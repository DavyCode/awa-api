import { MongooseObjectId } from "../../../common/types/mongoose.types";

export interface ReferralDto {
  save(): unknown;
  _id: MongooseObjectId | string;
  // add other properties as needed
}

export interface CreateReferralDto {
  // add properties for updating a role as needed
}

export interface PatchReferralDto {
  // add properties for updating a role as needed
}

export interface PutReferralDto {
  // add properties for updating a role as needed
}