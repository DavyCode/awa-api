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
    async findById(req: Request, res: Response) {
        const { id } = req.params;
        const plan = await plansService.findById(id);
        const controllerRes = new apiOKResponse(plan, 'Plan retrieved');
        res.status(controllerRes.statusCode).send(controllerRes);
    }
    async update(req: Request, res: Response) {
        const { id } = req.params;
        const { message, ...rest } = await plansService.update(id, req.body);
        const controllerRes = new apiOKResponse(rest, message);
        res.status(controllerRes.statusCode).send(controllerRes);
    }
    async delete(req: Request, res: Response) {
        const { id } = req.params;
        await plansService.delete(id);
        const controllerRes = new apiOKResponse({}, 'Plan deleted');
        res.status(controllerRes.statusCode).send(controllerRes);
    }
}

export default new PlansController()