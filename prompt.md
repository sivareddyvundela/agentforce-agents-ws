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

## Notes carried forward from past runs

- Subagents fanned out for Phases 1–2 have Bash access and can occasionally take unscoped filesystem actions (one renamed a directory mid-session for no requested reason). Run `git status` after a batch completes to spot-check.
- Keep the accent-color table above in sync with reality — grep each demo's `assets/css/style.css` for its `--primary`/`--he-primary`/`--heai-primary` variable if this file drifts out of date.
- `payer_agentforce_agents/ProviderContractEnquiryAgent` is the one agent whose deployable source sits in a nested subfolder (`.../ProviderContractEnquiryAgent/Provider Contract Enquiry`) — don't assume every folder deploys from its root.
