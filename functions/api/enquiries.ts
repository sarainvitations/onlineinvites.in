import { handleEnquiry } from "../../server/enquiries";
import type { Env } from "../../server/types";
export const onRequest: PagesFunction<Env> = (context) =>
  handleEnquiry(context.request, context.env, (task) =>
    context.waitUntil(task),
  );
