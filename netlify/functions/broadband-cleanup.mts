import type { Config } from '@netlify/functions'
import { getDatabase } from '@netlify/database'

/**
 * Prunes the disposable rows behind the /api/broadband limits.
 *
 * Rate-limit buckets are per-IP-per-window and would otherwise accumulate
 * indefinitely during a crawl. Credit and outcome counters are kept long enough
 * to review a full billing history.
 */
export default async () => {
  const db = getDatabase()

  const expired = await db.sql`
    DELETE FROM broadband_rate_limit WHERE expires_at < NOW() RETURNING bucket_key
  `
  const oldEvents = await db.sql`
    DELETE FROM broadband_event_counts WHERE day < CURRENT_DATE - INTERVAL '180 days' RETURNING day
  `
  const oldUsage = await db.sql`
    DELETE FROM broadband_credit_usage WHERE updated_at < NOW() - INTERVAL '400 days' RETURNING period_key
  `

  console.log(
    `[broadband-cleanup] removed ${expired.length} rate-limit buckets, ` +
      `${oldEvents.length} event rows, ${oldUsage.length} usage rows`,
  )
}

export const config: Config = {
  schedule: '@daily',
}
