import axiosService from "../services/axios.service";
import { InternalServerError } from "../utils/errors";

import { TERMI_BASE_URL, TERMI_API_KEY } from "../../config/env";

class ApiTermii {
	async sendSmsMessageWithTermii(resource: { message: string; phone: string }) {
		const payload = {
			to: resource.phone,
			from: "N-Alert", // 'talert', // 'N-Alert', // 'OTPAlert',
			sms: resource.message,
			type: "plain",
			channel: "dnd", // generic whatsapp
			api_key: TERMI_API_KEY,
		};

		try {
			return await axiosService({
				url: `${TERMI_BASE_URL}/sms/send`,
				method: "POST",
				data: payload,
			});
		} catch (ex: any) {
      console.log({ ex: ex.response.data })
			throw new InternalServerError("Something went wrong");
		}
	}
}

export default new ApiTermii();
