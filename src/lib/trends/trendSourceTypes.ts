/**
 * Future crawler architecture (prepared, not implemented)
 * ------------------------------------------------------
 * Future versions may ingest trend metadata from:
 * - Public RSS feeds
 * - Official APIs
 * - Manually approved source URLs
 *
 * IMPORTANT:
 * - Do NOT scrape paywalled or copyrighted content without permission.
 * - Store only metadata, summaries, source link, and generated tags unless licensed.
 */
export type TrendSource = {
  sourceName: string;
  sourceUrl: string;
  allowed: boolean;
  notes: string;
};

