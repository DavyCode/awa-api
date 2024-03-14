export enum SupportedCountryRegion {
	USA = "US",
	NIGERIA = "NG",
	BRITISH = "GB",
	TANZANIA = "TZ",
	GHANA = "GH",
	EUROPE = "EU",
	KENYA = "KE",
	RWANDA = "RWA",
}

export enum SupportedCountryRegionLogo {
	NG = "https://volla-prd-assets.s3.eu-west-3.amazonaws.com/server-assets/country-flags/nig-flag.jpg",
	US = "https://volla-prd-assets.s3.eu-west-3.amazonaws.com/server-assets/country-flags/usa-flag.jpg",
}

export type CountryAndCodeType = {
	country: string;
	code: string;
	minLength: number;
	regionCode: string;
	currency: string;
	logo: string;
};

export const SupportedCountryList: CountryAndCodeType[] = [
	{
		country: "Nigeria",
		code: "+234",
		minLength: 6,
		regionCode: SupportedCountryRegion.NIGERIA,
		currency: "NGN",
		logo: "https://volla-prd-assets.s3.eu-west-3.amazonaws.com/server-assets/country-flags/nig-flag.jpg",
	},
	// {
	// 	country: "USA",
	// 	code: "+1",
	// 	minLength: 5,
	// 	regionCode: SupportedCountryRegion.USA,
	// 	currency: "USD",
	// 	logo: "https://volla-prd-assets.s3.eu-west-3.amazonaws.com/server-assets/country-flags/nig-flag.jpg",
	// },
	// {
	// 	country: "TZ",
	// 	code: "",
	// 	minLength: 5,
	// 	regionCode: SupportedCountryRegion.TANZANIA,
	// 	currency: "TZS",
	// 	logo: "https://volla-prd-assets.s3.eu-west-3.amazonaws.com/server-assets/country-flags/nig-flag.jpg",
	// },
];
