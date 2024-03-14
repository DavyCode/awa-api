import { MongooseObjectId } from "../../../common/types/mongoose.types";

export interface ProfileDto {
  save(): unknown;
  _id: MongooseObjectId | string;
  // add other properties as needed
}

export interface Profile {
  _id: MongooseObjectId | string;
  // add other properties as needed
}

export interface PutProfileDto {
  // add other properties as needed
}

export interface PatchProfileDto {
  // add other properties as needed
}

export interface CreateProfileDto {
  // add other properties as needed
}