import { OK, INTERNAL_SERVER_ERROR } from 'http-status-codes';
import {
    Controller,
    Get,
    Post,
    Delete,
    ClassMiddleware,
} from '@overnightjs/core';
import { Request, Response } from 'express';
import { AAAService } from '../services/AAAService';
import { pxAccessKey } from '../middlewares/PxAccessKey';
import {
    ErrorGetUsernameAndEmail,
    ErrorGetFullUserInfo,
    ErrorGetUserWithCustomAttr,
    ErrorGetUserPO,
    ErrorClearCacheUser,
} from '../constant/AAAServiceError';

@Controller('api/v1')
@ClassMiddleware([pxAccessKey])
export class AAAController {
    private aaaService: AAAService;

    constructor() {
        this.aaaService = new AAAService();
    }

    /**
     * @swagger
     *
     * /api/v1/user/{userId}/name-email:
     *   get:
     *     tags:
     *       - CRUD
     *     summary: Get username and email
     *     description: Get username and email by user id
     *     produces:
     *       - application/json
     *     parameters:
     *       - $ref: '#/components/parameters/userId'
     *     responses:
     *       200:
     *         $ref: '#/components/responses/Success/nameAndEmail'
     *       403:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    @Get('user/:userId/name-email')
    private async getNameAndEmail(request: Request, response: Response) {
        try {
            const userId = request.params.userId;
            console.log('Get attribute for user: ' + userId);
            const aaaData = await this.aaaService.getBasicUserNameAndEmailAttribute(userId);
            return response.status(OK).json(aaaData);
        } catch (e) {
            return response.status(INTERNAL_SERVER_ERROR).json(ErrorGetUsernameAndEmail);
        }
    }

    /**
     * @swagger
     *
     * /api/v1/user/{userId}/name-email:
     *   delete:
     *     tags:
     *       - CRUD
     *     summary: Delete name and email
     *     description: Delete name and email by user id
     *     produces:
     *       - application/json
     *     parameters:
     *       - $ref: '#/components/parameters/userId'
     *     responses:
     *       200:
     *         $ref: '#/components/responses/Success/userInfoDelete'
     *       403:
     *         $ref: '#/components/responses/UnauthorizedError'
     */
    @Delete('user/:userId/name-email')
    private async clearNameAndEmailCache(request: Request, response: Response) {
        try {
            const userId = request.params.userId;
            console.log(`Clear cache for user ${userId}`);
            const result = await this.aaaService.clearNameAndEmailCache(userId);
            return response.status(OK).json(result);
        } catch (e) {
            return response.status(INTERNAL_SERVER_ERROR).json(ErrorClearCacheUser);
        }
    }

