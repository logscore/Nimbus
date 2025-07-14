import type { ClientRequestOptions } from "hono/client";
import type { AppType } from "@nimbus/server";
import env from "@nimbus/env/client";
import { hc } from "hono/client";

export const createClient = (options?: ClientRequestOptions) => hc<AppType>(env.NEXT_PUBLIC_BACKEND_URL, options);
