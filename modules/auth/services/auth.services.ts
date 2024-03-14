import UsersDao from '../../users/daos/users.dao';
import UserServices from '../../users/services/user.services';
import { CreateUserDto } from '../../users/dto/user.dto';
import { LoginDto } from '../dto/auth.dto';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../../common/utils/errors';
import Utils from '../../../common/utils';
import {} from '../../../common/constant';
// import JwtUtils from '../../../common/utils/Jwt.utils';
import { JWT_EXPIRATION_MINUTES, JWT_BEARER, CLIENT_HOST } from '../../../config/env';
import sendMail from '../../../common/services/sendMail';
import JWTMiddleware from '../../auth/middleware/jwt.middleware';
import phoneUtils, { getPhoneDetails } from '../../../common/utils/phone.utils';
import notificationServices from '../../notification/notification.services';

class AuthService {
  async sendEmailVerifyOtp(email: string) {
    const user: any = await UsersDao.findOne({ email: email.toLowerCase() });
    if (!user) throw new NotFoundError(`Email does not exist`);

    if (user.emailVerified) {
      throw new ForbiddenError('Email already taken');
    }

    const updatedUser = await UsersDao.put(
      { _id: user._id },
      {
        emailVerificationToken: Utils.genRandomNum(0, 15),
        updatedAt: Date.now(),
      },
      {
        new: true,
        upsert: false,
      },
    );

    // send verification email
    await sendMail.sendVerifyEmailToken(email, `${CLIENT_HOST}/email_verify?emailToken=${updatedUser.emailVerificationToken}&email=${updatedUser.email}`);

    return { message: 'Check your email for verification link' };
  }

  async confirmEmailVerifyOtp(email: string, emailToken: string) {
    const otpUser = await UsersDao.put(
      { emailVerificationToken: emailToken, email: email.toLowerCase()  },
      {
        emailVerified: true,
        active: true,
        emailVerificationToken: '',
        updatedAt: Date.now(),
      },
      { new: true, upsert: false },
    );

    if (!otpUser) {
      throw new NotFoundError('Wrong verification token or email');
    }

    const { token, refresh } = JWTMiddleware.genToken(otpUser);
    const userData = Utils.cleanUserResponseData(otpUser);

    return {
      message: 'Email successfully verified',
      user: userData,
      access_token: token,
      refresh_token: refresh,
      token_type: JWT_BEARER,
      expiresIn: JWT_EXPIRATION_MINUTES,
    };
  }

  async sendPhoneVerifyOtp(phoneNumber: string) {
    const phoneDetails = getPhoneDetails(phoneNumber);
		if (!phoneDetails.fullPhone || phoneDetails.regionCode == "null") {
			throw new BadRequestError(
				"Provide a valid phone number with country code"
			);
		}

		const user: any = await UsersDao.findOne({
			phoneNumber: phoneDetails.fullPhone,
		});

    if (!user) {
      throw new NotFoundError('User not found. Please register a new account')
    }

		if (user && user.phoneVerified) {
			throw new ForbiddenError("Phone already taken, please login");
		}

		if (
			!user.phoneVerified &&
			user.verifyPhoneOtpTimer &&
			new Date(user.verifyPhoneOtpTimer) > new Date()
		) {
			throw new ForbiddenError(
				"Wait after 2 mins to request new verification OTP or contact support"
			);
		}

		if (user.otpRequestCount >= 5) {
      throw new ForbiddenError(
        "Maximum OTP request limit, contact support to proceed"
      );
    }

    const updatedUser = await UsersDao.put(
      { phoneNumber: user.phoneNumber },
      {
        otpRequestCount: user.otpRequestCount + 1,
        verifyPhoneOtpTimer: Utils.genTimeStamp(60, 2),
        verifyPhoneOtp: Utils.genRandomNum(1, 6),
        updatedAt: Date.now(),
      },
      { new: true, upsert: false }
    );

    await notificationServices.sendTermiiSms({
      message: `Your Awabah code is ${updatedUser.verifyPhoneOtp}. Valid for 10 minutes, one-time use only.`,
      phone: `${updatedUser.phoneNumber}`
    })

		return { message: "Verification OTP sent" };
	}

	async confirmPhoneVerifyOtp(otp: string, phoneNumber: string) {
    const phoneDetails = getPhoneDetails(phoneNumber);
		if (
			!phoneDetails.fullPhone ||
			phoneDetails.regionCode == "null" ||
			phoneDetails.regionCode == null
		) {
			throw new BadRequestError(
				"Provide a valid phone number with country code"
			);
		}

		const updatedUser = await UsersDao.put(
			{ verifyPhoneOtp: otp, phoneNumber: phoneDetails.fullPhone },
			{
				phoneVerified: true,
        verifyPhoneOtp: null,
        verificationStatus: true,
				updatedAt: Date.now(),
			},
			{ new: true, upsert: false }
		);

    if (!updatedUser) {
			throw new NotFoundError("Wrong verification OTP");
		}

		return { message: "Phone number verified" };
	}
}

export default new AuthService();
