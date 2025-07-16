import { getHostnameFamily } from "./utils/hostname-family";
import { cacheEnv } from "./cache-env";
import { Redis } from "iovalkey";

async function redisClientInstance() {
	const family = await getHostnameFamily(cacheEnv.VALKEY_HOST);
	if (!family) {
		console.error("Failed to resolve hostname");
		process.exit(1);
	}

	const redisClient = new Redis({
		family,
		port: Number(cacheEnv.VALKEY_PORT),
		host: cacheEnv.VALKEY_HOST,
		username: cacheEnv.VALKEY_USERNAME,
		password: cacheEnv.VALKEY_PASSWORD,
	});

	redisClient.on("error", err => {
		console.error("Redis connection error:", err);
	});

	redisClient.on("connect", () => {
		console.log(`Connected to Valkey over ${family === 4 ? "IPv4" : "IPv6"}`);
	});

	return redisClient;
}

const redisClient = await redisClientInstance();

export default redisClient;
