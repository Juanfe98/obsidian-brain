---
name: aix-start-cowork
version: "2.2.4"
author: AIX Team
description: >-
  The non-technical getting-started and how-to guide for Claude Cowork with
  Disney's AIX tools. For first-time and everyday non-technical
  users (product, operations, marketing, analytics, finance, and similar
  roles). Covers what Cowork can do, your first 15 minutes, the AIX Manager
  app tab by tab, connecting and signing in to tools from Home, the
  one-time Cowork Global instructions step, letting Claude take actions safely
  (write access, read-only by default), tips for great results, real workflows
  by role, when a request needs Claude Code (building an app on aix-proto),
  and troubleshooting plus an FAQ - all in plain English with no terminal,
  CLI, or code.
  TRIGGER when a non-technical person is new to Cowork or AIX, opens Cowork
  for the first time, or asks how to get started, what you can do, how to
  connect or sign in to a tool, how to let Claude make changes, why a tool is
  not connected, or how to build or deploy an app on aix-proto - and is NOT a
  developer working in a code editor or terminal.
keywords:
  - aix
  - cowork
  - getting started
  - onboarding
  - welcome
  - new user
  - what can you do
  - how to use
  - non-technical
  - claude desktop
  - aix manager
  - connect tools
  - write access
  - tips and tricks
  - troubleshooting
  - aix-proto
  - build an app
  - deploy an app
  - prototype
---

# Welcome to Claude Cowork at Disney

You've got a new teammate, and the best part is how little you have to learn to start working with it.

Claude (the assistant inside the Claude app) can now reach your Disney work tools. Think of it as a sharp, endlessly patient colleague who has read everything you have access to and never tires of being asked. You don't program it, you don't run anything, and there's nothing to configure to get going. **You just talk to it in plain English** - the same way you'd lean over and ask the person at the next desk.

And if "connected to your Disney tools" makes you a little uneasy, relax: **by default Claude can only look things up** - it can't send, change, or delete a thing. So explore freely, and let's get you doing something useful in the next few minutes.

## What's in this guide

