import nodemailer from 'nodemailer';
import {
  GMAIL_EMAIL,
  GMAIL_CLIENT_ID,
  GMAIL_CLIENT_SECRET,
  GMAIL_REFRESH_TOKEN,
  SENDER_EMAIL,
} from '../../config/env';

const transport = nodemailer.createTransport({
  // Service
  service: 'Gmail',
  // Auth
  auth: {
    type: 'OAuth2',
    // Email use to send email (Your Google Email. Eg: xxx@gmail.com)
    user: GMAIL_EMAIL,
    // Get in Google Console API (GMAIL API)
    clientId: GMAIL_CLIENT_ID,
    // Get in Google Console API (GMAIL API)
    clientSecret: GMAIL_CLIENT_SECRET,
    // Get from Google OAuth2.0 Playground (Using Cliet ID & Client Secret Key)
    refreshToken: GMAIL_REFRESH_TOKEN,
  },
});

class SendMailService {
  async sendMail(receiver: string, subject: string, mailBody: string) {
    const mailOptions = {
      // Email should be SAME as USER EMAIL above
      from: `AWABAH <${SENDER_EMAIL}>`,
      // ANY Email to send the mail (to send to many use ',' inside the single quote. Eg: 'xxx@gmail.com, xxx@yahoo.com')
      to: receiver,
      subject,
      // TEXT cannot apply any HTML Elements (use either TEXT or HTML)
      // text: 'Hey there, it’s our first message sent with Nodemailer ',
      // HTML can apply any HTML Elements (use either TEXT or HTML)
      html: mailBody,
    };

    const res = await transport.sendMail(mailOptions);

    console.log({ res });
  }
}
export default new SendMailService();
