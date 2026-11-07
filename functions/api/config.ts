import { json, runtimeConfig, type Env } from "../../server/types";
export const onRequest: PagesFunction<Env> = ({ request, env }) =>
  request.method === "GET"
    ? json(runtimeConfig(env, new URL(request.url)))
    : json({ available: false }, 405, { Allow: "GET" });
