# Runbook: Adding a New Agent to the Portfolio

Reusable prompt playbook for onboarding a new Agentforce agent into this repo — README, demo web app, executive PPTX, and the root README index. Four phases, run in order. `<AgentFolder>` = the new agent's folder name, identical under `payer_agentforce_agents/` and `AgentDemoWebApps/`.

## Prerequisite

The new agent's Salesforce DX source must already exist at `payer_agentforce_agents/<AgentFolder>/` (`.agent` bundle, flows, Apex, objects, permission sets) before any of this runs — these tasks document/showcase it, they don't author the agent itself.

## Phase 1 — Agent README

_Do this first — everything downstream reads from it._

```
Review the agent under payer_agentforce_agents/<AgentFolder>/ and rewrite its README.md
to match the format of payer_agentforce_agents/ProviderNetworkSupportAgent/README.md and
payer_agentforce_agents/ProviderContractEnquiryAgent/README.md (read both first as
templates). Sections: title, one-paragraph description, Table of Contents, Overview
(Purpose + bundle/bot/planner details), Key Capabilities, How It Works (router →
subagents → each Flow/Apex action with real logic, read every .flow-meta.xml/.cls
directly), What's Inside This Folder (table), Data Model (objects/fields/relationships +
ASCII diagram), Try It Out (sample prompts), Deploy (sf project deploy start -d ... +
permission set notes). Ground everything in the actual files — call out any leftover
template scaffolding, permission gaps, or obsolete components you find rather than
fixing them silently.
```

For multiple new agents at once, fan this out as one parallel `Agent` call per folder.

---

## Phase 2 — Demo Web App

_Can run in parallel with Phase 3 once Phase 1 is done._

```
Create a new standalone, static, Vercel-deployable demo at AgentDemoWebApps/<AgentFolder>/,
mirroring AgentDemoWebApps/ProviderNetworkSupportAgent/ (read index.html, dashboard.html,
assets/js/app.js, assets/js/data.js, assets/css/style.css, vercel.json, README.md in full
as the template). Ground all copy, tabs, and mock data in
payer_agentforce_agents/<AgentFolder>/README.md. Use a distinct accent color not already
used — check current palette: indigo #4F46E5, teal #0D9488, navy/sky #0ea5e9, orange
#EA580C, slate #111827, blue/cyan #0369A1, violet #7C3AED, emerald #059669, amber #D97706,
royal blue #2563EB, crimson #DC2626, hot pink/magenta #DB2777. Reuse the same CSS class
names/structure so app.js
wiring matches. Self-check: confirm every data.js field referenced in app.js exists, and
every DOM id app.js queries exists in the HTML.
```

Once the demo folder exists and passes review, deploying it to Vercel (including one-time machine setup — CLI install, login) follows [`ADMIN.md`](ADMIN.md) — don't re-derive those steps here.

**Living accent-color list** — update this as new agents are added, so colors don't collide:

| Agent                              | Accent color                 |
| ---------------------------------- | ---------------------------- |
| Provider Contract Inquiry          | Navy / sky blue `#0ea5e9`    |
| Enrollment Service                 | Teal `#0D9488`               |
| Provider Search & Profile Lookup   | Near-black / slate `#111827` |
| Provider Network Inquiries         | Blue / cyan `#0369A1`        |
| Employer Group Support             | Indigo `#4F46E5`             |
| Provider Enrollment                | Orange `#EA580C`             |
| Credentialing Status               | Violet `#7C3AED`             |
| Network Participation Verification | Emerald green `#059669`      |
| Provider Claims Assistance         | Amber / gold `#D97706`       |
| Provider Issue Management          | Royal blue `#2563EB`         |
| Provider Termination               | Crimson red `#DC2626`        |
| Member Benefits and Eligibility    | Hot pink / magenta `#DB2777` |

---

## Phase 3 — Executive PPTX

_Precision-sensitive — do this directly with python-pptx rather than delegating to a subagent, to control formatting exactly. Don't ask a subagent to "just edit the pptx."_

```
Update Payer_Operations_Agents_Executive_Overview.pptx for the new agent(s) using
python-pptx:
1. Clone an existing "AGENT DETAIL" slide via deep-copy of its XML shapes (don't rebuild
   from scratch); edit title/badge/tagline/capabilities/value/example/stats table;
   alternate the badge color blue #0176D3 / green #04844B per position.
2. Add a row to the portfolio-at-a-glance table/slide and the ROI table (recompute the
   summary row's totals).
3. Insert the new slide(s) right after the last existing agent-detail slide using
   slide-ID-based moves (not index math, which drifts as slides shift).
4. Do a final position-based pass (bottom-right numeric textbox) to renumber every footer
   page number and update any "see slide N" footnote references.
5. Check for table/textbox overflow past slide bounds after any row additions and fix by
   resizing or splitting content onto a new slide rather than letting it overlap.

Back up the .pptx before running, and verify by reopening and dumping all slide titles /
page numbers / table contents afterward.
```