- [Quick start: your first win in three steps](#quick-start-your-first-win-in-three-steps)
- [The two apps you'll use](#the-two-apps-youll-use)
- [What Claude can do for you](#what-claude-can-do-for-you)
- [Building or deploying an app (aix-proto)](#building-or-deploying-an-app-aix-proto)
- [Your first 15 minutes](#your-first-15-minutes)
- [The AIX Manager app - a guided tour](#the-aix-manager-app---a-guided-tour)
- [Connecting your tools (signing in)](#connecting-your-tools-signing-in)
- [Letting Claude take actions (write access)](#letting-claude-take-actions-write-access)
- [Tips & tricks for great results](#tips--tricks-for-great-results)
- [More examples by role](#more-examples-by-role)
- [If something is not working](#if-something-is-not-working)
- [Frequently asked questions](#frequently-asked-questions)

You don't have to read it front to back. Skim the headings, jump to what you need, and come back when a question comes up.

---

## Quick start: your first win in three steps

If you read nothing else, read this. There are two apps: **Claude** (where you chat) and **AIX Manager** (the setup desk). To get going:

1. **Connect your tools.** In **AIX Manager**, open **Home** and click **Connect** next to each tool you use (Jira, Outlook, Teams, and so on). On an older AIX Manager with an **Auth** tab on the left, sign in there instead, then update AIX Manager. Usually this is already done for you.
2. **Point Cowork at your Disney tools (one time).** In **AIX Manager**, open the **Claude Desktop** tab, find the **Cowork instructions** card, and click **Copy instructions**. Then in the Claude app, open **Settings ▸ Cowork ▸ Global instructions** - or, if your app shows the newer Claude layout, **Settings ▸ General ▸ Instructions for Claude** - paste the text after anything already there, and save. This is what tells Claude to prefer your Disney tools - skip it and Claude may not reach into Jira, Outlook, or Teams at all.
3. **Ask a question.** Back in the Claude app, type something like *"What are my open Jira tickets, and which should I look at first?"* and press enter.

That's it. The rest of this guide explains each piece in friendly detail, but those three steps are the whole on-ramp.

---

## The two apps you'll use

It helps to know up front that two separate apps work together:

- **Claude** is where you chat. This is the app you'll spend almost all your time in - asking questions, getting summaries, handing off tasks. (Cowork is the name for this everyday-work assistant inside the Claude app. If you don't have the Claude desktop app yet, you can get it from **claude.ai/download**.)
- **AIX Manager** is the companion "front desk." It's where you install tools, sign in to them, and decide what Claude is allowed to do. You'll open it occasionally - to connect a new service or to let Claude take an action - and then go right back to chatting.

No terminal, no settings files, no guesswork. Just two friendly apps.

---

## What Claude can do for you

### The mental model: you talk, Claude does the legwork

There are really only three moving parts, and you only ever touch the first one:

1. **You ask, in your own words.** "What changed on the launch plan this week?" "Who owns the checkout service?" "Summarize this folder of meeting notes." No special syntax, no keywords. If you can describe what you want to a person, you can ask Claude.
2. **Claude reaches across your work for you.** It can pull information from your connected Disney tools, read and work with files in folders you share with it, and combine the two - all without you needing to know which tool holds what. **Claude picks the right tool for you automatically.** You never have to say "use Jira for this part."
3. **Claude carries out multi-step tasks.** A single plain-English request can fan out into several steps behind the scenes - find the document, read it, compare it against last week's, write you a summary - and you just get the finished result.

It also **remembers the conversation you're having.** So your follow-ups just work: "now make that shorter," "focus only on the budget," "who else should see this?" You're having a conversation that builds, not starting over each time.

### The kinds of things to ask for

Below are everyday needs people bring to Claude, with real examples. You don't have to use these exact words - they're just to spark ideas.

**Catch up fast.**
- *"Summarize my unread Teams messages from today and flag anything that needs a reply."*
- *"What's in my inbox that I haven't responded to?"*
- *"What happened on the project channel while I was out last week?"*

**Find and digest.**
- *"Find the Confluence page about the launch plan and give me the key points."*
- *"Pull the latest version of this Google Doc and summarize it in a paragraph."*
- *"Search Jira for everything tagged to my team this sprint and tell me what's at risk."*

**Draft.**
- *"Turn these rough notes into a project status update."*
- *"Draft a friendly reply to this email letting them know we'll have an answer Friday."*

**Organize.**
- *"Organize the files in this folder by topic and flag anything that looks out of date."*
- *"Read these five documents and tell me where they disagree with each other."*

**Look things up.**
- *"Who owns the checkout service?"* (Claude checks Yellowpages, Disney's directory of who-owns-what.)
- *"Is there an active incident right now, and who's on call?"*

Each answer comes back in seconds, with a pointer to the source if you want to read more.

### The tools Claude can reach

You don't need to memorize this - Claude picks the right one automatically - but it helps to know what's a single question away:

- **Jira** - tickets, sprints, and project tracking.
- **Confluence** - your team's wiki and knowledge pages.
- **Microsoft Teams** - chats, channels, and meeting notes.
- **Outlook** - email and calendar.
- **Google Drive** - Docs, Sheets, and Slides.
- **Airtable** - tables, lists, and trackers.
- **Lucid** - diagrams, flowcharts, and whiteboards.
- **Yellowpages** - Disney's directory of which team owns which service.
- **Datadog** and **PagerDuty** - system health, alerts, and who's on call.
- **ServiceNow** - incidents, changes, problems, knowledge articles, and requests.
- **Snowflake** and **Databricks** - the data and analytics platforms.

...and more. On top of these, Claude can also read and work with **files in folders you share with it** - so a request can blend a doc from your computer with a Jira ticket and a Teams thread, all in one answer.

Different role, same idea: just describe what *you* need, in your own words, and Claude takes it from there.

---

## Building or deploying an app (aix-proto)

There's one kind of request Cowork can't finish for you, and it's worth knowing why up front: **building and deploying an app** on Disney's self-serve platform, **aix-proto**.

aix-proto lets you stand up a small internal app (a page, a simple tool, or a prototype) that runs behind Disney login, without writing code yourself. It's for internal, non-production prototypes only. The catch: the assistant that actually builds it needs a developer setup (a "terminal") to create the project, run it, and ship it, and **Cowork doesn't have one, on purpose**. So Cowork can't build or deploy the app from here.

The good news is you can still do the thinking part right here, then hand off:

- **Shape the idea in Cowork (now).** Ask something like *"Help me plan an app I want to build on aix-proto."* Claude will help you pin down what it does, who should be able to see it, whether it needs to remember any data, and a short name for it - so you arrive ready.
- **Build it in Claude Code.** **Claude Code** is the developer version of the Claude app, for people working on a computer with a code setup. Open your project there and ask for **aix-proto**, and that assistant does the rest: it builds the app, shows you a preview, and deploys it behind Disney login. You still never write code or type commands.
- **Don't have Claude Code?** That's common if you're non-technical. Ask a teammate who builds things, or open the **AIX Manager** app - the same setup that gave you Cowork can add Claude Code too.

So: dream it up here, build it there. Everything else in this guide is something Cowork can do for you directly.

---

## Your first 15 minutes

The fastest way to "get it" is to do it. Set aside about fifteen unhurried minutes and follow these steps in order. There's no quiz and nothing to memorize.

### Step 1 - Make sure your tools are connected (about 2 minutes)

Open the **AIX Manager** app to its **Home** page. Anything that needs you sits at the top, under **Needs you**. If a tool isn't connected, click **Connect** next to it; AIX Manager walks you through the sign-in and handles any security codes for you. You only do this once per tool. If AIX Manager has an **Auth** tab on the left, it is an older version: sign in there instead, then update AIX Manager.

Often this is already done for you - and Claude will tell you the moment you ask, if a tool needs signing in. So feel free to skim this step.

### Step 2 - Turn on Cowork's Disney instructions (about 2 minutes, one time only)

This is the easy-to-miss step that makes everything else work. In **AIX Manager**, open the **Claude Desktop** tab and find the **Cowork instructions** card:

1. Click **Copy instructions**.
2. In the Claude app, open the instructions setting you see. Anthropic is moving accounts to a newer Claude layout gradually, so yours depends on your account, not your app version:
   - **Settings ▸ Cowork ▸ Global instructions**, or
   - **Settings ▸ General ▸ Instructions for Claude** (newer layout).
3. Paste the text after any instructions you already have (keep your own), review it, and save.

That's it - you only do this once. It tells Claude to prefer your Disney tools. (If you ever notice Claude reaching for a generic, non-Disney version of a tool, this is the fix.)

Your Disney tools run through the Claude app on your computer, so Claude can use them only while that app is open there. You can check on a conversation from the web or your phone, but steps that need a Disney tool wait on your computer. See Anthropic's [Cowork across surfaces](https://support.claude.com/en/articles/15520349) guide for what works where. (Settings paths per Anthropic's [new Claude experience](https://support.claude.com/en/articles/16761823) and [getting started](https://support.claude.com/en/articles/13345190-getting-started-with-cowork) articles, checked 2026-09-26 and rechecked 2026-09-30.)

### Step 3 - Ask your first easy question (about 3 minutes)

Now the fun part. Click into the chat box in the Claude app, type one of these, and press enter:

> **"What are my open Jira tickets, and which should I look at first?"**
>
> **"Summarize my unread Teams messages from today."**
>
> **"Find the Confluence page about [your project] and give me the key points."**

Pick whichever fits a tool you actually use, and watch the answer come back. This first reply is the "oh, that's it?" moment. That *is* it.

If you get a friendly note that a tool isn't connected, no problem: pop over to **Home** in AIX Manager and connect the tool (on an older AIX Manager with an Auth tab on the left, sign in to the tool there instead, then update AIX Manager), then start a fresh chat and ask again.

### Step 4 - Try a multi-step ask and refine it (about 5 minutes)

Once one question has worked, stretch a little. Claude is happy to do several things in a row from a single request:

> **"Pull my open Jira tickets, group them by priority, and write me a short status update I could paste into Teams."**

That's *find the tickets*, then *organize them*, then *write something up* - three steps, one sentence from you. And because it remembers the conversation, you can keep shaping the result without repeating yourself:

> **"Make that shorter."**  ·  **"Focus on the high-priority ones."**  ·  **"Add a friendly opening line."**

This back-and-forth is where Claude starts to feel like a teammate.

### Step 5 - Peek at the "/" menu once (about 1 minute)

Last thing: type **"/"** in the chat box. A menu of ready-made helpers pops up - a Jira helper, a Confluence helper, tools that summarize meetings and research. Take a look, then close it. Here's the reassuring part: **you never have to use this menu.** Plain English already triggers the right helper on its own. Now that you've seen it, you can forget about it.

### That's the core of it

In about fifteen minutes you connected your tools, pasted the Cowork instructions, asked a real question, handed Claude a multi-step task, and seen the "/" menu. Everything else in this guide is just more examples and more comfort on top of what you can already do. From here, it's the same move every time: **just ask.**

---

## The AIX Manager app - a guided tour

AIX Manager is the companion app that sits alongside Claude - the front desk for everything behind the scenes. Here's each tab in its left-hand menu, roughly in the order they'll matter to you.

### Setup - start here the very first time

The **Setup** tab is a guided install that gets you up and running. The first time you open AIX Manager, it checks that your system is ready, asks which parts of the company you work in, lets you pick a toolset, and installs everything for you. It's a walk-through, not a quiz. You'll use it once at the beginning and rarely think about it again. (It's safe to run again later if you ever want to re-check everything.)

The areas question is optional and you can change your answer later. Picking your areas only changes what gets recommended and shown first - nothing is hidden that you cannot still search for - so if you're not sure, leave it blank and move on.

### Home - where you connect (sign in to) your tools

**Home** is the one to remember. It lists your apps and shows what each one needs from you. Anything that needs you sits at the top under **Needs you**, with one button such as **Connect** or **Sign in again**. Until you connect your first app, Home also suggests a few under **Most people start with these**. Apps that are already working fold into a short "apps connected" line, and **More apps you can connect** lists the rest (click **Show** to open it). When Home shows neither the suggestions nor the "apps connected" line, that last list is called **Apps you can connect**. AIX Manager handles any security codes or multi-factor prompts for you, and you sign in once per tool. If Claude ever says a tool is "not connected," this is your fix. (An older AIX Manager has an **Auth** tab on the left; sign in there instead, then update AIX Manager.)

### Claude Desktop - your Cowork hub

The **Claude Desktop** tab is home base for Cowork. It's a busy tab, so here's what lives on it:

- **Connected Tools** - the tools currently wired up to the Claude app, so you can confirm everything's in place.
- **Extension** - a one-click **Install** that delivers your Disney tools and helpers to the Claude app. On a brand-new setup, if your tools don't appear in Claude at all, installing the extension here is the first thing to try. (Added new helpers later? Use the **Re-sync skills** button on the **Sync config** card to deliver them - it works without the extension.)
- **Cowork instructions** - the one-time **Copy instructions** step from your Quick start above.
- **Sync config** - if a tool you connected isn't showing up in Claude, this button refreshes the link between AIX Manager and Claude. (It does *not* sign you in - that's Home.)
- **Restart Claude Desktop** - a built-in **Restart Now** button. You'll use this whenever the app says a change needs a restart to take effect.
- **Chat write access** - the controls for letting Claude make changes (covered in detail below).
- **Tool Activity** - a recent-activity log. It's a handy way to confirm Claude actually used a tool: if you asked about Jira and you're not sure it worked, a glance here shows the activity.

### Install - browse and add tools and helpers

The **Install** tab lets you browse everything available - tools, skills (helpers), connections, and automations - grouped into plain-English categories like Issue Tracking & Project Mgmt, Docs & Knowledge, Communication, Data & ML, and Design & Diagramming. (An *automation* is a small ready-made routine that runs a repeatable task for you - you can add one the same way you add any tool.) Adding or removing something is a single button. Each skill shows a small badge: **"Cowork + Code"** means it works for you here in Cowork; **"Code only"** means it's a developer tool that won't apply to your everyday work. When browsing, just look for the **"Cowork + Code"** badge - that's your aisle.

### Team Bundles - the shortcut to a ready-made setup

The **Team Bundles** tab is a lovely shortcut. Instead of picking tools one at a time, browse ready-made toolsets that other teams have published, then add one with a single click. If you see a bundle that matches your team or role, it's the fastest way to a sensible starting set.

### What's New - the release notes

The **What's New** tab is the release history across all of AIX: what changed and when. Nothing you need to do - a friendly changelog to skim whenever you're curious.

### Settings - your configuration at a glance

The **Settings** tab is where you check things like version numbers and current state, and where **Your areas** lives - the same optional question Setup asked, editable any time. Change it and the Install tab reorders right away; Cowork picks the change up the next time you start Claude Desktop. For everyday use you won't need this tab.

### Platforms - mostly just informational

The **Platforms** tab shows which apps AIX is set up for. For a Cowork user this is almost entirely informational - nice to know it's there, but you'll rarely need to touch it.

---

## Connecting your tools (signing in)

Before Claude can look things up in a tool like Jira, Outlook, or Google Drive, that tool needs to know it's really you asking. That's what signing in does - a one-time, point-and-click step that lives entirely in the **AIX Manager** app.

### Why Claude asks you to sign in

Think of it like getting Claude its own badge to your work tools - one tied to *your* access and nobody else's. When you sign in to, say, Outlook, you're letting Claude see exactly what you can see, and nothing more. It can't peek at a colleague's private inbox or a project you don't have access to. Disney's security checks (including any multi-factor prompts) run during sign-in, the same as when you log in yourself. So this step isn't a hoop - it's what keeps everything secure and personal to you.

### How to sign in to a tool

1. **Open AIX Manager** and click **Home** on the left. It lists your apps and whether each is connected. (If AIX Manager has an **Auth** tab on the left, it is an older version: sign in to the tool there instead, then update AIX Manager, and skip the rest of these steps.)
2. **Find the tool you want** - for example, Jira, Confluence, Microsoft Teams, or Outlook.
3. **Click "Connect"** next to it (or **"Sign in again"** if its sign-in expired). Your normal Disney sign-in opens up.
4. **Complete the sign-in the way you always do.** If a security code or multi-factor approval pops up, AIX Manager walks you right through it.
5. **Check that it's connected.** It now shows in Home's connected list (click the **apps connected** line to open it). You're done with that tool.

No restart needed just to connect. Sign in, see the status change, move on.

### You only do this once per tool

Once a tool is connected, it stays connected across as many conversations as you like. Want several tools? Start with the ones under **Most people start with these** if Home shows them. Then click **Show** on the last list on Home, **More apps you can connect** or **Apps you can connect**, and connect each one you'll use. Many people set up two or three favorites on day one - say Teams, Outlook, and Confluence - and add more later. There's no rush.

### What the statuses mean

On **Home**, a tool under **Needs you** carries a short label:

- **Not connected yet** - You haven't signed in to this one yet. Click **Connect**.
- **Sign-in expiring** - Your sign-in is about to time out; click **Renew** to refresh it before it lapses.
- **Sign-in expired** - You *were* signed in, but the connection has timed out. This is completely normal - for security, sign-ins don't last forever, much like your other Disney tools occasionally ask you to log in again. Click **Sign in again** and you're back. Nothing is broken, and you don't lose any past work or chats.
- **Not working** - The tool itself has a problem that signing in won't fix. Follow the button it shows.

A tool listed under **apps connected** is connected and good to go. A tool you haven't connected yet sits under **Most people start with these** or in the last list, **More apps you can connect** or **Apps you can connect**. If Claude asked for it today and you answered **Not now**, it moves up to **Needs you** as **Not connected yet** for the rest of the day. A tool you chose **I don't use this** for always stays in the last list, even if it is connected or its sign-in has expired. One AIX Manager couldn't read shows under **Couldn't check**.

### If a tool says "not connected" while you're chatting

Sometimes you'll ask about your Jira tickets and Claude will say that tool isn't connected. No worry:

1. **Open AIX Manager** and go to **Home** (on an older AIX Manager with an Auth tab on the left, sign in to the tool there instead, then update AIX Manager and go to step 3).
2. **Connect** the tool Claude mentioned (or click **Sign in again** if it's expired).
3. **Come back to Claude and start a fresh chat**, then ask again.

Starting a new chat is the small detail that makes the difference - it lets Claude pick up the freshly connected tool.

Signing in might be the only "setup" you ever touch, and even this is just clicking a button and logging in the way you always do.

---

## Letting Claude take actions (write access)

Up to now, everything Claude does is **look-only**: read, search, list, and summarize. When you're ready, you can let it actually *act* on your behalf - send that Teams message, file that Jira ticket - one tool at a time, on your terms.

### Read-only by default

When AIX is first set up, **every tool is read-only**. That's deliberate, and it's what lets you explore with zero anxiety. In read-only mode, Claude physically cannot send a message, create or edit a ticket, change a page, or delete anything. While you're getting comfortable, poke around as much as you like - none of it touches the real thing.

### Which tools can be given write access

Write access is available for the tools where *taking an action* makes sense:

> **Jira · Confluence · Microsoft Teams · Microsoft Outlook · Google Drive · Universal Doc · Airtable · Lucid · WeaponX**

Lookup and monitoring tools - like **Datadog, PagerDuty, Snowflake, Databricks, and Yellowpages** - are read-only by their nature; there's nothing to "turn on" for them, because asking them questions is all they do.

### Turning on write access (the exact steps)

1. **Open AIX Manager** and click the **Claude Desktop** tab.
2. Scroll to the **Chat write access** card. You'll see your action-capable tools listed, each with a toggle that reads **"Read-only."**
3. **Flip the toggle** for the tool you want. Its label changes to **"Can read and make changes."** Your choice saves as you go.
4. A small notice appears: *"Saved. Takes effect on Claude's next request - no restart needed."* That's it - the grant is live on Claude's next request. (A small custom tool set may need one restart; the notice says so, and there's a **Restart…** button right there if you ever need it.)

The change applies to **only the tool you flipped** - turning on Teams does nothing to Jira or anything else. Each tool is its own decision.

### How to turn write access back off

Changed your mind? Flip the same toggle back to **Read-only** - it takes effect on Claude's next request, no restart. And as a built-in safety bonus, switching a tool back to read-only also automatically removes any delete permission you'd turned on for it. You never have to remember to undo two things.

### Deleting is a separate, deliberate choice

This is the safest part of the design. Letting Claude *make changes* does **not** let it *permanently delete* files or comments or *remove sharing*. Once you turn on write access for a tool, a separate **"Allow deleting"** option appears just below it. Turning *that* on is clearly marked in red as letting Claude permanently delete that tool's data, and it stays off unless you deliberately turn it on. (Creating and editing stay on either way.) For ServiceNow the option reads **"Allow deleting and bulk updates"** instead, because it also lets Claude update up to 50 records in one go and remove watchers or CI relationships; without it, Claude still creates and edits ServiceNow records one at a time. For **Universal Doc**, write access already covers changes *inside* a Google Doc, Sheet or Slides deck, including removing text, clearing cells or deleting a sheet tab, because you can undo them from that file's version history (**File > Version history**). **"Allow deleting"** is what lets Claude delete a whole file or a comment, or remove someone's access, which no version history can bring back.

In other words, Claude can create and update Jira tickets all day while having no ability to delete a single one, unless you deliberately allow deletes and confirm the prompt. If you never do, Claude can't permanently delete anything, full stop: the most it can remove is content inside a document, and that file's version history can restore it.

### You're still in control - even with write access on

Turning on write access does **not** put Claude on autopilot. Even after you've allowed changes, Claude still **checks with you before doing anything significant** - it shows you the exact message, the ticket it wants to create, the field it wants to change, and waits for your go-ahead.

So the safety net has two layers:

1. **You decide which tools can act at all** (the toggle in AIX Manager).
2. **Claude confirms each real action with you** before it happens.

### A couple of examples

Once write access is on for a tool, asking it to *do* something feels just like asking it to *find* something.

**Send a Teams message.** With write access on for Microsoft Teams:

> **"Send a Teams message to the design channel letting them know the review is moved to Thursday at 2pm."**

Claude drafts the message, shows it to you, and asks you to confirm before posting. Tweak it if you like (*"make it a bit warmer"*), and only then does it send.

**Create a Jira ticket.** With write access on for Jira:

> **"Create a Jira ticket in the Marketing Site project to fix the broken link on the careers page, and set it to high priority."**

Claude assembles the ticket and shows it to you first. Nothing is filed until you say yes.

The same pattern works everywhere: reply to an email in Outlook, update a Confluence page, add a row to an Airtable base. Turn the tool on, ask in plain English, and confirm when Claude checks in.

### Quick recap

- **Read-only is the default** - safe to explore.
- To let Claude act, open **AIX Manager → Claude Desktop → Chat write access** and flip the tool to **"Can read and make changes."** It takes effect on Claude's next request - no restart.
- **Deleting is a separate opt-in** with a confirmation prompt - and turning write off auto-removes it.
- Even with write access on, **Claude still asks before anything significant.**

Turn it on when you're ready, leave it off when you're not. Either way, you stay in the driver's seat.

---

## Tips & tricks for great results

You already know the main rule: just ask in plain English. These tips are the next layer - small habits that turn a good answer into a great one. None are required; pick them up one at a time.

### Say the goal, not the steps

Tell Claude what you want at the end, not how to get there.

- Instead of: *"Open Jira, filter by my name, sort by priority..."*
- Try: **"What should I work on first today?"**

> **"Give me the three biggest risks in this planning doc and who owns each one."**

That's a goal. Claude reads the doc, pulls out the risks, and checks who owns what - all from one sentence.

### Give it context - name the place, paste your notes

A vague *"summarize the doc"* makes Claude guess; naming the specific document, channel, project, or folder lets it go straight to the source.

- **Name the thing:** *"Summarize the #launch-readiness Teams channel from this week."*
- **Paste your raw material:** *"Here are my messy meeting notes - turn them into a clean status update."*
- **Point at the project:** *"Find the Confluence page for the Holiday Campaign and give me the key dates."*

More context in equals a better answer out.

### Remember it's a conversation, not a one-shot

You don't have to get your request perfect the first time. Claude remembers everything in the current chat, so refine with simple follow-ups:

- *"Make that shorter."*  ·  *"Now focus just on the budget section."*  ·  *"Rewrite it in a warmer tone."*  ·  *"Add the dates you found earlier."*

A great answer is often the third try, not the first - and that's completely normal.

### Share files and folders the easy way

Claude can read and work with your files - so you can hand it real work, not just questions. Sharing a file is as simple as attaching one to an email: **drag the file into the chat box, or use the attachment (paperclip) button** to pick it. To work across a whole folder, point Claude at it the same way and say what you'd like.

> **"Read everything in this Q3 Planning folder and tell me which documents still mention the old timeline."**
>
> **"Look through this folder of interview notes and pull out the themes that came up more than once."**

Claude reads what's actually in the folder you share; a very large folder may just take a little longer.

### Ask it to show its work

You should never have to take an answer on faith. If you want to know where something came from, just ask:

- *"Where did you find that?"*  ·  *"Which Teams messages is that based on?"*  ·  *"Link me to the source doc."*

This is especially worth doing before you forward a summary to your boss or paste a number into a report.

### Combine tools in one ask

You don't have to work one tool at a time - ask for a whole little workflow in a single sentence, and Claude moves between your tools to get it done.

> **"Read the launch plan in Google Drive and draft a short Teams update summarizing it for the team."**
>
> **"Find who owns the checkout service in Yellowpages and pull their recent Jira tickets."**

Reading from your tools works right away; if a step would *send* or *change* something, that's where write access and Claude's check-in come in.

### Use Projects to keep context together

If you keep returning to the same body of work - a campaign, a quarter of planning, an ongoing investigation - put those chats in a **Project**. A Project keeps related conversations and reference material together, so Claude stays oriented across days and weeks. Drop the key documents into the Project so they're always within reach. For one-off questions, you don't need a Project at all.

### Know when to start a fresh chat

Claude's memory of the current conversation is a feature - until you switch topics entirely. Start a new chat when:

- You've **switched to a completely different topic.**
- The conversation has gotten **long and wandering** and you want a clean slate.
- You **just connected a tool** in AIX Manager and want Claude to notice it.

Starting over costs nothing and you lose nothing important.

### When you're stuck, just ask what's possible

The friendliest tip of all: if you don't know where to start, ask Claude directly.

> **"What can you help me with?"**  ·  **"What can you do with my Jira and Teams?"**

There's no such thing as a silly question here.

---

## More examples by role

Here's what bigger, multi-step requests look like for different kinds of work. Find the one closest to yours. All of this is read-and-summarize by default, so you can try any of it today - the asks that *create* or *send* something are the ones you'd turn on write access for later.

**Product manager**
> *"Pull my team's open Jira tickets for this sprint, group them by status, and tell me which ones look at risk of slipping."*
> *"Find the Confluence launch plan, summarize the open risks, and draft a short status update for my stakeholders."*

**Analyst / data**
> *"Find the most recent quarterly results doc in this Google Drive folder, and give me the three numbers that changed most versus last quarter."*
> *"Summarize this analysis into a plain-English paragraph a non-analyst could follow, and list the two caveats I should mention."*

**Operations / program management**
> *"Summarize my unread Teams messages and today's Outlook calendar, and tell me what needs a response before noon."*
> *"Read the program status page in Confluence, pull the related open Jira tickets, and draft a one-page rollup for the steering meeting."*

**Marketing / communications**
> *"Find the latest campaign brief in Google Drive, summarize the key messages, and draft a short announcement in a friendly tone."*
> *"Catch me up on the launch channel in Teams - what's the current status, and what does the comms team still need to deliver?"*

**Legal / finance**
> *"Find the Confluence page on our policy, summarize the key obligations, and flag anything that looks out of date - and show me where each point came from."*
> *"Pull the most recent budget spreadsheet from this Drive folder and tell me the three biggest line-item changes since the last version."*

**Executive / chief of staff**
> *"Across my Teams channels and Outlook, give me a Monday-morning brief: the top three things that need my attention this week, and anything where I'm the blocker."*
> *"Look at next week's Outlook calendar and tell me which meetings I could decline or delegate, with a one-line reason for each."*

**The pattern behind all of these:** name the *outcome* you want, mention *where your stuff lives* (the channel, folder, page, or project), and let Claude handle the in-between. If the first pass isn't quite right, just say *"shorter,"* *"more formal,"* or *"focus on the budget"* - you're always one follow-up away from exactly what you needed.

---

## If something is not working

Almost every hiccup has the same kind of fix: a quick visit to the **AIX Manager** app. You won't need to install anything technical or type any commands. None of these mean you did something wrong.

### "That tool is not connected"

The most common one, and completely normal - it just means that tool hasn't been signed into yet on this computer.

1. Open **AIX Manager** and go to **Home** (on an older AIX Manager with an Auth tab on the left, sign in to the tool there instead, then update AIX Manager and go to step 4).
2. Find the tool (say, Outlook or Jira) and click **Connect**, or **Sign in again** if it expired. AIX Manager handles any security codes for you.
3. Check that it now shows in Home's connected list.
4. Come back to Claude, **start a fresh chat**, and ask again.

That fresh chat is what lets Claude notice the tool is now signed in.

### None of my Disney tools are showing up

If it feels like *none* of your tools are responding - Claude acts like nothing is connected - work through these in order:

1. Open **AIX Manager → Claude Desktop** tab.
2. Look at the **Extension** card. If it says **Not Installed**, click **Install** - this delivers your Disney tools to the Claude app, and on a fresh setup it's the step that's usually missing.
3. Check your **Connected Tools**. If they aren't listed, click **Sync config** to refresh the link between AIX Manager and Claude.
4. Click **Restart Now** (on the same tab), then start a fresh chat and try again.
5. Still nothing? Run the **Setup** tab once - a short, guided re-check. It's safe to run again anytime.

You can also glance at the **Tool Activity** log on this tab to confirm whether Claude is reaching your tools at all.

### A "/" command came back as "unknown"

The "/" menu is a nice shortcut but never required. If a "/" command wasn't recognized, don't worry about the wording: **just ask in plain English instead** - *"Summarize my unread Teams messages from today"* or *"Find the Confluence page about onboarding."* Claude picks the right helper automatically. The plain-English path always works.

### A new helper isn't showing up

Added a new skill on the **Install** tab but don't see it in Claude? Open **AIX Manager → Claude Desktop**, click **Re-sync skills** (on the Sync config card), then **Restart Now**. The restart is what loads it.

### "I turned on write access, but Claude still can't make changes"

The grant takes effect on Claude's **next request** - you don't need to restart. So the usual fix is simply to ask again in a fresh turn.

1. Double-check the toggle in **AIX Manager → Claude Desktop → Chat write access**. The tool should read **"Can read and make changes."**
2. Ask again in a new request (or a fresh chat) - the newly enabled tool is live.
3. Only a small custom tool set needs one restart; if you're on that setup, click **Restart Now** (or the **Restart…** button next to the "Saved" notice) and try again.

If you specifically need Claude to *permanently delete* something, such as a Jira issue, a whole file or a comment (or, in ServiceNow, to update many records at once), that's the separate **"Allow deleting"** option (**"Allow deleting and bulk updates"** for ServiceNow) that appears once write access is on - turn it on (and confirm the prompt) only where you need it; it, too, takes effect on the next request. Removing text, cells or a sheet tab inside a Universal Doc file needs only write access, because that file's version history can undo it. And remember: even with write access on, Claude still checks with you before anything significant.

### Where to get help

If you're truly stuck or something doesn't match this guide, you don't have to figure it out alone - reach out to your team's AIX channel or your platform admin. A real person is always part of the safety net.

---

## Frequently asked questions

### Is my data safe? What can Claude see?

Claude can only reach the specific Disney tools you've signed into, and only the information your own work account already lets you see - nothing hidden, nothing company-wide. It's looking at *your* tickets, *your* inbox, *your* documents. By default it's **read-only**. The activity log on the Claude Desktop tab is there for *your* own troubleshooting, and if you're ever curious where an answer came from, just ask *"Where did you find that?"* - that's always fair game.

### Will Claude change things without asking me?

No. Out of the box it can only read, search, and summarize. Even after you deliberately turn on write access for a specific tool, Claude still pauses and **checks with you before doing anything significant.** You're always the one who says "go ahead."

### Do I even need write mode?

Often, no. If your day is mostly catching up, finding things, and summarizing, read-only does everything you need - and it's the safest place to be. Turn on write access only when you actually want Claude to *act* for you, one tool at a time, on the **Claude Desktop** tab. No rush - flip it on the day you need it.

### How do I get new tools?

Two easy ways, both inside **AIX Manager**:

- **Install** tab - browse tools, skills, and connections grouped by what they help you do. Each adds with one button. Look for the **"Cowork + Code"** badge - that means it works here in Cowork.
- **Team Bundles** tab - the real shortcut: ready-made toolsets other teams have published. Find the one that matches your team and add the whole set in one click.

After adding something, connect it from **Home** (on an older AIX Manager with an Auth tab on the left, sign in there instead, then update AIX Manager). Then, on the **Claude Desktop** tab, click **Sync config** for a new tool or **Re-sync skills** for a new helper, then **Restart Now**. Then start a fresh chat.

### How do I keep everything up to date?

You mostly don't have to. AIX Manager updates your tools on its own in the background. If an update can't install itself, AIX Manager shows a small **Update** banner; just click it. Open **Home** now and then: anything that needs you shows under **Needs you**, and that's all the upkeep this needs.

### Which computers does this run on?

AIX Manager runs on Mac and on Windows 10/11 PCs with a 64-bit Intel or AMD processor (x64); it does not run on 32-bit Windows. To get it, open **registry.aix.twdc.technology** and click the download button for your computer. On Linux or WSL, use the terminal install on that same page instead. If you don't see a button for your computer, ask your team's AIX channel. On Windows, the first time you open the installer you may see a blue "Windows protected your PC" notice; click **More info**, then **Run anyway**.

### Where do I see what changed?

The **What's New** tab in AIX Manager is your release history - a plain, friendly list of what changed across AIX and when.

---

## You're ready

That's everything - and notice how little of it you actually have to remember. The whole guide comes down to: **connect your tools, paste the Cowork instructions once, and just ask, in plain English.** Everything else - the tabs, the toggles, the tips - is there for the moment you need it, not a checklist to memorize.

You can't break anything in read-only mode, you're always in control of what Claude can change, and the fastest way to get comfortable is simply to start. Open a chat, ask the first thing on your mind, and let your new teammate take it from there. Welcome aboard.
