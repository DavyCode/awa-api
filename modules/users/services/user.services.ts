import UsersDao from '../daos/users.dao';
import { CRUD } from '../../../common/interfaces/crud.interface';
import { PutUserDto, CreateUserDto } from '../dto/user.dto';
import {
  BadRequestError,
  NotFoundError,
  ForbiddenError,
  NotAcceptableError,
} from '../../../common/utils/errors';
import Utils from '../../../common/utils/';
import JWTMiddleware from '../../auth/middleware/jwt.middleware';
import sendMail from '../../../common/services/sendMail';
import authServices from '../../auth/services/auth.services';
import { UserDto } from '../dto/user.dto';
import { MongooseObjectId } from '../../../common/types/mongoose.types';
import { JWT_EXPIRATION_MINUTES, JWT_BEARER, CLIENT_HOST } from '../../../config/env';
import { AccountType } from '../../../common/constant';
import Pubsub from '../../../events/user.events.listener';
import phoneUtils, { getPhoneDetails } from '../../../common/utils/phone.utils';
import ReferralDao from "../daos/referral.dao";
import notificationServices from '../../notification/notification.services';

class UsersService implements CRUD {
  async putById(
    id: string | MongooseObjectId,
    resource: PutUserDto,
  ): Promise<any> {
    return UsersDao.putById(id, resource);
  }

  async getById(id: string | MongooseObjectId) {
    const user = await UsersDao.findById(id);

    if (!user) {
      throw new NotFoundError(`User not found`);
    }

    return user;
  }

  async getAll(query: any) {
    return UsersDao.getAllUsersAndFilter(query);
  }

  async getUserByEmail(email: string) {
    return UsersDao.findOne({email});
  }

  async getUserByPhone(phoneNumber: string) {
    return UsersDao.findOne({phoneNumber});
  }

  async create(resource: CreateUserDto) {
    const { phoneNumber, email, referredBy, firstName } = resource

    const phoneDetails = getPhoneDetails(phoneNumber);
		if (!phoneDetails.fullPhone || phoneDetails.regionCode == "null") {
			throw new BadRequestError(
				"Provide a valid phone number with country code"
			);
		}

    const phoneExist: any = await UsersDao.findOne({ phoneNumber: phoneDetails.fullPhone })
    
    if (phoneExist) {
      throw new ForbiddenError('Phone Number already taken');
    }

    // if (phoneExist && phoneExist.phoneVerified) {
    //   throw new ForbiddenError('Phone Number already taken');
    // }

    // if (phoneExist && !phoneExist.phoneVerified && phoneExist.verifyPhoneOtpTimer && new Date(phoneExist.verifyPhoneOtpTimer) > new Date()) {
    //   throw new BadRequestError('Wait after 2 mins to request new verification OTP');
    // }

    // if (phoneExist) {
    //   if (phoneExist.otpRequestCount >= 5) { 
    //     throw new BadRequestError('Maximum OTP request limit. Contact support to proceed');
    //   }

    //   const updatedUser = await UsersDao.put({ _id: phoneExist._id }, {
    //     otpRequestCount: phoneExist.otpRequestCount + 1,
    //     verifyPhoneOtpTimer: Utils.genTimeStamp(60, 2),
    //     verifyPhoneOtp: Utils.genRandomNum(1, 6),
    //   }, {upsert: false, new: true })

    //   await notificationServices.sendTermiiSms({
    //     message: `Your Awabah code is ${updatedUser.verifyPhoneOtp}. Valid for 10 minutes, one-time use only.`,
    //     phone: `${updatedUser.phoneNumber}`
    //   })

    //   return {
    //     message: 'Verification OTP sent to phone'
    //   }
    // }

    // at this point we try to create a user
    const emailExist: any = await UsersDao.findOne({
      email: email.toLowerCase(),
    });

    if (emailExist && emailExist.emailVerified) {
      throw new BadRequestError('Email taken, please Login');
    }

    if (emailExist && !emailExist.emailVerified) {
      emailExist.emailVerificationToken = Utils.genRandomNum(0, 15)
      emailExist.updatedAt = Date.now();
      const userEmailToken: any = await UsersDao.save(emailExist)

      await sendMail.sendVerifyEmailToken(email, firstName, `${CLIENT_HOST}/email_verify?emailToken=${userEmailToken.emailVerificationToken}&email=${userEmailToken.email}`);

      throw new BadRequestError(
        'Email not verified. Check your email for verification link',
      );
    }

    const refcode = Utils.generateReferralCode();

    const newUser: any = await UsersDao.create({
      ...resource,
      verifyPhoneOtpTimer: Utils.genTimeStamp(60, 2),
      verifyPhoneOtp: Utils.genRandomNum(1, 6),
      emailVerificationToken: Utils.genRandomNum(0, 15),
      referral_code: refcode,
      phoneNumber: phoneDetails.fullPhone,
      phoneCountryCode: phoneDetails.countryCode,
			regionCode: phoneDetails.regionCode,
    });

    await this.referralCreate({
      referral_code: refcode,
      referred_by: referredBy ? referredBy : null, 
      user: newUser,
    }, newUser)

    // await notificationServices.sendTermiiSms({
    //   message: `Your Awabah code is ${newUser.verifyPhoneOtp}. Valid for 10 minutes, one-time use only.`,
    //   phone: `${newUser.phoneNumber}`
    // })

    await sendMail.sendVerifyEmailToken(email, firstName, `${CLIENT_HOST}/email_verify?emailToken=${newUser.emailVerificationToken}&email=${newUser.email}`);
    
    return {
      message: 'Verify your account. Check your phone for verification OTP',
    };
  }

