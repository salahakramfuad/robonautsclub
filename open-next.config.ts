import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";
import d1NextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/d1-next-tag-cache";

/**
 * OpenNext caching without R2 (R2 not enabled on account yet).
 * Plain KV incremental cache (no regional Cache API) so revalidateTag after
 * creating events updates /events immediately.
 *
 * enableCacheInterception: serve ISR/SSG cache hits (/, /courses, /news,
 * /gallery, /robofest…) straight from the incremental cache without booting
 * the Next.js server for that request — lower TTFB on cached pages. The tag
 * cache is still consulted, so on-demand revalidation keeps working.
 * Must be turned off if Partial Prerendering is ever enabled.
 */
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  queue: doQueue,
  tagCache: d1NextTagCache,
  enableCacheInterception: true,
});