---

## Phase 4 — Root README

_Do last — it's the index of everything above._

```
Update README.Md at the repo root: add the new agent to the Agent Portfolio table (type,
description, persona, link to its README) and to the Demo Web Apps table (accent color,
demo login, link to its README). Update the total agent count throughout. Check whether
the new agent introduces a new "Known Gaps & Notes" item (leftover scaffolding,
permission gaps, obsolete flows, cross-agent object dependencies) worth surfacing.
```

---

## Phase 5 — Wiring a Live Agentforce Embed Snippet (on-demand)

_Not part of new-agent onboarding — run this any time a real Agentforce embedded-service snippet is provided for an agent that already has a demo web app. Never fabricate a snippet; if one hasn't been pasted/provided, ask for it and confirm which `<AgentFolder>` it's for before touching anything._

Every demo already has the placeholder for this at the bottom of `AgentDemoWebApps/<AgentFolder>/dashboard.html`:

```html
<!-- <script src="REPLACE_WITH_AGENTFORCE_EMBED_SCRIPT_URL"></script> -->
```

Three requirements, and how the existing shell already satisfies (or needs hardening for) each:

1. **Works only after authentication.** `dashboard.html`'s `app.js` already gates the whole page — `initDashboardPage()` redirects to `index.html` immediately unless `sessionStorage.getItem("heAI_authenticated") === "true"` (this key is identical across all 12 apps — verified by grep). Splicing the real snippet into `dashboard.html` (never `index.html`) rides on that gate. Harden it further by wrapping the pasted snippet's own init call in the same explicit check, since a `<script>` tag placed after the redirect can still start executing in the instant before the browser navigates away:
   ```html
   <script>
     if (sessionStorage.getItem('heAI_authenticated') === 'true') {
       // paste the real Agentforce bootstrap snippet body here, unmodified except for this wrapper
     }
   </script>
   ```
2. **Works in every tab, not just the home page.** Tabs are not separate pages — `dashboard.html` renders every `<section class="tab-panel">` in the same DOM and `activateTab()` in `app.js` just toggles `hidden`/`active` on click (confirmed in `ProviderNetworkSupportAgent/assets/js/app.js`). One snippet placed once at the bottom of `dashboard.html` therefore already persists across every tab automatically — do not duplicate it per `tab-panel`. After wiring, manually click through at least two tabs and confirm the chat widget stays mounted/open rather than resetting.
3. **Passes the logged-in user's identity to the agent.** Critical ordering rule: call `setHiddenPrechatFields()` **after** `.init()` resolves, inside a `window.addEventListener('onEmbeddedMessagingReady', ...)` handler — never before `.init()` in the same `try` block. `embeddedservice_bootstrap.prechatAPI` isn't populated until the SDK finishes initializing, so calling it earlier throws, the surrounding `catch` swallows the error, and since `.init()` was queued *after* that failing call in the same `try`, it never runs at all — the widget silently never boots, with no visible error to the user. (This exact bug shipped once already: caught in production via screenshot — chat launcher did nothing, and the demo's now-redundant static stub launcher/panel was still showing since it hadn't been removed after wiring in the real snippet.) Once the real embed is wired in, also delete the demo's old stub floating-chat-launcher button and panel from `dashboard.html` (the real widget renders its own launcher after `.init()` succeeds — leaving both would show two overlapping chat buttons); confirm first via each `app.js`'s stub-wiring code that it null-checks the elements (`if (!launcher || !panel) return;`) before deleting, so removing the HTML doesn't throw on a missing element. Each agent's `assets/js/data.js` already holds the logged-in persona's real fields under one top-level key that varies by agent — `provider` (most provider-facing agents), `member` (Enrollment Service, Benefits & Eligibility), or `employer` (Employer Group Support). Read that file first to get the exact field names for the target agent (e.g. `name`, `npi`, `email`, `phone`, `memberId`). Then, using whatever hidden-prechat/context-variable API the *pasted* snippet actually exposes (commonly `embeddedservice_bootstrap.prechatAPI.setHiddenPrechatFields({...})`, called before `.init()`), map those `data.js` fields in. Do not invent hidden-field names — they must match what's configured on that agent's real Embedded Service Deployment in Setup; if that mapping isn't given alongside the snippet, ask rather than guess.

