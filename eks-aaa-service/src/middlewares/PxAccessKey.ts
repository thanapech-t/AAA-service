import { Request, Response, NextFunction } from 'express';
import { FORBIDDEN } from 'http-status-codes';
import { PxAccessKeyError } from '../constant/PxAccessKeyError';

export const PX_KEY_NAME = 'px-access-key';
export const PX_KEY_VALUE = 'inevitable.thanos';

export function pxAccessKey(req: Request, res: Response, next: NextFunction) {
  const accessKey = req.headers[PX_KEY_NAME] as string;

  if (!accessKey || accessKey !== PX_KEY_VALUE) {
    console.error(`Invalid ${PX_KEY_NAME}: ${accessKey}`);

    return res.status(FORBIDDEN).send(PxAccessKeyError);
  }

  next();
}
