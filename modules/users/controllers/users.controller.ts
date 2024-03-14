import { Request, Response } from 'express';
import usersService from '../services/user.services';
import debug from 'debug';
import Utils from '../../../common/utils/';
import {
  apiOKResponse,
  apiCreatedResponse,
} from '../../../common/utils/apiResponses';

const log: debug.IDebugger = debug('app:users-controller');

class UsersController {
  async getAllUsers(req: Request, res: Response): Promise<void> {
    const users = await usersService.getAll(req.query);
    const controllerRes = new apiOKResponse(users, 'Users retrieved');
    res.status(controllerRes.statusCode).send(controllerRes);
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    const user = await usersService.getById(req.params.userId);
    const userData = Utils.cleanUserResponseData(user);
    const controllerRes = new apiOKResponse(userData, 'User retrieved');
    res.status(controllerRes.statusCode).send(controllerRes);
  }

  async getUserProfile(req: Request, res: Response): Promise<void> {
    const user = await usersService.getById(res.locals.user._id);
    const userData = Utils.cleanUserResponseData(user);
    const controllerRes = new apiOKResponse(userData, 'User retrieved');
    res.status(controllerRes.statusCode).send(controllerRes);
  }

  async createUser(req: Request, res: Response): Promise<void> {
    const { message, ...rest } = await usersService.create(req.body);
    const controllerRes = new apiOKResponse(rest, message);
    res.status(controllerRes.statusCode).send(controllerRes);
  }

  async getPasswordResetOtp(req: Request, res: Response): Promise<void> {
    const { message, ...rest } = await usersService.getResetPasswordOtp(
      req.params.email
    );
    const controllerRes = new apiOKResponse(rest, message);
    res.status(controllerRes.statusCode).send(controllerRes);
  }

  async resetPassword(req: Request, res: Response): Promise<void> {
    const { otp, password } = req.body;
    const { message, ...rest } = await usersService.resetPassword(
      otp,
      password,
    );
    const controllerRes = new apiOKResponse(rest, message);
    res.status(controllerRes.statusCode).send(controllerRes);
  }

}

export default new UsersController();
