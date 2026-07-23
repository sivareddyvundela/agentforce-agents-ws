# Provider Termination Agent

An Agentforce Service Agent for healthcare payer contact centers that looks up a healthcare provider by NPI, shows the members and active authorizations impacted by terminating that provider, and submits a formal provider termination request once the user confirms.

## Table of Contents

- [Overview](#overview)
- [Key Capabilities](#key-capabilities)
- [How It Works](#how-it-works)
- [What's Inside This Folder](#whats-inside-this-folder)
- [Data Model](#data-model)
- [Try It Out](#try-it-out)
- [Deploy](#deploy)

## Overview

**Purpose:** Terminating a provider from the network is never a single click — staff need to know who else is affected first: which members are tied to that provider and which authorizations are still active before the provider is removed. This agent gives contact center and network operations staff a conversational way to pull up a provider by NPI, see that impact analysis (impacted members, active authorizations) up front, and — only after the user chooses to proceed — capture an effective date and termination reason and create the termination request record for downstream approval.

The real agent in this folder is the **`Sunny_Provider_Termination_Agent`** bundle (Agent Script / Agent DSL authoring format, target `Sunny_Provider_Termination_Agent.v5`). It runs as an `EinsteinServiceAgent` (`ExternalCopilot`) built on the `SvcCopilotTmpl__AgentforceServiceAgent` template, bot developer name `Sunny_Provider_Termination_Agent`, bot version `v5`, planner `Sunny_Provider_Termination_Agent_v5` (planner type `Atlas__ConcurrentMultiAgentOrchestration`), default agent user `provider_network_inquiries_agent@00dhs00000ttgxg1772157319.ext`, locale `en_US` with `en_GB` as an additional locale.

## Key Capabilities

- **Provider lookup by NPI** — finds a `HealthcareProvider` record from an NPI and displays its name, status, and specialty before doing anything else.
- **Impact analysis before action** — automatically retrieves and displays the count and details of impacted members and active authorizations tied to the provider, so staff can make an informed decision.
- **Confirmation-gated termination** — only asks for an effective date and termination reason, and only creates the termination request, after the user explicitly chooses to proceed past the impact analysis.
- **Duplicate-request protection** — before creating a new termination request, checks whether one already exists for the provider (in any status other than Approved) and reports it instead of creating a duplicate.
- **Structured, reusable conversation state** — carries the resolved `providerId` across all downstream actions so the user is never asked to re-enter it, and presents results as concise, bulleted sections rather than raw data dumps.

## How It Works

**Start agent — `Agent Router`:** Uses the classifier model `model://sfdc_ai__DefaultEinsteinHyperClassifier` and transitions to the single `Provider_termination_process` subagent for any provider-termination-related intent.

**Subagent — `Provider_termination_process`:** Its reasoning instructions define the full conversational flow:
1. Requires an NPI before calling `Search_provider_by_NPI`; if the provider isn't found, tells the user and stops (no other actions are attempted).
2. If found, displays the provider details first, stores `providerId`, then automatically calls `Get_Impacted_Members` and `Get_Active_Authorizations` for that provider and presents, in order: Provider Details, Impacted Members (with count), Active Authorizations (with count).
3. Asks the user whether they want to proceed with a termination request. If yes, collects the Effective Date, then a Reason from a fixed list (Retirement, Contract Expired, Network Change, Compliance Issue, Other), then calls `Create_Provider_Termination_request` with the provider Id and the counts gathered earlier.
4. Displays the created request's Request Number, Status, Effective Date, Reason, Impacted Members Count, and Active Authorizations Count. If the user declines after seeing the impact analysis, no request is created.
5. The NPI itself is never passed downstream — only the resolved `providerId` (a Salesforce record Id) is reused across `Get_Active_Authorizations`, `Get_Impacted_Members`, and `Create_Provider_Termination_request`, all of which are gated with `available when @variables.providerId is not None` (except the initial NPI search).

**Action — `Search_provider_by_NPI`** (target `flow://Get_Provider_by_NPI`): Looks up `HealthcareProvider` by `NPI__c`. If a record is found it assigns `providerId`, `providerName` (`Name`), `providerStatus` (`Status`), and a formatted `providerSummary` HTML block (Name, NPI, Status, `Speciality__c`); otherwise `providerSummary` is set to "No Provider found with the given NPI."

**Action — `Get_Impacted_Members`** (target `flow://Get_Impacted_Members`): Queries `Account` where `Healthcare_Provider__c` equals the provider Id (no record limit specified). If matches exist, it loops over every returned `Account`, appending a plain-text block (Name, Phone, `PersonEmail`) per record to `memberSummary` and incrementing `memberCount`; otherwise it returns `memberCount = 0` and "No impacted members were found for this provider."

**Action — `Get_Active_Authorizations`** (target `flow://Get_Active_Authorizations`): Queries `Authorization__c` where `Healthcare_Provider__c` equals the provider Id **and** `Status__c` equals `"Active"`. It loops over the matches, appending a plain-text block (Authorization Number/`Name`, `Authorization_Type__c`, `Status__c`, `Start_Date__c`, `End_Date__c`) per record to `authorizationSummary` and incrementing `authorizationCount`; otherwise it returns `authorizationCount = 0` and "No active authorizations found."

**Action — `Create_Provider_Termination_request`** (target `flow://Create_Provider_Termination_Request`): First looks up an existing `Provider_Termination_Request__c` for the provider whose `Status__c` is **not** `"Approved"`. If one exists, it returns a message with that request's Name, Status, Effective Date, and Reason and explicitly states no new request was created (duplicate protection). Otherwise it creates a new `Provider_Termination_Request__c` with `Healthcare_Provider__c`, `Effective_Date__c`, `Reason__c`, `Active_Authorizations_Count__c`, `Impacted_Members_Count__c`, and a hard-coded `Status__c = "Pending"`, then re-queries the new record by Id and returns its Name (`requestNumber`), `Status__c` (`requestStatus`), and a formatted HTML success summary (Request Number, Status, Impacted Members, Active Authorizations).

**GenAI local actions:** Because this agent uses only Flow targets (no Apex), the four actions above are wired up as `localActions`/`localActionLinks` inside the `Sunny_Provider_Termination_Agent_v5` genAiPlannerBundle (planner type `Atlas__ConcurrentMultiAgentOrchestration`), each with a matching `input`/`output` JSON schema under `localActions/.../input|output/schema.json` that mirrors the flow's variables.

## What's Inside This Folder

| Component | Type | Purpose |
| --- | --- | --- |
| `Sunny_Provider_Termination_Agent` | AI Authoring Bundle (`.agent`) | The agent definition: Agent Router and the `Provider_termination_process` subagent/actions. |
| `Sunny_Provider_Termination_Agent` | Bot / BotVersion (`v5`) | Bot shell (`EinsteinServiceAgent` / `ExternalCopilot`) and compiled dialogs referencing the planner bundle. |
| `Sunny_Provider_Termination_Agent_v5` | GenAI Planner Bundle | Compiled planner artifacts (topics, local actions, input/output schemas); the `.agent` file above is the human-readable source of truth. |
| `Get_Provider_by_NPI` | Flow (AutoLaunchedFlow) | Looks up a `HealthcareProvider` by NPI and returns its Id, name, status, and a formatted summary. |
| `Get_Impacted_Members` | Flow (AutoLaunchedFlow) | Returns the count and details of `Account` records linked to the provider. |
| `Get_Active_Authorizations` | Flow (AutoLaunchedFlow) | Returns the count and details of `Authorization__c` records linked to the provider with `Status__c = Active`. |
| `Create_Provider_Termination_Request` | Flow (AutoLaunchedFlow) | Checks for an existing open termination request, or creates a new `Provider_Termination_Request__c` record and returns its confirmation summary. |
| `HealthcareProvider` | Standard Object (read only, not shipped) | The provider master record; matched by `NPI__c`, and read for `Name`, `Status`, `Speciality__c`. |
| `Account` | Standard Object (extended) | Adds the `Healthcare_Provider__c` lookup; represents the members/patients impacted by a provider termination. |
| `Authorization__c` | Custom Object | Tracks a member's authorization for a service, linked to both the provider and the member. |
| `Provider_Termination_Request__c` | Custom Object | The termination request record created at the end of the conversation. |
| `Recent_Provider_Termination_Permissions` | Permission Set | Grants the agent's runtime user access to `Authorization__c`, `Provider_Termination_Request__c`, read access to `Account`/`Contact`/`HealthcareProvider`, and read access to a broad set of `HealthcareProvider` fields. |

Supporting metadata includes page layouts and tabs for `Authorization__c` and `Provider_Termination_Request__c`. No leftover "Local Info Agent" scaffolding (weather/event Apex classes or prompt templates) was found in this folder — it appears to have been cleaned up already.

## Data Model

- **`HealthcareProvider`** (standard object, not shipped in this package — expected to already exist in the target org) — matched by `NPI__c`; the flows also read `Name`, `Status`, and `Speciality__c`.
- **`Account`** (standard object, extended) — custom field `Healthcare_Provider__c` (Lookup to `HealthcareProvider`, relationship `Accounts`). Represents the impacted members/patients; the flow also reads `Name`, `Phone`, and `PersonEmail`.
- **`Authorization__c`** — two lookups: `Healthcare_Provider__c` (Lookup to `HealthcareProvider`, relationship `Authorizations`) and `Member__c` (Lookup to `Account`, relationship `Authorizations`). Autonumber `Auth-{0000}`. Fields: `Authorization_Type__c` (Picklist: Surgery, Consultation, Lab Test, Medication, Home Care), `Status__c` (Picklist: Active, Closed, Pending), `Start_Date__c`, `End_Date__c`.
- **`Provider_Termination_Request__c`** — child of `HealthcareProvider` via the `Healthcare_Provider__c` lookup (relationship `Provider_Termination_Requests`). Autonumber `PTR-{0000}`. Fields: `Status__c` (Picklist: Draft, Pending, Approved, Cancelled), `Reason__c` (Picklist: Retirement, Contract Expired, Network Change, Compliance Issue, Others), `Effective_Date__c` (Date), `Active_Authorizations_Count__c` (Number), `Impacted_Members_Count__c` (Number), and `Compliance_Status__c` (Picklist: Passed, Failed — present on the object but not populated by any flow in this folder).

```
HealthcareProvider
├─ Account                        (Healthcare_Provider__c lookup) — impacted members
│  └─ Authorization__c            (Member__c lookup)
├─ Authorization__c               (Healthcare_Provider__c lookup)
└─ Provider_Termination_Request__c (Healthcare_Provider__c lookup)
```

## Try It Out

Once deployed and activated, start a conversation with the agent and try prompts such as:

- _I need to terminate a provider with NPI 1234567890._
- _Show me the impacted members and active authorizations for this provider._
- _Yes, go ahead and submit the termination request. Effective date is September 1st, 2026, reason is Contract Expired._
- _Is there already a termination request for this provider?_

## Deploy

Deploy this folder to your org:

```bash
sf project deploy start -d payer_agentforce_agents/ProviderTerminationAgent
```

Then assign the folder's permission set:

```bash
sf org assign permset --name Recent_Provider_Termination_Permissions
```

> **Note on permissions:** The permission set grants full create/edit/delete/view-all access to `Authorization__c` and `Provider_Termination_Request__c` (the two objects this agent writes to), plus read-only access to `Account`, `Contact`, and `HealthcareProvider` (including a broad list of `HealthcareProvider` fields). `HealthcareProvider` itself is not part of this deploy manifest — ensure it, and the standard `Account`/`Contact` objects, already exist in the target org before deploying. Review and scope down the `Authorization__c`/`Provider_Termination_Request__c` grants for production use if this agent should not have delete or view-all-records access.
