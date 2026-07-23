# healthEdge AI &mdash; Provider Contract Inquiry (Demo Site)

Standalone, static, zero-build pre-sales demo website for the **Provider Contract Inquiry Agent**, one of
six Agentforce demo sites under the **healthEdge AI** umbrella brand. This site showcases an internal
employee tool used by payer contract-ops and network staff to look up provider contracts by contract
number, provider name, or NPI, then drill into network info, fee schedules, and amendment history &mdash;
with automatic alerts for contracts that are expired or expiring within 30 days.

This is a marketing/login page plus an authenticated dashboard shell with realistic mock data. It is
**not** wired to a real backend or a real Agentforce agent yet &mdash; see "Where to paste the real
Agentforce embed script" below.

## Login credentials (demo only)

| Field    | Value              |
|----------|---------------------|
| Username | `contract.analyst`  |
| Password | `Demo@123`          |

These are also shown on the login page itself in a "Demo Credentials" hint box.

## Sidebar tabs (dashboard.html)

1. Overview
2. Contract Search
3. Provider Network Info
4. Fee Schedules
5. Amendment History
6. Expiring Contracts

## Where to paste the real Agentforce embed script

Open `dashboard.html` and locate the placeholder block immediately before the closing `</body>` tag:

```html
<!-- ============================================================
     AGENTFORCE EMBED SCRIPT
     Paste the Agentforce Agent embedded-service bootstrap script
     here to enable the live chat experience for this demo.
     ============================================================ -->
<!-- <script src="REPLACE_WITH_AGENTFORCE_EMBED_SCRIPT_URL"></script> -->
```

Replace the commented-out `<script>` tag with the real Agentforce embedded-service bootstrap script
provided for this agent. Once wired in, it will render in place of (or alongside) the floating chat
launcher stub in the bottom-right corner of the dashboard.

## Project structure

```
ProviderContractEnquiryAgent/
├── index.html              Landing + login page
├── dashboard.html           Authenticated app shell (tabs, tables, chat stub)
├── assets/
│   ├── css/style.css        All styling (slate/navy + sky-blue accent system)
│   └── js/
│       ├── app.js           Login gate logic + dashboard tab-switching logic
│       └── data.js          Mock contract/network/fee-schedule/amendment data
├── vercel.json
└── README.md
```

## Deploying to Vercel

From inside this folder:

```bash
cd ProviderContractEnquiryAgent
vercel deploy
vercel --prod
```

No build step, no dependencies, no environment variables required &mdash; this is plain static
HTML/CSS/JS and deploys with zero configuration.
