import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Secret } from 'jsonwebtoken';
import config from '../../config';
import ApiError from '../../errors/ApiError';
import { jwtHelper } from '../../helpers/jwtHelper';
import { User } from '../modules/user/user.model';

const auth =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenWithBearer = req.headers.authorization;
      if (!tokenWithBearer) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
      }

      const [scheme, token, extra] = tokenWithBearer.trim().split(/\s+/);
      if (scheme !== 'Bearer' || !token || extra) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
      }

      const verifyUser = jwtHelper.verifyToken(
        token,
        config.jwt.jwt_secret as Secret,
      );
      const currentUser = await User.findById(verifyUser.id).select(
        'role status isBlocked verified',
      );
      if (
        !currentUser ||
        !currentUser.verified ||
        currentUser.status === 'banned' ||
        currentUser.isBlocked
      ) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not authorized');
      }

      verifyUser.role = currentUser.role;
      req.user = verifyUser;

      if (roles.length && !roles.includes(currentUser.role)) {
        throw new ApiError(
          StatusCodes.FORBIDDEN,
          "You don't have permission to access this api",
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };

export default auth;
