# EPIC: Add API Authentication to CV Builder Backend

## EPIC Summary

Add service-to-service API authentication to the CV Builder backend so that only trusted clients, such as the Vercel frontend server, can consume protected backend endpoints.

This EPIC focuses on **API/client authentication**, not full user authentication. The goal is to protect expensive and sensitive backend operations such as CV parsing, file uploads, and AI provider calls from being consumed directly by random clients, bots, or unauthorized scripts.

## Target Architecture

```txt
Browser
  ↓
Next.js / Vercel Frontend Server Route
  ↓ x-internal-api-key
Fastify Backend API
  ↓
AI Provider / DB / Storage
```

The browser must never receive or send the internal API key directly. The key should only exist in trusted server-side environments.

## Goals

- Protect private backend endpoints with an internal API key.
- Keep public endpoints, such as `/api/health`, accessible without authentication.
- Centralize authentication logic in a Fastify plugin or middleware.
- Validate required environment variables at startup.
- Add consistent unauthorized error responses.
- Add tests for protected and public routes.
- Document how the Vercel frontend should call the backend securely.

## Non-Goals

- This EPIC does not implement user login.
- This EPIC does not implement OAuth, sessions, JWTs, or Supabase Auth.
- This EPIC does not add role-based access control.
- This EPIC does not add billing or per-user quotas.

---

# Ticket 1: Define API Authentication Strategy and Environment Contract

## Description

As a CV Builder backend engineer, I want to define the API authentication strategy and required environment variables so that the backend has a clear and secure contract for protected internal endpoints.

## Acceptance Criteria

- [ ] The backend uses service-to-service authentication through an internal API key.
- [ ] The expected header name is defined, for example `x-internal-api-key`.
- [ ] The required environment variable is defined, for example `INTERNAL_API_KEY`.
- [ ] Public routes are documented, starting with `/api/health`.
- [ ] Protected routes are documented, starting with `/api/cv/parse`.
- [ ] The architecture decision is documented in the backend README or an internal docs file.
- [ ] The documentation clearly states that the browser must never receive the internal API key.

## Dev Notes

Recommended environment variable:

```txt
INTERNAL_API_KEY=<long-random-secret>
```

Recommended header:

```txt
x-internal-api-key: <secret>
```

Recommended initial route classification:

```txt
Public:
- GET /api/health

Protected:
- POST /api/cv/parse
```

The first implementation can use a single shared secret. More advanced client-level API keys can be added later if needed.

## Claude-ready Prompt

```txt
You are working on my CV Builder backend.

Context:
- The backend is a Fastify + TypeScript API.
- It exposes endpoints like POST /api/cv/parse for CV upload and AI parsing.
- The frontend is deployed separately, likely on Vercel.
- I want to add service-to-service API authentication, not user authentication.
- The browser must never receive the internal API key.

Task:
Create or update the backend documentation to define the API authentication strategy.

Requirements:
- Use an internal API key approach.
- The backend should expect the key in the `x-internal-api-key` header.
- The backend should read the expected value from `process.env.INTERNAL_API_KEY`.
- Document which routes are public and which routes are protected.
- Public route: GET /api/health.
- Protected route: POST /api/cv/parse.
- Clearly explain that the frontend server should call the backend, not the browser directly.
- Keep the documentation concise and practical.

Do not implement code yet. Only add or update the documentation.
```

---

# Ticket 2: Add Environment Validation for API Authentication

## Description

As a CV Builder backend engineer, I want the application to validate the required API authentication environment variables at startup so that production deployments fail fast when secrets are missing or misconfigured.

## Acceptance Criteria

- [ ] `INTERNAL_API_KEY` is added to the backend environment schema/config.
- [ ] The application fails at startup if `INTERNAL_API_KEY` is missing in non-test environments.
- [ ] Tests can run without requiring a real production secret.
- [ ] The config exposes the internal API key through a typed config object.
- [ ] The app does not log the raw API key.
- [ ] Example environment files are updated without exposing real secrets.

## Dev Notes

If the project already has a config module, extend it instead of reading `process.env` directly in route handlers.

Example:

```ts
export const config = {
  internalApiKey: process.env.INTERNAL_API_KEY,
};
```

Prefer schema validation with the existing project pattern. If the project already uses Zod for validation, use Zod for env validation as well.

Avoid this:

```ts
request.headers['x-internal-api-key'] === process.env.INTERNAL_API_KEY
```

Prefer this:

```ts
request.headers['x-internal-api-key'] === config.internalApiKey
```

## Claude-ready Prompt

