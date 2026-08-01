import type { Config } from '@netlify/functions'
import { getDatabase } from '@netlify/database'
import { LIMITS, periodKeys } from '../lib/broadband-guard.mjs'

/**
 * Reports BroadbandMap credit consumption so a spike is visible early rather
 * than at the end of the month.
 *
 * Requires the BROADBAND_ADMIN_TOKEN environment variable, passed as
 * ?token=..., and returns 404 when that variable is unset so the endpoint does
 * not exist at all until it is deliberately enabled.
 */
export default async (req: Request) => {
  const expected = Netlify.env.get('BROADBAND_ADMIN_TOKEN')
  const provided = new URL(req.url).searchParams.get('token')
  if (!expected || provided !== expected) {
    return new Response('Not found', { status: 404 })
  }

  const { day, month } = periodKeys()

  try {
    const db = getDatabase()

    const usage = await db.sql`
      SELECT period_key, credits, updated_at
      FROM broadband_credit_usage
      WHERE period_key = ${`day:${day}`} OR period_key = ${`month:${month}`}
    `
    const creditsFor = (key: string) => Number(usage.find((r: any) => r.period_key === key)?.credits ?? 0)

    // Two weeks of outcomes: enough to show whether blocked traffic is rising.
    const events = await db.sql`
      SELECT day, event, count
      FROM broadband_event_counts
      WHERE day >= CURRENT_DATE - INTERVAL '14 days'
      ORDER BY day DESC, count DESC
    `

    const byDay: Record<string, Record<string, number>> = {}
    for (const row of events as any[]) {
      const key = new Date(row.day).toISOString().slice(0, 10)
      byDay[key] ??= {}
      byDay[key][row.event] = Number(row.count)
    }

    const usedToday = creditsFor(`day:${day}`)
    const usedThisMonth = creditsFor(`month:${month}`)

    return Response.json(
      {
        limits: {
          perDay: LIMITS.perDay,
          perMonth: LIMITS.perMonth,
          perIpHour: LIMITS.perIpHour,
          perIpDay: LIMITS.perIpDay,
          cacheDays: LIMITS.cacheDays,
        },
        today: { date: day, creditsUsed: usedToday, creditsRemaining: Math.max(LIMITS.perDay - usedToday, 0) },
        month: {
          period: month,
          creditsUsed: usedThisMonth,
          creditsRemaining: Math.max(LIMITS.perMonth - usedThisMonth, 0),
        },
        dailyBreakdown: byDay,
      },
      { headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } },
    )
  } catch (err) {
    console.error('[broadband-usage] query failed:', err)
    return Response.json({ error: 'Usage data unavailable' }, { status: 503 })
  }
}

export const config: Config = {
  path: '/api/broadband-usage',
  method: ['GET'],
}
