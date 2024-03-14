import { Request, Response, NextFunction } from 'express';
import usersService from '../../users/services/user.services';
import {
  UnauthorizedError,
  ForbiddenError,
  BadRequestError,
} from '../../../common/utils/errors';
import { RolesType } from '../../../common/constant';
import accessRolesControl from './accessRoleControl';
import UsersDao from '../../users/daos/users.dao';

class AuthMiddleware {
  /**
   * verifyUserPassword.
   * @param request
   * @param response
   * @param next
   */
  async verifyUserPassword(req: Request, res: Response, next: NextFunction) {
    const user: any = await usersService.getUserByEmail(
      req.body.email,
    );

    if (user) {
      const isPasswordMatch = await UsersDao.comparePasswords(
        user,
        req.body.password,
      );
      if (!isPasswordMatch) {
        throw new BadRequestError('Password does not match user account');
      }

      res.locals.user = user;
      return next();
    } else {
      throw new BadRequestError('Invalid Email, user not found');
    }
  }

  /**
   * ensureAuth
   * @param request
   * @param response
   * @param next
   */
  async ensureAuth(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    if (!response.locals.jwt) {
      throw new UnauthorizedError('Unauthorized');
    }

    return next();
  }

  /**
   * ensureSupport
   * @param request
   * @param response
   * @param next
   */
  async ensureAdmin(
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    if (!response.locals.jwt) {
      throw new UnauthorizedError('Unauthorized');
    }
    if (response.locals.jwt.role !== RolesType.ADMIN) {
      if (response.locals.jwt.role !== RolesType.SUPPORT) {
        throw new ForbiddenError('Access denied, admin privilege required');
      }
    }
    return next();
  }

  /**
   * grantRoleAccess
   * @param action
   * @param resource
   * @returns NextFunction
   */
  grantRoleAccess(action: string, resource: string) {
    return async (request: Request, response: Response, next: NextFunction) => {
      const permission = accessRolesControl
        .can(response.locals.jwt.role)
        [action](resource);
      if (!permission.granted) {
        throw new ForbiddenError(
          "You don't have enough permission to perform this action",
        );
      }
      return next();
    };
  }
}

export default new AuthMiddleware();