```txt
You are working on my CV Builder backend.

Context:
- The backend is a Fastify + TypeScript API.
- I am adding service-to-service API authentication.
- The API key should be stored in the INTERNAL_API_KEY environment variable.
- I want clean configuration management and startup validation.

Task:
Update the backend configuration so it supports INTERNAL_API_KEY safely.

Requirements:
- Add INTERNAL_API_KEY to the environment/config validation layer.
- Fail fast at startup if INTERNAL_API_KEY is missing in non-test environments.
- Allow tests to run without needing a real production secret, using either a default test value or test-specific setup.
- Expose the value through the existing typed config object.
- Do not log the raw secret.
- Update .env.example or equivalent files with a placeholder value only.
- Follow the existing project patterns for config, validation, and error handling.

After implementation, briefly explain what files changed and why.
```

---

# Ticket 3: Implement Fastify API Key Authentication Plugin

## Description

As a CV Builder backend engineer, I want a reusable Fastify authentication plugin so that protected endpoints can enforce internal API key validation consistently.

## Acceptance Criteria

- [ ] A reusable authentication plugin or hook is created.
- [ ] The plugin checks the `x-internal-api-key` request header.
- [ ] The plugin compares the request header against the configured internal API key.
- [ ] Missing keys return `401 Unauthorized`.
- [ ] Invalid keys return `401 Unauthorized`.
- [ ] The response shape follows the backend error response pattern.
- [ ] The plugin does not log the raw received key.
- [ ] The plugin allows public routes to bypass authentication.
- [ ] The implementation is covered by unit or integration tests.

## Dev Notes

Recommended error response shape:

```json
{
  "error": "Unauthorized",
  "code": "UNAUTHORIZED"
}
```

Recommended behavior:

```txt
No header      → 401
Wrong header   → 401
Correct header → continue request
Public route   → bypass auth
```

Implementation options:

1. Global `preHandler` hook with route allowlist.
2. Route-level `preHandler` for protected routes only.
3. Fastify plugin with reusable `authenticateInternalRequest` function.

For this project, prefer a plugin or reusable preHandler because the API will likely grow.

## Claude-ready Prompt

```txt
You are working on my CV Builder backend.

Context:
- The backend is Fastify + TypeScript.
- The API has a public health endpoint and protected CV parsing endpoint.
- The expected API key header is `x-internal-api-key`.
- The expected value comes from the typed config as `internalApiKey` or the equivalent existing config field.

Task:
Implement a reusable Fastify API key authentication plugin or preHandler.

Requirements:
- Validate the `x-internal-api-key` header.
- Compare it against the configured `INTERNAL_API_KEY` value.
- Return 401 when the key is missing.
- Return 401 when the key is invalid.
- Use the project’s existing error response style if one exists.
- Do not log the raw key.
- Keep `/api/health` public.
- Protect `/api/cv/parse`.
- Keep the implementation clean, typed, and easy to reuse for future protected routes.
- Add tests for missing key, invalid key, valid key, and public route behavior.

After implementation, summarize the files changed and include the test command to run.
```

---

# Ticket 4: Protect CV Parsing Route

## Description

As a CV Builder backend engineer, I want the CV parsing endpoint to require internal API authentication so that unauthorized clients cannot consume AI credits or process CV files directly.

## Acceptance Criteria

- [ ] `POST /api/cv/parse` requires a valid internal API key.
- [ ] Requests without `x-internal-api-key` are rejected before file parsing starts.
- [ ] Requests with invalid `x-internal-api-key` are rejected before file parsing starts.
- [ ] Requests with a valid key continue through the existing parse flow.
- [ ] Existing validation errors, such as missing file or invalid CV format, continue working after authentication passes.
- [ ] Tests confirm that unauthorized requests do not invoke parser or AI provider logic.

## Dev Notes

Authentication should run before expensive operations:

```txt
Request received
  ↓
Authenticate internal API key
  ↓
Validate multipart payload
  ↓
Extract CV text
  ↓
Call AI provider
  ↓
Validate response
  ↓
Return parsed CV
```

This prevents unauthorized clients from triggering file parsing or AI provider calls.

## Claude-ready Prompt

