export const AWS_REGIONS = [
	// US Regions
	{ value: "us-east-1", label: "US East (N. Virginia)" },
	{ value: "us-east-2", label: "US East (Ohio)" },
	{ value: "us-west-1", label: "US West (N. California)" },
	{ value: "us-west-2", label: "US West (Oregon)" },

	// US GovCloud (requires special access)
	{ value: "us-gov-east-1", label: "AWS GovCloud (US-East)" },
	{ value: "us-gov-west-1", label: "AWS GovCloud (US-West)" },

	// Canada
	{ value: "ca-central-1", label: "Canada (Central)" },
	{ value: "ca-west-1", label: "Canada (Calgary)" },

	// Mexico (2024)
	{ value: "mx-central-1", label: "Mexico (Central)" },

	// Europe
	{ value: "eu-north-1", label: "Europe (Stockholm)" },
	{ value: "eu-west-1", label: "Europe (Ireland)" },
	{ value: "eu-west-2", label: "Europe (London)" },
	{ value: "eu-west-3", label: "Europe (Paris)" },
	{ value: "eu-central-1", label: "Europe (Frankfurt)" },
	{ value: "eu-central-2", label: "Europe (Zurich)" },
	{ value: "eu-south-1", label: "Europe (Milan)" },
	{ value: "eu-south-2", label: "Europe (Spain)" },

	// Asia Pacific
	{ value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
	{ value: "ap-northeast-2", label: "Asia Pacific (Seoul)" },
	{ value: "ap-northeast-3", label: "Asia Pacific (Osaka)" },
	{ value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
	{ value: "ap-southeast-2", label: "Asia Pacific (Sydney)" },
	{ value: "ap-southeast-3", label: "Asia Pacific (Jakarta)" },
	{ value: "ap-southeast-4", label: "Asia Pacific (Melbourne)" },
	{ value: "ap-southeast-5", label: "Asia Pacific (Malaysia)" },
	{ value: "ap-east-1", label: "Asia Pacific (Hong Kong)" },
	{ value: "ap-east-2", label: "Asia Pacific (Taipei)" },
	{ value: "ap-south-1", label: "Asia Pacific (Mumbai)" },
	{ value: "ap-south-2", label: "Asia Pacific (Hyderabad)" },
	{ value: "ap-southeast-6", label: "Asia Pacific (Thailand)" },

	// China (requires special setup)
	{ value: "cn-north-1", label: "China (Beijing)" },
	{ value: "cn-northwest-1", label: "China (Ningxia)" },

	// South America
	{ value: "sa-east-1", label: "South America (São Paulo)" },

	// Middle East
	{ value: "me-south-1", label: "Middle East (Bahrain)" },
	{ value: "me-central-1", label: "Middle East (UAE)" },

	// Africa
	{ value: "af-south-1", label: "Africa (Cape Town)" },

	// Israel
	{ value: "il-central-1", label: "Israel (Tel Aviv)" },
] as const;

export type AWSRegion = (typeof AWS_REGIONS)[number]["value"];
