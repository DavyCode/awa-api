import { MongooseObjectId } from '../../../common/types/mongoose.types';

export interface UserDto {
  save(): unknown;
  _id: MongooseObjectId | string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  validated?: boolean;
  phoneVerified?: boolean;
  resetPassOtp?: string;
  password?: string;
  isEmailVerified?: boolean;
  verifyEmailOtp?: string;
  role?: string;
  accountType?: string;
  createdAt: NativeDate;
  updatedAt: NativeDate;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password?: string;
  registeredMethod?: string;
  validated?: boolean;
  accountType?: string;
  otpRequestCount: number;
  verifyPhoneOtpTimer: Date | number;
  verifyPhoneOtp: string;
  emailVerificationToken: number | string;
  referral_code: string;
  phoneCountryCode: string;
  regionCode: string;
  referredBy: string | undefined;
}

export interface PutUserDto {
  email: string;
  firstName: string;
  lastName: string;
  // ... add other user info
}

export interface PatchUserDto extends Partial<PutUserDto> {}