```txt
You are working on my CV Builder backend.

Context:
- There is an existing POST /api/cv/parse endpoint.
- It receives multipart/form-data with a PDF or DOCX file.
- It eventually parses the file and calls an AI provider through an adapter.
- We already added or are adding an internal API key authentication plugin/preHandler.

Task:
Protect POST /api/cv/parse with internal API authentication.

Requirements:
- Ensure the route requires `x-internal-api-key`.
- Authentication must happen before multipart parsing, file validation, parser logic, or AI provider calls.
- Missing key should return 401.
- Invalid key should return 401.
- Valid key should allow the existing CV parsing flow to continue unchanged.
- Existing domain errors like MISSING_FILE and CV_IMPORT_VALIDATION_ERROR should still work after authentication passes.
- Add or update tests to prove unauthorized requests do not call the parser or AI provider.
- Keep the route implementation clean and aligned with the existing Fastify structure.

After implementation, summarize the route changes and test coverage.
```

---

# Ticket 5: Add Frontend Server Proxy Contract Documentation

## Description

As a CV Builder engineer, I want to document how the frontend should securely call the backend so that the internal API key is only used from trusted server-side code.

## Acceptance Criteria

- [ ] Documentation explains that browser/client components must not call the backend with the internal API key.
- [ ] Documentation shows the expected Vercel/Next.js server route flow.
- [ ] Documentation includes the required frontend environment variables.
- [ ] Documentation includes the request forwarding contract.
- [ ] Documentation includes a warning that `NEXT_PUBLIC_*` variables must not be used for secrets.
- [ ] Documentation includes a small example of a server-side fetch to the backend.

## Dev Notes

Recommended frontend environment variables:

```txt
BACKEND_API_URL=https://your-backend-url.com
INTERNAL_API_KEY=<same-secret-configured-in-backend>
```

Do not use:

```txt
NEXT_PUBLIC_INTERNAL_API_KEY=...
```

Because `NEXT_PUBLIC_*` variables are exposed to the browser.

Example server flow:

```txt
Browser → /api/cv/parse in Next.js → Fastify Backend
```

## Claude-ready Prompt

```txt
You are working on my CV Builder project.

Context:
- The frontend is likely Next.js deployed on Vercel.
- The backend is a separate Fastify API deployed as a public web service.
- The backend requires `x-internal-api-key` for protected endpoints.
- The browser must never receive this key.

Task:
Create documentation explaining how the frontend should call the backend securely.

Requirements:
- Explain that the browser should call a Next.js server route or server action.
- Explain that the Next.js server route should forward the request to the Fastify backend.
- Explain that only the server-side code should attach the `x-internal-api-key` header.
- Include required env vars: BACKEND_API_URL and INTERNAL_API_KEY.
- Explicitly warn not to use NEXT_PUBLIC_INTERNAL_API_KEY.
- Include a small TypeScript example of a server-side fetch forwarding multipart/form-data to the backend.
- Keep the documentation practical and easy to follow.

Do not modify backend code in this ticket. Only create or update documentation.
```

---

# Ticket 6: Add CORS Policy for Frontend Domain

## Description

As a CV Builder backend engineer, I want to configure CORS so that browser-based requests are restricted to the expected frontend origins.

## Acceptance Criteria

- [ ] CORS is configured using environment-based allowed origins.
- [ ] Local development frontend origin is supported.
- [ ] Production frontend origin is supported.
- [ ] Unknown origins are rejected or not allowed by CORS.
- [ ] CORS config does not replace API authentication.
- [ ] Documentation explains that CORS is not a security boundary for non-browser clients.
- [ ] Tests or manual validation steps are added.

## Dev Notes

Recommended environment variable:

```txt
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

CORS helps browsers, but it does not stop `curl`, Postman, or backend scripts. API authentication is still required.

## Claude-ready Prompt

```txt
You are working on my CV Builder backend.

Context:
- The backend is Fastify + TypeScript.
- It will be deployed publicly, likely on Render or Cloud Run.
- The frontend will be deployed separately, likely on Vercel.
- We already have or are adding internal API key authentication.

Task:
Add a strict but practical CORS configuration.

Requirements:
- Use an environment variable called ALLOWED_ORIGINS or follow the existing config naming convention.
- Support multiple comma-separated origins.
- Allow local development origin, for example http://localhost:3000.
- Allow the production frontend origin.
- Do not allow arbitrary origins in production.
- Keep `/api/health` usable.
- Add documentation explaining that CORS is not a replacement for API authentication.
- Add tests if the project has an existing pattern for testing CORS; otherwise add clear manual validation steps.

