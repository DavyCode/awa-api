import { MongooseObjectId } from '../../../common/types/mongoose.types';
import { ProfileDto } from './profile.dto';

export interface CreateRoleDto {
  name: string[];
  profiles: MongooseObjectId[];
  // add other role creation properties as needed
}

export interface PatchRoleDto {
  // add properties for patching a role as needed
}

export interface PutRoleDto {
  // add properties for updating a role as needed
}

export interface RoleDto {
  save(): unknown;
  _id: MongooseObjectId | string;
  name: string[];
  profiles: ProfileDto[];
  createdAt: Date;
  updatedAt: Date;
}