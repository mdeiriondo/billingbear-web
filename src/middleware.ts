import type { MiddlewareHandler } from "astro";

const HTML_CACHE_CONTROL =
  "public, max-age=0, s-maxage=300, stale-while-revalidate=600";

export const onRequest: MiddlewareHandler = async (_context, next) => {
  const response = await next();
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    response.headers.set("Cache-Control", HTML_CACHE_CONTROL);
  }
  return response;
};