    /**
     * @swagger
     *
     * /api/v1/users/name-email:
     *   post:
     *     tags:
     *       - CRUD
     *     summary: Get username and email list
     *     description: Get list of username and email from cache table and update table in case of there is no data for any user id
     *     produces:
     *       - application/json
     *     requestBody:
     *       description: Send user id as an array
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               type: string
     *             example: ["PAXTRA77552", "PAXTRA77553", "PAXTRA77556"]
     *     responses:
     *       200:
     *         $ref: '#/components/responses/Success/nameAndEmailList'
     *       403:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    @Post('users/name-email')
    private async getNameAndEmailList(request: Request, response: Response) {
        try {
            const listUserId: string[] = request.body;

            if (!listUserId || !listUserId.length) {
                return response.status(OK).json([]);
            }
            console.log(`Get list username and email for these user id: ${listUserId.join(', ')}`);

            const aaaData = await this.aaaService.getNameAndEmailList(listUserId);

            return response.status(OK).json(aaaData);
        } catch (e) {
            return response.status(INTERNAL_SERVER_ERROR).json(ErrorGetUsernameAndEmail);
        }
    }

    /**
     * @swagger
     *
     * /api/v1/user/{userId}:
     *   get:
     *     tags:
     *       - CRUD
     *     summary: Get user info
     *     description: Get user info by user id
     *     produces:
     *       - application/json
     *     parameters:
     *       - $ref: '#/components/parameters/userId'
     *     responses:
     *       200:
     *         $ref: '#/components/responses/Success/userInfo'
     *       403:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    @Get('user/:userId')
    private async getBasicAttributes(request: Request, response: Response) {
        try {
            const userId = request.params.userId;
            console.log('Get attribute for user: ' + userId);
            const aaaData = await this.aaaService.getBasicUserAttributes(userId);
            return response.status(OK).json(aaaData);
        } catch (e) {
            return response.status(INTERNAL_SERVER_ERROR).json(ErrorGetFullUserInfo);
        }
    }

    /**
     * @swagger
     *
     * /api/v1/user/{userId}:
     *   post:
     *     tags:
     *       - CRUD
     *     summary: Get user info
     *     description: Get user info by user id
     *     produces:
     *       - application/json
     *     requestBody:
     *       description: Send user attribute as an array
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: array
     *             items:
     *               type: string
     *             example: ["PROFILE.FirstName", "PROFILE.LastName", "PROFILES.uuid", "PROFILES.UP"]
     *     parameters:
     *       - $ref: '#/components/parameters/userId'
     *     responses:
     *       200:
     *         $ref: '#/components/responses/Success/userInfoPost'
     *       403:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    @Post('user/:userId')
    private async getCustomAttributes(request: Request, response: Response) {
        try {
            const userId = request.params.userId;
            const attributes: string[] = request.body;
            if (!attributes || !attributes.length) {
                return response.status(OK).json([]);
            }
            console.log(`Get attribute for user: ${userId} with custom attributes: ${attributes.join(', ')}`);
            const aaaData = await this.aaaService.getUserAttributes(userId, attributes);
            return response.status(OK).json(aaaData);
        } catch (e) {
            return response.status(INTERNAL_SERVER_ERROR).json(ErrorGetUserWithCustomAttr);
        }
    }

    /**
     * @swagger
     *
     * /api/v1/user/{userId}:
     *   delete:
     *     tags:
     *       - CRUD
     *     summary: Delete user info
     *     description: Delete user info by user id
     *     produces:
     *       - application/json
     *     parameters:
     *       - $ref: '#/components/parameters/userId'
     *     responses:
     *       200:
     *         $ref: '#/components/responses/Success/userInfoDelete'
     *       403:
     *         $ref: '#/components/responses/UnauthorizedError'
     */
    @Delete('user/:userId')
    private async clearUserCache(request: Request, response: Response) {
        try {
            const userId = request.params.userId;
            console.log(`Clear cache for user ${userId}`);
            const result = await this.aaaService.clearUserCache(userId);
            return response.status(OK).json(result);
        } catch (e) {
            return response.status(INTERNAL_SERVER_ERROR).json(ErrorClearCacheUser);
        }
    }

    /**
     * @swagger
     *
     * /api/v1/user/{userId}/po/{po}:
     *   get:
     *     tags:
     *       - CRUD
     *     summary: Get PO
     *     description: Get PO of user info
     *     produces:
     *       - application/json
     *     parameters:
     *       - $ref: '#/components/parameters/userId'
     *       - $ref: '#/components/parameters/po'
     *     responses:
     *       200:
     *         $ref: '#/components/responses/Success/po'
     *       403:
     *         $ref: '#/components/responses/UnauthorizedError'
     *       500:
     *         $ref: '#/components/responses/InternalServerError'
     */
    @Get('user/:userId/po/:po')
    private async getUserPO(request: Request, response: Response) {
        try {
            const userId = request.params.userId;
            const po = request.params.po;
            console.log(`Get po ${po} for user ${userId}`);
            const poData = await this.aaaService.getPO(userId, po);
            return response.status(OK).json(poData);
        } catch (e) {
            return response.status(INTERNAL_SERVER_ERROR).json(ErrorGetUserPO);
        }
    }
}
