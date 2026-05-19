# AI Provider Factory

## What it is

A single function (`createAIProvider`) that reads the active provider from environment config and returns a concrete `AIProvider` implementation.

```ts
const provider = createAIProvider(); // returns MockAIProvider or GeminiAIProvider
```

The rest of the codebase only ever sees the `AIProvider` interface — never the concrete class.

---

## Why it exists

### Problem without it

Without a factory, every place that needs AI would have to decide which provider to use:

```ts
// Without factory — repeated everywhere
const provider = process.env.AI_PROVIDER === 'gemini'
  ? new GeminiAIProvider()
  : new MockAIProvider();
```

Provider selection logic leaks into use cases, routes, and services. Adding a third provider means touching every one of those files.

### Solution with it

```ts
// With factory — one place
export function createAIProvider(override?: AIProviderName): AIProvider {
  const name = override ?? env.AI_PROVIDER;

  switch (name) {
    case 'mock':   return new MockAIProvider();
    case 'gemini': return new GeminiAIProvider();
    default:       throw new AiConfigurationError(`Unknown provider: "${name}"`);
  }
}
```

Use cases call `createAIProvider()` and work against the interface. They have no knowledge of what's behind it.

---

## Provider selection rules

| `AI_PROVIDER` value | `NODE_ENV` | Result |
|---|---|---|
| Not set / empty | `development` or `test` | `MockAIProvider` |
| Not set / empty | `production` | `GeminiAIProvider` |
| `mock` | any | `MockAIProvider` |
| `gemini` | any | `GeminiAIProvider` |
| Anything else | any | Hard throw at startup |

Validation happens in `src/config/env.ts` when the process starts — not at request time. A misconfigured deployment fails immediately rather than serving broken responses.

---

## Adding a new provider

1. Create `src/modules/ai/providers/openai.provider.ts` implementing `AIProvider`.
2. Add `'openai'` to `AIProviderName` in `ai.types.ts`.
3. Add one `case` to the factory switch.
4. Update `env.ts` `VALID_AI_PROVIDERS` array.

No other files change.

---

## Architecture position

```
Route / Use Case
      │
      ▼
  AiService                   ← depends on AIProvider interface
      │
      ▼
createAIProvider()            ← reads env, returns concrete impl
      │
      ├── MockAIProvider      ← deterministic, no API key, used in dev/test
      └── GeminiAIProvider    ← real calls, used in production
```

Routes and use cases sit above the factory. They never import a concrete provider class — only `AiService`, which itself receives a provider via the factory.

---

## Key files

| File | Role |
|---|---|
| `src/modules/ai/providers/ai-provider.ts` | Interface all providers must implement |
| `src/modules/ai/providers/provider-factory.ts` | Factory — reads env, returns provider |
| `src/modules/ai/providers/mock.provider.ts` | Deterministic mock for dev and tests |
| `src/modules/ai/providers/gemini.provider.ts` | Gemini stub — throws `AiNotImplementedError` until wired |
| `src/config/env.ts` | Validates `AI_PROVIDER` at startup |
| `src/modules/ai/ai.errors.ts` | `AiConfigurationError` for invalid config |
