import '../src/setupEnv';
import * as AWS from 'aws-sdk';
import AAAServiceServer from '../src/AAAServiceServer';
import 'mocha';
import { expect, should } from 'chai';
import * as supertest from 'supertest';
import { SuperTest, Test } from 'supertest';
import { OK, FORBIDDEN } from 'http-status-codes';
import { PX_KEY_NAME, PX_KEY_VALUE } from '../src/middlewares/PxAccessKey';
import nock from 'nock';
import {
  createTableUserParams,
  userInputDB,
  userPAXTRA77551,
  userPAXTRA77552,
  userInputDBExpirePAXTRA77551,
} from './mockupData/user';
import {
  createTableNameAndEmailParams,
  nameAndEmailInputDB,
  nameAndEmailInputDBExpire,
  nameAndEmailPAXTRA77551,
  nameAndEmailPAXTRA77552,
  nameAndEmailPAXTRA77553,
  nameAndEmailListOutput,
} from './mockupData/nameAndEmail';
import { getConfig } from '../src/pxConfig';
const config = getConfig();

const TABLE_USER = config.dynamoTable;
const TABLE_NAME_EMAIL = config.dynamoTableUserInfo;
const USER_PAXTRA77551_VALUE = userPAXTRA77551.value;
const USER_PAXTRA77552_VALUE = userPAXTRA77552.value;
const NAME_EMAIL_PAXTRA77551_VALUE = nameAndEmailPAXTRA77551.value;
const NAME_EMAIL_PAXTRA77552_VALUE = nameAndEmailPAXTRA77552.value;
const NAME_EMAIL_PAXTRA77553_VALUE = nameAndEmailPAXTRA77553.value;
const EXPIRY_DATE_TIMESTAMP = 1589541271883;

const aaaConfig = config.services.userattribute;
const host = aaaConfig.host;
const url = `http://${host}`;
const pathname = `/userattributesservice/userattribute/?ids=`;
const userAttribute = config.services.userattribute.attributes.join(',');
const nameAndEmailAttribute = `PROFILE.FirstName,PROFILE.LastName,PROFILE.EmailAddress`;

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

const createDB = async (dbParam) => {
  await dynamoDB.createTable(dbParam).promise();
  console.log('CREATE TABLE SUCCESS');
};

const addDataToDB = async (dataParam) => {
  await dynamoDBClient.batchWrite(dataParam).promise();
  console.log('ADD DATA SUCCESS');
};

const mockupDB = async (dbParam, dataParam) => {
  await createDB(dbParam);
  await addDataToDB(dataParam);
};

const clearDB = async (tableName) => {
  await dynamoDB
    .deleteTable({
      TableName: tableName,
    })
    .promise();
  console.log('DELETE TABLE SUCCESS');
};

const getCacheFromDB = async (tableName, userID, query) => {
  return await dynamoDBClient
    .get({
      TableName: tableName,
      Key: {
        userid: userID,
        query,
      },
    })
    .promise();
};

