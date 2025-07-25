"use client";

import { createS3AccountSchema, type CreateS3AccountSchema } from "@nimbus/shared";
import { FieldError } from "@/components/ui/field-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type S3AccountFormProps = {
	onSuccess: () => void;
	onCancel: () => void;
};

const awsRegions = [
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
];

export function S3AccountForm({ onSuccess, onCancel }: S3AccountFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<CreateS3AccountSchema>({
		resolver: zodResolver(createS3AccountSchema),
	});

	const onSubmit = async (data: CreateS3AccountSchema) => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/account/s3`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = (await response.json().catch(() => ({ message: "Failed to add S3 account" }))) as {
					message?: string;
				};
				throw new Error(errorData.message || "Failed to add S3 account");
			}

			onSuccess();
		} catch (err) {
			setError(err instanceof Error ? err.message : "An unexpected error occurred");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="accessKeyId">Access Key ID</Label>
				<Input id="accessKeyId" type="text" placeholder="AKIA..." {...register("accessKeyId")} disabled={isLoading} />
				<FieldError error={errors.accessKeyId?.message} />
			</div>

			<div className="space-y-2">
				<Label htmlFor="secretAccessKey">Secret Access Key</Label>
				<Input
					id="secretAccessKey"
					type="password"
					placeholder="Enter your secret access key"
					{...register("secretAccessKey")}
					disabled={isLoading}
				/>
				<FieldError error={errors.secretAccessKey?.message} />
			</div>

			<div className="space-y-2">
				<Label htmlFor="region">Region</Label>
				<select
					id="region"
					{...register("region")}
					disabled={isLoading}
					className="border-input placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				>
					<option value="">Select a region</option>
					{awsRegions.map(region => (
						<option key={region.value} value={region.value}>
							{region.label}
						</option>
					))}
				</select>
				<FieldError error={errors.region?.message} />
			</div>

			<div className="space-y-2">
				<Label htmlFor="bucketName">Bucket Name</Label>
				<Input
					id="bucketName"
					type="text"
					placeholder="my-s3-bucket"
					{...register("bucketName")}
					disabled={isLoading}
				/>
				<FieldError error={errors.bucketName?.message} />
			</div>

			<div className="space-y-2">
				<Label htmlFor="endpoint">Custom Endpoint (Optional)</Label>
				<Input
					id="endpoint"
					type="url"
					placeholder="https://s3.amazonaws.com"
					{...register("endpoint")}
					disabled={isLoading}
				/>
				<p className="text-muted-foreground text-xs">
					Leave empty for AWS S3. Use for S3-compatible services like MinIO, DigitalOcean Spaces, etc.
				</p>
				<FieldError error={errors.endpoint?.message} />
			</div>

			<div className="space-y-2">
				<Label htmlFor="nickname">Account Nickname (Optional)</Label>
				<Input id="nickname" type="text" placeholder="My S3 Account" {...register("nickname")} disabled={isLoading} />
				<FieldError error={errors.nickname?.message} />
			</div>

			{error && (
				<div className="bg-destructive/15 rounded-md p-3">
					<p className="text-destructive text-sm">{error}</p>
				</div>
			)}

			<div className="flex justify-end space-x-2">
				<Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
					Cancel
				</Button>
				<Button type="submit" disabled={isLoading}>
					{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
					Add S3 Account
				</Button>
			</div>
		</form>
	);
}
