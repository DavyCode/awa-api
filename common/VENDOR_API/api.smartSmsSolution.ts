import axiosService from "../services/axios.service";
import { InternalServerError } from "../utils/errors";

import { SMART_SMS_TOKEN, SMART_SMS_URL } from "../../config/env";
const baseurl = SMART_SMS_URL;

class ApiSmartSmsSolution {
	async sendSms(resource: { message: string; phone: string }) {
		const payload = {
			sender: "Awabah", // TODO - Register VOLLA
			to: resource.phone,
			message: resource.message,
			type: "0",
			routing: "2",
			token: SMART_SMS_TOKEN,
			schedule: "",
		};

		try {
			return await axiosService({
				url: `${baseurl}`,
				method: "POST",
				// headers: { "content-type": "application/json" },
				data: payload,
				params: payload,
			});
		} catch (ex: any) {
			throw new InternalServerError("Something went wrong");
		}
	}
}

export default new ApiSmartSmsSolution();
