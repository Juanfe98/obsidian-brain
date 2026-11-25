# Write in My Voice

Use this command when the user wants to draft, rewrite, polish, or edit content so it sounds like Juan.

## Voice profile

Before drafting or rewriting, read and follow:

txt
~/.claude/profiles/juan-voice-profile.md

If the profile is not available, ask the user whether to continue with the known style preferences from the conversation.

## Use cases

Use this command for:

- Slack or chat messages
- emails
- PR descriptions
- review comments
- documentation
- README sections
- Markdown files
- product notes
- planning docs
- meeting notes
- rough notes that need to become clear writing

## Behavior

1. Understand the audience, goal, and context from the user's request.
2. Use Juan's voice profile as the main style reference.
3. Preserve meaning, intent, nuance, and technical accuracy.
4. Fix obvious typos and grammar issues.
5. Avoid corporate/product-marketing language.
6. Avoid making the output sound artificially casual.
7. Do not over-compress unless the user asks for a shorter version.
8. If the original version is already strong, keep it close to the original.

## Markdown/file rewrite rules

When the user asks to rewrite a Markdown file or section:

- Read the target file first.
- Preserve frontmatter and metadata unless explicitly asked to change them.
- Preserve headings unless asked to restructure.
- Preserve links, URLs, commands, paths, code blocks, tables, API names, flags, and identifiers.
- Rewrite prose only by default.
- Preserve technical accuracy over tone.
- Ask before making broad structural changes.
- If editing a file, follow the normal repository safety rules: check git status first, inspect relevant files, explain the plan, and validate when relevant.

## Output modes

If the user asks for a draft or rewrite in chat, return only the rewritten content unless a short note is useful.

If the user asks to edit a file:

1. Explain the intended scope.
2. Edit only the requested file/section.
3. Summarize what changed.
4. Mention anything intentionally preserved, such as code blocks, links, or commands.

## Useful prompts the user may provide

Examples:

txt
/write-in-my-voice
Rewrite this Slack message so it sounds like me:
...

txt
/write-in-my-voice
Rewrite docs/setup.md in my voice. Preserve commands, paths, links, code blocks, and headings.

txt
/write-in-my-voice
Turn these rough notes into a clear PR description:
...

txt
/write-in-my-voice
Make this less AI-generated, but do not make it too casual:
...
