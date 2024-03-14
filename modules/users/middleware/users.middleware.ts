import { Request, Response, NextFunction } from 'express';
import userService from '../services/user.services';
import debug from 'debug';
import { NotFoundError, BadRequestError } from '../../../common/utils/errors';

const log: debug.IDebugger = debug('app:users-controller');

class UsersMiddleware {
  async validateAuthUserExist(req: Request, res: Response, next: NextFunction) {
    const user = await userService.getById(res.locals.jwt.userId);
    if (user) {
      res.locals.user = user;
      next();
    } else {
      throw new NotFoundError('User not found');
    }
  }

  async validateSameEmailDoesntExist(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const user = await userService.getUserByEmail(req.body.email);
    if (user) {
      throw new BadRequestError('User email already exists');
    } else {
      next();
    }
  }
}

export default new UsersMiddleware();