describe('AAA Service Controller', () => {
  let agent: SuperTest<Test>;
  const server = new AAAServiceServer();

  before(async () => {
    server.start(config.port);
    agent = supertest.agent(server.getExpressInstance());
  });

  after(async () => {
    server.stop();
  });

  describe('User Info Section', () => {
    before(async () => {
      await mockupDB(createTableUserParams, userInputDB);
      await mockupDB(createTableNameAndEmailParams, nameAndEmailInputDB);
    });
    after(async () => {
      await clearDB(TABLE_USER);
      await clearDB(TABLE_NAME_EMAIL);
    });

    it('GET: user/:userId', (done) => {
      agent
        .get('/api/v1/user/PAXTRA77552')
        .set(PX_KEY_NAME, PX_KEY_VALUE)
        .end((err, res) => {
          expect(res.status).equal(OK);
          expect(res.body).to.deep.equal(USER_PAXTRA77552_VALUE);
          done();
        });
    });

    it('DELETE: user/:userId, then should get blank data from DB of UserInfo and DB of NameAndEmail', (done) => {
      agent
        .del('/api/v1/user/PAXTRA77552')
        .set(PX_KEY_NAME, PX_KEY_VALUE)
        .end((err, res) => {
          expect(res.status).equal(OK);
          expect(res.body).to.deep.equal([{}]);

          setTimeout(async () => {
            const result = await getCacheFromDB(
              TABLE_USER,
              'PAXTRA77552',
              userAttribute,
            );
            expect(result).to.deep.equal({});

            const result2 = await getCacheFromDB(
              TABLE_NAME_EMAIL,
              'PAXTRA77552',
              nameAndEmailAttribute,
            );
            expect(result2).to.deep.equal({});

            done();
          }, 250);
        });
    });

    describe('Get user info that is not in DB', () => {
      let aaaServiceCallCountTime = 0;
      before(() => {
        nock(url)
          .get(`${pathname}${userAttribute}`)
          .reply(OK, () => {
            aaaServiceCallCountTime++;
            return USER_PAXTRA77551_VALUE;
          });
      });
      after(() => {
        aaaServiceCallCountTime = 0;
        nock.cleanAll();
      });

      it('GET: user/:userId, then check that DB update Data and check count time of connecting mockup URL', (done) => {
        agent
          .get('/api/v1/user/PAXTRA77551')
          .set(PX_KEY_NAME, PX_KEY_VALUE)
          .end((err, res) => {
            expect(res.status).equal(OK);
            expect(res.body).to.deep.equal(USER_PAXTRA77551_VALUE);
            expect(aaaServiceCallCountTime).equal(1);

            setTimeout(async () => {
              const result = await getCacheFromDB(
                TABLE_USER,
                'PAXTRA77551',
                userAttribute,
              );
              expect(result.Item.value).to.deep.equal(USER_PAXTRA77551_VALUE);
              done();
            }, 250);
          });
      });
    });
  });

  describe('Get user info in case of date expire', () => {
    let aaaServiceCallCountTime = 0;
    before(async () => {
      await mockupDB(createTableUserParams, userInputDBExpirePAXTRA77551);
      nock(url)
        .get(`${pathname}${userAttribute}`)
        .reply(OK, () => {
          aaaServiceCallCountTime++;
          return USER_PAXTRA77551_VALUE;
        });
    });
    after(async () => {
      await clearDB(TABLE_USER);
      aaaServiceCallCountTime = 0;
      nock.cleanAll();
    });

    it('GET: user/:userId, then check that DB update expiry date  and check count time of connecting mockup URL', (done) => {
      agent
        .get('/api/v1/user/PAXTRA77551')
        .set(PX_KEY_NAME, PX_KEY_VALUE)
        .end((err, res) => {
          expect(res.status).equal(OK);
          expect(res.body).to.deep.equal(USER_PAXTRA77551_VALUE);
          expect(aaaServiceCallCountTime).equal(1);

          setTimeout(async () => {
            try {
              const result = await getCacheFromDB(
                TABLE_USER,
                'PAXTRA77551',
                userAttribute,
              );
              expect(result.Item.expire).not.equal(EXPIRY_DATE_TIMESTAMP);
              done();
            } catch (e) {
              done(e);
            }
          }, 250);
        });
    });
  });

  describe('Name and Email Section', () => {
    before(async () => {
      await mockupDB(createTableNameAndEmailParams, nameAndEmailInputDB);
    });
    after(async () => {
      await clearDB(TABLE_NAME_EMAIL);
    });

    it('GET: user/:userId/name-email', (done) => {
      agent
        .get('/api/v1/user/PAXTRA77552/name-email')
        .set(PX_KEY_NAME, PX_KEY_VALUE)
        .end((err, res) => {
          expect(res.status).equal(OK);
          expect(res.body).to.deep.equal(NAME_EMAIL_PAXTRA77552_VALUE);
          done();
        });
    });

    it('POST: users/name-email (List)', (done) => {
      agent
        .post('/api/v1/users/name-email')
        .set(PX_KEY_NAME, PX_KEY_VALUE)
        .send([
          'PAXTRA77557',
          'PAXTRA77552',
          'PAXTRA77553',
          'PAXTRA77554',
          'PAXTRA77555',
          'PAXTRA77556',
        ])
        .end((err, res) => {
          expect(res.status).equal(OK);
          expect(res.body).to.deep.equal(nameAndEmailListOutput);
          done();
        });
    });

    it('DELETE: user/:userId/name-email, then should get blank data from DB', (done) => {
      agent
        .del('/api/v1/user/PAXTRA77552/name-email')
        .set(PX_KEY_NAME, PX_KEY_VALUE)
        .end((err, res) => {
          expect(res.status).equal(OK);
          expect(res.body).to.deep.equal([{}]);

          setTimeout(async () => {
            try {
              const result = await getCacheFromDB(
                TABLE_NAME_EMAIL,
                'PAXTRA77552',
                nameAndEmailAttribute,
              );
              expect(result).to.deep.equal({});
              done();
            } catch (e) {
              done(e);
            }
          }, 250);
        });
    });

    describe('Get name and email that is not in DB', () => {
      let aaaServiceCallCountTime = 0;
      before(() => {
        nock(url)
          .get(`${pathname}${nameAndEmailAttribute}`)
          .reply(OK, () => {
            aaaServiceCallCountTime++;
            return NAME_EMAIL_PAXTRA77551_VALUE;
          });
      });
      after(async () => {
        aaaServiceCallCountTime = 0;
        nock.cleanAll();
      });

      it('GET: user/:userId/name-email, then check that DB update Data and check count time of connecting mockup URL', (done) => {
        agent
          .get('/api/v1/user/PAXTRA77551/name-email')
          .set(PX_KEY_NAME, PX_KEY_VALUE)
          .end((err, res) => {
            expect(res.status).equal(OK);
            expect(res.body).to.deep.equal(NAME_EMAIL_PAXTRA77551_VALUE);
            expect(aaaServiceCallCountTime).equal(1);

            setTimeout(async () => {
              try {
                const result = await getCacheFromDB(
                  TABLE_NAME_EMAIL,
                  'PAXTRA77551',
                  nameAndEmailAttribute,
                );
                expect(result.Item.value).to.deep.equal(
                  NAME_EMAIL_PAXTRA77551_VALUE,
                );
                done();
              } catch (e) {
                done(e);
              }
            }, 250);
          });
      });
    });
  });

  describe('Get name and email list is not in DB. After that update in DB behind the scene', () => {
    let aaaServiceCallCountTime = 0;
    before(async () => {
      await createDB(createTableNameAndEmailParams);

      nock(url, {
        reqheaders: {
          reutersuuid: 'PAXTRA77552',
        },
      })
        .get(`${pathname}${nameAndEmailAttribute}`)
        .reply(OK, () => {
          aaaServiceCallCountTime++;
          return NAME_EMAIL_PAXTRA77552_VALUE;
        });

      nock(url, {
        reqheaders: {
          reutersuuid: 'PAXTRA77553',
        },
      })
        .get(`${pathname}${nameAndEmailAttribute}`)
        .reply(OK, () => {
          aaaServiceCallCountTime++;
          return NAME_EMAIL_PAXTRA77553_VALUE;
        });
    });

    after(async () => {
      await clearDB(TABLE_NAME_EMAIL);

      aaaServiceCallCountTime = 0;
      nock.cleanAll();
    });

    it('POST: users/name-email (List), then check that DB update Data and check count time of connecting mockup URL', (done) => {
      agent
        .post('/api/v1/users/name-email')
        .set(PX_KEY_NAME, PX_KEY_VALUE)
        .send(['PAXTRA77552', 'PAXTRA77553'])
        .end((err, res) => {
          expect(res.status).equal(OK);

          expect(res.body).to.deep.equal({
            PAXTRA77552: [],
            PAXTRA77553: [],
          });
          expect(aaaServiceCallCountTime).equal(2);

          setTimeout(async () => {
            try {
              const result = await getCacheFromDB(
                TABLE_NAME_EMAIL,
                'PAXTRA77552',
                nameAndEmailAttribute,
              );
              expect(result.Item.value).to.deep.equal(
                NAME_EMAIL_PAXTRA77552_VALUE,
              );
              const result2 = await getCacheFromDB(
                TABLE_NAME_EMAIL,
                'PAXTRA77553',
                nameAndEmailAttribute,
              );
              expect(result2.Item.value).to.deep.equal(
                NAME_EMAIL_PAXTRA77553_VALUE,
              );
              done();
            } catch (e) {
              done(e);
            }
          }, 250);
        });
    });
  });

  describe('Get name and email in case of expiry data', () => {
    let aaaServiceCallCountTime = 0;
    before(async () => {
      await mockupDB(createTableNameAndEmailParams, nameAndEmailInputDBExpire);
      nock(url, {
        reqheaders: {
          reutersuuid: 'PAXTRA77551',
        },
      })
        .get(`${pathname}${nameAndEmailAttribute}`)
        .reply(OK, () => {
          aaaServiceCallCountTime++;
          return NAME_EMAIL_PAXTRA77551_VALUE;
        });
    });

    after(async () => {
      await clearDB(TABLE_NAME_EMAIL);
      aaaServiceCallCountTime = 0;
      nock.cleanAll();
    });

    it('GET: user/:userId/name-email, then check that DB update expiry date  and check count time of connecting mockup URL', (done) => {
      agent
        .get('/api/v1/user/PAXTRA77551/name-email')
        .set(PX_KEY_NAME, PX_KEY_VALUE)
        .end((err, res) => {
          expect(res.status).equal(OK);
          expect(res.body).to.deep.equal(NAME_EMAIL_PAXTRA77551_VALUE);
          expect(aaaServiceCallCountTime).equal(1);

          setTimeout(async () => {
            try {
              const result = await getCacheFromDB(
                TABLE_NAME_EMAIL,
                'PAXTRA77551',
                nameAndEmailAttribute,
              );
              expect(result.Item.expire).not.equal(EXPIRY_DATE_TIMESTAMP);
              done();
            } catch (e) {
              done(e);
            }
          }, 250);
        });
    });
  });
});
