/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload, Secret, SignOptions } from 'jsonwebtoken';

const createToken = (
  payload: string | object | Buffer,
  secret: Secret,
  expireTime?: string | number
) => {
  const options: SignOptions = {};
  if (expireTime) {
    options.expiresIn = expireTime as SignOptions['expiresIn'];
  }

  return jwt.sign(payload as any, secret as any, options);
};

const verifyToken = (token: string, secret: Secret) => {
  return jwt.verify(token as string, secret as any) as JwtPayload;
};

export const jwtHelper = { createToken, verifyToken };
