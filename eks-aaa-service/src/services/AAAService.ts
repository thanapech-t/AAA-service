import * as AWS from 'aws-sdk';
import * as request from 'request-promise';
import { BatchGetUtility } from './utility/BatchGetUtility';
import { getConfig } from '../pxConfig';
const config = getConfig();

type KeyList = AWS.DynamoDB.DocumentClient.KeyList;
type ItemList = AWS.DynamoDB.DocumentClient.ItemList;
type AttributeMap = AWS.DynamoDB.DocumentClient.AttributeMap;

interface INameAndEmailList {
    [key: string]: ItemList;
}

// As per DynamoDB limitation, maximum response is 100 items and 16 MB of data so 50 is saver.
export const BATCH_SIZE = 50;

AWS.config.update({
    region: config.region,
});
const dynamoDBClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
    endpoint: process.env.DYNAMO_DB_HOST,
});
const DYNAMO_CACHE_TABLE_NAME = config.dynamoTable;
const DYNAMO_CACHE_TABLE_USER_INFO = config.dynamoTableUserInfo;
const ONE_DAY_IN_MILLI_SECONDS = 1000 * 60 * 60 * 24;
const ONE_MONTH_IN_MILLI_SECONDS = 1000 * 60 * 60 * 24 * 30;
const NAME_AND_EMAIL_ATTRIBUTE = 'PROFILE.FirstName,PROFILE.LastName,PROFILE.EmailAddress';
export class AAAService {
    public readonly batchGetUtility: BatchGetUtility;

    constructor() {
        this.batchGetUtility = new BatchGetUtility(dynamoDBClient);
    }

    public async getBasicUserNameAndEmailAttribute(userId: string, forceRefresh: boolean = false): Promise<INameAndEmailList> {
        try {
            return await this.getData(DYNAMO_CACHE_TABLE_USER_INFO, userId, NAME_AND_EMAIL_ATTRIBUTE, forceRefresh);
        } catch (error) {
            throw error;
        }
    }

    public async getNameAndEmailList(userIDs: string[]): Promise<INameAndEmailList> {
        try {
            return await this.getNameAndEmailListFromDB(userIDs, NAME_AND_EMAIL_ATTRIBUTE);
        } catch (error) {
            console.log('AAAService -> error', error);
            throw error;
        }
    }

    private async getNameAndEmailListFromDB(
        userIDs: string[],
        query: string,
    ): Promise<INameAndEmailList> {
        const requestQuery: KeyList = userIDs.map((userid: string): object => {
            return {
                userid,
                query,
            };
        });
        const results: ItemList[] = await this.batchGetUtility.executeBatchGetSequentially(requestQuery, BATCH_SIZE, DYNAMO_CACHE_TABLE_USER_INFO);
        const nameAndEmailList: INameAndEmailList = this.extractNameAndEmailList(userIDs, results);

        return nameAndEmailList;
    }

    public extractNameAndEmailList(userIDs: string[], data: ItemList[]): INameAndEmailList {
        const nameAndEmailList = {};
        // Format to be response form. It can return blank data if there is no data response from DB
        userIDs.forEach((userID: string): void => {
            Object.assign(nameAndEmailList, { [userID]: [] });
        });
        // Update data as user id key
        data.forEach((item: AttributeMap): void => {
            Object.assign(nameAndEmailList, { [item.userid]: item.value.userAttributeList });
        });

        this.updateMissingNameAndEmailToDB(nameAndEmailList);

        return nameAndEmailList;
    }

    public updateMissingNameAndEmailToDB(data: INameAndEmailList): void {
        Object.keys(data).forEach((item: string) => {
            if (!data[item].length) {
                this.getDataAndSaveToCache(DYNAMO_CACHE_TABLE_USER_INFO, item, NAME_AND_EMAIL_ATTRIBUTE);
            }
        });
    }

    public async getBasicUserAttributes(userId: string, forceRefresh: boolean = false): Promise<any> {
        try {
            const attributes = config.services.userattribute.attributes;
            return await this.getUserAttributes(userId, attributes, forceRefresh);
        } catch (error) {
            throw error;
        }
    }

    public async getUserAttributes(userId: string, attributes: string[], forceRefresh: boolean = false): Promise<any> {
        try {
            const query = attributes.join(',');
            return await this.getData(DYNAMO_CACHE_TABLE_NAME, userId, query, forceRefresh);
        } catch (error) {
            throw error;
        }
    }

    public async getPO(userId: string, po: string, forceRefresh: boolean = false) {
        try {
            const query = `PERM.${po}`;
            return await this.getData(DYNAMO_CACHE_TABLE_NAME, userId, query, forceRefresh);
        } catch (error) {
            throw error;
        }
    }

