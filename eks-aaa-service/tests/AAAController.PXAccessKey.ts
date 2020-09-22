import '../src/setupEnv';
import * as supertest from 'supertest';
import { SuperTest, Test } from 'supertest';
import 'mocha';
import { expect } from 'chai';
import * as AWS from 'aws-sdk';
import { OK, FORBIDDEN } from 'http-status-codes';
import AAAServiceServer from '../src/AAAServiceServer';
import { PxAccessKeyError } from '../src/constant/PxAccessKeyError';
import { PX_KEY_NAME, PX_KEY_VALUE } from '../src/middlewares/PxAccessKey';
import { userPAXTRA77552 } from './mockupData/user';
import { getConfig } from '../src/pxConfig';
const config = getConfig();

const USER_PAXTRA77552_VALUE = userPAXTRA77552.value;

AWS.config.update({
  region: config.region,
});

describe('AAA Controller', () => {
  let agent: SuperTest<Test>;
  const server = new AAAServiceServer();

  before(async () => {
    server.start(config.port);
    agent = supertest.agent(server.getExpressInstance());
  });

  after(async () => {
    server.stop();
  });

  const testPxAccessKey = (url: string, method: string = ''): Mocha.Func => {
    return (done) => {
      let req: Test = null;

      if (method === 'POST') {
        req = agent.post(url);
      } else if (method === 'DELETE') {
        req = agent.del(url);
      } else {
        req = agent.get(url);
      }

      req.expect(FORBIDDEN, (err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body).to.deep.equal(PxAccessKeyError);
        done();
      });
    };
  };

  const testWrongPxAccessKey = (
    url: string,
    method: string = '',
  ): Mocha.Func => {
    return (done) => {
      let req: Test = null;

      if (method === 'POST') {
        req = agent.post(url);
      } else if (method === 'DELETE') {
        req = agent.del(url);
      } else {
        req = agent.get(url);
      }

      req.set(PX_KEY_NAME, 'wrong.value').expect(FORBIDDEN, (err, res) => {
        if (err) {
          return done(err);
        }
        expect(res.body).to.deep.equal(PxAccessKeyError);
        done();
      });
    };
  };

  describe('api/v1', () => {
    describe('GET user/:userId', () => {
      it(
        'Return forbidden if access-key is missing',
        testPxAccessKey('/api/v1/user/PAXTRA77552'),
      );
    });
    describe('POST user/:userId', () => {
      it(
        'Return forbidden if access-key is missing',
        testPxAccessKey('/api/v1/user/PAXTRA77552', 'POST'),
      );
    });
    describe('GET user/:userId/po/:po', () => {
      it(
        'Return forbidden if access-key is missing',
        testPxAccessKey('/api/v1/user/PAXTRA77552/po/GUIDES.CEONOFF'),
      );
    });
    describe('DELETE user/:userId', () => {
      it(
        'Return forbidden if access-key is missing',
        testPxAccessKey('/api/v1/user/PAXTRA77552', 'DELETE'),
      );
    });
    describe('GET user/:userId/name-email', () => {
      it(
        'Return forbidden if access-key is missing',
        testPxAccessKey('/api/v1/user/PAXTRA77552/name-email', 'GET'),
      );
    });
    describe('DELETE user/:userId/name-email', () => {
      it(
        'Return forbidden if access-key is missing',
        testPxAccessKey('/api/v1/user/PAXTRA77552/name-email', 'DELETE'),
      );
    });
    describe('POST users/name-email', () => {
      it(
        'Return forbidden if access-key is missing',
        testPxAccessKey('/api/v1/users/name-email', 'POST'),
      );
    });
  });

  describe('Should error when provide PX Access Key with wrong value', () => {
    describe('GET user/:userId', () => {
      it(
        'Return forbidden if access-key is provided with wrong value',
        testWrongPxAccessKey('/api/v1/user/PAXTRA77552'),
      );
    });
    describe('POST user/:userId', () => {
      it(
        'Return forbidden if access-key is provided with wrong value',
        testWrongPxAccessKey('/api/v1/user/PAXTRA77552', 'POST'),
      );
    });
    describe('GET user/:userId/po/:po', () => {
      it(
        'Return forbidden if access-key is provided with wrong value',
        testWrongPxAccessKey('/api/v1/user/PAXTRA77552/po/GUIDES.CEONOFF'),
      );
    });
    describe('DELETE user/:userId', () => {
      it(
        'Return forbidden if access-key is provided with wrong value',
        testWrongPxAccessKey('/api/v1/user/PAXTRA77552', 'DELETE'),
      );
    });
    describe('GET user/:userId/name-email', () => {
      it(
        'Return forbidden if access-key is provided with wrong value',
        testWrongPxAccessKey('/api/v1/user/PAXTRA77552/name-email', 'GET'),
      );
    });
    describe('DELETE user/:userId/name-email', () => {
      it(
        'Return forbidden if access-key is provided with wrong value',
        testWrongPxAccessKey('/api/v1/user/PAXTRA77552/name-email', 'DELETE'),
      );
    });
    describe('POST users/name-email', () => {
      it(
        'Return forbidden if access-key is provided with wrong value',
        testWrongPxAccessKey('/api/v1/users/name-email', 'POST'),
      );
    });
  });
});
