import { Document, Model } from "../../../common/types/mongoose.types";
import mongooseService from '../../../setup/db/mongoose.services';
import debug from 'debug';
import { CreateReferralDto, PatchReferralDto, PutReferralDto, ReferralDto } from '../dto/referral.dto';
import {
  AccountType,
} from '../../../common/constant';
import Utils from '../../../common/utils';

import {
  MongooseObjectId,
  MongooseUpdateOptions,
} from '../../../common/types/mongoose.types';

const log: debug.IDebugger = debug('app:Referral-dao');

const MongooseSchema = mongooseService.getMongoose().Schema;

class ReferralDao {
  Schema = MongooseSchema;

  getAmount(value: any) {
		if (typeof value !== "undefined") {
			return parseFloat(value.toString());
		}
		return value;
	}

  /**
   * Referral SCHEMA
   */
  referralSchema = new this.Schema(
    {
      user: {
				ref: "User",
				type: MongooseSchema.Types.ObjectId,
			},
      referral_code: {
				type: String,
				trim: true,
				lowercase: true,
			},
			referred_by: {
				ref: "User",
				type: MongooseSchema.Types.ObjectId,
			},
			referral_balance: {
				type: MongooseSchema.Types.Decimal128,
				default: 0.0,
				get: this.getAmount,
			},
			total_referral_earning: {
				type: MongooseSchema.Types.Decimal128,
				default: 0.0,
				get: this.getAmount,
			},
			referral_transactions: [
				{
					ref: "Transaction",
					type: MongooseSchema.Types.ObjectId,
				},
			],
			referred_users: [
				{
					ref: "User",
					type: MongooseSchema.Types.ObjectId,
				},
			],
    },
    { timestamps: true },
  );

  Referral = mongooseService.getMongoose().model('Referrals', this.referralSchema);

  constructor() {
    log('Created new instance of ReferralDao');

    this.referralSchema.methods.toJSON = function () {
      const obj = this.toObject();
      return obj;
    };

    this.referralSchema.index({ '$**': 'text' });
  }

  /**
   * create
   * @param referralFields CreateReferralDto
   */
  async create(referralFields: CreateReferralDto) {
    return await this.Referral.create(referralFields);
  }

  async getAllReferralsAndFilter(query: any) {
    const paginate = { skip: 0, limit: 20 };

    if (query && query.skip && query.limit) {
      paginate.skip = Number(query.skip);
      paginate.limit = Number(query.limit);
    }

    const filterParams = { ...query };

    if (query.date) {
      filterParams.createdAt = {
        $gte: new Date(new Date(query.date).setHours(0o0, 0o0, 0o0)),
        $lt: new Date(new Date(query.date).setHours(23, 59, 59)),
      };
    }

    if (query.startDate && query.endDate) {
      filterParams.createdAt = {
        $gte: new Date(new Date(query.startDate).setHours(0o0, 0o0, 0o0)),
        $lt: new Date(new Date(query.endDate).setHours(23, 59, 59)),
      };
    }

    const { skip, limit, date, endDate, startDate, ...rest } = filterParams;

    const data = await this.Referral.find({ ...rest })
      .limit(paginate.limit)
      .skip(paginate.skip)
      .sort({ createdAt: -1 })
      .exec();

    const totalDocumentCount = await this.Referral.count({
      ...rest,
    });

    return Promise.resolve({
      referrals: data,
      totalDocumentCount,
      skip: paginate.skip,
      limit: paginate.limit,
      queryWith: query,
    });
  }

  /**
   * putById
   * @param referralId
   * @param referralFields
   * @param option
   */
  async putById(
    referralId: string | MongooseObjectId,
    referralFields: PutReferralDto | PatchReferralDto | any,
    option?: MongooseUpdateOptions | null,
  ): Promise<any> {
    if (!mongooseService.validMongooseObjectId(referralId)) {
      return Promise.resolve(false);
    }
    return await this.Referral.findOneAndUpdate(
      { _id: referralId },
      {
        $set: referralFields,
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
    return await this.Referral.findOneAndUpdate(
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
    return await this.Referral.findOne({ _id: referralId }).exec();
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
    return await this.Referral.findOne(query).exec();
  }

  /**
   * saveReferral
   * @param referralInstance
   */
  async saveReferral(referralInstance: ReferralDto) {
    return referralInstance.save();
  }
}

export default new ReferralDao();
