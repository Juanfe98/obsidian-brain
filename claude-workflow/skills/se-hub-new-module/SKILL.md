---
name: se-hub-new-module
description: Add a new content module to an existing SE Hub academy. Scaffolds the .tsx file, toc export, and wires it into the manifest and MOCK_ACADEMIES.
allowed-tools: Read, Glob, Grep, Edit, Write, Bash
argument-hint: <academy-slug> <module-slug> "<Module Title>" <estimatedMinutes> [tags...]
---

# SE Hub — Add New Academy Module

Adds a single new content module to an existing academy in the SE Hub project.

## Arguments

`$ARGUMENTS` format: `<academy-slug> <module-slug> "<Module Title>" <estimatedMinutes> [tag1 tag2 ...]`

Example: `web-fundamentals responsive-design "Responsive Design" 20 css layout`

## Procedure

### 1. Parse arguments and locate files

Parse `$ARGUMENTS`:
- `ACADEMY_SLUG` = first word
- `MODULE_SLUG` = second word
- `MODULE_TITLE` = quoted string
- `ESTIMATED_MINUTES` = number
- `TAGS` = remaining words

Locate:
- Manifest: `src/modules/<ACADEMY_SLUG>/manifest.ts`
- Modules dir: `src/modules/<ACADEMY_SLUG>/modules/`
- mock-data.ts: `src/lib/mock-data.ts`

If the manifest file doesn't exist, stop and tell the user the academy slug doesn't match any module in `src/modules/`.

### 2. Check for conflicts

Read the manifest. If a route with `slug: "<MODULE_SLUG>"` already exists, stop and report the conflict.

Read mock-data.ts. Check the matching academy entry. If a route with the same slug already exists there, stop.

### 3. Write the module content file

Create `src/modules/<ACADEMY_SLUG>/modules/<MODULE_SLUG>.tsx`:

```tsx
import type { TocItem } from "@/lib/types/academy";

export const toc: TocItem[] = [
  { id: "intro", title: "Introduction", level: 2 },
  { id: "section-two", title: "Section Two", level: 2 },
  { id: "section-three", title: "Section Three", level: 2 },
  { id: "key-takeaways", title: "Key Takeaways", level: 2 },
];

export default function <PascalCaseModuleName>() {
  return (
    <div className="article-content">
      <p>
        Opening paragraph introducing the topic.
      </p>

      <h2 id="intro">Introduction</h2>
      <p>...</p>

      <h2 id="section-two">Section Two</h2>
      <p>...</p>
      <pre><code>{`// Example code block`}</code></pre>

      <h2 id="section-three">Section Three</h2>
      <p>...</p>

      <h2 id="key-takeaways">Key Takeaways</h2>
      <ul>
        <li>Key point one</li>
        <li>Key point two</li>
        <li>Key point three</li>
      </ul>
    </div>
  );
}
```

Rules:
- No `"use client"` — this is a Server Component
- The content MUST be real educational content, not placeholder text
- Write at minimum 3 H2 sections with actual paragraphs
- Include at least one code block with real example code for the topic
- Key Takeaways section is required — 4–6 bullet points
- `toc` IDs must exactly match the `id` attributes on heading elements

### 4. Add route to manifest

In `src/modules/<ACADEMY_SLUG>/manifest.ts`, add to the `routes` array (at the correct `order` position based on the learning path):

```ts
{
  slug: "<MODULE_SLUG>",
  title: "<MODULE_TITLE>",
  order: <next_order_number>,
  estimatedMinutes: <ESTIMATED_MINUTES>,
  tags: [<TAGS>],
  component: () => import("./modules/<MODULE_SLUG>"),
},
```

Also add `"<MODULE_SLUG>"` to `learningPath` at the end (or appropriate position).

Update `totalEstimatedMinutes` to include the new module's minutes.

### 5. Add route to MOCK_ACADEMIES

In `src/lib/mock-data.ts`, find the matching academy by `slug: "<ACADEMY_SLUG>"`. Add to its `routes` array:

```ts
{
  slug: "<MODULE_SLUG>",
  title: "<MODULE_TITLE>",
  order: <next_order_number>,
  estimatedMinutes: <ESTIMATED_MINUTES>,
  tags: [<TAGS>],
},
```

Also add `"<MODULE_SLUG>"` to its `learningPath`.

Update `moduleCount` to include the new module.

Recompute `totalHours`: `Math.round((totalMinutes / 60) * 10) / 10`.

### 6. Verify

Run `pnpm build` and confirm it passes. If it fails, fix the TypeScript errors before reporting done.

### 7. Report

Summarise:
- File created: `src/modules/<ACADEMY_SLUG>/modules/<MODULE_SLUG>.tsx`
- Manifest updated: route added, `totalEstimatedMinutes` updated
- mock-data.ts updated: route added, `moduleCount` updated
- Build: ✓ clean
- URL to test: `/learn/<ACADEMY_SLUG>/<MODULE_SLUG>`
