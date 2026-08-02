# HUNT-NEXTJS Security Audit Report

**Date:** 2026-08-02
**Target:** localhost:3000 (local development)
**Framework:** Next.js (App Router, dev mode)

---

## Executive Summary

The wijha application has been audited using the HUNT-NEXTJS methodology across all 8 phases. The security posture is **significantly improved** from the initial audit (391/1000). Most critical vulnerabilities have been remediated.

**Overall Assessment: LOW-MEDIUM RISK**

---

## Phase 1: Fingerprint

| Item            | Finding                                    |
| --------------- | ------------------------------------------ |
| Next.js Version | Dev mode (no version header exposed)       |
| Build ID        | Empty (dev mode)                           |
| Router          | App Router (RSC - React Server Components) |
| `__NEXT_DATA__` | Not present (App Router)                   |
| X-Powered-By    | `Next.js` [LOW]                            |
| Source Maps     | Not accessible                             |
| Dev Tools       | Not exposed externally                     |

---

## Phase 2: Server Actions Abuse

| Item                    | Finding           |
| ----------------------- | ----------------- |
| Action IDs in HTML      | None found        |
| ACTION_ references      | None found        |
| Action IDs in JS chunks | None found        |
| POST to dashboard       | 404 (not exposed) |

**Result: SECURE** — Server actions not exposed in client bundles.

---

## Phase 3: Middleware Auth Bypass

| Route                     | Unauthenticated | Status |
| ------------------------- | --------------- | ------ |
| /dashboard/admin          | 307 → /login    | SECURE |
| /dashboard/admin/courses  | 307 → /login    | SECURE |
| /dashboard/admin/accounts | 307 → /login    | SECURE |
| /dashboard/admin/events   | 307 → /login    | SECURE |
| /dashboard/admin/settings | 307 → /login    | SECURE |
| /dashboard/teacher        | 307 → /login    | SECURE |
| /dashboard/collaborator   | 307 → /login    | SECURE |

| API Route                     | Unauthenticated | Status |
| ----------------------------- | --------------- | ------ |
| /api/admin/users              | 401             | SECURE |
| /api/admin/courses            | 401             | SECURE |
| /api/admin/events             | 401             | SECURE |
| /api/teacher/profile          | 401             | SECURE |
| /api/collaborator/submissions | 401             | SECURE |

**Result: SECURE** — Middleware correctly protects all dashboard and admin routes.

---

## Phase 4: `/_next/image` SSRF

| URL                                      | Response | Status  |
| ---------------------------------------- | -------- | ------- |
| http://169.254.169.254/latest/meta-data/ | 400      | BLOCKED |
| http://127.0.0.1:5432/                   | 400      | BLOCKED |
| file:///etc/passwd                       | 400      | BLOCKED |
| http://0x7f000001:3000/api/health        | 400      | BLOCKED |
| http://2130706433:3000/api/health        | 400      | BLOCKED |

**Result: SECURE** — Image optimization endpoint rejects all internal/external URLs.

---

## Phase 5: `/_next/data/` IDOR

| Item                  | Finding                     |
| --------------------- | --------------------------- |
| Build ID              | Empty (dev mode)            |
| /_next/data/*.json    | 404 for all routes          |
| RSC payload (teacher) | Only component tree, no PII |

**Result: SECURE** — No data endpoints exposed.

---

## Phase 6: ISR Cache Poisoning

| Route                 | Cache-Control             | Vary               | Status |
| --------------------- | ------------------------- | ------------------ | ------ |
| /                     | no-store, must-revalidate | rsc, next-router-* | SECURE |
| /login                | no-store, must-revalidate | rsc, next-router-* | SECURE |
| /category/digital-sat | no-store, must-revalidate | rsc, next-router-* | SECURE |
| /category/act         | no-store, must-revalidate | rsc, next-router-* | SECURE |

**Result: SECURE** — No ISR caching, all pages use no-store.

---

## Phase 7: Debug Endpoints

| Endpoint                       | Response            | Status   |
| ------------------------------ | ------------------- | -------- |
| /__nextjs_original-stack-frame | 404                 | SECURE   |
| /__nextjs_launch-editor        | 404                 | SECURE   |
| TRACE method                   | 200 (no reflection) | LOW RISK |

**Result: SECURE** — Debug endpoints not accessible. TRACE method returns 200 but does not reflect request headers/body (Next.js handles as GET).

---

## Phase 8: Environment Variable Leakage

| Item                    | Finding                            |
| ----------------------- | ---------------------------------- |
| NEXT_PUBLIC_* in HTML   | None found                         |
| Secret keywords in HTML | None found                         |
| AUTH_SECRET in JS       | False positive (library docs only) |
| DATABASE_URL in JS      | Not found                          |
| API keys in chunks      | Not found                          |
| GitHub tokens           | Not found                          |

**Result: SECURE** — No environment variables leaked to client bundles.

---

## Additional Findings

### Rate Limiting

- **Endpoint:** /api/auth/callback/credentials
- **Threshold:** ~20 requests per minute
- **Status:** FUNCTIONAL
- **Risk:** MEDIUM — Threshold is high for brute-force protection
- **Recommendation:** Lower to 5-10 per minute

### Security Headers

| Header                    | Value                                    | Status         |
| ------------------------- | ---------------------------------------- | -------------- |
| X-Content-Type-Options    | nosniff                                  | SET            |
| X-Frame-Options           | DENY                                     | SET            |
| X-XSS-Protection          | 0                                        | SET            |
| Strict-Transport-Security | max-age=63072000; includeSubDomains      | SET            |
| Referrer-Policy           | strict-origin-when-cross-origin          | SET            |
| Permissions-Policy        | camera=(), microphone=(), geolocation=() | SET            |
| Content-Security-Policy   | —                                        | MISSING [INFO] |
| X-Powered-By              | Next.js                                  | EXPOSED [LOW]  |

### HTTP Method Handling

| Method  | /api/admin/users | Status |
| ------- | ---------------- | ------ |
| GET     | 401              | SECURE |
| POST    | 401              | SECURE |
| PUT     | 405              | SECURE |
| PATCH   | 405              | SECURE |
| DELETE  | 405              | SECURE |
| OPTIONS | 204              | SECURE |
| TRACE   | 500              | SECURE |

### CORS

- No wildcard `Access-Control-Allow-Origin` headers
- No CORS misconfiguration detected

---

## Risk Summary

| Severity | Count | Items                             |
| -------- | ----- | --------------------------------- |
| CRITICAL | 0     | —                                 |
| HIGH     | 0     | —                                 |
| MEDIUM   | 1     | Rate limit threshold (20/min)     |
| LOW      | 2     | X-Powered-By header, TRACE method |
| INFO     | 1     | Missing CSP header                |

---

## Recommendations

1. **[MEDIUM]** Lower rate limit threshold to 5-10 per minute on login endpoint
2. **[LOW]** Remove `X-Powered-By: Next.js` header in next.config.js
3. **[LOW]** Block TRACE method in middleware
4. **[INFO]** Add Content-Security-Policy header
5. **[INFO]** Add CSP nonce for inline scripts

---

## Conclusion

The application demonstrates **strong security posture** after the implemented fixes:

- Middleware auth is correctly enforced
- SSRF protection is working
- No sensitive data leakage
- Security headers are mostly in place
- Rate limiting is functional

The remaining findings are low-risk and can be addressed as follow-up tasks.
