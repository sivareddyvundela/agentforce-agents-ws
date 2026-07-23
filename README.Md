# Payer Operations Agents — Agentforce Portfolio

A 12-agent Salesforce Agentforce portfolio spanning provider network, claims, credentialing, enrollment, member benefits/eligibility, and contact-center operations for a healthcare payer — built for internal employees (contract ops, credentialing, network ops) and external providers/members/employers alike. Each agent is a self-contained, independently deployable Salesforce DX project, and each ships with a matching static, Vercel-deployable pre-sales demo web app under **healthEdge AI** branding.

## Table of Contents

- [Project Structure](#project-structure)
- [Agent Portfolio](#agent-portfolio) — all 12 Agentforce agents, what they do, and how to deploy them
- [Demo Web Apps](#demo-web-apps) — all 12 healthEdge AI pre-sales demo sites, login credentials, and how to run them
- [Executive Presentation](#executive-presentation)
- [Quick Start](#quick-start)
- [Common Architecture Pattern](#common-architecture-pattern)
- [Known Gaps & Notes](#known-gaps--notes)

## Project Structure

```
agentforce-agents-ws/
├── payer_agentforce_agents/              Salesforce DX projects — one per agent (deployable source)
│   ├── BenefitsAndEligibilityAgent/
│   ├── CredentialingStatusAgent/
│   ├── EmployerGroupSupportAgent/
│   ├── EnrollmentServiceAgent/
│   ├── NetworkParticipationVerificationAgent/
│   ├── ProviderClaimsAssistanceAgent/
│   ├── ProviderContractEnquiryAgent/
│   ├── ProviderEnrollmentAgent/
│   ├── ProviderIssueManagementAgent/
│   ├── ProviderNetworkSupportAgent/
│   ├── ProviderSearchAndProfileLookup/
│   └── ProviderTerminationAgent/
├── AgentDemoWebApps/                     Static "healthEdge AI" demo sites — one per agent (Vercel-deployable)
│   └── <same 12 agent folders>/
└── Payer_Operations_Agents_Executive_Overview.pptx   Executive-facing slide deck covering the whole portfolio
```

Every folder under both `payer_agentforce_agents/` and `AgentDemoWebApps/` has its own detailed `README.md` — this file is the map; follow the links below for the full write-up of any individual agent or demo.

## Agent Portfolio

All 12 agents are independent Salesforce DX projects under `payer_agentforce_agents/`. **Employee agents** are used by internal payer staff (contract ops, credentialing, network ops); **Service agents** are customer/provider-facing, typically via messaging (and in one case, voice), with escalation to a live agent.

| Agent | Type | What it does | Primary persona | Folder |
| --- | --- | --- | --- | --- |
| **Provider Contract Inquiry** | Employee | Looks up a provider's contract by contract number, provider name, or NPI — network participation, fee schedules, reimbursement rates, amendment history | Contract & network ops staff | [README](payer_agentforce_agents/ProviderContractEnquiryAgent/README.md) |
| **Enrollment Service** | Service | Lets members self-serve Coverage Change requests (add/remove a dependent), logs a trackable `Case`, escalates to a human on request | Members (self-service) | [README](payer_agentforce_agents/EnrollmentServiceAgent/README.md) |
| **Provider Search & Profile Lookup** ("Sunny") | Service | Searches for a provider by name, NPI, or Tax ID, then returns a 360° profile — credentials, contracts, networks, locations, compliance issues | Provider relations / contact-center / network ops staff | [README](payer_agentforce_agents/ProviderSearchAndProfileLookup/README.md) |
| **Provider Network Inquiries** | Service | Verifies a provider's identity (name, NPI, phone) and answers questions on demographics, credentialing, contracts, and fee schedules | Providers (self-service) | [README](payer_agentforce_agents/ProviderNetworkSupportAgent/README.md) |
| **Employer Group Support** | Service | Verified employer-group inquiries — policies, participants, coverages, billing, eligibility | Employer HR / benefits admins | [README](payer_agentforce_agents/EmployerGroupSupportAgent/README.md) |
| **Provider Enrollment** | Employee | Guided intake form that captures a new provider's demographics + supporting document and creates an `Enrollment__c` record | Onboarding / enrollment staff | [README](payer_agentforce_agents/ProviderEnrollmentAgent/README.md) |
| **Credentialing Status** | Employee | Summarizes a credentialing case (`CR-######`), explains status/stage in plain language, flags missing documents, auto-emails reminders | Credentialing / provider services staff | [README](payer_agentforce_agents/CredentialingStatusAgent/README.md) |
| **Network Participation Verification** | Employee | Verifies a provider's network participation by Name + NPI — specialty, tier/status, service locations, plus knowledge-search FAQ | Network ops / provider relations staff | [README](payer_agentforce_agents/NetworkParticipationVerificationAgent/README.md) |
| **Provider Claims Assistance** | Service | Looks up a claim by claim number and reports type, status, dates, and amounts — including denial reason when denied; strictly read-only | Providers (self-service) | [README](payer_agentforce_agents/ProviderClaimsAssistanceAgent/README.md) |
| **Provider Issue Management** | Service | Identifies the provider, classifies their issue (claims/payment/credentialing/contract/directory) with a confidence score, and recommends a resolution path or escalates | Providers (self-service) | [README](payer_agentforce_agents/ProviderIssueManagementAgent/README.md) |
| **Provider Termination** | Service | Looks up a provider by NPI, shows impacted members & active authorizations, and submits a termination request after confirmation (with duplicate-request protection) | Network operations staff | [README](payer_agentforce_agents/ProviderTerminationAgent/README.md) |
| **Member Benefits and Eligibility** | Service | Verifies a member by name, DOB, and phone, then answers benefits/plan-coverage/prior-authorization questions and surfaces recent claims with denial reasons — over both messaging and voice | Members (self-service, messaging & voice) | [README](payer_agentforce_agents/BenefitsAndEligibilityAgent/README.md) |

### Deploying an agent

Each project deploys independently. From the repo root:

```bash
sf project deploy start -d payer_agentforce_agents/<AgentFolder>
```

> **Exception:** `ProviderContractEnquiryAgent`'s deployable source sits in a nested subfolder — use `sf project deploy start -d "payer_agentforce_agents/ProviderContractEnquiryAgent/Provider Contract Enquiry"` instead. See that agent's own README for details.

Several agents also ship a permission set to assign after deploy (`sf org assign permset --name <PermissionSetName>`) — check each agent's own README for the exact name and any caveats about scope/gaps, since a few permission sets don't cover every object the agent touches.

## Demo Web Apps

All 12 demos live under `AgentDemoWebApps/` as the **healthEdge AI** brand suite — standalone static HTML/CSS/JS sites (no build step, no framework) with a split-screen marketing/login page and an authenticated dashboard, each with its own accent color and mock/test data (no real PHI/PII). Every dashboard has a floating chat-launcher stub with a commented placeholder for the real Agentforce embedded-service script.

| Agent Demo | Accent color | Demo login | Folder |
| --- | --- | --- | --- |
| Provider Contract Inquiry | Navy / sky blue | `contract.analyst` / `Demo@123` | [README](AgentDemoWebApps/ProviderContractEnquiryAgent/README.md) |
| Enrollment Service | Teal | `member.portal` / `Demo@123` | [README](AgentDemoWebApps/EnrollmentServiceAgent/README.md) |
| Provider Search & Profile Lookup | Near-black / slate | `network.ops` / `Demo@123` | [README](AgentDemoWebApps/ProviderSearchAndProfileLookup/README.md) |
| Provider Network Inquiries | Blue / cyan | `provider.rep` / `Demo@123` | [README](AgentDemoWebApps/ProviderNetworkSupportAgent/README.md) |
| Employer Group Support | Indigo | `employer.admin` / `Demo@123` | [README](AgentDemoWebApps/EmployerGroupSupportAgent/README.md) |
| Provider Enrollment | Orange | `enrollment.specialist` / `Demo@123` | [README](AgentDemoWebApps/ProviderEnrollmentAgent/README.md) |
| Credentialing Status | Violet | `credentialing.analyst` / `Demo@123` | [README](AgentDemoWebApps/CredentialingStatusAgent/README.md) |
| Network Participation Verification | Emerald green | `network.ops` / `Demo@123` | [README](AgentDemoWebApps/NetworkParticipationVerificationAgent/README.md) |
| Provider Claims Assistance | Amber / gold | `claims.support` / `Demo@123` | [README](AgentDemoWebApps/ProviderClaimsAssistanceAgent/README.md) |
| Provider Issue Management | Royal blue | `support.rep` / `Demo@123` | [README](AgentDemoWebApps/ProviderIssueManagementAgent/README.md) |
| Provider Termination | Crimson red | `network.ops.admin` / `Demo@123` | [README](AgentDemoWebApps/ProviderTerminationAgent/README.md) |
| Member Benefits and Eligibility | Hot pink / magenta | `member.portal.user` / `Demo@123` | [README](AgentDemoWebApps/BenefitsAndEligibilityAgent/README.md) |

### Running a demo locally

Every demo is plain static files — just open `index.html` in a browser, or serve the folder:

```bash
cd AgentDemoWebApps/<AgentFolder>
npx serve .
```

### Deploying a demo to Vercel

```bash
cd AgentDemoWebApps/<AgentFolder>
vercel deploy
vercel --prod
```

No build step or configuration is required (each folder ships a zero-config `vercel.json`). To wire up the real agent, paste the Agentforce embedded-service `<script>` tag into the commented placeholder block at the bottom of that folder's `dashboard.html`.

## Executive Presentation

[`Payer_Operations_Agents_Executive_Overview.pptx`](Payer_Operations_Agents_Executive_Overview.pptx) is a 22-slide executive deck covering the full portfolio: the business opportunity, a portfolio-at-a-glance table (across two slides), the common agent pattern, a detail slide per agent (capabilities, business value, time-saved stats, example interaction), an ROI roll-up table across all 12 agents, personas, and a pilot-to-scale roadmap.

## Quick Start

1. **Explore an agent's design** — read its README under `payer_agentforce_agents/<AgentFolder>/README.md` (linked in the table above) for the full agent/flow/Apex/data-model breakdown.
2. **See it in action (no org required)** — open the matching demo under `AgentDemoWebApps/<AgentFolder>/index.html` and log in with the demo credentials.
3. **Deploy to a Salesforce org** — `sf project deploy start -d payer_agentforce_agents/<AgentFolder>` (see per-agent README for permission sets and any manual reactivation/config steps).
4. **Pitch it** — use `Payer_Operations_Agents_Executive_Overview.pptx` for the business-level narrative.

## Common Architecture Pattern

Every agent in this portfolio follows the same governed shape (see slide 5 of the executive deck):

1. **User request** — a staff member or provider asks in natural language via chat or messaging.
2. **Intelligent routing** — an Agent Router classifies intent (Einstein Hyper Classifier) and hands off to the right subagent.
3. **Trusted action** — the subagent calls a Salesforce Flow or Apex action to read/write governed provider data.
4. **Clear answer** — results are summarized in plain language, with escalation to a human agent when needed.

Agents share a common data model — `HealthcareProvider`, `Credential__c`, `Contract`, Provider Network objects, `Provider_Claims__c`/standard `Claim`, `Authorization__c`, `Account` (member/Person Account), `PlanBenefit`, and related objects — while remaining independently deployable bundles with their own permission sets.

## Known Gaps & Notes

These are called out in detail in the relevant agent's own README — flagged here so they aren't missed:

- **Leftover template scaffolding**: several agent folders were scaffolded from a generic "Local Info Agent" (resort weather/events) SFDX template and still carry unused Apex classes, flows, or permission sets from that template (e.g. `NetworkParticipationVerificationAgent`, `ProviderIssueManagementAgent`). None of it is referenced by the real agent — safe to ignore or clean up.
- **Permission set gaps**: a few shipped permission sets don't cover every object/flow the agent actually uses (e.g. `ProviderIssueManagementAgent`'s permission set omits `HealthcareProvider` and `ProviderNetworkContract`). Check the "Deploy" section of each agent's README before assuming access is fully configured.
- **Obsolete/uncompiled components**: `NetworkParticipationVerificationAgent`'s flow ships with status `Obsolete` (must be reactivated), and that same agent plus `CredentialingStatusAgent` ship only agent-script source with no compiled Bot/BotVersion/GenAI Planner Bundle — they need to be authored/published from Agentforce DX before they exist as a live Bot in an org.
- **Cross-agent object dependencies**: some agents query standard/managed objects (e.g. `vlocity_ins__ProviderNetwork__c`, `HealthcareProvider`) that aren't shipped in their own folder and are expected to already exist in the target org — typically shipped by a sibling agent in this same portfolio (noted per-agent in each README's Data Model section).
- **Voice-channel org-specific config**: `BenefitsAndEligibilityAgent`'s voice escalation flow (`Outbound_Flow_for_Voice_Agent`) hardcodes a queue Id from its source org — it must be updated (or the queue re-created with a matching Id) after deploying elsewhere. Its messaging-escalation flow (`Route_to_Live_Human_Agent`) and a `Submitting_Provider__c` lookup on `Claim` are referenced but not shipped, and it ships no permission set at all — see that agent's README before deploying.
