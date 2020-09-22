import * as bodyParser from 'body-parser';
import { Server } from '@overnightjs/core';
import { Application } from 'express';
import { AAAController } from './controllers/AAAController';
import { swaggerRoute, swaggerJson } from './swaggers/swagger';
import { landing } from './landing';
import { getConfig } from './pxConfig';
const config = getConfig();

class AAAServiceServer extends Server {
    private readonly SERVER_STARTED = 'AAAServiceServer started on port: ';
    private readonly SERVER_STOPPED = 'AAAServiceServer has been stopped.';
    private server;

    constructor() {
        super(true);
        this.app.use(bodyParser.json({ type: '*/*' }));
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.setupControllers();
    }

    private setupControllers(): void {
        super.addControllers([
            new AAAController(),
        ]);
    }

    public start(port: number): void {
        this.app.get('/', landing);
        this.app.get('/config', (request, response) => {
            response.json(config);
        });
        this.app.get('/swagger.json', swaggerJson);

        this.app.use('/swagger', swaggerRoute);

        this.server = this.app.listen(port, () => {
            console.log(this.SERVER_STARTED + port);
        });
    }

    public stop() {
        if (this.server) {
            console.log(this.SERVER_STOPPED);
            this.server.close();
        }
    }

    public getExpressInstance(): Application {
        return this.app;
    }
}

export default AAAServiceServer;
