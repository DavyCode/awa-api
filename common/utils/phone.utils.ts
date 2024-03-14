import { Request, Response, NextFunction } from "express";
import { BadRequestError, NotFoundError } from "./errors";
import { parsePhoneNumber } from "awesome-phonenumber";
import { CountryAndCodeType, SupportedCountryList } from "../constant";

const countryCodeformatter = (
	num: string,
	countryAndCode: CountryAndCodeType
) => {
	switch (countryAndCode.code) {
		case "+234":
			return formatNigeriaPhone(num, countryAndCode);
		// case "+1":
		default:
			throw new NotFoundError(
				"Country not currently supported, contact support!"
			);
	}
};

const formatNigeriaPhone = (
	num: string,
	countryAndCode: CountryAndCodeType
) => {
	const prefix = countryAndCode.code || "+234";
	if (num.length <= countryAndCode.minLength) {
		throw new BadRequestError("Phone length too short");
	}

	if (num.length <= 10 && num.startsWith("0")) {
		return prefix + num.slice(1);
	} else if (num.length <= 10) {
		return prefix + num;
	} else if (num.startsWith("0")) {
		return prefix + num.slice(1);
	} else if (num.startsWith("+234")) {
		return prefix + num.slice(4);
	} else if (num.startsWith("234")) {
		return prefix + num.slice(3);
	} else {
		return num;
	}
};

const arrayObjectChecker = (
	arr: Array<CountryAndCodeType>,
	regionCode: string
) => arr.filter((obj) => obj["regionCode"] === regionCode);

export default (request: Request, response: Response, next: NextFunction) => {
	if (request.body && request.body.phoneNumber && request.body.phoneCountryCode) {
		const { phoneNumber, phoneCountryCode } = request.body;
		const num = phoneNumber.toString().replace(/\s+/, "");
		let formatedPhone;
		let codeFound;

		const codeExist = arrayObjectChecker(
			SupportedCountryList,
			phoneCountryCode
		);
		if (codeExist.length < 1) {
			throw new NotFoundError(
				"Country not currently supported! Contact support"
			);
		}

		if (codeExist.length > 0) {
			const { code } = codeExist[0];
			formatedPhone = countryCodeformatter(num, codeExist[0]);
			codeFound = code;
		}
		request.body.phone = formatedPhone;
		request.body.phoneCountryCode = codeFound;
		return next();
	}
	return next();
};

export const formatNumber = (phoneNumber: string) => {
	if (phoneNumber) {
		const prefix = "+234";
		const num = phoneNumber.toString().replace(/\s+/, "");
		let formatedPhone;

		if (num.length <= 10 && num.startsWith("0")) {
			formatedPhone = prefix + num.slice(1);
		} else if (num.length <= 10) {
			formatedPhone = prefix + num;
		} else if (num.startsWith("0")) {
			formatedPhone = prefix + num.slice(1);
		} else if (num.startsWith("+234")) {
			formatedPhone = prefix + num.slice(4);
		} else if (num.startsWith("234")) {
			formatedPhone = prefix + num.slice(3);
		} else {
			formatedPhone = num;
		}
		return formatedPhone;
	}
	return false;
};

export const cleanPhoneNumber = (phoneNumber: string) => {
	const trimmedPhone = phoneNumber.toString().replace(/ /g, ""); // remove all spaces
	const pn: any = parsePhoneNumber(trimmedPhone);
	return pn.getNumber();
};

export const cleanPhoneNumberMiddleware = (
	request: Request,
	response: Response,
	next: NextFunction
) => {
	if (request.body.phoneCountryCode && request.body.phoneNumber) {
		const { phoneNumber, phoneCountryCode } = request.body;
		const trimmedPhoneCode = phoneCountryCode.toString().replace(/ /g, ""); // remove all spaces
		const trimmedPhone = phoneNumber.toString().replace(/ /g, ""); // remove all spaces
		const fullPhone = `${trimmedPhoneCode}${trimmedPhone}`;
		if (fullPhone.substring(0, 1) !== "+") {
			throw new BadRequestError("Correct country code required");
		}

		const pn: any = parsePhoneNumber(fullPhone);
		request.body.phoneNumber = pn.getNumber();
		request.params.phoneNumber = pn.getNumber();

		return next();
	}
	return next();
};

export const cleanFullPhoneNumberMiddleware = (
	request: Request,
	response: Response,
	next: NextFunction
) => {
	if (request.body && request.body.phoneNumber) {
		const { phoneNumber, phoneCountryCode } = request.body;

		// const trimmedPhoneCode = phoneCountryCode.toString().replace(/ /g, ""); // remove all spaces
		const trimmedPhone = phoneNumber.toString().replace(/ /g, ""); // remove all spaces
		// const fullPhone = `${trimmedPhoneCode}${trimmedPhone}`;
		if (trimmedPhone.substring(0, 1) !== "+") {
			throw new BadRequestError("Correct country code required");
		}
		
		const pn: any = parsePhoneNumber(trimmedPhone);

		if (!pn || !pn.g.valid) {
			throw new BadRequestError(
				"Provide a valid phone number with country code in format +234(0)8132078656"
			);
		}

		console.log({ pnn: pn.getNumber(), pn: pn.getNumber("significant")})
		request.body.phoneNumber = pn.getNumber();
		request.params.phoneNumber = pn.getNumber();

		return next();
	}
	return next();
};

export const getPhoneDetails = (phone: string) => {
	let isSupportedRegion = false;
	const trimmed = phone.toString().replace(/ /g, ""); // remove all spaces.
	const pn: any = parsePhoneNumber(trimmed);

	if (!pn || !pn.g.valid) {
		throw new BadRequestError(
			"Provide a valid phone number with country code in format +234(0)8132078656"
		);
	}
	const regionCode = pn.getRegionCode();
	const countryCode = `+${pn.getCountryCode()}`;

	// check if regionCode exist
	if ((regionCode && regionCode != "null") || regionCode != null) {
		const countryCodeExist = arrayObjectChecker(
			SupportedCountryList,
			regionCode
		);
		if (countryCodeExist.length < 1) {
			throw new BadRequestError(
				"Country not currently supported! Contact support"
			);
		}
		isSupportedRegion = true;
	}

	return {
		phone: pn.getNumber("significant") as string,
		fullPhone: pn.getNumber() as string,
		countryCode: countryCode as string,
		regionCode: regionCode as string,
		isSupportedRegion: isSupportedRegion as boolean,
	};
};