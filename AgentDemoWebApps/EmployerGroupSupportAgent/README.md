# healthEdge AI — Employer Support Agent (Demo)

This is a standalone, static, Vercel-deployable pre-sales demo website showcasing
**HealthBridge's Employer Support AI Agent**, part of the **healthEdge AI** demo suite
built for a healthcare payer organization.

The agent helps **employer groups** (HR / benefits administrators at companies that
offer this payer's plans to their employees) — not individual members. In the real
product, the agent verifies the caller by an exact match of Employer Account Name +
Employer Account Number before disclosing any data, then retrieves and summarizes
Insurance Policies, Policy Participants, Policy Coverages, Contacts, and Cases tied to
that employer's account, and can escalate to a live human agent (offering to log a
case if escalation fails).

This repo is the surrounding marketing site + authenticated dashboard shell only.
It uses realistic mock data — no real member, employer, or PHI data. The live
Agentforce chat experience will be wired in later (see "Where to paste the real
Agentforce embed script" below).

## Demo login credentials

| Field    | Value            |
|----------|------------------|
| Username | `employer.admin` |
| Password | `Demo@123`       |

These are also shown directly on the login page in a "Demo Credentials" hint box.

## Sidebar tabs (in order)

1. Overview
2. Insurance Policies
3. Policy Participants
4. Policy Coverages
5. Contacts
6. Cases

## Where to paste the real Agentforce embed script

Open `dashboard.html` and find the placeholder block immediately before the closing
`</body>` tag:

```html
<!-- ============================================================
     AGENTFORCE EMBED SCRIPT
     Paste the Agentforce Agent embedded-service bootstrap script
     here to enable the live chat experience for this demo.
     ============================================================ -->
<!-- <script src="REPLACE_WITH_AGENTFORCE_EMBED_SCRIPT_URL"></script> -->
```

Replace that commented-out line with the real Agentforce embedded-service bootstrap
`<script>` tag provided by Salesforce for this agent. Once added, the floating chat
launcher (bottom-right) will present the live agent instead of the static stub panel
that currently reads "This is where the live Agentforce agent will appear once
embedded."

## File structure

```
EmployerGroupSupportAgent/
├── index.html              landing + login page
├── dashboard.html           authenticated app shell
├── assets/
│   ├── css/style.css        all styling
│   └── js/
│       ├── app.js           login gate logic + dashboard tab-switching logic
│       └── data.js          mock/test data (plain JS arrays/objects)
├── vercel.json
└── README.md
```

No build step, no npm/node dependencies, no framework, no external CDNs. Plain
HTML/CSS/JS only.

## Deploying to Vercel

From inside this folder:

```bash
cd EmployerGroupSupportAgent
vercel deploy
vercel --prod
```

The included `vercel.json` (clean URLs, no trailing slash) requires zero additional
configuration.
