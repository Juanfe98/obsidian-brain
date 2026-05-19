# 🚀 EPIC: UX Refinement — AI Experience Bullets (with Claude Prompts)

## 🎯 Goal
Refine the AI Experience Bullets UX to feel:
- Clear
- Intentional
- High-quality
- Assistant-like (not tool-like)

---

## 🧠 Core Principle
AI suggests → User reviews → User accepts → State updates


## Important
Text values needs to use the localization and internationalization pattern already in the project. 

---

# 🟢 Phase 1 — Clarity & Intent

## 🧾 Ticket 1 — Improve Action Button Copy

### Description
Make AI action explicit and valuable.

### Acceptance Criteria
- Replace "Mejorar" → "✨ Mejorar este bullet"
- Consistent across all bullets

### 🤖 Claude Prompt
```
You are a senior frontend engineer.

Update the AI action button label in the experience bullets section.

Requirements:
- Replace "Mejorar" with "✨ Mejorar este bullet"
- Ensure consistency across all instances
- Do not break layout or styling

Focus on clarity and perceived value.
```

---

## 🧾 Ticket 2 — Improve Suggestion Panel Title

### Description
Make panel clearly tied to action.

### Acceptance Criteria
- Replace "Mejorar punto" → "✨ Sugerencias para mejorar este bullet"

### 🤖 Claude Prompt
```
Update the AI suggestion panel title.

Replace:
"Mejorar punto"

With:
"✨ Sugerencias para mejorar este bullet"

Ensure:
- Strong contextual connection to clicked bullet
- No layout regressions
```

---

# 🟡 Phase 2 — Suggestion Quality

## 🧾 Ticket 3 — Simplify Explanation Text

### Description
Reduce cognitive load.

### Acceptance Criteria
- Max 1 sentence
- Non-technical
- Easy to scan

### 🤖 Claude Prompt
```
Refactor AI suggestion explanations.

Requirements:
- Keep explanations short (1 sentence max)
- Avoid technical wording
- Focus on impact (clarity, strength, professionalism)

Example:
"Más impacto usando verbos más fuertes."
```

---

## 🧾 Ticket 4 — Highlight Recommended Suggestion

### Description
Guide user decision.

### Acceptance Criteria
- First suggestion marked:
  "⭐ Recomendado"
- Visually distinct

### 🤖 Claude Prompt
```
Enhance suggestion cards.

Requirements:
- Mark first suggestion as "⭐ Recomendado"
- Add subtle visual distinction (badge or border)
- Do not overwhelm UI

Goal: reduce decision fatigue.
```

---

# 🟠 Phase 3 — Interaction Quality

## 🧾 Ticket 5 — Add Animations

### Description
Improve perceived quality.

### Acceptance Criteria
- Expand animation (150–200ms)
- Fade-in suggestions

### 🤖 Claude Prompt
```
Add animations to suggestion panel.

Requirements:
- Animate height expansion (0 → auto)
- Fade in content
- Duration 150–200ms
- Use existing animation utilities

Goal: smooth appearance instead of abrupt UI change
```

---

## 🧾 Ticket 6 — Improve Accept Button Copy

### Description
Make action clearer.

### Acceptance Criteria
- Replace "Aceptar" → "Usar este bullet"

### 🤖 Claude Prompt
```
Update suggestion action buttons.

Replace:
"Aceptar"

With:
"Usar este bullet"

Ensure consistency and clarity.
```

---

## 🧾 Ticket 7 — Add Feedback After Accept

### Description
Give confirmation.

### Acceptance Criteria
- Highlight updated text OR show success message

### 🤖 Claude Prompt
```
Add visual feedback after accepting suggestion.

Options:
1. Highlight updated bullet briefly
2. OR show small success message

Constraints:
- Subtle
- Non-intrusive

Goal: confirm action success
```

---

## 🧾 Ticket 8 — Improve Close UX

### Description
Make exit clearer.

### Acceptance Criteria
- Add "Cerrar sugerencias"
- Keep X button

### 🤖 Claude Prompt
```
Improve closing interaction.

Requirements:
- Add "Cerrar sugerencias" action
- Keep existing X button
- Ensure both close panel

Goal: clearer exit action
```

---

# 🔴 Phase 4 — Behavior

## 🧾 Ticket 9 — Single Active Panel

### Description
Avoid UI clutter.

### Acceptance Criteria
- Only one panel open at a time

### 🤖 Claude Prompt
```
Ensure only one suggestion panel is active.

Requirements:
- Opening new closes previous
- No stacking panels

Goal: clean interaction model
```

---

## 🧾 Ticket 10 — Improve Loading UX

### Description
Make AI state visible.

### Acceptance Criteria
- Button loading state
- Optional text:
  "Generando sugerencias..."

### 🤖 Claude Prompt
```
Improve loading UX.

Requirements:
- Show loading state in button
- Optionally display "Generando sugerencias..."
- Prevent duplicate clicks

Goal: clear system feedback
```

---

# 🟣 Phase 5 — Discoverability (Claude can explore best placement)

## 🧾 Ticket 11 — Add Generate Bullets Entry

### Description
Help users without content.

### Acceptance Criteria
- Add "✨ Generar bullets con IA"

### 🤖 Claude Prompt
```
Add "Generate bullets" entry point.

Context:
- Analyze current layout
- Choose best placement above textarea

Requirements:
- Add "✨ Generar bullets con IA"
- Integrate existing hook

If unsure:
- Evaluate layout and choose optimal UX placement
```

---

## 🧾 Ticket 12 — Add AI Hint

### Description
Improve discoverability.

### Acceptance Criteria
- Add subtle helper text

### 🤖 Claude Prompt
```
Add subtle AI hint.

Text:
"💡 Usa IA para mejorar o generar bullets automáticamente"

Requirements:
- Place near textarea
- Keep UI clean

If unsure:
- Analyze layout and choose least intrusive placement
```

---

# ✅ Definition of Done

- AI feels intentional and helpful
- Suggestions easy to scan and apply
- UI smooth and responsive
- Clear feedback after actions
- No clutter or confusion

---

# 🧠 Final Rule

AI should feel like a helpful assistant, not a hidden feature.
