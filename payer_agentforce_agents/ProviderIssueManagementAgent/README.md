# Provider Issue Management Agent

An Agentforce Service Agent for healthcare payer contact centers that identifies a healthcare provider, classifies their reported issue (claims, payment, credentialing, contract, or directory), and recommends a resolution path — escalating to a live human agent whenever confidence is low or the provider asks for one.

## Table of Contents

- [Overview](#overview)
- [Key Capabilities](#key-capabilities)
- [How It Works](#how-it-works)
- [What's Inside This Folder](#whats-inside-this-folder)
- [Data Model](#data-model)
- [Try It Out](#try-it-out)
- [Deploy](#deploy)

## Overview

**Purpose:** Providers contact payer support with a wide range of issues — an unpaid claim, a stalled credentialing application, an expiring network contract, or a directory listing with the wrong phone number. This agent gives them a single conversational entry point: it confirms the provider's identity by name and NPI, classifies the free-text issue description into one of several categories using a GenAI prompt template, pulls the relevant record data for that category, and asks a second prompt template to recommend a resolution path — status update, request for more information, or escalation. Anything the two prompt templates can't resolve with confidence is handed off to a human agent.

The real agent in this folder is the **`Provider_Issue_Management_2_Mokshitha`** bundle (Agent Script / Agent DSL authoring format). It runs as an `EinsteinServiceAgent` (`ExternalCopilot`), bot developer name `Provider_Issue_Management_2_Mokshitha`, bot version `v5`, planner `Provider_Issue_Management_2_Mokshitha_v5`, locale `en_US`, default agent user `provider_network_inquiries_agent@00dhs00000ttgxg1772157319.ext`, tone `Casual`.

## Key Capabilities

- **Provider identification** — asks for Name and NPI (phone not required), reviews conversation history first so it never re-asks for information already given, and confirms identity back to the provider using only Name, NPI, and Specialty (never phone, address, or other record fields).
- **Issue classification** — feeds the provider's own message into a classification prompt that sorts it into one of six categories: Claims Issue, Payment Inquiry, Credentialing Issue, Contract Issue, Directory Issue, or Unknown.
- **Confidence-gated recommendations** — only presents a resolution path when the classifier's confidence score is 60 or higher; below that, or when the provider has no further information, it moves straight toward escalation instead of guessing.
- **Context-aware resolution guidance** — a second prompt template reasons only over the actual record data returned for the matched category (claim, payment, credentialing, or contract record) and recommends one of: Provide Status Update, Request Additional Information, Escalate to Support Queue, or No Action Available – Recommend Escalation.
- **Escalation to a live agent** — transfers to a human on explicit request, or offers to log a support case if a recommendation isn't available or escalation fails.
- **Strict information hygiene** — never exposes raw JSON, the model's internal reasoning key, the numeric confidence score, or full provider records to the end user.

## How It Works

**Start agent — `Agent Router`:** Uses the classifier model `model://sfdc_ai__DefaultEinsteinHyperClassifier` and routes to either the `escalation` subagent or the `Provider_Issue_Management` subagent based on the user's intent.

**Subagent — `escalation`:** On an explicit request for a human agent, calls `@utils.escalate` (`escalate_to_human`); if escalation fails, it asks the provider whether they'd like to log a support case instead.

**Subagent — `Provider_Issue_Management`:** This is where the real work happens, driven by a detailed, four-step reasoning script:
1. **Identify the provider** — collects Name and NPI (using the provider's issue description already in the conversation as `varProviderMessage` if one was given, rather than asking again), then calls the one action defined for this subagent.
2. **Classify** — the action returns the classification; the agent stores `varConfidenceScore`, `varIssueType`, `varSummary`, and `PromptResponse2` and never classifies the issue itself.
3. **Evaluate & respond** — uses only `PromptResponse2.statusexplanation` (and `recommendedAction` where relevant) to build a resolution message; if `statusexplanation` indicates an inconsistency, it asks the provider to reconfirm details instead of presenting a resolution.
4. **Escalate** — offers to connect to a human whenever the flow fails, returns no data, confidence is below 60, or the recommended action implies escalation/manual review/investigation — and only actually escalates after the provider explicitly confirms.

**Action — `Provider_Issue_Classification_and_Recommendation`:** target `flow://Provider_Issue_Management`, called with `NPI`, `Name`, and `varProviderMessage`. Returns `PromptResponse2` (JSON with `reasoning`/`explanation`/`recommendedAction`, marked non-displayable so it's never shown raw), `providerFound`, `varConfidenceScore`, `varIssueType`, and `varSummary`.

**Flow — `Provider_Issue_Management`** (`AutoLaunchedFlow`, inputs `Name`/`NPI`/`varProviderMessage`, outputs `providerFound`/`varConfidenceScore`/`varIssueType`/`varSummary`/`PromptResponse2`):
1. **`Healthcare_Provider`** looks up `HealthcareProvider` where `NPI__c` equals the input NPI **or** `Name` equals the input name (first record only).
2. **`Provider_Found_or_Not`** decision: if `Healthcare_Provider.Id` is not null, continue to classification; otherwise the `Provider_Assignment` assignment sets `providerFound = false` and the flow ends (no classification is attempted for an unmatched provider).
3. **`Classify_Action_1`** calls the `Classify` prompt template (`generatePromptResponse`) with `Input:ProviderMessage = varProviderMessage`, storing the raw JSON in `PromptResponse`.
4. **`FetchValuesFromJSON`** calls the Apex action `ParseProviderIssueJSON` with `jsonResponse = PromptResponse`, extracting `varConfidenceScore` (from JSON key `ConfidenceScore`), `varIssueType` (`IssueType`), and `varSummary` (`Summary`).
5. **`Route_By_IssueType`** decision routes on `varIssueType` + `varConfidenceScore >= 60`:
   - *Claims issue* → **`Claims`** looks up `Provider_Claims__c` by `Healthcare_Provider__c`, then **`Claims_Data`** assigns the `ClaimContextData` text template (Claim Number/Status/Denial Reason/Claim Type/Claim Reason/Initiation Date/Finalized Date) to `varContextData`.
   - *Payment inquiry* → **`Payment_of_Claims`** looks up `Provider_Claims__c` by `Healthcare_Provider__c`, then **`Payment_Data`** assigns the `PaymentContextData` template (Claim Number/Status/Estimated Amount/Actual Amount/Approved Amount/Policy Number).
   - *Credentialing issue* → **`Get_Provider_Credential`** looks up `Credential__c` by `Healthcare_Provider__c`, then **`CredentialData`** assigns the `CredentialContextId` template (Credentials Id/Credentialing Status/Current Stage/Application Date/Expected Completion/Committee Review Date/Rejection Reason).
   - *Contract issue* → **`Get_Provider_Network_Contract`** looks up `ProviderNetworkContract` by `HealthcareProviderId`, then **`Provider_Data`** assigns the `ContractContextVariable` template (Name/Contract/Healthcare Payer Network/Status/Start Date/End Date).
   - *Directory issue* → **`ProviderData`** assigns the `DirectoryContextData` template built directly from the already-looked-up `Healthcare_Provider` record (Name/City/State/Country/Phone/Email/Specialty/Status).
   - *Default (unknown/low confidence)* → falls straight to the recommendation step with whatever `varContextData` is currently set (typically empty).
6. **`Recommendation_Action_1`** calls the `Recommendation` prompt template with `varIssueType`, `varProviderMessage`, `varContextData`, and `varConfidenceScore`, storing the result in the flow's `PromptResponse2` output.

**Apex class — `ParseProviderIssueJSON.parse`:** A simple invocable method that deserializes the classifier's JSON string (`JSON.deserializeUntyped`) and returns typed `issueType` (String), `confidenceScore` (Decimal), and `summary` (String) values pulled from the `IssueType`/`ConfidenceScore`/`Summary` keys.

**GenAI Prompt Template — `Classify`:** Given `ProviderMessage`, classifies it into exactly one of Claims Issue, Payment Inquiry, Credentialing Issue, Contract Issue, or Directory Issue (or `Unknown` with confidence 0), returning strict JSON `{IssueType, ConfidenceScore, Summary}`. Runs on `sfdc_ai__DefaultGPT5Mini`.

**GenAI Prompt Template — `Recommendation`:** Given `varIssueType`, `varConfidenceScore`, `varProviderMessage`, and `varContextData`, reasons per-issue-type rules (e.g., a claim `Status = "Finalized"` → *Provide Status Update*; mismatched Approved/Actual payment amounts → *Escalate to Support Queue*; an expired or terminated contract → *Escalate to Support Queue*; any directory correction → *Escalate to Support Queue*, since the flow never edits `HealthcareProvider` records) and returns strict JSON `{RecommendedAction, StatusExplanation, Reasoning}`. If `ConfidenceScore < 60` it is instructed to prefer escalation over a confident recommendation. Also runs on `sfdc_ai__DefaultGPT5Mini`.

**Routing flow — `Inbound_flow_Provider_Issue`** (`RoutingFlow`): calls `routeWork` with `routingType = Copilot`, `serviceChannelDevName = sfdc_livemessage`, `queueLabel = Escalation Team`, `copilotId` set via `setupReference` to the `Provider_Issue_Management_2_Mokshitha` bot — the inbound side of Omni-Channel routing for this bot.

**Routing flow — `outbound_Provider`** (`RoutingFlow`): calls `routeWork` with `routingType = QueueBased`, `serviceChannelDevName = sfdc_livemessage`, `queueLabel = Escalation Team`, `queueId = 00Gfj00000DjkKAEAZ` — this is the flow the agent's `messaging` connection block (`outbound_route_name: "flow://outbound_Provider"`) invokes to hand a conversation off to the **Escalation Team** queue when `@utils.escalate` is called.

## What's Inside This Folder

| Component | Type | Purpose |
| --- | --- | --- |
| `Provider_Issue_Management_2_Mokshitha` | AI Authoring Bundle (`.agent`) | The agent definition: Agent Router, `escalation` subagent, and `Provider_Issue_Management` subagent/action. |
| `Provider_Issue_Management_2_Mokshitha` | Bot / BotVersion (`v5`) | Bot shell (`ExternalCopilot`) and compiled dialogs referencing the planner bundle. |
| `Provider_Issue_Management_2_Mokshitha_v5` | GenAI Planner Bundle | Compiled planner artifacts (agent graph, local action schemas); the `.agent` file above is the human-readable source of truth. |
| `ParseProviderIssueJSON` | Apex Class | Invocable method that parses the classifier's JSON string into `issueType`/`confidenceScore`/`summary`. |
| `Provider_Issue_Management` | Flow (AutoLaunchedFlow) | Looks up the provider, calls the `Classify` prompt, parses it via Apex, looks up the category-specific record, and calls the `Recommendation` prompt. |
| `Inbound_flow_Provider_Issue` | Flow (RoutingFlow) | Routes an inbound conversation to the bot via Omni-Channel (`routingType = Copilot`, queue `Escalation Team`). |
| `outbound_Provider` | Flow (RoutingFlow) | Routes an escalated conversation to a live agent via the `Escalation Team` queue (`routingType = QueueBased`) — the target of the agent's `@utils.escalate` action. |
| `Classify` | GenAI Prompt Template | Classifies the provider's message into one of five issue types (or Unknown) with a confidence score and summary. |
| `Recommendation` | GenAI Prompt Template | Recommends one of four resolution paths from the issue type, confidence score, and record context data. |
| `ProviderNetworkContract.Status__c` | Custom Field (on standard object) | Picklist (Active/Pending/Expired/Terminated/Suspended/Renewing) added to the standard `ProviderNetworkContract` object; read by the flow's Contract Issue branch. |
| `Provider_Issue_Management_Mokshitha315010923_Permissions` | Permission Set | Grants the agent's runtime user read access (with view-all) to `Credential__c` and `Provider_Claims__c`. |
| `Escalation_Team` | Queue (on `MessagingSession`) | The escalation destination referenced by both routing flows. |
| `Escalation_Team_RoutingConfig` | Queue Routing Config | `MOST_AVAILABLE` routing model, priority 1, used by the `Escalation_Team` queue. |

> **Note on leftover scaffolding:** This folder was scaffolded from the same "Local Info Agent" SFDX template used elsewhere in this workspace and still contains leftover, unrelated resort-demo artifacts: the Apex classes `CheckWeather`, `CurrentDate` (+ `CurrentDateTest`), and `WeatherService` (+ `WeatherServiceTest`), plus the `Get_Resort_Hours` flow. None of these are referenced by this agent, and none are listed in `manifest/package.xml` — they can be ignored or removed.

## Data Model

This folder ships only one custom field on a standard object; every business object the flow reads (`HealthcareProvider`, `Credential__c`, `Provider_Claims__c`, and the rest of `ProviderNetworkContract`) is expected to already exist in the target org from other packages/agents in this workspace.

- **`ProviderNetworkContract`** (standard object) — this folder adds `Status__c` (Picklist: Active, Pending, Expired, Terminated, Suspended, Renewing). The flow also reads its standard/related fields `Name`, `ContractId`, `HealthcarePayerNetworkId`, `StartDate`, `EndDate`, and filters by `HealthcareProviderId`.
- **`HealthcareProvider`** (standard object, not shipped here) — looked up by `NPI__c` or `Name`; fields read include `City__c`, `State__c`, `Country__c`, `Provider_Phone__c`, `Email__c`, `Speciality__c`, and `Status`.
- **`Credential__c`** (custom object, not shipped here) — looked up via `Healthcare_Provider__c`; fields read include `Credentialing_Status__c`, `Current_Stage__c`, `Application_Date__c`, `Expected_Completion__c`, `Committee_Review_Date__c`, `Rejection_Reason__c`.
- **`Provider_Claims__c`** (custom object, not shipped here) — looked up via `Healthcare_Provider__c`; used for both the Claims Issue branch (`Status__c`, `Claim_Denail_Reason__c`, `Claim_Type__c`, `Claim_Reason__c`, `Initiation_Date__c`, `Finalized_Date__c`) and the Payment Inquiry branch (`Status__c`, `Estimated_Amount__c`, `Actual_Amount__c`, `Approved_Amount__c`, `Insurance_Policy__c`) of the same object.

```
HealthcareProvider
├─ Provider_Claims__c        (Healthcare_Provider__c lookup)  — Claims & Payment context
├─ Credential__c             (Healthcare_Provider__c lookup)  — Credentialing context
└─ ProviderNetworkContract   (HealthcareProviderId)            — Contract context (adds Status__c)
```

## Try It Out

Once deployed and activated, start a messaging session with the agent and try prompts such as:

- _My name is Dr. Jane Smith, NPI 1234567890. I submitted a claim two weeks ago and haven't heard anything._
- _What's the status of my credentialing application?_
- _My contract seems to have expired — can you check?_
- _My phone number and specialty are listed incorrectly in the directory._
- _Can you connect me to a live agent?_

## Deploy

Deploy this agent folder to an authorized org:

```bash
sf project deploy start -d payer_agentforce_agents/ProviderIssueManagementAgent
```

Then assign the folder's permission set:

```bash
sf org assign permset --name Provider_Issue_Management_Mokshitha315010923_Permissions
```

> **Note on permissions:** The permission set only covers `Credential__c` and `Provider_Claims__c` (read + view-all). It does **not** grant access to `HealthcareProvider` or `ProviderNetworkContract` — ensure the Agentforce agent user is separately entitled to those objects/fields (for example via an org-level Agentforce agent permission set group) before the provider-lookup and contract-issue branches will work. Also confirm Omni-Channel is configured for the `sfdc_livemessage` service channel and the **Escalation Team** queue referenced by `Inbound_flow_Provider_Issue` and `outbound_Provider`, then activate the agent and its connected Agentforce Service channel before testing.