**Before the widget will render on a deployed (non-localhost) domain, TWO separate Salesforce Setup changes are required — not one.** Both are manual steps only someone with org access can do, not fixable from this repo. They're easy to conflate (both are "add this domain somewhere in Setup") but they live on different pages and fix different symptoms — doing only one leaves the widget silently broken:

1. **CORS Allowed Origins** (Setup → Security → CORS) — controls which origins can *fetch data from* Salesforce (`embedded-service-config`, `businesshours` calls). Symptom if missing: Chrome's Network tab shows the `embedded-service-config` request in red/failed even though its Response tab shows a full, valid `embeddedServiceConfig` JSON payload — that combination (valid body + failed status) is the signature of a CORS block: the server responded fine over the wire, but the browser withheld the response from `embeddedservice_bootstrap`'s own JS. Confirm via Console (logs "...has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header...").
2. **Clickjack Protection** (Setup → Sites → *the specific Experience Cloud site* → Clickjack Protection Level, an **allowed-domains list distinct per site**, not the org-wide CORS page) — controls which origins are allowed to *embed/iframe* that site at all. Symptom if missing (even with #1 already fixed): config/businesshours calls succeed (200/204), but the widget still never renders because a helper resource (`sitecontext.min.html`, used for cross-domain storage access) gets iframe-blocked. Confirm via Console: `Framing 'https://<site>.my.site.com/' violates ... "frame-ancestors <existing allowed domains>". The request has been blocked.` The existing allowed-domains list may already contain unrelated domains from a prior, different demo — leave those alone (don't remove them, they may be in active use elsewhere) and just add the new Vercel domain alongside them.

Both settings are **per Experience Cloud site** (i.e., per Embedded Service Deployment), even though several agents share the same Salesforce org (`00DHs00000TTGXG`) — fixing one agent's site does not fix another's, except when two agents deliberately share one deployment (Enrollment Service + Provider Network Inquiries share `HealthBridge_Provider_Network`/site `ESWHealthBridgeProvider1784728390106`, so fixing that site's settings covers both).

| Agent | Site URL to find in Setup → Sites | Vercel domain to add (both CORS and Clickjack Protection) |
| --- | --- | --- |
| Employer Group Support | `ESWHealthBridgeEmployer1784811347592` | `heai-employer-group-support.vercel.app` |
| Provider Network Inquiries / Enrollment Service | `ESWHealthBridgeProvider1784728390106` | `heai-provider-network-support.vercel.app` and/or `heai-enrollment-service.vercel.app` (either covers both agents) |
| Provider Search & Profile Lookup | `ESWHealthBridgeProvider1785152613898` | `heai-provider-search-profile.vercel.app` |
| Provider Termination | `ESWHealthbridgeProvider1785153054681` | `heai-provider-termination.vercel.app` |
| Provider Issue Management | `ESWHealthBridgeProvider1785153380026` | `heai-provider-issue-mgmt.vercel.app` |
| Provider Claims Assistance | `ESWHealthBridgeProvider1785153554345` | `heai-provider-claims.vercel.app` |

For CORS, `*.vercel.app` (wildcard) is simplest since it covers every future demo project too. For Clickjack Protection, confirmed working with `*.vercel.app` added to that site's existing allowed-domains list. Update this table whenever a new agent's demo gets wired to a live snippet.

Apply changes to exactly the `<AgentFolder>`(s) the snippet was provided for — each snippet is tied to one org's Embedded Service Deployment, so never copy one agent's real snippet into another agent's `dashboard.html`. After editing, verify: `index.html` loads with no widget network call; logging in and landing on `dashboard.html` loads the real widget; switching tabs keeps it mounted; and (if devtools/network access is available) the outgoing hidden-prechat payload carries the real logged-in persona's values, not placeholders.

---

## Notes carried forward from past runs

- Subagents fanned out for Phases 1–2 have Bash access and can occasionally take unscoped filesystem actions (one renamed a directory mid-session for no requested reason). Run `git status` after a batch completes to spot-check.
- Keep the accent-color table above in sync with reality — grep each demo's `assets/css/style.css` for its `--primary`/`--he-primary`/`--heai-primary` variable if this file drifts out of date.
- `payer_agentforce_agents/ProviderContractEnquiryAgent` is the one agent whose deployable source sits in a nested subfolder (`.../ProviderContractEnquiryAgent/Provider Contract Enquiry`) — don't assume every folder deploys from its root.
- First-time Vercel CLI installs on a new machine commonly hit an `EACCES` error because the default global npm prefix (`/usr/local/lib/node_modules`) is root-owned — don't reach for `sudo`; see [`ADMIN.md`](ADMIN.md) §1.2 for the user-owned-prefix fix.
