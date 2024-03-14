import mongooseService from '../../../setup/db/mongoose.services';
import debug from 'debug';
import { ProfileDto, PutProfileDto, PatchProfileDto, CreateProfileDto } from '../dto/profile.dto';
import {
  RolesType,
  AccountType,
} from '../../../common/constant';
import Utils from '../../../common/utils';
import bcrypt from 'bcryptjs';

import {
  MongooseObjectId,
  MongooseUpdateOptions,
} from '../../../common/types/mongoose.types';

const log: debug.IDebugger = debug('app:profile-dao');

const MongooseSchema = mongooseService.getMongoose().Schema;

class ProfilesDao {
  Schema = MongooseSchema;
  /**
   * PROFILE SCHEMA
   */
  profileSchema = new this.Schema(
    {
      bonuses: { type: Array },
      microPensionsAdded: { type: Array },
      paymentCards: { type: Array },
      referrals: { type: Array },
      transactions: { type: Array },
      verifications: { type: Array },
      role: {
        type: MongooseSchema.Types.ObjectId,
				ref: 'Role',
      },
      user: {
        type: MongooseSchema.Types.ObjectId,
				ref: 'User',
      },
      referralCode: { type: String },
      business: {
        type: MongooseSchema.Types.ObjectId,
				ref: 'Business',
      },
      enrollmentIdentification: { type: String },
      teamPayments: { type: Array },
      plan: {
        type: MongooseSchema.Types.ObjectId,
				ref: 'Plan',
      },
      provider: {
        type: MongooseSchema.Types.ObjectId,
				ref: 'Provider',
      },
      rsaPin: { type: String },
      team: {
        type: MongooseSchema.Types.ObjectId,
				ref: 'Team',
      },
    },
    { timestamps: true },
  );

  Profile = mongooseService.getMongoose().model('Profiles', this.profileSchema);

  constructor() {
    log('Created new instance of ProfilesDao');

    this.profileSchema.methods.toJSON = function () {
      const obj = this.toObject();
      return obj;
    };

    this.profileSchema.index({ '$**': 'text' });
  }

  /**
   * create
   * @param profileFields CreateProfileDto
   */
  async create(profileFields: CreateProfileDto) {
    return await this.Profile.create(profileFields);
  }

  async getAllProfilesAndFilter(query: any) {
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

    const data = await this.Profile.find({ ...rest })
      .limit(paginate.limit)
      .skip(paginate.skip)
      .sort({ createdAt: -1 })
      .exec();

    const totalDocumentCount = await this.Profile.count({
      ...rest,
    });

    return Promise.resolve({
      profiles: data,
      totalDocumentCount,
      skip: paginate.skip,
      limit: paginate.limit,
      queryWith: query,
    });
  }

  /**
   * putById
   * @param profileId
   * @param profileFields
   * @param option
   */
  async putById(
    profileId: string | MongooseObjectId,
    profileFields: PutProfileDto | PatchProfileDto | any,
    option?: MongooseUpdateOptions | null,
  ): Promise<any> {
    if (!mongooseService.validMongooseObjectId(profileId)) {
      return Promise.resolve(false);
    }
    return await this.Profile.findOneAndUpdate(
      { _id: profileId },
      {
        $set: profileFields,
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
    return await this.Profile.findOneAndUpdate(
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
   * @param profileId
   * @public
   */
  async findById(profileId: string | MongooseObjectId): Promise<any> {
    if (!mongooseService.validMongooseObjectId(profileId)) {
      return Promise.resolve(false);
    }
    return await this.Profile.findOne({ _id: profileId }).exec();
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
    return await this.Profile.findOne(query).exec();
  }

  /**
   * saveProfile
   * @param profileInstance
   */
  async saveProfile(profileInstance: ProfileDto) {
    return profileInstance.save();
  }
}

export default new ProfilesDao();
