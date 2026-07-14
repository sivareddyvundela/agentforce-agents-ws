# Provider Network Inquiries Agent

An Agentforce service agent for healthcare payer operations that verifies healthcare providers and answers questions about their network participation — provider demographics, credentialing status, contracts, payer networks, and fee schedules — with the ability to escalate to a live human agent.

## Table of Contents

- [Overview](#overview)
- [Key Capabilities](#key-capabilities)
- [How It Works](#how-it-works)
- [What's Inside This Folder](#whats-inside-this-folder)
- [Data Model](#data-model)
- [Try It Out](#try-it-out)
- [Deploy](#deploy)

## Overview

Provider network teams at a payer field a high volume of repetitive inquiries from contracted and prospective providers: "Where is my credentialing application?", "What is my allowed amount for a CPT code?", "Am I in-network for this plan?". These questions require the provider to be authenticated first, and the answers are spread across several objects.

This agent automates that front line. It authenticates the provider using name, NPI, and phone number, then retrieves a consolidated view of the provider's network information from Salesforce. If the request falls outside its scope, or the provider explicitly asks for a person, it hands the conversation off to a live service agent through Omni-Channel routing.

## Key Capabilities

- **Provider verification** — collects Provider Name, NPI, and Provider Phone and authenticates the provider against `HealthcareProvider` records before any data is disclosed.
- **Provider network inquiries** — returns provider demographics, credentialing status, contracts, payer network participation, and fee schedules (allowed amounts, CPT codes) for a verified provider.
- **Verification gating** — network inquiries are blocked until verification succeeds; the agent automatically routes an unverified user back to verification.
- **Escalation to a live agent** — transfers the conversation to a human agent on request, and offers to log a support case if the transfer fails.
- **Scoped, grounded responses** — answers strictly from returned data, declines off-topic questions, and avoids exposing raw JSON unless explicitly asked (see the Agent 2 variant below).

## How It Works

The agent is defined as an Agent Script bundle in `aiAuthoringBundles/`. A **start agent (`agent_router`)** greets the user and classifies intent, using the `sfdc_ai__DefaultEinsteinHyperClassifier` model, then transitions to one of three subagents:

| Subagent | Responsibility |
| --- | --- |
| `Provider_Verification` | Collects NPI, Provider Name, and Provider Phone, then invokes the verification action. Stores the boolean result in the `provider_verified` variable and the returned Salesforce Id in `provider_id`. |
| `Provider_Network_Inquiries` | If `provider_verified == True` and `provider_id` is set, calls the inquiry action with that Id; otherwise informs the user and transitions back to `Provider_Verification`. |
| `escalation` | Calls the `@utils.escalate` tool to transfer to a live human agent, falling back to offering a support case if escalation fails. |

Conversation state is carried in two mutable variables — `provider_verified` (boolean, default `False`) and `provider_id` (string) — which are set by the verification action's outputs (`isVerified`, `providerId`) and consumed by the inquiry action's input (`healthcareProviderId`).

**Apex actions.** Two invocable Apex classes back the subagents:

- `ProviderVerificationAction` (`apex://ProviderVerificationAction`, action `HealthBridge_Provider_Verification`) — normalizes the phone number, queries `HealthcareProvider` by name + NPI, and matches on the normalized phone. It returns `isVerified`, `providerId`, and a message, and reports distinct error types for no-match (`NoMatchException`), duplicate matches (`MultipleMatchesException`), and invalid input (`InvalidInputException`).
- `ProviderInquiryAction` (`apex://ProviderInquiryAction`, action `HealthBridge_Provider_Inquiry_Service`) — takes a `healthcareProviderId` and assembles a consolidated payload of the provider record, related `Credential__c` records, `ProviderNetworkContract` records, and the `Fee_Schedule__c` records tied to each contract. It returns the result as a pretty-printed JSON `inquirySummary` plus a `success` flag and message. The class resolves the provider object dynamically (`HealthcareProvider`, falling back to `Account`) and defensively checks that each object and field exists before querying.

**Routing flow.** `Route_to_service_agent_flow` is a `RoutingFlow` that runs the `routeWork` action to place the conversation into the **Messaging Queue** over the `sfdc_livemessage` service channel, referencing the `Provider_Network_Inquiries_Agent` bot definition. This is the mechanism behind the escalation handoff to a live agent.

### Two bundle variants

Both bundles share the same developer name (`Provider_Network_Inquiries_Agent`), router, variables, actions, and Apex targets. They differ only in the `Provider_Network_Inquiries` subagent instructions:

- **`Provider_Network_Inquiries_Agent_1`** — the lean variant. The inquiry subagent simply runs the inquiry action when the provider is verified, or transitions back to verification when it isn't.
- **`Provider_Network_Inquiries_Agent_2`** — the fuller variant. It adds detailed reasoning guidance: a friendly, professional healthcare-support tone; explicit topic scoping (credentialing, network participation, contracts, fee schedules, allowed amounts, CPT codes, analysts, application dates, stages, completion dates) with a canned response for out-of-scope questions; instructions to convert returned data into human-readable text without exposing raw JSON; guidance for summarizing multiple records; and a fallback message when the requested data isn't present. Its inquiry action inputs/outputs also carry explicit `complex_data_type_name` (e.g. `lightning__textType`) metadata.

In short, Agent 2 is the more production-ready, better-grounded version of the same agent; Agent 1 is the minimal baseline.

## What's Inside This Folder

| Component | Type | Purpose |
| --- | --- | --- |
| `Provider_Network_Inquiries_Agent_1` | Agent Script bundle (`aiAuthoringBundles`) | Baseline agent definition: router, verification, inquiry, and escalation subagents. |
| `Provider_Network_Inquiries_Agent_2` | Agent Script bundle (`aiAuthoringBundles`) | Enhanced variant with detailed tone, scoping, and response-formatting instructions for the inquiry subagent. |
| `ProviderVerificationAction` | Apex class (invocable) | Verifies a provider by name, NPI, and phone against `HealthcareProvider`; returns verification status and provider Id. |
| `ProviderInquiryAction` | Apex class (invocable) | Returns a consolidated provider profile: demographics, credentials, contracts, and fee schedules. |
| `Route_to_service_agent_flow` | Flow (RoutingFlow) | Routes the conversation to a live service agent via Omni-Channel (`sfdc_livemessage`, Messaging Queue). |
| `HealthcareProvider` | Standard object (extended) | The provider master record with custom fields NPI, Phone, Email, and Tax ID. |
| `Credential__c` | Custom object | Tracks each provider's credentialing lifecycle. |
| `Fee_Schedule__c` | Custom object | Contract-level fee lines (CPT code, allowed amount). |

Supporting metadata includes page layouts and tabs for `Credential__c` and `Fee_Schedule__c`, plus list views.

## Data Model

The inquiry action assembles its response from a provider-centric graph:

- **`HealthcareProvider`** (standard object, extended) — the anchor record. Custom fields: `NPI__c` (National Provider Identifier), `Provider_Phone__c`, `Email__c`, and `Tax_ID__c`, alongside the standard `Name`. Verification matches on `Name` + `NPI__c` + normalized `Provider_Phone__c`.
- **`Credential__c`** — child of `HealthcareProvider` via the `Healthcare_Provider__c` lookup (relationship `Credentials`). Named by AutoNumber (`CR-{000000}`) and described as "Tracks credentialing lifecycle." Fields include `Credentialing_Status__c`, `Current_Stage__c`, `Application_Date__c`, `Committee_Review_Date__c`, `Expected_Completion__c`, `Assigned_Analyst__c`, and `Rejection_Reason__c`.
- **`Fee_Schedule__c`** — child of `Contract` via the `Contract__c` lookup (relationship `Fee Schedules`). Named by AutoNumber (`FS-{00000}`). Fields include `CPT_Code__c`, `Allowed_Amount__c`, and `Description__c`.

The provider is linked to contracts through the standard **`ProviderNetworkContract`** junction (`HealthcareProviderId` → `ContractId`), and fee schedules hang off those `Contract` records. So a single verified provider fans out to its credentialing records directly, and to its fee schedules by way of its network contracts:

```
HealthcareProvider
├─ Credential__c            (Healthcare_Provider__c lookup)
└─ ProviderNetworkContract  (HealthcareProviderId)
   └─ Contract
      └─ Fee_Schedule__c    (Contract__c lookup)
```

## Try It Out

Once deployed and activated, start a messaging session with the agent and try prompts such as:

- "I'd like to verify my provider details." — the agent collects Provider Name, NPI, and Provider Phone and confirms the match.
- "What is my current credentialing status and what stage is my application in?" — after verification, returns credentialing lifecycle details.
- "What's the allowed amount for CPT code 99213 under my contract?" — returns the relevant fee schedule line.
- "Can you connect me to a live agent?" — escalates the conversation to a human via the routing flow.

## Deploy

Deploy this agent folder to an authorized org:

```bash
sf project deploy start -d force-app/main/ProviderNetworkAgents/ProviderAgents/ProviderNetworkSupportAgent
```

> **Note on permissions:** Unlike the sibling agent folders, this folder does **not** ship its own permission set or permission set group. Rather than assigning the individual Apex classes and objects it uses, grant the Agentforce agent user access through an Agentforce agent permission set group managed at the org level — for example a shared `AFDX_Agent_Perms` group if one exists in your org, or the standard Agentforce user permissions. Because no permission metadata deploys with this folder, treat this as guidance and align it with however agent access is administered in your org.

After deploying:

- Ensure the Agentforce agent user is entitled to the resources this agent uses (the `ProviderInquiryAction` and `ProviderVerificationAction` Apex classes, and the `HealthcareProvider`, `Credential__c`, and `Fee_Schedule__c` objects and their fields) via the org-level permission set group described above.
- Ensure Omni-Channel messaging is configured (the `sfdc_livemessage` service channel and the **Messaging Queue** referenced by `Route_to_service_agent_flow`) so escalation to a live agent works.
- Activate the agent and its connected Agentforce Service channel, then test in the Agent preview or a messaging deployment.