  // NOT IN USE
  async getPasswordResetOtp(phoneNumber: string) {
    const phoneDetails = getPhoneDetails(phoneNumber);
		if (!phoneDetails.fullPhone || phoneDetails.regionCode == "null") {
			throw new BadRequestError(
				"Provide a valid phone number with country code"
			);
		}

    const otpUser = await UsersDao.put(
      { phoneNumber: phoneDetails.fullPhone },
      {
        resetPasswordOtp: Utils.genRandomNum(2, 6),
        updatedAt: Date.now(),
      },
      { new: true, upsert: false },
    );

    if (!otpUser) {
      throw new NotFoundError('User not found');
    }

    // send OTP
    await notificationServices.sendTermiiSms({
      message: `Your Awabah code is ${otpUser.resetPasswordOtp}. Valid for 10 minutes, one-time use only.`,
      phone: `${otpUser.phoneNumber}`
    })

    return { message: 'Check your phone for reset OTP' };
  }

  async getResetPasswordOtp(email: string) {

    const otpUser = await UsersDao.put(
      { email: email.toLowerCase() },
      {
        resetPasswordOtp: Utils.genRandomNum(2, 6),
        updatedAt: Date.now(),
      },
      { new: true, upsert: false },
    );

    if (!otpUser) {
      throw new NotFoundError('User not found');
    }

    await sendMail.sendResetPasswordOtp(email, `${otpUser.resetPasswordOtp}`);

    return { message: 'Check your Email for password reset OTP' };
  }

  async resetPassword(otp: string, password: string) {
    if (!otp || !password) {
      throw new BadRequestError('OTP and new password required!');
    }

    const passwordHash = await UsersDao.hashPassword(password);

    const user = await UsersDao.put(
      { resetPasswordOtp: otp },
      {
        passwordHash: passwordHash,
        resetPasswordOtp: '',
        updatedAt: Date.now(),
      },
      { new: false, upsert: false },
    );

    if (!user) {
      throw new NotFoundError('Wrong OTP');
    }

    // send confirmation email
    if (user.email) {
      await sendMail.sendConfirmPassChanged(user.email, user.name);
    }

    return { message: 'Password reset successful' };
  }

  async referralCreate(referralObject: any, user: any) {
    let referrerRecord;

    if (referralObject.referred_by !== null) {
      referrerRecord = await ReferralDao.findOne({ referral_code: referralObject.referred_by });
    }

    const referral = await ReferralDao.create({
      ...referralObject,
      referred_by: referrerRecord,
    });

    user.referralRecord = referral;
    await UsersDao.save(user);
  }

  async getReferralStats(userId: MongooseObjectId | string) {

    const referral: any = await ReferralDao.findOne({ user: userId });

    if (!referral) { throw new NotFoundError('Referral record not found') }

    return {
      referralCode: referral.referral_code,
      totalInvites: referral.referred_users.length,
      totalEarning: referral.total_referral_earning,
    }
  }

}

export default new UsersService();
