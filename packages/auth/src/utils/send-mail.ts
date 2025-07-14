import env from "@nimbus/env/client";
import axios from "axios";

export async function sendMail({ to, subject, text }: { to: string; subject: string; text: string }) {
	try {
		const response = await axios.post(`${env.NEXT_PUBLIC_BACKEND_URL}/api/email/send-mail`, { to, subject, text });

		return response.data;
	} catch (error) {
		console.error("Error sending email:", error);
		throw error;
	}
}
