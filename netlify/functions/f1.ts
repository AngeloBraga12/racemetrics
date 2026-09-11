import type { Config, Context } from '@netlify/functions'

type Resource = 'drivers' | 'constructors' | 'circuits' | 'races'

const API_BASE = 'https://api.jolpi.ca/ergast/f1'
const ALLOWED_RESOURCES = new Set<Resource>(['drivers', 'constructors', 'circuits', 'races'])

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'public, max-age=300, stale-while-revalidate=600',
  },
})

export default async (request: Request, _context: Context) => {
  if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405)

  const url = new URL(request.url)
  const resource = url.searchParams.get('resource') as Resource | null
  const season = url.searchParams.get('season') || 'current'

  if (!resource || !ALLOWED_RESOURCES.has(resource)) return json({ error: 'invalid_resource' }, 400)
  if (!/^(current|20\d{2})$/.test(season)) return json({ error: 'invalid_season' }, 400)

  const endpoint = `${API_BASE}/${season}/${resource}/?limit=100`
  try {
    const upstream = await fetch(endpoint, {
      headers: {
        accept: 'application/json',
        'user-agent': 'RaceMetrics/0.1.0',
      },
    })

    if (!upstream.ok) return json({ error: 'upstream_unavailable', status: upstream.status }, 502)
    return new Response(await upstream.text(), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=300, stale-while-revalidate=600',
      },
    })
  } catch {
    return json({ error: 'upstream_unavailable' }, 502)
  }
}

export const config: Config = {
  path: '/api/f1',
  method: ['GET'],
}
