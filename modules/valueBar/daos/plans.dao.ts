import mongooseService from '../../../setup/db/mongoose.services';
import debug from 'debug';
import { CreatePlanDto, UpdatePlanDto } from "../dtos/plans.dto";

import Utils from '../../../common/utils';

import {
  MongooseObjectId,
  MongooseUpdateOptions,
} from '../../../common/types/mongoose.types';
import { HydratedDocument } from "mongoose";
import { PlanInterval } from '../../../common/constant';

const log: debug.IDebugger = debug('app:Plan-dao');

const MongooseSchema = mongooseService.getMongoose().Schema;

export type PlanType = {
  name: string;
  description: string;
  amount: number;
  interval: string;
};

export type PlanDocument = HydratedDocument<PlanType, MongooseObjectId>;

class PlanDao {
  Schema = MongooseSchema;

    /**
   * Plan SCHEMA
   */
  planSchema = new this.Schema(
    {
      name: {
        type: String,
      },
      description: {
        type: String,
      },
      amount: {
        type: Number,
      },
      interval: {
        type: String,
        enum: PlanInterval,
      },
    },
     { timestamps: true },
  );

  Plan = mongooseService.getMongoose().model('Plans', this.planSchema);

  constructor() {
    log('Created new instance of PlanDao');

    this.planSchema.methods.toJSON = function () {
      const obj = this.toObject();
      return obj;
    };

    this.planSchema.index({ '$**': 'text' });
  }

  /**
   * create
   * @param planFields CreatePlanDto)
   */
  async create(planFields: CreatePlanDto) {
    return await this.Plan.create(planFields);
  }


  /**
   * putById
   * @param referralId
   * @param planFields
   * @param option
   */
  async putById(
    referralId: string | MongooseObjectId,
    planFields: UpdatePlanDto,
    option?: MongooseUpdateOptions | null,
  ): Promise<any> {
    if (!mongooseService.validMongooseObjectId(referralId)) {
      return Promise.resolve(false);
    }
    return await this.Plan.findOneAndUpdate(
      { _id: referralId },
      {
        $set: planFields,
        updatedAt: Date.now(),
      },
      option,
    )
      .exec();
  }

  /**
   * put
   * @param query
   * @param update
   * @param option
   */
  async put(
    query: any,
    update: any,
    option: MongooseUpdateOptions,
  ): Promise<any> {
    if (query._id) {
      if (!mongooseService.validMongooseObjectId(query._id)) {
        return Promise.resolve(false);
      }
    }
    return await this.Plan.findOneAndUpdate(
      query,
      {
        $set: update,
        updatedAt: Date.now(),
      },
      option,
    )
      .exec();
  }

  /**
   * findById
   * @param referralId ReferralDto
   * @public
   */
  async findById(referralId: string | MongooseObjectId): Promise<any> {
    if (!mongooseService.validMongooseObjectId(referralId)) {
      return Promise.resolve(false);
    }
    return await this.Plan.findOne({ _id: referralId }).exec();
  }

  /**
   * findOne
   * @param query
   */
  async findOne(query: any) {
    if (query._id) {
      if (!mongooseService.validMongooseObjectId(query._id)) {
        return Promise.resolve(false);
      }
    }
    return await this.Plan.findOne(query).exec();
  }

    /**
   * find
   * @param query
   * @return PlanDocument[]
   */
  find(query: any) {
    return this.Plan.find(query).exec();
  }

  /**
   * savePlan
   * @param planInstance
   */
  async savePlan(planInstance: PlanDocument) {
    return planInstance.save();
  }
}

export default new PlanDao();
