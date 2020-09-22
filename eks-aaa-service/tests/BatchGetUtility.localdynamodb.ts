import '../src/setupEnv';
import * as AWS from 'aws-sdk';
import AAAServiceServer from '../src/AAAServiceServer';
import 'mocha';
import { expect, should } from 'chai';
import * as supertest from 'supertest';
import { SuperTest, Test } from 'supertest';
import {
  createTableNameAndEmailParams,
  nameAndEmailInputDB,
  nameAndEmailPAXTRA77552,
  nameAndEmailPAXTRA77553,
} from './mockupData/nameAndEmail';
import { BatchGetUtility } from '../src/services/utility/BatchGetUtility';
import { getConfig } from '../src/pxConfig';
const config = getConfig();

const NAME_AND_EMAIL_ATTRIBUTE =
  'PROFILE.FirstName,PROFILE.LastName,PROFILE.EmailAddress';

AWS.config.update({
  region: config.region,
});

const dynamoDB = new AWS.DynamoDB({
  apiVersion: '2012-08-10',
  endpoint: process.env.DYNAMO_DB_HOST,
});

const dynamoDBClient = new AWS.DynamoDB.DocumentClient({
  apiVersion: '2012-08-10',
  endpoint: process.env.DYNAMO_DB_HOST,
});

describe('AAA Service', () => {
  let agent: SuperTest<Test>;
  const server = new AAAServiceServer();

  before(async () => {
    server.start(config.port);
    agent = supertest.agent(server.getExpressInstance());
  });

  after(async () => {
    server.stop();
  });

  const createTable = async (createTableParams) => {
    await dynamoDB.createTable(createTableParams).promise();
  };

  const addMockData = async (mockupData) => {
    await dynamoDBClient.batchWrite(mockupData).promise();
  };

  const deleteTable = async (tableName) => {
    await dynamoDB
      .deleteTable({
        TableName: tableName,
      })
      .promise();
  };

  describe('AAA Service get name and email list operation', () => {
    const TABLE_NAME_EMAIL = config.dynamoTableUserInfo;

    before(async () => {
      await createTable(createTableNameAndEmailParams);
      console.log('CREATE TABLE SUCCESS');
      await addMockData(nameAndEmailInputDB);
      console.log('ADD DATA SUCCESS');
    });

    after(async () => {
      await deleteTable(TABLE_NAME_EMAIL);
      console.log('DELETE TABLE SUCCESS');
    });

    describe('Batch get utility function', () => {
      it('Return name and email list from local Dynamo DB', async () => {
        const batchGetUtility = new BatchGetUtility(dynamoDBClient);
        const nameAndEmailList = await batchGetUtility.executeBatchGetSequentially(
          [
            { userid: 'PAXTRA77557', query: NAME_AND_EMAIL_ATTRIBUTE },
            { userid: 'PAXTRA77552', query: NAME_AND_EMAIL_ATTRIBUTE },
            { userid: 'PAXTRA77553', query: NAME_AND_EMAIL_ATTRIBUTE },
            { userid: 'PAXTRA77554', query: NAME_AND_EMAIL_ATTRIBUTE },
            { userid: 'PAXTRA77555', query: NAME_AND_EMAIL_ATTRIBUTE },
            { userid: 'PAXTRA77556', query: NAME_AND_EMAIL_ATTRIBUTE },
          ],
          50,
          TABLE_NAME_EMAIL,
        );

        expect(nameAndEmailList).to.deep.equal([
          nameAndEmailPAXTRA77552,
          nameAndEmailPAXTRA77553,
        ]);
      });
    });
  });
});
