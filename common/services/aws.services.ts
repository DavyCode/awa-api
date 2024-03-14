import Email from 'email-templates';
import path from 'path';
import debug from 'debug';
import * as BluebirdPromise from 'bluebird';
import previewEmail from 'preview-email';
import AWS from 'aws-sdk';

// import {
//   ACCESS_AWS_KEY_ID,
//   SECRET_AWS_ACCESS_KEY,
//   BUCKET_AWS_REGION,
//   SES_AWS_CONFIG_SET,
//   MAILER_FROM_OPTION,
//   LOGS_MAIL,
// } from '../../config/env';

// AWS.config.update({
//   accessKeyId: ACCESS_AWS_KEY_ID,
//   secretAccessKey: SECRET_AWS_ACCESS_KEY,
//   region: BUCKET_AWS_REGION,
// });

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

const log: debug.IDebugger = debug('app:event-background-process');

class MailerService {
  // async sendMailAws(mailObject: any) {
  //   try {
  //     const { email, templateName } = mailObject;
  //     return new BluebirdPromise.Promise((resolve, reject) => {
  //       this.loadTemplate(templateName, mailObject).then((result: any) => {
  //         const { subject, html, text } = result;
  //         const params: any = {
  //           Destination: {
  //             ToAddresses: [email], // Email address/addresses that you want to send your email
  //             BccAddresses: [LOGS_MAIL],
  //             // CcAddresses: [
  //             //   LOGS_MAIL,
  //             //   /* more items */
  //             // ],
  //           },
  //           ConfigurationSetName: SES_AWS_CONFIG_SET,
  //           Message: {
  //             Body: {
  //               Html: {
  //                 // HTML Format of the email
  //                 Charset: 'UTF-8',
  //                 Data: html,
  //               },
  //               Text: {
  //                 Charset: 'UTF-8',
  //                 Data: text,
  //               },
  //             },
  //             Subject: {
  //               Charset: 'UTF-8',
  //               Data: subject,
  //             },
  //           },
  //           Source: MAILER_FROM_OPTION,
  //           ReplyToAddresses: [
  //             /* more items */
  //           ],
  //         };
  //         try {
  //           const sendEmail = ses.sendEmail(params).promise();
  //           sendEmail
  //             .then((data) => {
  //               log('email submitted to SES');
  //               return resolve(data);
  //             })
  //             .catch((error) => {
  //               log('message did not deliver', error);
  //               return reject(error);
  //             });
  //         } catch (error) {
  //           log('could not deliver message', error);
  //           return reject(error);
  //         }
  //       });
  //     });
  //   } catch (err) {
  //     log(err);
  //   }
  // }
  // loadTemplate(templateName: any, context: any): any {
  //   try {
  //     const dir = path.join(
  //       __dirname,
  //       '../../../email-templates', // this folder is outside dist so add extra ../ path
  //       templateName,
  //     );
  //     const email: any = new Email({
  //       message: context,
  //       views: {
  //         options: {
  //           extension: 'ejs', // <------ HERE template engine
  //         },
  //       },
  //     });
  //     return new BluebirdPromise.Promise((resolve, reject) => {
  //       email
  //         .renderAll(dir, {
  //           // name: context.name,
  //           // link: context.link,
  //           ...context,
  //         })
  //         .then((template: any) => {
  //           previewEmail(template).then(log).catch(log); //preview email in browser, comment in production
  //           resolve(template);
  //         })
  //         .catch((err: any) => {
  //           log(err.message);
  //           reject(err);
  //         });
  //     });
  //   } catch (err: any) {
  //     log('ERROR_loadTemplate', err.message);
  //   }
  // }
}

export default new MailerService();
