import debug from 'debug';
import plansDao, { PlanDocument } from '../daos/plans.dao';
import { BadRequestError } from '../../../common/utils/errors';


const log: debug.IDebugger = debug('app:plan-service');
class SubscriptionService {
  async create(resource: PlanDocument) {
    return {
      message: 'Subscription created successfully',
      createdSubscription: resource,
    };
  }
}

export default new SubscriptionService();
