import NodemailerService from './nodemailer.service';

class SendMailServices {
  async sendResetPasswordOtpOld(email: string, resetPassOtp: string) {
    const mes = `
      <h3>Hello.</h3>
      <p>You requested to reset your password. Use the OTP below</p>
      <h3> ${resetPassOtp}</h3>
    `;
    await NodemailerService.sendMail(email, 'Reset Password', mes);
  }

  /**
   * sendConfirmPassChanged
   * @param email string
   */
  async sendConfirmPassChanged(email: string, name: string) {
    const mes = `
    <h4>Dear ${name},</h4>
    <p>
      We're reaching out to inform you that the password for your Awabah account has been successfully changed.
    </p>

    <p>
      If you did not initiate this change or believe your account may have been compromised, 
      please contact us immediately at support@awabahng.com or call us on 02012296733. 
      Our team will assist you in securing your account.
    </p>

    <p>
      If you did change your password, you can disregard this email.
    </p>

    <p>Thank you.</p>

    <p>Best regards,</p>
    <p>The Awabah Team</p>
    `;

    await NodemailerService.sendMail(
      email,
      'Your Password Has Been Successfully Changed',
      mes,
    );
  }

  /**
   * sendVerifyEmailToken
   * @param email string
   * @param verifyToken string.
   */
  async sendVerifyEmailToken(email: string, verifyToken: string) {
    const mes = `
      <h3>Hello.</h3>
      <p>Verify your email. Use the Link below</p>
      <h3> ${verifyToken}</h3>
    `;
    await NodemailerService.sendMail(email, 'Email Verify', mes);
  }

  async sendResetPasswordOtp(email: string, otp: string) {
    const mes = `
      <h3>Hello.</h3>
      <p>Find your Awabah Password reset OTP below. Valid for 10 minutes, one-time use only.</p>
      <h3> ${otp} </h3>
    `;
    await NodemailerService.sendMail(email, 'Password Reset OTP', mes);
  }
}

export default new SendMailServices();
