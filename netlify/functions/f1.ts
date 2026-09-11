import type { Config, Context } from '@netlify/functions'

type Resource = 'drivers' | 'constructors' | 'circuits' | 'races' | 'results' | 'driverstandings' | 'constructorstandings'

const API_BASE = 'https://api.jolpi.ca/ergast/f1'
const ALLOWED_RESOURCES = new Set<Resource>([
  'drivers', 'constructors', 'circuits', 'races', 'results', 'driverstandings', 'constructorstandings',
])

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'public, max-age=300, stale-while-revalidate=600',
  },
})

const validPositiveInteger = (value: string | null) => value !== null && /^[1-9]\d*$/.test(value)

export default async (request: Request, _context: Context) => {
  if (request.method !== 'GET') return json({ error: 'method_not_allowed' }, 405)

  const url = new URL(request.url)
  const resource = url.searchParams.get('resource') as Resource | null
  const season = url.searchParams.get('season') || 'current'
  const round = url.searchParams.get('round')
  const limit = url.searchParams.get('limit') || '100'
  const offset = url.searchParams.get('offset') || '0'

  if (!resource || !ALLOWED_RESOURCES.has(resource)) return json({ error: 'invalid_resource' }, 400)
  if (!/^(current|20\d{2})$/.test(season)) return json({ error: 'invalid_season' }, 400)
  if (round !== null && round !== 'last' && !validPositiveInteger(round)) return json({ error: 'invalid_round' }, 400)
  if (!validPositiveInteger(limit) || Number(limit) > 100) return json({ error: 'invalid_limit' }, 400)
  if (!/^\d+$/.test(offset)) return json({ error: 'invalid_offset' }, 400)

  const roundPath = round ? `${round}/` : ''
  const endpoint = `${API_BASE}/${season}/${roundPath}${resource}/?limit=${limit}&offset=${offset}`

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
