import debug from 'debug';
import plansDao, { PlanDocument } from '../daos/plans.dao';
import { BadRequestError } from '../../../common/utils/errors';
import { UpdatePlanDto } from '../dtos/plans.dto';

const log: debug.IDebugger = debug('app:plan-service');
class PlanService {
  async create(resource: PlanDocument) {
    const existingPlan = await plansDao.findOne({ name: resource.name });

    if (existingPlan) {
      throw new BadRequestError('Plan already exists');
    }

    const createdPlan = await plansDao.create(resource);

    return {
      message: 'Plan created successfully',
      createdPlan,
    };
  }

  async findAll() {
    const plans = await plansDao.find({});
    return {plans};
  }

  async findById(id: string) {
    const plan = await plansDao.findById(id);
    return {plan};
  }

  async update(id: string, resource: UpdatePlanDto) {
    if (resource.name){
        const existingPlan = await plansDao.findOne({ name: resource.name });
        if (existingPlan) {
          throw new BadRequestError('Plan already exists');
        }
    }
    const updatedPlan = await plansDao.put({_id: id}, resource);
    return {
      message: 'Plan updated successfully',
      updatedPlan,
    };
  }

  delete(id: string) {
    
    const planExists = plansDao.findById(id);

    if (!planExists) {
      throw new BadRequestError('Plan does not exist');
    }
    
    return plansDao.delete({ _id: id });
  }
}

export default new PlanService();
