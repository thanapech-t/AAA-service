import * as AWS from 'aws-sdk';
import { getConfig } from '../../src/pxConfig';
const config = getConfig();
type BatchWriteItemInput = AWS.DynamoDB.DocumentClient.BatchWriteItemInput;

export const createTableUserParams: AWS.DynamoDB.Types.CreateTableInput = {
  TableName: config.dynamoTable,
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

export const userPAXTRA77551 = {
  value: {
    userAttributeList: [
      { Name: 'PROFILE.FirstName', Value: 'Michael' },
      { Name: 'PROFILE.LastName', Value: 'Grazebrook' },
      {
        Name: 'PROFILE.EmailAddress',
        Value: 'michael.grazebrook@thomsonreuters.com',
      },
      {
        Name: 'PROFILE.UserId',
        Value: 'michael.grazebrook@thomsonreuters.com',
      },
      { Name: 'SETTING.RDE_USER_CURRENT_TICK_COLOR', Value: 'EU' },
      {
        Name: 'SETTING.COMMON.RDE_PRODUCT.NAME',
        Value: 'Refinitiv Eikon',
      },
      {
        Name:
          'SETTING.COMMON.REGIONAL_SETTINGS.DATEFORMAT_DAY_LIGHT_SAVING_SWITCH',
        Value: 'Yes',
      },
      {
        Name: 'SETTING.COMMON.RDE_PRODUCT.INTERNALNAME',
        Value: 'Refinitiv Eikon',
      },
      {
        Name: 'SETTING.COMMON.REGIONAL_SETTINGS.NUMBERFORMAT_GROUPSEPARATOR',
        Value: ',',
      },
      { Name: 'SETTING.COMMON.RDE_PRODUCT.VERSION', Value: '1.0' },
      {
        Name: 'SETTING.EIKONLIGHT.SETTINGS.WEBMODE',
        Value: 'Eikon4',
      },
      {
        Name: 'SETTING.COMPLIANCE_MANAGEMENT_ACCELUS_ALERTS',
        Value: 'false',
      },
      {
        Name: 'SETTING.COMMON.REGIONAL_SETTINGS.DATEFORMAT_TIMEPATTERN',
        Value: 'HH:mm',
      },
      {
        Name: 'SETTING.COMMON.REGIONAL_SETTINGS.NUMBERFORMAT_DECIMALSEPARATOR',
        Value: '.',
      },
      { Name: 'SETTING.RDE_USER_CURRENT_THEME', Value: 'Charcoal' },
      {
        Name: 'SETTING.COMMON.REGIONAL_SETTINGS.UI_LANGUAGE',
        Value: 'zh-Hant',
      },
      {
        Name: 'SETTING.COMMON.REGIONAL_SETTINGS.DATEFORMAT_DATEPATTERN',
        Value: 'dd/MM/yyyy',
      },
      {
        Name: 'SETTING.COMMON.REGIONAL_SETTINGS.DATEFORMAT_SEPARATOR',
        Value: '/',
      },
      {
        Name: 'SETTING.COMMON.REGIONAL_SETTINGS.DATEFORMAT_TIMEZONE',
        Value: 'GMT Standard Time',
      },
    ],
  },
  query: config.services.userattribute.attributes.join(','),
  userid: 'PAXTRA77551',
  expire: 1589541271883,
};

export const userPAXTRA77552 = {
  value: {
    userAttributeList: [
      { Name: 'PROFILE.FirstName', Value: 'Chakkapan' },
      { Name: 'PROFILE.LastName', Value: 'Rapeepunpienpen' },
      {
        Name: 'PROFILE.EmailAddress',
        Value: 'chakkapan.rapeepunpi@thomsonreuters.com',
      },
      {
        Name: 'PROFILE.UserId',
        Value: 'chakkapan.rapeepunpi@thomsonreuters.com',
      },
      {
        Name: 'SETTING.RDE_USER_CURRENT_TICK_COLOR',
        Value: 'European',
      },
      {
        Name: 'SETTING.COMMON.RDE_PRODUCT.NAME',
        Value: 'Refinitiv Eikon',
      },
      {
        Name:
          'SETTING.COMMON.REGIONAL_SETTINGS.DATEFORMAT_DAY_LIGHT_SAVING_SWITCH',
        Value: 'Yes',
      },
      {
        Name: 'SETTING.COMMON.RDE_PRODUCT.INTERNALNAME',
        Value: 'Refinitiv Eikon',
      },
      {
        Name: 'SETTING.COMMON.REGIONAL_SETTINGS.NUMBERFORMAT_GROUPSEPARATOR',
        Value: ',',
      },
      { Name: 'SETTING.COMMON.RDE_PRODUCT.VERSION', Value: '1.0' },
      {
        Name: 'SETTING.EIKONLIGHT.SETTINGS.WEBMODE',
        Value: 'RefinitivWorkspace',
      },
      {
        Name: 'SETTING.COMPLIANCE_MANAGEMENT_ACCELUS_ALERTS',
        Value: 'false',
      },
      {
        Name: 'SETTING.COMMON.REGIONAL_SETTINGS.DATEFORMAT_TIMEPATTERN',
        Value: 'h:mm:ss tt',
      },
      {
        Name: 'SETTING.COMMON.REGIONAL_SETTINGS.NUMBERFORMAT_DECIMALSEPARATOR',
        Value: '.',
      },
      { Name: 'SETTING.RDE_USER_CURRENT_THEME', Value: 'Charcoal' },
      {
        Name: 'SETTING.COMMON.REGIONAL_SETTINGS.UI_LANGUAGE',
        Value: 'en-US',
      },
      {
        Name: 'SETTING.COMMON.REGIONAL_SETTINGS.DATEFORMAT_DATEPATTERN',
        Value: 'dddd, MMMM d, yyyy',
      },
      {
        Name: 'SETTING.COMMON.REGIONAL_SETTINGS.DATEFORMAT_SEPARATOR',
        Value: '/',
      },
      {
        Name: 'SETTING.COMMON.REGIONAL_SETTINGS.DATEFORMAT_TIMEZONE',
        Value: 'SE Asia Standard Time',
      },
    ],
  },
  query: config.services.userattribute.attributes.join(','),
  userid: 'PAXTRA77552',
  expire: new Date(Date.now() + 1000 * 60 * 60 * 24).getTime().valueOf(),
};

export const userInputDB: BatchWriteItemInput = {
  RequestItems: {
    [config.dynamoTable]: [
      {
        PutRequest: {
          Item: userPAXTRA77552,
        },
      },
    ],
  },
};

export const userInputDBExpirePAXTRA77551: BatchWriteItemInput = {
  RequestItems: {
    [config.dynamoTable]: [
      {
        PutRequest: {
          Item: userPAXTRA77551,
        },
      },
    ],
  },
};
