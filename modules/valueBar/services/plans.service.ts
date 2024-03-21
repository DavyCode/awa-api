import debug from 'debug';
import plansDao, { PlanDocument } from '../daos/plans.dao';
import { BadRequestError } from '../../../common/utils/errors';

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

  async findById() {}

  async update() {}

  delete() {}
}

export default new PlanService();
