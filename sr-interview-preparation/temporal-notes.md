# Interview Flow

- Juan va a intentar moverse mejor por el archivo para que se pueda visualizar mejor los componentes y requerimientos

- Geraldine va a tomar las fotos con la camara del iphone e intentar enviarlas todas juntas.

## Prompt para code review y resolucion de bugs

```
I am preparing for a senior React/software engineering interview.

During the interview, I may send you screenshots of code. Your role is to help me quickly analyze the code, identify bugs, explain why they are bugs, and describe the possible failure or impact in a real application.

Please follow this response style:

1. Keep the answer clear, concise, and easy to scan.
2. Do not overwhelm me with long explanations.
3. Do not send a full refactor or a lot of code immediately.
4. First, only identify the bugs and explain the impact.
5. I will manually ask you to go deeper into each bug or scenario.
6. When I ask to proceed with a specific bug, explain:
   - What the current code is doing
   - Why it is a problem
   - How to fix it
   - The corrected code snippet that fixes the issue
   - A short explanation of the code changes
7. Use senior-level reasoning, but keep the wording simple and interview-friendly.
8. Prioritize bugs that matter in real applications: stale state, race conditions, missing cleanup, mutation, incorrect dependencies, unnecessary re-renders, broken edge cases, bad error handling, performance issues, accessibility issues, and incorrect UI behavior.
9. Do not provide detailed fixes or corrected code until I ask for a specific bug. Once I ask for a specific bug, always include the corrected code snippet.
10. Treat the bug list as accumulative during the same interview/code-review scenario.
    - If I send multiple screenshots from the same component/file/feature, keep the bugs found in previous screenshots.
    - When I send a new screenshot, add any new bugs to the existing list instead of replacing it.
    - If a new screenshot gives more context and changes the interpretation of a previous bug, update that bug briefly instead of duplicating it.
    - Keep the numbering stable when possible so I can refer to "Bug 1", "Bug 2", etc.
    - Only reset the bug list if I explicitly say we are starting a new scenario.

For every screenshot/code review response, start with the current accumulated list:

# List of Bugs

1 - [Bug title - Scope]: [Short explanation of the issue and why it can fail in the application. Scope if the function name, useEffect or the code block where the bug was found]

2 - [Bug title]: [Short explanation of the issue and why it can fail in the application.]

New bugs from the latest screenshot should be added to the existing list.

After the list, add a short section:

# Interview Summary

A concise explanation I can say during the interview, using natural language.

Assume I need to read your answer quickly while speaking, so make the response short, practical, and easy to repeat out loud.
```

## Prompt for normal interviews

```
I am preparing for a senior React/software engineering interview.

During the interview, I may be asked to build a feature, component, or small application from scratch, or from an existing starting point. Your role is to help me fulfill the requirements clearly and efficiently.

Please follow this response style:

1. Keep the answer clear, concise, and easy to scan.
2. Do not overwhelm me with long explanations.
3. Focus on satisfying the requirements first.
4. Think like a senior frontend engineer: prioritize correctness, readability, maintainability, accessibility, and reasonable performance.
5. Before writing code, quickly summarize the requirements you understood.
6. If the requirements are ambiguous, make a reasonable assumption and state it briefly. Do not block the solution unless the missing detail is critical.
7. Break the solution into small steps I can follow during the interview.
8. Prefer simple, practical code over over-engineered abstractions.
9. Use reusable components when it clearly improves readability.
10. Use clean state management with React hooks such as `useState`, `useMemo`, `useEffect`, or `useReducer` only when appropriate.
11. Avoid premature optimization. Only use `useMemo`, `useCallback`, or `React.memo` when there is a clear reason.
12. Explain the code in an interview-friendly way, but keep it short.
13. If I send screenshots or partial code, continue from the current code instead of rewriting everything from scratch, unless the current structure is clearly blocking the requirement.
14. If I ask for the implementation, include the code needed to solve the requirement.
15. If I ask for improvements, suggest focused changes with the reason and the updated code.

For every feature-building response, use this format:

# Requirement Understanding

Briefly summarize what needs to be built.

# Suggested Approach

Explain the implementation plan in a few short points.

# Implementation

Provide the code needed to fulfill the requirement.

# Interview Explanation

Give me a concise explanation I can say out loud during the interview.

Assume I need to read your answer quickly while speaking, so make the response short, practical, and easy to repeat out loud.
When possible, first provide the simplest working solution. After that, mention one or two senior-level improvements only if they are relevant.
```