After implementation, summarize the files changed and any env vars required.
```

---

# Ticket 7: Add Rate Limiting for Protected Endpoints

## Description

As a CV Builder backend engineer, I want to add rate limiting to expensive protected endpoints so that the API is more resilient against abuse, accidental loops, and repeated expensive AI calls.

## Acceptance Criteria

- [ ] Rate limiting is configured for protected endpoints.
- [ ] `POST /api/cv/parse` has a reasonable request limit.
- [ ] Rate limit settings are configurable through environment variables.
- [ ] Rate limit responses use a consistent error format.
- [ ] The implementation does not block health checks unnecessarily.
- [ ] Tests or manual validation steps are added.

## Dev Notes

Recommended initial limits for MVP:

```txt
CV_PARSE_RATE_LIMIT_MAX=10
CV_PARSE_RATE_LIMIT_WINDOW=1 minute
```

This is not final product-level quota management. It is basic API protection.

If all requests come from the Vercel server, IP-based limits may group many users together. That is acceptable for MVP but should be revisited after user authentication is added.

## Claude-ready Prompt

```txt
You are working on my CV Builder backend.

Context:
- The backend exposes an expensive endpoint: POST /api/cv/parse.
- That endpoint can trigger file parsing and AI provider calls.
- We already have or are adding internal API key authentication.
- I want basic rate limiting for abuse prevention.

Task:
Add rate limiting to protected expensive endpoints, especially POST /api/cv/parse.

Requirements:
- Use a Fastify-compatible rate limiting approach, preferably following existing project conventions.
- Configure a reasonable MVP limit for POST /api/cv/parse.
- Make the limit configurable through environment variables.
- Do not unnecessarily rate-limit GET /api/health.
- Return a consistent error response when the rate limit is exceeded.
- Add tests if feasible, or add manual validation steps.
- Keep the implementation simple and production-friendly.

After implementation, summarize the files changed, env vars added, and how to validate the behavior.
```

---

# Ticket 8: Add Security-Focused Tests for API Authentication

## Description

As a CV Builder backend engineer, I want automated tests around API authentication so that future route changes do not accidentally expose protected backend functionality.

## Acceptance Criteria

- [ ] Tests cover public route access without an API key.
- [ ] Tests cover protected route access without an API key.
- [ ] Tests cover protected route access with an invalid API key.
- [ ] Tests cover protected route access with a valid API key.
- [ ] Tests confirm protected route logic is not executed when authentication fails.
- [ ] Tests are included in the existing backend test suite.
- [ ] Test setup uses safe test secrets.

## Dev Notes

Minimum test matrix:

```txt
GET /api/health without key       → 200
POST /api/cv/parse without key    → 401
POST /api/cv/parse with bad key   → 401
POST /api/cv/parse with valid key → route continues
```

For the valid key test, it is okay to still receive a domain validation error if no file is provided, for example:

```txt
401 is wrong because auth failed.
400 MISSING_FILE is acceptable because auth passed and route validation continued.
```

## Claude-ready Prompt

```txt
You are working on my CV Builder backend.

Context:
- The backend is Fastify + TypeScript.
- We added internal API key authentication using the `x-internal-api-key` header.
- `/api/health` is public.
- `/api/cv/parse` is protected.

Task:
Add automated tests for API authentication behavior.

Requirements:
- Test that GET /api/health works without an API key.
- Test that POST /api/cv/parse returns 401 without an API key.
- Test that POST /api/cv/parse returns 401 with an invalid API key.
- Test that POST /api/cv/parse with a valid API key passes authentication and reaches the route validation flow.
- If no file is provided with a valid key, it is acceptable for the response to be a domain validation error like MISSING_FILE.
- Add a test to ensure expensive dependencies, such as parser or AI provider, are not called when authentication fails, if the current test structure supports it.
- Use safe test environment values.
- Follow the existing test patterns in the repository.

After implementation, summarize the test cases and provide the command to run them.
```

---

# Ticket 9: Add Deployment Secret Checklist

## Description

As a CV Builder engineer, I want a deployment checklist for API authentication secrets so that the backend and frontend environments are configured correctly before production deployment.

## Acceptance Criteria

- [ ] The checklist includes backend environment variables.
- [ ] The checklist includes frontend server environment variables.
- [ ] The checklist explains that both services must share the same internal API key value.
- [ ] The checklist explains that the key must not use a `NEXT_PUBLIC_` prefix.
- [ ] The checklist includes secret rotation notes.
- [ ] The checklist includes basic smoke test steps after deployment.

## Dev Notes

Backend environment variables:

```txt
INTERNAL_API_KEY=<secret>
ALLOWED_ORIGINS=<frontend-origin-list>
```

Frontend environment variables:

```txt
BACKEND_API_URL=<backend-public-url>
INTERNAL_API_KEY=<same-secret-as-backend>
```

Smoke tests:

```txt
GET /api/health → 200
POST /api/cv/parse without key → 401
POST /api/cv/parse through frontend flow → expected parse behavior
```

## Claude-ready Prompt

```txt
You are working on my CV Builder project documentation.

