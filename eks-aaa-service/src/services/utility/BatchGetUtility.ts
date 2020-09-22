import * as AWS from 'aws-sdk';
import {chunk} from './Chunk';

type KeyList = AWS.DynamoDB.DocumentClient.KeyList;
type BatchGetItemInput = AWS.DynamoDB.DocumentClient.BatchGetItemInput;
type BatchGetItemOutput = AWS.DynamoDB.DocumentClient.BatchGetItemOutput;
type ItemList = AWS.DynamoDB.DocumentClient.ItemList;

export class BatchGetUtility {
    public readonly dynamoDBClient: AWS.DynamoDB.DocumentClient;

    constructor(dynamodbClient: AWS.DynamoDB.DocumentClient) {
        this.dynamoDBClient = dynamodbClient;
    }

    public async executeBatchGetSequentially(
        requestQuery: any[],
        batchSize: number,
        tableName: string,
    ): Promise<ItemList[]> {
        const chunks: any[][] = chunk(requestQuery, batchSize);

        return await chunks.reduce(
            async (previousPromise, itemsInChunk): Promise<ItemList[]> => {
                const allPreviousResults: ItemList[] = await previousPromise;
                const currentResult: ItemList[] = await this.performBatchGet(itemsInChunk, tableName);
                return [...allPreviousResults, ...currentResult];
            },
            Promise.resolve<ItemList[]>([]),
        );
    }

    private async performBatchGet(
        requestQuery: KeyList[],
        tableName: string,
    ): Promise<ItemList[]> {
        const params: BatchGetItemInput = {
            RequestItems: {
                [tableName]: {
                    Keys: requestQuery,
                },
            },
        };

        try {
            const results: BatchGetItemOutput = await this.dynamoDBClient.batchGet(params).promise();
            return results.Responses[tableName] as ItemList[];
        } catch (e) {
            throw e;
        }
    }

}
