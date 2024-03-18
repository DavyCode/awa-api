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
      please contact us immediately at <a href="mailto:support@awabahng.com">support@awabahng.com</a>
      or call us on 02012296733. Our team will assist you in securing your account.
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
   * @param verificatonLink string.
   */
  async sendVerifyEmailToken(
    email: string,
    name: string,
    verificatonLink: string,
  ) {
    const mes = `
      <h3>Dear ${name}</h3>
      <p>Verify your email. Use the Link below</p>

      <p>
        Welcome to Awabah! We are thrilled to have you on board and can't wait for you 
        to explore everything our platform has to offer.
      </p>

      <p>
        To ensure the security of your account and enable full access to our features, 
        we kindly ask you to verify your email address by clicking on the link below:
      </p>
      
      <p><a href="${verificatonLink}">CLICK HERE</a> or ${verificatonLink}</p

      <p> Please Note: This link may expire in 24 hours.</p>

      <p>Once you've verified your email, you'll make the most out of your experience with us. </p>
      
      <p>
        If you have any questions or encounter any issues during the verification process, 
        please don't hesitate to reach out to our support team at <a href="mailto:support@awabahng.com">support@awabahng.com</a> or 
        call us on 02012296733. We're here to help!
      </p>

      <p>Best regards,</p>
      <p>The Awabah Team</p>

    `;
    await NodemailerService.sendMail(
      email,
      'Welcome to Awabah - Please Verify Your Email',
      mes,
    );
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
