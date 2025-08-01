"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createS3AccountSchema, type CreateS3AccountSchema, AWS_REGIONS } from "@nimbus/shared";
import { FieldError } from "@/components/ui/field-error";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type S3AccountFormProps = {
	onSuccess: () => void;
	onCancel: () => void;
};

export function S3AccountForm({ onSuccess, onCancel }: S3AccountFormProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		control,
		formState: { errors },
	} = useForm<CreateS3AccountSchema>({
		resolver: zodResolver(createS3AccountSchema),
	});

	const onSubmit = async (data: CreateS3AccountSchema) => {
		setIsLoading(true);
		setError(null);

		try {
			const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
			if (!backendUrl) {
				throw new Error("Backend URL is not configured");
			}
			const response = await fetch(`${backendUrl}/api/account/s3`, {
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
				<Controller
					name="region"
					control={control}
					render={({ field }) => (
						<Select disabled={isLoading} onValueChange={field.onChange} value={field.value}>
							<SelectTrigger>
								<SelectValue placeholder="Select a region" />
							</SelectTrigger>
							<SelectContent>
								{AWS_REGIONS.map(region => (
									<SelectItem key={region.value} value={region.value}>
										{region.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}
				/>
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
