import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = process.cwd()
const failures = []
const checks = []

function check(name, condition, detail = '') {
  if (condition) checks.push(`PASS  ${name}`)
  else failures.push(`FAIL  ${name}${detail ? `: ${detail}` : ''}`)
}

function read(path) {
  const full = join(root, path)
  check(`file exists: ${path}`, existsSync(full))
  return existsSync(full) ? readFileSync(full, 'utf8') : ''
}

function allFiles(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir)) {
    if (['node_modules', '.git', 'dist', 'coverage'].includes(entry)) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) allFiles(full, out)
    else out.push(full)
  }
  return out
}

const pkg = JSON.parse(read('package.json'))
const main = read('src/main.tsx')
const auth = read('src/auth/AuthProvider.tsx')
const authScreen = read('src/auth/AuthScreen.tsx')
const supabase = read('src/lib/supabase.ts')
const headers = read('public/_headers')
const proxy = read('netlify/functions/f1.ts')
const migration = read('supabase/migrations/202609110001_private_user_data.sql')

check('package remains private', pkg.private === true)
check('security test is wired into npm scripts', pkg.scripts?.['test:security'] === 'node scripts/security-audit.mjs')
check('protected app gates App behind authenticated user', /return user \? <App \/> : <AuthScreen \/>/.test(main))
check('auth provider restores persisted session', /supabase\.auth\.getSession\(\)/.test(auth))
check('auth provider has exactly one auth state subscription', (auth.match(/supabase\.auth\.onAuthStateChange/g) || []).length === 1)
check('OAuth redirects use current origin', /redirectTo: window\.location\.origin/.test(auth))
check('password recovery uses current origin', /resetPasswordForEmail\(email\.trim\(\), \{\s*redirectTo: window\.location\.origin/.test(auth))
check('password recovery success message avoids account enumeration', /Se houver uma conta associada, as instruções foram enviadas\./.test(authScreen))
check('auth input limits are enforced in the UI', /maxLength=\{254\}/.test(authScreen) && /maxLength=\{128\}/.test(authScreen) && /maxLength=\{80\}/.test(authScreen))
check('auth input limits are enforced before provider calls', /MAX_PASSWORD_LENGTH = 128/.test(auth) && /MAX_EMAIL_LENGTH = 254/.test(auth) && /MAX_NAME_LENGTH = 80/.test(auth))
check('Supabase client uses publishable key', /VITE_SUPABASE_PUBLISHABLE_KEY/.test(supabase))
check('browser client does not reference service role key', !/service_role|SUPABASE_SERVICE_ROLE|sb_secret_/i.test(supabase))

check('CSP exists', /Content-Security-Policy:/.test(headers))
check('CSP blocks object embeds', /object-src 'none'/.test(headers))
check('CSP blocks framing', /frame-ancestors 'none'/.test(headers))
check('anti-clickjacking header exists', /X-Frame-Options: DENY/.test(headers))
check('MIME sniffing protection exists', /X-Content-Type-Options: nosniff/.test(headers))
check('strict referrer policy exists', /Referrer-Policy: strict-origin-when-cross-origin/.test(headers))
check('HSTS exists', /Strict-Transport-Security:/.test(headers))

check('F1 proxy allows only GET', /request\.method !== 'GET'/.test(proxy))
check('F1 proxy uses resource allowlist', /ALLOWED_RESOURCES/.test(proxy) && /ALLOWED_RESOURCES\.has\(resource\)/.test(proxy))
check('F1 proxy validates season', /\^\(current\|20\\d\{2\}\)\$/.test(proxy))
check('F1 proxy defines a 100-record limit cap', /const MAX_LIMIT = 100/.test(proxy))
check('F1 proxy enforces the configured limit cap', /Number\(limit\) > MAX_LIMIT/.test(proxy))
check('F1 proxy validates offset', /\^\\d\+\$/.test(proxy))
check('F1 proxy caps offset', /Number\(offset\) > MAX_OFFSET/.test(proxy) && /const MAX_OFFSET = 100_000/.test(proxy))
check('F1 proxy has an upstream timeout', /UPSTREAM_TIMEOUT_MS = 8_000/.test(proxy) && /controller\.abort\(\)/.test(proxy))
check('F1 proxy error responses are not cached', /cache-control.*no-store/.test(proxy))
check('F1 proxy success responses use bounded cache', /max-age=300.*stale-while-revalidate=600/.test(proxy))
check('F1 proxy caps upstream response size', /MAX_RESPONSE_BYTES = 2_000_000/.test(proxy) && /upstream_response_too_large/.test(proxy) && /TextEncoder\(\)\.encode\(body\)\.byteLength/.test(proxy))
check('F1 proxy has Netlify per-IP rate limiting', /rateLimit:\s*\{[\s\S]*windowLimit: 60[\s\S]*windowSize: 60[\s\S]*aggregateBy: \['ip', 'domain'\]/.test(proxy))
check('F1 proxy has no user-controlled upstream URL', !/new URL\([^)]*searchParams|fetch\(url/i.test(proxy))

check('all private tables enable RLS', ['profiles', 'preferences', 'favorites', 'saved_comparisons'].every(t => new RegExp(`alter table public\\.${t} enable row level security`).test(migration)))
check('private tables revoke anonymous access', ['profiles', 'preferences', 'favorites', 'saved_comparisons'].every(t => new RegExp(`revoke all on public\\.${t} from anon`).test(migration)))
check('policies target authenticated role', (migration.match(/to authenticated/g) || []).length >= 12)
check('ownership policies use auth.uid()', (migration.match(/auth\.uid\(\)/g) || []).length >= 12)
check('all four tables define update ownership policies', (migration.match(/for update to authenticated/g) || []).length === 4)
check('all four update policies define WITH CHECK', (migration.match(/for update to authenticated[\s\S]*?with check/g) || []).length === 4)
check('trigger function is SECURITY INVOKER', /set_updated_at\(\)[\s\S]*?security invoker/.test(migration))
check('SECURITY DEFINER trigger pins search_path', /handle_new_user\(\)[\s\S]*?security definer[\s\S]*?set search_path = public/.test(migration))

const sourceFiles = allFiles(join(root, 'src'))
const sourceText = sourceFiles.map(file => `${relative(root, file)}\n${readFileSync(file, 'utf8')}`).join('\n')
for (const pattern of [
  /dangerouslySetInnerHTML/,
  /document\.write\s*\(/,
  /eval\s*\(/,
  /new Function\s*\(/,
  /innerHTML\s*=/,
]) {
  check(`no unsafe DOM sink ${pattern}`, !pattern.test(sourceText))
}
check('no service-role secrets in browser source', !/service_role|SUPABASE_SERVICE_ROLE|sb_secret_/i.test(sourceText))
check('no access tokens are manually persisted in browser source', !/localStorage\.(setItem|getItem)\([^)]*(token|session|jwt)/i.test(sourceText))

if (failures.length) {
  console.error(`\nSecurity audit failed: ${failures.length} check(s).\n`)
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Security audit passed: ${checks.length} checks.`)
console.log(checks.join('\n'))
