import { Request, Response } from "express";
import { apiOKResponse } from "../../../common/utils/apiResponses";
import plansService from "../services/plans.service";

class PlansController {
    async create(req: Request, res: Response) {
        const { message, ...rest } = await plansService.create(req.body);
        const controllerRes = new apiOKResponse(rest, message);
        res.status(controllerRes.statusCode).send(controllerRes);
    }
    async findAll(req: Request, res: Response) {
        const plans: any = await plansService.findAll();
        const controllerRes = new apiOKResponse(plans, 'Plans retrieved');
        res.status(controllerRes.statusCode).send(controllerRes);
    }
    async findById() {}
    async update() {}
    async delete() {}
}

export default new PlansController()