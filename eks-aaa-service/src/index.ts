import './setupEnv'; // keep this as the first import
import PageServiceServer from './AAAServiceServer';
import { getConfig } from './pxConfig';
const config = getConfig();

const pageServiceServer = new PageServiceServer();
pageServiceServer.start(config.port);
