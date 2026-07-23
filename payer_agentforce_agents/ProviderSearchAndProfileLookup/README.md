# Provider Search Service — Sunny

An Agentforce Service Agent for internal healthcare payer employees (Provider Relations Representatives, Contact Center Agents, Network Operations Specialists) that searches for a healthcare provider and then looks up that provider's full profile — credentials, network participation, contracts, service locations, and compliance issues — using Flow actions against Health Cloud data.

## Table of Contents

- [Overview](#overview)
- [Key Capabilities](#key-capabilities)
- [How It Works](#how-it-works)
- [What's Inside This Folder](#whats-inside-this-folder)
- [Data Model](#data-model)
- [Try It Out](#try-it-out)
- [Deploy](#deploy)

## Overview

**Purpose:** Give internal staff a single conversational entry point to find a provider by Name, NPI, or Tax ID, then drill into that provider's credentials, network participation, active network contracts, service locations, and compliance issues without leaving the chat. Unlike the other agents in this workspace, it is built entirely on **Flow actions** rather than Apex.

The real agent in this folder is the **`Provider_Search_Service_Sunny_1`** bundle (Agent Script / Agent DSL authoring format), template `SvcCopilotTmpl__AgentforceServiceAgent`. It runs as an `EinsteinServiceAgent` (`ExternalCopilot`), bot developer name `Provider_Search_Service_Sunny`, bot version `v1`, planner `Provider_Search_Service_Sunny_v1`. Description: "An AI assistant for internal healthcare employees that retrieves provider profiles from Salesforce Health Cloud. Users can search providers using Provider Name, NPI, or Tax ID and view provider demographics, credentials, provider networks, network contracts, and recent CRM interactions."

## Key Capabilities

- **Provider Search** — find a `HealthcareProvider` record by Name, NPI, or Tax ID and view demographics (specialty, status, type, phone, email, board certification, accepting-new-patients flag).
- **Credentials Lookup** — list a provider's credentialing records, then drill into one selected credential's full detail.
- **Provider Network Participation** — list the provider's network memberships (active flag, line of business, effective dates).
- **Provider Network Contracts** — list the provider's *Active* network contracts (payer, status, start/end dates).
- **Service Locations** — list the provider's practice/service addresses.
- **Compliance Issues** — list the provider's compliance issues (type, status, severity, dates), most recent first.

## How It Works

**Start agent — `Agent Router`:** Uses the classifier model `sfdc_ai__DefaultEinsteinHyperClassifier` and routes every turn to one of two subagents based on intent.

**Subagent — `Provider Search and Credentials` (`Provider_Search_and_Profile`):** Handles provider identification/search and credentials, and establishes the "selected provider" context reused by the other subagent.

| Action | Flow | Logic | Returns |
| --- | --- | --- | --- |
| Search Healthcare Provider | `flow://Search_Healthcare_Provider` | Looks up `HealthcareProvider` where `Name` starts with, `NPI__c` equals, or `Tax_ID__c` equals the search text (first match). | Provider Id/name/NPI/Tax ID/specialty/type/status/phone/email/board-certified/accepting-new-patients, plus a record link. |
| Get Provider Credentials Multiple | `flow://Get_Provider_Credentials_Multiple` | Queries all `Credential__c` for the selected provider; branches on 0 / 1 / many results. | A "no records" message, a single credential's inline detail, or a numbered list prompting the user to pick one. |
| Fetch selected credential details | `flow://Fetch_selected_credential_details` | Re-queries the provider's credentials and matches the number the user picked. | Full detail: status, application date, current stage, assigned analyst, expected completion, committee review date, rejection reason. |

**Subagent — `Provider Network, Service and Compliance Details` (`Provider_Network_and_Service_Details`):** Uses the already-selected provider context (never re-asks for Name/NPI/Tax ID) and invokes only the one action matching the user's request.

| Action | Flow | Logic | Returns |
| --- | --- | --- | --- |
| Get Provider Network multiple | `flow://Get_Provider_Network_multiple` | Queries `vlocity_ins__ProviderNetwork__c` for the selected provider. | Numbered list: network name, active flag, line of business, effective start/end date. |
| Get Active Provider Contracts Multiple | `flow://Get_Active_Provider_Contracts_Multiple` | Queries `ProviderNetworkContract` where `Status__c = "Active"` for the selected provider. | Numbered list: contract name, payer network, status, start/end date. |
| Fetch Provider service locations | `flow://Get_Provider_Service_Locations_Multiple` | Queries `Service_Location__c` for the selected provider. | List: location name, service location Id, address, city, country. |
| Get Provider Compliance Issues | `flow://Get_Provider_Compliance_Issue` | Queries `Provider_Compliance_Issues__c` for the selected provider, sorted by identified date descending. | List: issue name/title, compliance type, status, severity, identified date, resolution due date. |

All 7 flows are auto-launched, run in system mode without sharing, and never expose internal record Ids, flow names, or API names to the end user. The agent tracks which categories it has already shown per conversation to avoid repeating menus, resetting that tracking whenever a new/different provider is selected.

## What's Inside This Folder

| Component | Type | Purpose |
| --- | --- | --- |
| `Provider_Search_Service_Sunny_1` | AI Authoring Bundle (`.agent`) | The agent definition: router plus `Provider_Search_and_Profile` and `Provider_Network_and_Service_Details` subagents. |
| `Provider_Search_Service_Sunny` | Bot / BotVersion (`v1`) | Bot shell and compiled dialogs referencing the planner bundle. |
| `Provider_Search_Service_Sunny_v1` | GenAI Planner Bundle | Compiled planner artifacts; the `.agent` file above is the human-readable source of truth. |
| `Search_Healthcare_Provider` | Flow | Searches `HealthcareProvider` by Name, NPI, or Tax ID. |
| `Get_Provider_Credentials_Multiple` | Flow | Lists `Credential__c` records for the selected provider. |
| `Fetch_selected_credential_details` | Flow | Returns full detail for one selected credential. |
| `Get_Provider_Network_multiple` | Flow | Lists `vlocity_ins__ProviderNetwork__c` records for the selected provider. |
| `Get_Active_Provider_Contracts_Multiple` | Flow | Lists Active `ProviderNetworkContract` records for the selected provider. |
| `Get_Provider_Service_Locations_Multiple` | Flow | Lists `Service_Location__c` records for the selected provider. |
| `Get_Provider_Compliance_Issue` | Flow | Lists `Provider_Compliance_Issues__c` records for the selected provider. |
| `Credential__c` | Custom Object | Credentialing lifecycle records. |
| `Provider_Compliance_Issues__c` | Custom Object | Compliance issue tracking. |
| `Service_Location__c` | Custom Object | Provider practice/service locations. |
| `HealthcareProvider` | Standard Object (extended) | Adds `Is_Accepting_New_Patients__c`. |
| `ProviderNetworkContract` | Standard Object (extended) | Adds `Status__c` picklist. |
| `vlocity_ins__ProviderNetwork__c` | Managed-Package Object (extended) | Adds `Healthcare_Provider__c` and `Network__c` lookups. |
| `Provider_Search_Agent_Access_Permission_Set` | Permission Set | Grants read access to the objects this agent queries. |

## Data Model

- **`HealthcareProvider`** (standard, extended) — searched via `Name`, `NPI__c`, `Tax_ID__c`; also reads `Speciality__c`, `Status`, `Email__c`, `ProviderType`, `Provider_Phone__c`, `Board_Certified__c`, and the custom `Is_Accepting_New_Patients__c` (checkbox, default `false`).
- **`Credential__c`** — lookup `Healthcare_Provider__c` (relationship `Credentials`) to `HealthcareProvider`. Fields: `Application_Date__c`, `Assigned_Analyst__c`, `Committee_Review_Date__c`, `Credentialing_Status__c`, `Current_Stage__c`, `Expected_Completion__c`, `Rejection_Reason__c`.
- **`Provider_Compliance_Issues__c`** — lookup `Healthcare_Provider__c` (relationship `Provider_Compliance_Issues`) to `HealthcareProvider`. Fields: `Issue_Title__c`, `Compliance_Type__c` (License Compliance, Credentialing, Regulatory, Documentation, Privacy, Quality, Others), `Status__c` (Open, Under Review, Remediation Required, Resolved, Closed), `Severity__c` (Low, Medium, High, Critical), `Identified_date__c`, `Resolution_Due_Date__c`, `Resolution_Date__c`.
- **`Service_Location__c`** — lookup `Healthcare_Provider__c` (relationship `Service_Locations`) to `HealthcareProvider`. Fields: `Location_Name__c`, `Address__c`, `City__c`, `State__c`, `Country__c`.
- **`ProviderNetworkContract`** (standard, extended) — related via `HealthcareProviderId`; custom addition `Status__c` (Active, Pending, Expired, Terminated, Suspended, Renewing); also reads standard `Name`, `HealthcarePayerNetwork.Name`, `StartDate`, `EndDate`.
- **`vlocity_ins__ProviderNetwork__c`** (managed package, extended) — custom lookups `Healthcare_Provider__c` (relationship `Provider_Network`) to `HealthcareProvider` and `Network__c`; also reads `Name`, `vlocity_ins__IsActive__c`, `vlocity_ins__LineofBusiness__c`, `vlocity_ins__EffectiveStartDate__c`, `vlocity_ins__EffectiveEndDate__c`.

```
                                   HealthcareProvider
                                (Name, NPI__c, Tax_ID__c,
                             Speciality__c, Status, Email__c,
                          Is_Accepting_New_Patients__c, ...)
                                          │
        ┌───────────────┬────────────────┼────────────────┬───────────────────┐
        │                │                │                │                   │
  Credential__c   Service_Location__c  Provider_       ProviderNetworkContract  vlocity_ins__
 (Healthcare_      (Healthcare_        Compliance_      (HealthcareProviderId,  ProviderNetwork__c
  Provider__c)       Provider__c)      Issues__c         Status__c custom)      (Healthcare_Provider__c
                                       (Healthcare_                              custom, Network__c
                                        Provider__c)                             custom lookup)
```

## Try It Out

Once deployed and activated, start a conversation with the agent and try prompts such as:

- _Find provider John Mercer._ / _Search NPI 1234567890._
- _Show me the credentials for this provider._ then _Show me credential #2._
- _What networks does this provider participate in?_
- _Show active contracts for this provider._
- _List this provider's service locations._ / _Any compliance issues on file for this provider?_

## Deploy

Deploy this agent folder to an authorized org:

```bash
sf project deploy start -d payer_agentforce_agents/ProviderSearchAndProfileLookup
```

Then assign the folder's permission set:

```bash
sf org assign permset --name Provider_Search_Agent_Access_Permission_Set
```

> **Note:** The permission set grants read access to `Credential__c`, `HealthcareProvider`, `ProviderNetworkContract`, `Provider_Compliance_Issues__c`, and `Service_Location__c` (plus baseline read on `Account`, `Contact`, `Contract`, `HealthcarePayerNetwork`), but does **not** explicitly list `vlocity_ins__ProviderNetwork__c`. If network-participation lookups fail for a restricted user, grant access to that managed-package object separately.
