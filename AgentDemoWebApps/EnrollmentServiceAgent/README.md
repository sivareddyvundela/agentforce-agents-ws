# healthEdge AI — Enrollment Service Agent (Demo)

A standalone, static, Vercel-deployable pre-sales demo site for the **Enrollment Service
Agent**, part of the healthEdge AI Agentforce demo suite for a healthcare payer
organization.

## What this demo is

This site showcases how a health plan member can use the Enrollment Service Agent —
over chat or voice — to request a **Coverage Change** (add or remove a dependent)
without waiting on a phone queue. The agent collects Account Name, Coverage Change
Type, Dependent Name, Dependent Gender, Dependent DOB, Relation to Subscriber, and
Effective Date of Change, opens a Case, and returns a generated **5-digit Issue Id**
the member can use to track the request. It also advertises a "PCP Change Request"
option in its menu — that path is an unfinished stub today and is represented here as
**Coming Soon**. The agent can escalate to a live human agent on request, offering to
log a case if the escalation itself fails.

This repository is a marketing/login page plus an authenticated dashboard shell built
around mock data. It does **not** contain a live agent — see "Where to paste the real
Agentforce embed script" below.

## Demo login credentials

| Field    | Value           |
|----------|-----------------|
| Username | `member.portal` |
| Password | `Demo@123`      |

## Sidebar tabs

1. **Overview** — stat tiles and a member snapshot
2. **My Coverage** — current plan details
3. **Dependents** — everyone covered (or pending a change) under the plan
4. **Coverage Change Requests** — submitted add/remove dependent requests
5. **PCP Change (Coming Soon)** — empty-state placeholder for the unfinished PCP stub
6. **Case Tracker** — look up any request by its Issue Id

## Where to paste the real Agentforce embed script

Open `dashboard.html` and find the HTML comment block near the end of the file, just
before the closing `</body>` tag:

```html
<!-- ============================================================
     AGENTFORCE EMBED SCRIPT
     Paste the Agentforce Agent embedded-service bootstrap script
     here to enable the live chat experience for this demo.
     ============================================================ -->
<!-- <script src="REPLACE_WITH_AGENTFORCE_EMBED_SCRIPT_URL"></script> -->
```

Uncomment the `<script>` tag and replace the placeholder `src` with the real
Agentforce embedded-service bootstrap script URL. The floating chat launcher button
already in the page can be left as-is, replaced, or hidden once the real widget takes
over the chat experience.

## Project structure

```
EnrollmentServiceAgent/
├── index.html              # Landing + login page
├── dashboard.html          # Authenticated app shell
├── assets/
│   ├── css/style.css       # All styling
│   └── js/
│       ├── app.js          # Login gate + tab-switching logic
│       └── data.js         # Mock/demo data
├── vercel.json
└── README.md
```

No build step, no npm dependencies, no external CDNs. Plain HTML/CSS/JS only.

## Deploy to Vercel

From inside this folder:

```bash
cd EnrollmentServiceAgent
vercel deploy
vercel --prod
```
