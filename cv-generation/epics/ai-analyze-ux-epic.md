# 🚀 EPIC: UX Refinement — AI Analyze CV Page

## 🎯 Goal
Transform the Analyze CV page from a **problem report** into a **guided improvement experience**.

The page should feel:
- Structured
- Actionable
- Motivating
- Non-overwhelming

---

## 🧠 Core UX Principle
Analyze → Prioritize → Navigate → Improve

---

# 🟢 Phase 1 — Structure & Clarity

## 🧾 Ticket 1 — Group Issues by Section

### Description
Merge duplicate issues under a single section.

### Acceptance Criteria
- No repeated "Experience" blocks
- Issues grouped like:
  Experience (2 issues)
  Skills (1 issue)

### 🤖 Claude Prompt
```
You are a senior frontend engineer.

Refactor the Analyze CV UI.

Requirements:
- Group issues by section (Experience, Skills, Education, Profile)
- Merge duplicate entries into a single section
- Display issue count per section

If unsure:
- Analyze current data structure and normalize grouping
```

---

## 🧾 Ticket 2 — Add Severity Grouping

### Description
Group issues by impact level.

### Acceptance Criteria
- Sections:
  🔴 High Impact
  🟡 Medium Impact
  🟢 Low Impact
- Items categorized correctly

### 🤖 Claude Prompt
```
Improve severity visualization.

Requirements:
- Group issues into High, Medium, Low impact
- Replace "Alta/Media" with visual hierarchy
- Use color + icon (not only text)

Goal: reduce cognitive overload
```

---

# 🟡 Phase 2 — Actionability

## 🧾 Ticket 3 — Add “Go to Section” Actions

### Description
Allow user to navigate directly to fix issues.

### Acceptance Criteria
- Each issue has:
  "Ir a sección"
- Navigates to correct editor step

### 🤖 Claude Prompt
```
Add navigation actions to analysis items.

Requirements:
- Add button "Ir a sección"
- Navigate to correct editor section
- Use existing routing/state

If unsure:
- Map issue.section → editor step dynamically
```

---

## 🧾 Ticket 4 — Add “Next Best Actions” Panel

### Description
Highlight top priorities.

### Acceptance Criteria
- Show top 2–3 issues at top
- Ordered by impact

### 🤖 Claude Prompt
```
Add a "Next Best Actions" section.

Requirements:
- Show top 2–3 most critical improvements
- Sorted by severity
- Include quick navigation buttons

Goal: guide user focus
```

---

# 🟠 Phase 3 — Content & Readability

## 🧾 Ticket 5 — Refactor Issue Text

### Description
Make issues structured and scannable.

### Acceptance Criteria
- Format:
  Problema
  Recomendación
  Ejemplo (optional)
- No long paragraphs

### 🤖 Claude Prompt
```
Refactor issue descriptions.

Requirements:
- Break text into:
  Problem / Recommendation / Example
- Avoid long paragraphs
- Improve readability

If unsure:
- Infer structure from current content
```

---

## 🧾 Ticket 6 — Reduce Red/Error Overuse

### Description
Avoid overwhelming UI.

### Acceptance Criteria
- Red only for critical
- Medium = yellow
- Low = neutral

### 🤖 Claude Prompt
```
Improve visual severity usage.

Requirements:
- Red only for critical issues
- Medium = yellow
- Low = neutral/gray
- Avoid full red panels everywhere

Goal: reduce anxiety
```

---

# 🟣 Phase 4 — Score & Motivation

## 🧾 Ticket 7 — Add Score Context

### Description
Make score meaningful.

### Acceptance Criteria
- Add message below score:
  "Buen nivel..." or similar

### 🤖 Claude Prompt
```
Enhance score section.

Requirements:
- Add contextual message based on score
- Example:
  80+ → strong CV
  60–80 → good but improvable
- Keep concise

Goal: motivate user
```

---

## 🧾 Ticket 8 — Add Progress Feeling

### Description
Make improvements feel achievable.

### Acceptance Criteria
- Optional progress indicator
- Or count of completed improvements

### 🤖 Claude Prompt
```
Add progress feedback.

Requirements:
- Show number of issues
- Optionally track resolved issues
- Keep simple

Goal: increase engagement
```

---

# 🔴 Phase 5 — Advanced UX (Optional but Powerful)

## 🧾 Ticket 9 — Add “Fix this” Integration

### Description
Bridge analyze → AI improvement.

### Acceptance Criteria
- Each issue can trigger relevant AI action
- Still requires user confirmation

### 🤖 Claude Prompt
```
Integrate "Fix this" actions.

Requirements:
- Map issue → AI action (improveText, etc)
- Do NOT auto-apply changes
- Show suggestions first

If unsure:
- Analyze mapping strategy dynamically
```

---

## 🧾 Ticket 10 — Collapse/Expand Sections

### Description
Improve readability.

### Acceptance Criteria
- Sections collapsible
- Default: High expanded

### 🤖 Claude Prompt
```
Add collapsible sections.

Requirements:
- Allow expand/collapse
- Default open: high severity
- Keep animation smooth

Goal: reduce visual noise
```

---

# ✅ Definition of Done

- Issues are grouped and non-redundant
- Clear severity hierarchy
- Actionable navigation exists
- Text is scannable and structured
- Score is meaningful
- UI feels calm, not overwhelming

---

# 🧠 Final Rule

This page should feel like:

"Your AI coach guiding you step by step"

Not:

"A list of everything wrong with your CV"
