import axiosService from "../services/axios.service";
import { InternalServerError } from "../utils/errors";

import {
	BULK_SMS_NG_URL,
	BULK_SMS_USERNAME,
	BULK_SMS_PASS,
	BULK_SMS_SENDER,
} from "../../config/env";

const SMS_NG_URL = `${BULK_SMS_NG_URL}/?username=${BULK_SMS_USERNAME}&password=${BULK_SMS_PASS}&sender=${BULK_SMS_SENDER}`;

class ApiBulkSmsNg {
	async sendSms(resource: { message: string; phone: string }) {
		const encodedMessage = encodeURIComponent(resource.message);
		const encodedNumbers = encodeURIComponent(resource.phone);

		const requestUrl = `${SMS_NG_URL}&message=${encodedMessage}&mobiles=${encodedNumbers}`;

		try {
			return await axiosService({
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				url: `${requestUrl}`,
			});
		} catch (ex: any) {
			throw new InternalServerError("Something went wrong");
		}
	}
}

export default new ApiBulkSmsNg();
