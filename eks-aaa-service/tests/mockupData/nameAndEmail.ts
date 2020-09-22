import * as AWS from 'aws-sdk';
import { getConfig } from '../../src/pxConfig';
const config = getConfig();
type BatchWriteItemInput = AWS.DynamoDB.DocumentClient.BatchWriteItemInput;

export const createTableNameAndEmailParams: AWS.DynamoDB.Types.CreateTableInput = {
  TableName: config.dynamoTableUserInfo,
  KeySchema: [
    {
      KeyType: 'HASH',
      AttributeName: 'userid',
    },
    {
      KeyType: 'RANGE',
      AttributeName: 'query',
    },
  ],
  AttributeDefinitions: [
    {
      AttributeName: 'userid',
      AttributeType: 'S',
    },
    {
      AttributeName: 'query',
      AttributeType: 'S',
    },
  ],
  ProvisionedThroughput: {
    WriteCapacityUnits: 1,
    ReadCapacityUnits: 1,
  },
};

export const nameAndEmailPAXTRA77551 = {
  value: {
    userAttributeList: [
      { Name: 'PROFILE.FirstName', Value: 'Michael' },
      { Name: 'PROFILE.LastName', Value: 'Grazebrook' },
      {
        Name: 'PROFILE.EmailAddress',
        Value: 'michael.grazebrook@thomsonreuters.com',
      },
    ],
  },
  query: 'PROFILE.FirstName,PROFILE.LastName,PROFILE.EmailAddress',
  userid: 'PAXTRA77551',
  expire: 1589541271883,
};

export const nameAndEmailPAXTRA77552 = {
  value: {
    userAttributeList: [
      { Value: 'Chakkapan', Name: 'PROFILE.FirstName' },
      { Value: 'Rapeepunpienpen', Name: 'PROFILE.LastName' },
      {
        Value: 'chakkapan.rapeepunpi@thomsonreuters.com',
        Name: 'PROFILE.EmailAddress',
      },
    ],
  },
  query: 'PROFILE.FirstName,PROFILE.LastName,PROFILE.EmailAddress',
  userid: 'PAXTRA77552',
  expire: new Date(Date.now() + 1000 * 60 * 60 * 24).getTime().valueOf(),
};

export const nameAndEmailPAXTRA77553 = {
  value: {
    userAttributeList: [
      { Value: 'Peggy', Name: 'PROFILE.FirstName' },
      { Value: 'Ng', Name: 'PROFILE.LastName' },
      {
        Value: 'peggy.ng@thomsonreuters.com',
        Name: 'PROFILE.EmailAddress',
      },
    ],
  },
  query: 'PROFILE.FirstName,PROFILE.LastName,PROFILE.EmailAddress',
  userid: 'PAXTRA77553',
  expire: new Date(Date.now() + 1000 * 60 * 60 * 24).getTime().valueOf(),
};

export const nameAndEmailInputDB: BatchWriteItemInput = {
  RequestItems: {
    [config.dynamoTableUserInfo]: [
      {
        PutRequest: {
          Item: nameAndEmailPAXTRA77552,
        },
      },
      {
        PutRequest: {
          Item: nameAndEmailPAXTRA77553,
        },
      },
    ],
  },
};

export const nameAndEmailInputDBExpire: BatchWriteItemInput = {
  RequestItems: {
    [config.dynamoTableUserInfo]: [
      {
        PutRequest: {
          Item: nameAndEmailPAXTRA77551,
        },
      },
    ],
  },
};

export const nameAndEmailListOutput = {
  PAXTRA77557: [],
  PAXTRA77552: nameAndEmailPAXTRA77552.value.userAttributeList,
  PAXTRA77553: nameAndEmailPAXTRA77553.value.userAttributeList,
  PAXTRA77554: [],
  PAXTRA77555: [],
  PAXTRA77556: [],
};
