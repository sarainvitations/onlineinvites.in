import { handleRsvp } from "../../server/rsvps";
import type { Env } from "../../server/types";
export const onRequest: PagesFunction<Env> = (context) => handleRsvp(context.request, context.env, (task) => context.waitUntil(task));
