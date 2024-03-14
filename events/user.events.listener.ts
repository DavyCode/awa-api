import Pubsub from '../events';
import debug from 'debug';
import AuthService from '../modules/auth/services/auth.services';

const log: debug.IDebugger = debug('app:user.event-listener');

/**
 * Subscribe to event
 */
Pubsub.on('email_verify_otp', async (email) => {
  try {
    await AuthService.sendEmailVerifyOtp(email);
  } catch (error: any) {
    log(`Server running at ${error.message}!`);
  }
});

export default Pubsub;