    public async clearNameAndEmailCache(userId: string) {
        try {
            const list = await this.listUserCache(DYNAMO_CACHE_TABLE_USER_INFO, userId);
            if (!list || list.length === 0) {
                return [];
            }

            const tasks = list.map((item) => this.deleteFromDynamo(DYNAMO_CACHE_TABLE_USER_INFO, userId, item.query));
            const result = await Promise.all(tasks);

            return result;
        } catch (error) {
            console.error(`An error occurred during clear data cache. UserId: ${userId} from table: ${DYNAMO_CACHE_TABLE_USER_INFO}. Error: ${error.message}.`, error);
            throw error;
        }
    }

    public async clearUserCache(userId: string) {
        try {
            await this.clearNameAndEmailCache(userId);

            const list = await this.listUserCache(DYNAMO_CACHE_TABLE_NAME, userId);
            if (!list || list.length === 0) {
                return [];
            }
            const tasks = list.map((item) => this.deleteFromDynamo(DYNAMO_CACHE_TABLE_NAME, userId, item.query));
            const result = await Promise.all(tasks);
            return result;
        } catch (error) {
            console.error(`An error occurred during clear data cache. UserId: ${userId} from table: ${DYNAMO_CACHE_TABLE_NAME}. Error: ${error.message}.`, error);
            throw error;
        }
    }

    private async getData(tableName: string, userid: string, query: string, forceRefresh: boolean = false) {
        if (forceRefresh) {
            return await this.getDataAndSaveToCache(tableName, userid, query);
        } else {
            try {
                const cachedData = await this.getFromDynamo(tableName, userid, query);
                if (!cachedData) {
                    // null or expired
                    return await this.getDataAndSaveToCache(tableName, userid, query);
                }
                return cachedData;
            } catch (cacheIssue) {
                return await this.getDataAndSaveToCache(tableName, userid, query);
            }
        }
    }

    private async getDataAndSaveToCache(tableName: string, userid: string, query: string) {
        const data = await this.sendRequestToAAA(userid, query);
        this.saveToDynamo(tableName, userid, query, data);
        return data;
    }

    private async sendRequestToAAA(userid: string, query: string) {
        try {
            const aaaConfig = config.services.userattribute;
            const host = aaaConfig.host;
            const url = `http://${host}/userattributesservice/userattribute/?ids=${query}`;
            const aaaData = await request.get({
                url,
                headers: {
                    reutersuuid: userid,
                },
                json: true,
                timeout: aaaConfig.timeout,
            });
            return aaaData;
        } catch (error) {
            throw error;
        }
    }

    private async saveToDynamo(tableName: string, userId: string, query: string, value: any) {
        try {
            const extraExpireDate = (tableName === DYNAMO_CACHE_TABLE_USER_INFO) ? ONE_MONTH_IN_MILLI_SECONDS : ONE_DAY_IN_MILLI_SECONDS;
            const expireDate = new Date(Date.now() + extraExpireDate);
            const saveQuery = {
                TableName: tableName,
                Item: {
                    userid: userId,
                    query,
                    value,
                    expire: expireDate.getTime().valueOf(),
                },
            };
            const result = await dynamoDBClient.put(saveQuery).promise();
            if (!result) {
                console.warn('Empty response.');
                return null;
            }
            return result;
        } catch (error) {
            console.error(`An error occurred during save data to cache. UserId: ${userId} query ${query}. Error: ${error.message}.`, error);
            throw error;
        }
    }

    private async getFromDynamo(tableName: string, userId: string, query: string) {
        try {
            const getCache = {
                TableName: tableName,
                Key: {
                    userid: userId,
                    query,
                },
            };
            const result = await dynamoDBClient.get(getCache).promise();
            if (!result || !result.Item || !result.Item.expire) {
                console.warn('Cache empty.');
                return null;
            }
            if (result.Item.expire - Date.now() <= 0) {
                console.warn('Cache expired.');
                return null;
            }
            return result.Item.value;
        } catch (error) {
            console.error(`An error occurred during get cache. UserId: ${userId} query ${query}. Error: ${error.message}.`, error);
            throw error;
        }
    }

    private async listUserCache(tableName: string, userId: string): Promise<any[]> {
        try {
            const listUserCache = {
                TableName: tableName,
                KeyConditionExpression: '#id = :userid',
                ExpressionAttributeNames: {
                    '#id': 'userid',
                },
                ExpressionAttributeValues: {
                    ':userid': userId,
                },
            };
            const result = await dynamoDBClient.query(listUserCache).promise();
            if (!result || !result.Count || result.Count <= 0) {
                console.warn('Cache empty.');
                return null;
            }
            return result.Items;
        } catch (error) {
            console.error(`An error occurred during list user cache. UserId: ${userId}. Error: ${error.message}.`, error);
            throw error;
        }
    }

    public async deleteFromDynamo(tableName: string, userId: string, query: string) {
        try {
            const deleteQuery = {
                TableName: tableName,
                Key: {
                    userid: userId,
                    query,
                },
            };
            const result = await dynamoDBClient.delete(deleteQuery).promise();
            if (!result) {
                console.warn('Empty response.');
                return null;
            }
            return result;
        } catch (error) {
            throw error;
        }
    }
}
