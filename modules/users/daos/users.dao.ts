import mongooseService from '../../../setup/db/mongoose.services';
import debug from 'debug';
import { UserDto, PutUserDto, PatchUserDto, CreateUserDto } from '../dto/user.dto';
import {
  RolesType,
  AccountType,
  HowDidYouHearAboutUs,
} from '../../../common/constant';
import Utils from '../../../common/utils';
import bcrypt from 'bcryptjs';

import {
  MongooseObjectId,
  MongooseUpdateOptions,
} from '../../../common/types/mongoose.types';

const log: debug.IDebugger = debug('app:user-dao');

const MongooseSchema = mongooseService.getMongoose().Schema;

class UsersDao {
  Schema = MongooseSchema;
  /**
   * USER SCHEMA
   */
  userSchema = new this.Schema(
    {
      profileImage: {
        type: String,
        default:
          "https://images.unsplash.com/placeholder-avatars/extra-large.jpg",
      },
      bvnVerified: { type: Boolean, default: false },
      bvn: { type: String, trim: true, default: '', },
      active: { type: Boolean, default: false },
      isDeleted: { type: Boolean, default: false },
      ninVerified: { type: Boolean, default: false },
      nin: { type: String, trim: true, default: '' },
      verificationStatus: { type: Boolean, default: false },
      email: {
        type: String,
        index: true,
        lowercase: true,
        trim: true,
        match: /^\w+([\\.-]?\w+)*@\w+([\\.-]?\w+)*(\.\w{2,3})+$/,
        unique: true,
        // required: [true, "Email is required!"], // was unique
      },
      emailVerified: { type: Boolean, default: false },
      emailVerificationToken: { type: String },
      firstName: { type: String, trim: true },
      lastName: { type: String, trim: true },
      passwordHash: { type: String },
      phoneNumber: {
        type: String,
        unique: true,
        index: true,
        trim: true,
        required: true,
      },
      phoneVerified: {
        type: Boolean,
        default: false,
      },
      resetPasswordOtp: {
        type: String,
      },
      role: {
        type: String,
        default: RolesType.USER,
        enum: [...Utils.getObjectValues(RolesType)],
      },
      accountType: {
        type: String,
        default: AccountType.Individual,
        enum: [...Utils.getObjectValues(AccountType)],
      },
      // TODO: Extra
      phoneCountryCode: { type: String, trim: true },
      country: { type: String, trim: true },
      businessName: { type: String, trim: true },
      businessLocation: { type: String, trim: true },
      regionCode: { type: String, trim: true },
      // nationality: { type: String, trim: true },
      // country: { type: String, trim: true },
      lock: { type: Boolean, default: false },
      verifyPhoneOtp: { type: String },
      verifyPhoneOtpTimer: { type: Date }, // timer for phone verification
      otpRequestCount: { type: Number, default: 1 },
      // Referral
      referral_code: {
				type: String,
				trim: true,
				lowercase: true,
			},
      referralRecord: {
        type: MongooseSchema.Types.ObjectId,
        ref: "Referral",
      },
      howDidYouHearAboutUs: {
        type: String,
        trim: true,
        default: HowDidYouHearAboutUs.OTHER,
        enum: [...Utils.getObjectValues(HowDidYouHearAboutUs)],
      },
    },
    { timestamps: true },
  );

  User = mongooseService.getMongoose().model('Users', this.userSchema);

  constructor() {
    log('Created new instance of UsersDao');

    this.userSchema.virtual('password').set(function (val: any) {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(val, salt);
      this.passwordHash = hash;
    });
}

  /**
   * comparePasswords
   * @param userInstance
   * @param password
   */
  async comparePasswords(userInstance: any, password: string) {
    return bcrypt.compareSync(password, userInstance.passwordHash);
  }

  /**
   * hashPassword
   * @param password hash string
   */
  async hashPassword(password: string) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  }

  /**
   * create
   * @param userFields CreateUserDto
   */
  async create(userFields: CreateUserDto) {
    return await this.User.create(userFields);
  }

  async getAllUsersAndFilter(query: any) {
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

    const data = await this.User.find({ ...rest })
      .limit(paginate.limit)
      .skip(paginate.skip)
      .sort({ createdAt: -1 })
      .select('-passwordHash')
      .exec();

    const totalDocumentCount = await this.User.count({
      ...rest,
    });

    return Promise.resolve({
      users: data,
      totalDocumentCount,
      skip: paginate.skip,
      limit: paginate.limit,
      queryWith: query,
    });
  }

  /**
   * putById
   * @param userId
   * @param userFields
   * @param option
   */
  async putById(
    userId: string | MongooseObjectId,
    userFields: PutUserDto | PatchUserDto | any,
    option?: MongooseUpdateOptions | null,
  ): Promise<any> {
    if (!mongooseService.validMongooseObjectId(userId)) {
      return Promise.resolve(false);
    }
    return await this.User.findOneAndUpdate(
      { _id: userId },
      {
        $set: userFields,
        updatedAt: Date.now(),
      },
      option,
    )
      .select('-passwordHash')
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
    return await this.User.findOneAndUpdate(
      query,
      {
        $set: update,
        updatedAt: Date.now(),
      },
      option,
    )
      .select('-passwordHash')
      .exec();
  }

  /**
   * findById
   * @param userId
   * @public
   */
  async findById(userId: string | MongooseObjectId): Promise<any> {
    if (!mongooseService.validMongooseObjectId(userId)) {
      return Promise.resolve(false);
    }
    return await this.User.findOne({ _id: userId }).select('-passwordHash').exec();
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
    return await this.User.findOne(query).exec();
  }

  /**
   * saveUser
   * @param userInstance
   */
  async save(userInstance: UserDto) {
    return userInstance.save();
  }
}

export default new UsersDao();
