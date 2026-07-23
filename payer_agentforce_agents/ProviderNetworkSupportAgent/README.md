# Provider Network Inquiries Agent

An Agentforce Service Agent for healthcare payer contact centers that verifies a healthcare provider's identity and answers questions about the provider's demographics, credentialing status, network contracts, and fee schedules — with the ability to escalate to a live human agent.

## Table of Contents

- [Overview](#overview)
- [Key Capabilities](#key-capabilities)
- [How It Works](#how-it-works)
- [What's Inside This Folder](#whats-inside-this-folder)
- [Data Model](#data-model)
- [Try It Out](#try-it-out)
- [Deploy](#deploy)

## Overview

**Purpose:** Provider network teams field a high volume of repetitive inquiries — "What's my credentialing status?", "What's my allowed amount for a CPT code?", "Am I in network for this contract?" This agent automates that front line: it authenticates the provider by name, NPI, and phone, then retrieves a consolidated view of the provider's demographics, credentials, network contracts, and fee schedules. Requests outside its scope are redirected, and the conversation can be handed off to a live agent at any time.

The real agent in this folder is the **`Provider_Network_Inquiries_Agent_2`** bundle (Agent Script / Agent DSL authoring format). It runs as an `EinsteinServiceAgent` (`ExternalCopilot`), bot developer name `Provider_Network_Inquiries_Agent`, bot version `v2`, planner `Provider_Network_Inquiries_Agent_v2`, default agent user `payer_contact_center_agent@00dfj00000q85ss699465383.ext`.

## Key Capabilities

- **Provider verification** — collects Provider Name, NPI, and Provider Phone and authenticates the provider against `HealthcareProvider` records before disclosing any data.
- **Provider network inquiries** — returns provider demographics, credentialing status, network contract participation, and fee schedules (allowed amounts, CPT codes) once the provider is verified.
- **Verification gating** — network inquiries are blocked until verification succeeds; an unverified user is routed back to verification.
- **Escalation to a live agent** — transfers the conversation to a human on request, and offers to log a support case if the transfer fails.
- **Scoped responses** — declines off-topic questions with a fixed message pointing back to credentialing, network participation, contracts, and fee schedules.

## How It Works

**Start agent — `Agent Router`:** Uses the classifier model `model://sfdc_ai__DefaultEinsteinHyperClassifier` and routes to one of three subagents: `Provider_Verification`, `Provider_Network_Inquiries`, or `escalation`.

**Subagent — `Provider_Verification`:** Collects Provider Name, NPI, and Provider Phone, then calls the `HealthBridge_Provider_Verification` action (target `apex://ProviderVerificationAction`). It stores the result in the mutable conversation variables `provider_verified` (boolean) and `provider_id` (string) from the action's `isVerified`/`providerId` outputs.

**Subagent — `Provider_Network_Inquiries`:** If `provider_verified == True` and `provider_id` is set, it calls the `HealthBridge_Provider_Inquiry_Service` action (target `apex://ProviderInquiryAction`) with `healthcareProviderId = @variables.provider_id`, then converts the JSON result into a human-readable answer without exposing raw JSON unless asked. If not verified, it tells the user verification is required and transitions back to `Provider_Verification`. Off-topic questions get: *"I can assist with provider credentialing, network participation, contracts, fee schedules, and provider information. For other inquiries, please contact a support representative."*

**Subagent — `escalation`:** On an explicit request for a human agent, calls `@utils.escalate`; if escalation fails, offers to log a support case instead.

**Apex action — `ProviderVerificationAction.verifyProvider`:** Normalizes the phone number (strips non-digits), then runs a single bulk query — `SELECT Id, Name, NPI__c, Provider_Phone__c FROM HealthcareProvider WHERE Name IN :providerNames AND NPI__c IN :npis AND Provider_Phone__c != NULL LIMIT 1000` — and matches on a composite key of lowercase name + NPI + normalized phone. It distinguishes three error types: `InvalidInputException` (a required field is missing), `NoMatchException` (no provider matches), and `MultipleMatchesException` (the same composite key matched more than one record). On success it returns `isVerified = true`, `providerId`, and `providerName`.

**Apex action — `ProviderInquiryAction.getProviderInformation`:** Validates the `healthcareProviderId`, then resolves the provider object dynamically via `Schema.getGlobalDescribe()` (preferring `HealthcareProvider`, falling back to `Account`) and assembles a consolidated payload: the provider record, related `Credential__c` records (`Healthcare_Provider__c` lookup), and — via `ProviderNetworkContract` (`HealthcareProviderId`/`ContractId`, a standard object not shipped in this package) — the `Fee_Schedule__c` records tied to each contract (`Contract__c` lookup). Object/field existence is checked defensively via `Schema` describes before each query, so missing pieces degrade gracefully instead of failing outright. The result is returned as a pretty-printed JSON `inquirySummary` plus `success` and `message`.

**GenAI Functions:** `HealthBridge_Provider_Verification` and `HealthBridge_Provider_Inquiry_Service` are the formal `GenAiFunction` wrappers around the two Apex classes, each with matching `input`/`output` JSON schemas that mirror the Apex request/response shapes.

**Routing flow — `Route_to_service_agent_flow`:** A `RoutingFlow` that calls `routeWork` (routing type `QueueBased`) to place the conversation into the "Messaging Queue" over the `sfdc_livemessage` service channel, referencing the `Provider_Network_Inquiries_Agent` bot — this is the mechanism behind the escalation handoff.

## What's Inside This Folder

| Component | Type | Purpose |
| --- | --- | --- |
| `Provider_Network_Inquiries_Agent_2` | AI Authoring Bundle (`.agent`) | The agent definition: router, `Provider_Verification`, `Provider_Network_Inquiries`, and `escalation` subagents. |
| `Provider_Network_Inquiries_Agent` | Bot / BotVersion (`v2`) | Bot shell and compiled dialogs referencing the planner bundle. |
| `Provider_Network_Inquiries_Agent_v2` | GenAI Planner Bundle | Compiled planner artifacts; the `.agent` file above is the human-readable source of truth. |
| `HealthBridge_Provider_Verification` | GenAI Function | Formal wrapper/schema for the verification action. |
| `HealthBridge_Provider_Inquiry_Service` | GenAI Function | Formal wrapper/schema for the inquiry action. |
| `ProviderVerificationAction` | Apex Class | Verifies a provider by name, NPI, and phone against `HealthcareProvider`; returns verification status and provider Id. |
| `ProviderInquiryAction` | Apex Class | Returns a consolidated provider profile: demographics, credentials, contracts, and fee schedules. |
| `Route_to_service_agent_flow` | Flow (RoutingFlow) | Routes the conversation to a live service agent via Omni-Channel. |
| `HealthcareProvider` | Standard Object (extended) | The provider master record with custom fields NPI, Phone, Email, and Tax ID. |
| `Credential__c` | Custom Object | Tracks each provider's credentialing lifecycle. |
| `Fee_Schedule__c` | Custom Object | Contract-level fee lines (CPT code, allowed amount). |

Supporting metadata includes page layouts and tabs for `Credential__c` and `Fee_Schedule__c`.

## Data Model

- **`HealthcareProvider`** (standard object, extended) — custom fields `NPI__c` (Text 10), `Provider_Phone__c` (Phone), `Email__c` (Email), `Tax_ID__c` (Text 20), alongside the standard `Name`. Verification matches on `Name` + `NPI__c` + normalized `Provider_Phone__c`.
- **`Credential__c`** — child of `HealthcareProvider` via the `Healthcare_Provider__c` lookup (relationship `Credentials`). Autonumber `CR-{000000}`. Fields: `Credentialing_Status__c`, `Current_Stage__c`, `Application_Date__c`, `Committee_Review_Date__c`, `Expected_Completion__c`, `Assigned_Analyst__c`, `Rejection_Reason__c`.
- **`Fee_Schedule__c`** — child of the standard `Contract` object via the `Contract__c` lookup (relationship `Fee_Schedules`). Autonumber `FS-{00000}`. Fields: `CPT_Code__c`, `Allowed_Amount__c`, `Description__c`.

The provider is linked to contracts through the standard **`ProviderNetworkContract`** object (`HealthcareProviderId` → `ContractId`, not shipped in this package — it's expected to already exist in the target org), and fee schedules hang off those `Contract` records:

```
HealthcareProvider
├─ Credential__c            (Healthcare_Provider__c lookup)
└─ ProviderNetworkContract  (HealthcareProviderId)
   └─ Contract
      └─ Fee_Schedule__c    (Contract__c lookup)
```

## Try It Out

Once deployed and activated, start a messaging session with the agent and try prompts such as:

- _I'd like to verify my provider details. My name is Dr. Jane Smith, NPI 1234567890, phone 555-123-4567._
- _What is my current credentialing status and what stage is my application in?_
- _What's the allowed amount for CPT code 99213 under my contract?_
- _Can you connect me to a live agent?_

## Deploy

Deploy this agent folder to an authorized org:

```bash
sf project deploy start -d payer_agentforce_agents/ProviderNetworkSupportAgent
```

> **Note on permissions:** This folder does **not** ship its own permission set or permission set group. Rather than assigning the individual Apex classes and objects it uses, grant the Agentforce agent user access through an Agentforce agent permission set group managed at the org level — for example a shared `AFDX_Agent_Perms`-style group if one exists in your org, or the standard Agentforce user permissions. Because no permission metadata deploys with this folder, treat this as guidance and align it with however agent access is administered in your org.

After deploying:

- Ensure the Agentforce agent user is entitled to the resources this agent uses (the `ProviderInquiryAction` and `ProviderVerificationAction` Apex classes, and the `HealthcareProvider`, `Credential__c`, and `Fee_Schedule__c` objects and their fields) via the org-level permission set group described above.
- Ensure Omni-Channel messaging is configured (the `sfdc_livemessage` service channel and the **Messaging Queue** referenced by `Route_to_service_agent_flow`) so escalation to a live agent works.
- Activate the agent and its connected Agentforce Service channel, then test in the Agent preview or a messaging deployment.
