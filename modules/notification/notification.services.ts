import Utils from "../../common/utils";
import API_TERMII from "../../common/VENDOR_API/api.termii";
// import API_SMSNG from "../../common/VENDOR_API/api.bulkSmsNg"
// import API_SMARTSMS from "../../common/VENDOR_API/api.smartSmsSolution"
import { SmsTYPE } from "./types/notification.type";

class NotificationService {
	/**
	 * sendTermiiSms
	 * @param {*} resource
	 */
	async sendTermiiSms(resource: SmsTYPE) {
		await API_TERMII.sendSmsMessageWithTermii(resource);
		return { message: "Sms Successful" };
	}

	// async sendApiBulkSmsNgSms(resource: SmsTYPE) {
	// 	await API_SMSNG.sendSms(resource)
	// 	return { message: "Sms Successful" };
	// }

	// async sendSmartSMS(resource: SmsTYPE) {
	// 	await API_SMARTSMS.sendSms(resource)
	// 	return { message: "Sms Successful" };
	// }
}

export default new NotificationService();
