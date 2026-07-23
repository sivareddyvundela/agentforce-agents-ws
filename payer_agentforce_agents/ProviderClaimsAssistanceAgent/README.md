# Provider Claims Assistance Agent

An Agentforce Service Agent for healthcare payer contact centers that looks up a provider claim by claim number and reports back its status, dates, and financial amounts — including the denial reason when a claim has been denied.

## Table of Contents

- [Overview](#overview)
- [Key Capabilities](#key-capabilities)
- [How It Works](#how-it-works)
- [What's Inside This Folder](#whats-inside-this-folder)
- [Data Model](#data-model)
- [Try It Out](#try-it-out)
- [Deploy](#deploy)

## Overview

**Purpose:** Providers and support staff frequently ask a single, repetitive question about a submitted claim: "What's happening with claim CLM-00042?" This agent gives them a conversational way to get the answer directly — it takes a claim number, looks up the matching `Provider_Claims__c` record, and reports the claim's type, status, key dates, and dollar amounts back in plain language, surfacing the denial reason only when the claim was actually denied. It is strictly read-only: it never creates, updates, or deletes claim data.

The real agent in this folder is the **`Claims_Issue_Agent_SJ`** bundle (Agent Script / Agent DSL authoring format, agent label "Claims Issue Agent", `.agent` file target `Claims_Issue_Agent_SJ.v2`). It is built on the `SvcCopilotTmpl__AgentforceServiceAgent` template, agent type `EinsteinServiceAgent` (bot `type=ExternalCopilot`), bot version `v2`, planner `Claims_Issue_Agent_SJ_v2` (planner type `Atlas__ConcurrentMultiAgentOrchestration`), tone `Casual`, default locale `en_US` with `en_GB` as an additional locale.

## Key Capabilities

- **Claim lookup by claim number** — asks the user for a Claim Number (the `Provider_Claims__c` record's autonumber Name, format `CLM-{00000}`) if not already supplied, then retrieves the matching record.
- **Consolidated claim summary** — presents Healthcare Provider, Claim Type, Status, Initiation Date, Estimated Amount, Actual Amount, Approved Amount, Finalized Date, and (when applicable) the Claim Denial Reason in a clear, user-friendly format.
- **Denial-aware reporting** — the denial reason is only populated and surfaced when the claim's Status is `Denied`; for every other status it is left out.
- **Not-found handling** — if no claim matches the supplied number, the agent tells the user to verify the claim number and try again rather than showing empty or broken data.
- **Read-only guarantee** — the reasoning instructions explicitly forbid modifying claim information; the agent only retrieves and displays it.

## How It Works

**Start agent — `Agent Router`:** Uses the classifier model `model://sfdc_ai__DefaultEinsteinHyperClassifier` and transitions to the `Enquiry_Agent` subagent via the `go_to_Enquiry_Agent` action based on the user's intent.

**Subagent — `Enquiry_Agent`:** Its reasoning instructions walk through a fixed script:
1. Ask the user for the Claim Number if not already provided.
2. Search the Provider Claim record using the supplied Claim Number.
3. If a match is found, retrieve and display Healthcare Provider, Claim Type, Status, Initiation Date, Estimated Amount, Actual Amount, Approved Amount, Claim Denial Reason, and Finalized Date.
4. Present the information in a clear, user-friendly format.
5. Show the message "The above are your claim details."
6. If no matching claim is found, respond "No claim was found for the provided claim number. Please verify the claim number and try again."
7. Never modify claim information — only retrieve and display it.

It calls a single action, `Claim_Information` (target `flow://Claim_Assistance_SJ`), with one required input `ClaimId` (the claim number the user supplied), and receives back `HealthacreProvider`, `InitiationDate`, `EstimatedAmount`, `ActualAmount`, `ApprovedAmount`, `ClaimType`, `Status`, `ClaimDenialReason`, `FinalisedDate`, and `ConfirmationMessage` (note: `HealthacreProvider` is the actual output/field name used throughout the flow and agent action — it is a real, if misspelled, API name, not a typo introduced here).

**Flow — `Claim_Assistance_SJ`:** An `AutoLaunchedFlow` that takes `ClaimId` (string) and returns the fields above:
1. **`Get_Records_from_Provider_Claim`** — a record lookup on `Provider_Claims__c` filtered by `Name = ClaimId`, `getFirstRecordOnly = true`, with `storeOutputAutomatically` enabled (no null-safety fallback is configured if no record matches).
2. **`Denied?`** decision — checks `Get_Records_from_Provider_Claim.Status__c = "Denied"`.
   - If **Denied**, it runs the **`Output for agent`** assignment, which copies `InitiationDate`, `EstimatedAmount`, `ActualAmount`, `ApprovedAmount`, `ClaimType`, `Status`, `ClaimDenialReason` (from `Claim_Denail_Reason__c` — the real field name, misspelled in the org), `FinalisedDate` (from `Finalized_Date__c`), and `HealthacreProvider` (from `Healthcare_Provider__r.Name`).
   - Otherwise (the default path, **not DENIED**), it runs the **`Not DENIED`** assignment, which copies the same fields **except** `ClaimDenialReason` — so the denial reason is only ever populated when the claim is actually denied.
3. Both branches converge on the **`Confirm Message`** assignment, which sets `ConfirmationMessage = "The above are your claim details"`.
4. If `Get_Records_from_Provider_Claim` finds no record at all, the flow still runs through the (empty) `Get_Records_from_Provider_Claim` reference on the default "not DENIED" path — the "no claim found" behavior described in the agent's reasoning instructions relies on the agent recognizing blank/empty output from the flow rather than an explicit flow branch for "no record found."

There are no separate `GenAiFunction` records in this folder — the flow is wired directly to the subagent as a local planner action (see `Claims_Issue_Agent_SJ_v2_definition.agent` / `localActions` in the `GenAiPlannerBundle`), and there is no escalation/routing subagent in this bundle (unlike some sibling agents in this workspace).

## What's Inside This Folder

| Component | Type | Purpose |
| --- | --- | --- |
| `Claims_Issue_Agent_SJ` | AI Authoring Bundle (`.agent`) | The agent definition: `Agent Router` and the `Enquiry_Agent` subagent/action. |
| `Claims_Issue_Agent_SJ` | Bot / BotVersion (`v2`) | Bot shell (`ExternalCopilot`) and compiled dialogs referencing the planner bundle. |
| `Claims_Issue_Agent_SJ_v2` | GenAI Planner Bundle | Compiled planner artifacts (`Atlas__ConcurrentMultiAgentOrchestration`); the `.agent` file above is the human-readable source of truth. |
| `Claim_Assistance_SJ` | Flow (AutoLaunchedFlow) | Looks up the `Provider_Claims__c` record by claim number and assembles the claim summary, including the denial reason only when denied. |
| `Provider_Claims__c` | Custom Object | The claim record itself — type, status, dates, amounts, provider/policy lookups, and denial reason. |
| `Provider_Claims__c-Provider Claim Layout` | Layout | Page layout for the `Provider_Claims__c` object. |
| `Provider_Claims__c` (tab) | Custom Tab | Tab for the `Provider_Claims__c` object. |
| `All` | List View | Default list view for `Provider_Claims__c`. |
| `Claims_Permission_Set_SJ` | Permission Set | Grants the agent's runtime user access to `Provider_Claims__c` (full CRUD) and read access to `HealthcareProvider` fields, plus the `RunFlow` user permission. |

No leftover "Local Info Agent" scaffolding (weather Apex classes, resort prompt templates, etc.) was found in this folder — it only contains the components listed above.

## Data Model

- **`Provider_Claims__c`** — custom object, label "Provider Claim", plural "Provider Claims", autonumber Name format `CLM-{00000}`, sharing model `ReadWrite`. Fields:
  - `Healthcare_Provider__c` — Lookup to the standard `HealthcareProvider` object (relationship `Provider_Claims`).
  - `Insurance_Policy__c` — Lookup to the standard `InsurancePolicy` object (relationship `Provider_Claims`); neither `HealthcareProvider` nor `InsurancePolicy` is shipped in this package — both are expected to already exist in the target org.
  - `Claim_Type__c` — restricted Picklist: Medical Claim, Professional Claim, Institutional Claim, Pharmacy Claim, Dental Claim, Vision Claim, Behavioral Health Claim, Workers' Compensation Claim.
  - `Status__c` — restricted Picklist: Draft, Submitted, Received, Pending Review, Under Review, Information Requested, Pending Documentation, Pending Authorization, Adjudication in Progress, Approved, Partially Approved, Denied, Paid, Partially Paid, Closed, Reopened, Escalated, Cancelled.
  - `Initiation_Date__c`, `Assessment_Date__c`, `Finalized_Date__c` — DateTime fields (`Assessment_Date__c` exists on the object but isn't read by the flow).
  - `Estimated_Amount__c`, `Actual_Amount__c`, `Approved_Amount__c` — Currency fields.
  - `Claim_Reason__c` — Text Area (free-text reason for the claim; not surfaced by this agent).
  - `Claim_Denail_Reason__c` — Text(254); the real field name in the org (misspelled "Denail" instead of "Denial"), surfaced by the agent as `ClaimDenialReason` only when `Status__c = "Denied"`.

```
HealthcareProvider
└─ Provider_Claims__c   (Healthcare_Provider__c lookup)

InsurancePolicy
└─ Provider_Claims__c   (Insurance_Policy__c lookup)
```

## Try It Out

Once deployed and activated, start a conversation with the agent and try prompts such as:

- _What's the status of claim CLM-00042?_
- _Can you pull up the details for claim number CLM-00107?_
- _Why was my claim denied?_ (after providing a claim number for a claim in `Denied` status)
- _I don't have my claim number — can you look it up another way?_ (the agent will explain it needs the claim number and ask again)

## Deploy

Deploy this agent folder to an authorized org:

```bash
sf project deploy start -d payer_agentforce_agents/ProviderClaimsAssistanceAgent
```

Then assign the folder's permission set:

```bash
sf org assign permset --name Claims_Permission_Set_SJ
```

> **Note on permissions:** `Claims_Permission_Set_SJ` grants full create/read/edit/delete plus "view all"/"modify all" access on `Provider_Claims__c`, even though this agent only ever reads claim data — review and scope this down to read-only for production use. It also grants broad read access to standard `HealthcareProvider` fields and the `RunFlow` user permission (needed to invoke `Claim_Assistance_SJ`). Note that both the `.agent` file's `default_agent_user` and the bot's `botUser` are set to `provider_network_inquiries_agent@00dhs00000ttgxg1772157319.ext` — a user name that reads like it was carried over from a different agent in this workspace; confirm/replace this with the correct dedicated agent user for your org before going live.

After deploying:

- Ensure the Agentforce agent user is entitled to the `Provider_Claims__c` object/fields and the `Claim_Assistance_SJ` flow via the permission set above (and to `HealthcareProvider`/`InsurancePolicy` if those objects carry org-specific sharing restrictions).
- Activate the agent and its connected Agentforce Service channel, then test in the Agent preview or a live messaging deployment.
