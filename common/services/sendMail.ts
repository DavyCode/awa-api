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
  async sendConfirmPassChanged(email: string) {
    const mes = `
    <h3>Hello.</h3>
    <p>Your password was changed</p>

    <p>Contact support if it was not you.</p>
    `;

    await NodemailerService.sendMail(email, 'Password Changed', mes);
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