Context:
- The frontend and backend are deployed separately.
- The backend requires an internal API key for protected endpoints.
- The frontend server must send that key when calling the backend.
- The browser must never receive that key.

Task:
Create a deployment checklist for API authentication secrets.

Requirements:
- Include backend env vars: INTERNAL_API_KEY and ALLOWED_ORIGINS.
- Include frontend env vars: BACKEND_API_URL and INTERNAL_API_KEY.
- Explain that the backend and frontend server must use the same INTERNAL_API_KEY value.
- Warn not to use NEXT_PUBLIC_INTERNAL_API_KEY.
- Add simple secret rotation guidance.
- Add smoke test steps for validating deployment.
- Keep it practical and easy to follow.

Do not implement code. Only create or update documentation.
```

---

# Ticket 10: Add Observability for Unauthorized Requests

## Description

As a CV Builder backend engineer, I want safe logging for unauthorized API requests so that I can detect suspicious traffic without exposing secrets in logs.

## Acceptance Criteria

- [ ] Unauthorized requests are logged with safe metadata.
- [ ] Logs include route, method, request id, and failure reason.
- [ ] Logs do not include raw API keys.
- [ ] Logs distinguish missing key from invalid key without exposing secret values.
- [ ] Logs use the existing logger pattern.
- [ ] Documentation explains what to inspect when debugging authentication failures.

## Dev Notes

Safe log example:

```json
{
  "event": "api_auth_failed",
  "reason": "missing_api_key",
  "method": "POST",
  "url": "/api/cv/parse",
  "requestId": "req-1"
}
```

Avoid:

```json
{
  "receivedApiKey": "secret-value"
}
```

## Claude-ready Prompt

```txt
You are working on my CV Builder backend.

Context:
- The backend uses Fastify and structured logging.
- We added internal API key authentication for protected routes.
- I want to observe unauthorized traffic safely.

Task:
Add safe logging for failed API authentication attempts.

Requirements:
- Log unauthorized requests with safe metadata only.
- Include method, route/url, request id if available, and failure reason.
- Distinguish between missing key and invalid key.
- Never log the raw received API key.
- Never log the expected API key.
- Follow the existing pino/Fastify logging style.
- Add or update tests if the project currently tests logs; otherwise keep the implementation simple.
- Add a short debugging note in documentation explaining where to look for auth failures.

After implementation, summarize the files changed and include an example log shape without real secrets.
```

---

# Suggested Implementation Order

```txt
1. Ticket 1 - Define strategy and contract
2. Ticket 2 - Add env validation
3. Ticket 3 - Implement auth plugin
4. Ticket 4 - Protect CV parsing route
5. Ticket 8 - Add security tests
6. Ticket 5 - Document frontend proxy contract
7. Ticket 6 - Add CORS policy
8. Ticket 7 - Add rate limiting
9. Ticket 9 - Add deployment checklist
10. Ticket 10 - Add observability
```

## Recommended MVP Scope

If you want the smallest safe production-ready version, implement these first:

```txt
Ticket 2 - Environment validation
Ticket 3 - API key authentication plugin
Ticket 4 - Protect CV parsing route
Ticket 8 - Security tests
Ticket 9 - Deployment checklist
```

Then add CORS, rate limiting, and observability as hardening tickets.

---

# Final Expected Backend Behavior

```txt
GET /api/health
  → public
  → returns 200 without API key

POST /api/cv/parse without x-internal-api-key
  → protected
  → returns 401 UNAUTHORIZED

POST /api/cv/parse with invalid x-internal-api-key
  → protected
  → returns 401 UNAUTHORIZED

POST /api/cv/parse with valid x-internal-api-key but no file
  → auth passes
  → returns normal validation error, for example MISSING_FILE

POST /api/cv/parse with valid x-internal-api-key and valid file
  → auth passes
  → CV parsing flow continues
```

---

# Future Enhancements

These are not required for the initial EPIC, but they are natural next steps:

- Add user authentication with Supabase Auth, Clerk, or Auth.js.
- Add per-user usage limits.
- Add API key rotation with multiple active keys.
- Add request signing instead of a static shared secret.
- Add async job processing for CV parsing.
- Add queue-based rate limiting.
- Add audit logs for authenticated internal clients.
