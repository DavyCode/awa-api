import mongooseService from '../../../setup/db/mongoose.services';
import debug from 'debug';

import Utils from '../../../common/utils';

import {
  MongooseObjectId,
  MongooseUpdateOptions,
} from '../../../common/types/mongoose.types';
import { HydratedDocument } from 'mongoose';
import { PlanInterval } from '../../../common/constant';
import { CreateSubscriptionDto } from '../dtos/subscriptions.dto';

const log: debug.IDebugger = debug('app:subscription-dao');

const MongooseSchema = mongooseService.getMongoose().Schema;

export enum SubscriptionBeneficiaries {
  SELF = "Self",
  SELFANDOTHERS = "SelfAndOthers",
  OTHERS = "Others"
}

export type BeneficiaryType = {
  first_name: string;
  last_name: string;
  email: string;
  country: string;
  phone_number: string;
  dob: Date;
  marital_status: string;
  address: string;
  state_of_origin: string;
  lga: string;
  qualification: string;
  nin: string;
  bankDetails: {};
  nextOfKin: {};
  hasMicroPensionAccount: string;
  pfa?: string;
  rsa?: string;
  numberOfBeneficiaries: number;
  passport?: string;
  signature?: string;
  nin_slip?: string;
};

export type SubscriptionType = {
  user: MongooseObjectId;
  plan: MongooseObjectId;
  amount: number;
  endDate: Date;
  interval: PlanInterval;
  promoCode: string;
  beneficiaries: BeneficiaryType[];
  subscribeFor: SubscriptionBeneficiaries;
  status: string;
};

export type SubscriptionDocument = HydratedDocument<SubscriptionType>;

class SubscriptionDao {
  Schema = MongooseSchema;

  /**
   * Subscription Schema
   */
  subscriptionSchema = new this.Schema({
    user: {
      ref: "User",
      type: MongooseSchema.Types.ObjectId,
    },
    plan: {
      ref: "Plan",
      type: MongooseSchema.Types.ObjectId,
    },
    amount: { type: Number },
    endDate: { type: Date },
    interval: { type: String, enum: PlanInterval },
    promoCode: { type: String },
    beneficiaries: [{}],
    subscribeFor: { type: String, enum: SubscriptionBeneficiaries },
    status: { type: String },
  }, { timestamps: true });

  Subscription = mongooseService
    .getMongoose()
    .model('Plans', this.subscriptionSchema);

  constructor() {
    log('Created new instance of SubscriptionDao');

    this.subscriptionSchema.methods.toJSON = function () {
      const obj = this.toObject();
      return obj;
    };

    this.subscriptionSchema.index({ '$**': 'text' });
  }

  /**
   * create
   * @param subscriptionDetails CreateSubscriptionDto)
   */
  async create(subscriptionDetails: CreateSubscriptionDto) {
    return await this.Subscription.create(subscriptionDetails);
  }
}

export default new SubscriptionDao();
