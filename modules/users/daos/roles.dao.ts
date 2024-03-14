import { Document, Model } from "../../../common/types/mongoose.types";
import mongooseService from '../../../setup/db/mongoose.services';
import debug from 'debug';
import { CreateRoleDto, PatchRoleDto, PutRoleDto, RoleDto } from '../dto/role.dto';

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

const log: debug.IDebugger = debug('app:role-dao');

const MongooseSchema = mongooseService.getMongoose().Schema;

class RolesDao {
  Schema = MongooseSchema;
  /**
   * ROLE SCHEMA
   */
  roleSchema = new this.Schema(
    {
      name: { type: Array },
      profiles: [
        {
          type: MongooseSchema.Types.ObjectId,
          ref: 'Profile',
        },
      ],
    },
    { timestamps: true },
  );

  Role = mongooseService.getMongoose().model('Roles', this.roleSchema);

  constructor() {
    log('Created new instance of RolesDao');

    this.roleSchema.methods.toJSON = function () {
      const obj = this.toObject();
      return obj;
    };

    this.roleSchema.index({ '$**': 'text' });
  }

  /**
   * create
   * @param roleFields CreateRoleDto
   * @returns
   */
  async create(roleFields: CreateRoleDto) {
    return await this.Role.create(roleFields);
  }

  async getAllRolesAndFilter(query: any) {
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

    const data = await this.Role.find({ ...rest })
      .limit(paginate.limit)
      .skip(paginate.skip)
      .sort({ createdAt: -1 })
      .exec();

    const totalDocumentCount = await this.Role.count({
      ...rest,
    });

    return Promise.resolve({
      roles: data,
      totalDocumentCount,
      skip: paginate.skip,
      limit: paginate.limit,
      queryWith: query,
    });
  }

  /**
   * putById
   * @param roleId
   * @param roleFields
   * @param option
   * @returns
   */
  async putById(
    roleId: string | MongooseObjectId,
    roleFields: PutRoleDto | PatchRoleDto | any,
    option?: MongooseUpdateOptions | null,
  ): Promise<any> {
    if (!mongooseService.validMongooseObjectId(roleId)) {
      return Promise.resolve(false);
    }
    return await this.Role.findOneAndUpdate(
      { _id: roleId },
      {
        $set: roleFields,
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
   * @returns
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
    return await this.Role.findOneAndUpdate(
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
   * @param roleId
   * @returns RoleDto
   * @public
   */
  async findById(roleId: string | MongooseObjectId): Promise<any> {
    if (!mongooseService.validMongooseObjectId(roleId)) {
      return Promise.resolve(false);
    }
    return await this.Role.findOne({ _id: roleId }).exec();
  }

  /**
   * findOne
   * @param query
   * @returns
   */
  async findOne(query: any) {
    if (query._id) {
      if (!mongooseService.validMongooseObjectId(query._id)) {
        return Promise.resolve(false);
      }
    }
    return await this.Role.findOne(query).exec();
  }

  /**
   * saveRole
   * @param roleInstance
   * @returns
   */
  async saveRole(roleInstance: RoleDto) {
    return roleInstance.save();
  }
}

export default new RolesDao();
