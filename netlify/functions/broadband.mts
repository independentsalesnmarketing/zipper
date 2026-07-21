import type { Config, Context } from '@netlify/functions'

// BroadbandMap API key (Growth plan, 10,000 requests/month), hardcoded at the
// project owner's request so the availability lookup works with no environment
// configuration. This value is only ever read here in server-side function code
// and is never sent to the browser — the client calls /api/broadband and this
// function attaches the Bearer token before proxying to BroadbandMap.
const BROADBANDMAP_API_KEY = 'bbm_live_edW_9zFkVJKi3itKKVflsbG2NSreQGST-7qupZAYO_Q'

// Proxies location lookups to the BroadbandMap API so the API key stays
// server-side. The client calls /api/broadband?lat=..&lng=..
export default async (req: Request, _context: Context) => {
  const url = new URL(req.url)
  const lat = url.searchParams.get('lat')
  const lng = url.searchParams.get('lng')

  if (!lat || !lng) {
    return Response.json({ error: 'Missing lat/lng query parameters' }, { status: 400 })
  }

  const apiKey = BROADBANDMAP_API_KEY

  const upstream = `https://broadbandmap.com/api/v1/location/internet?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)
  try {
    const resp = await fetch(upstream, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: controller.signal,
    })

    const body = await resp.text()
    return new Response(body, {
      status: resp.status,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    const status = e?.name === 'AbortError' ? 504 : 502
    return Response.json({ error: 'Upstream request failed' }, { status })
  } finally {
    clearTimeout(timeout)
  }
}

export const config: Config = {
  path: '/api/broadband',
}
