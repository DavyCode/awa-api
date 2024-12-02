import { Request, Response } from "express";
import { apiOKResponse } from "../../../common/utils/apiResponses";
import SubscriptionsService from "../services/subscriptions.service";


class SubscriptionsController {
    async create(req: Request, res: Response) {
        const { message, ...rest } = await SubscriptionsService.create(req.body);
        const controllerRes = new apiOKResponse(rest, message);
        res.status(controllerRes.statusCode).send(controllerRes);
    }
}

export default new SubscriptionsController()