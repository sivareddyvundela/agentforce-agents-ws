# Provider Search & Profile Lookup Agent

An Agentforce (Service) agent that lets internal healthcare staff search for a healthcare provider by Name, NPI, or Tax ID and drill into the provider's full profile — credentials, provider networks, network contracts, service locations, and compliance issues — sourced entirely from Salesforce CRM.

## Table of Contents

- [Overview](#overview)
- [Key Capabilities](#key-capabilities)
- [How It Works](#how-it-works)
- [What's Inside This Folder](#whats-inside-this-folder)
- [Data Model](#data-model)
- [Try It Out](#try-it-out)
- [Deploy](#deploy)

## Overview

**Purpose:** Help Provider Relations Representatives, Contact Center Agents, and Network Operations Specialists quickly identify a healthcare provider and look up their complete profile. The agent finds a provider from a search term, establishes that provider as the working context for the conversation, and then answers follow-up requests for the provider's credentials, contracts, network participation, service locations, and compliance issues.

The agent is grounded strictly in Salesforce CRM / Health Cloud data. It does not assume, infer, or fabricate provider information, and it presents only fields that contain values.

## Key Capabilities

- **Provider search** by Provider Name, NPI, or Tax ID, with disambiguation when multiple providers match.
- **Provider profile summary** — name, NPI, Tax ID, specialty, type, status, phone, email, board-certification, and accepting-new-patients indicators.
- **Credential lookup** — list a provider's credential records and drill into a selected credential's full detail (status, application date, current stage, assigned analyst, expected completion, committee review date, rejection reason).
- **Provider network participation** — all networks the provider participates in (a provider can belong to multiple networks).
- **Provider network contracts** — active contract details for the selected provider.
- **Service locations** — all practice/service locations (name, address, city, country) for the provider.
- **Compliance issues** — all compliance/regulatory records for the provider.
- **Context preservation** — once a provider is selected, follow-up requests reuse that provider context without re-searching, and viewed categories are tracked so the follow-up menu stays relevant.

## How It Works

**Real agent bundle:** `Provider_Search_Service_Sunny_1` (agent label *"Provider Search (Service) - Sunny"*), built on the `SvcCopilotTmpl__AgentforceServiceAgent` service template.

**Routing.** The `agent_router` start agent greets the user and classifies intent using the `sfdc_ai__DefaultEinsteinHyperClassifier` model, then transitions to one of two subagents:

1. **Provider Search and Profile** (`Provider_Search_and_Profile`) — Handles provider identification and profile lookup. It searches with the user's term, and if multiple providers match it asks the user to pick one. Once a provider is identified it presents the profile and preserves the provider ID for downstream requests. This subagent also handles credential retrieval, including the two-step "list credentials → view a selected credential" flow.

2. **Provider Network, Service and Compliance Details** (`Provider_Network_and_Service_Details`) — Operates on the already-selected provider context (never re-asking for search terms). It invokes exactly one action per request to return service locations, network participation, active network contracts, or compliance issues.

**Search → lookup flow.** A provider search calls the `Search_Healthcare_Provider` flow, which returns the `providerId`. That ID is then passed into each "multiple" lookup flow (credentials, networks, contracts, service locations, compliance) so every follow-up is scoped to the correct provider. Each lookup flow queries its related records, loops through them to build a human-readable summary string, and returns either the record set or a "no records found" message.

**Formatting / reasoning rules (enforced via subagent instructions).**
- After a profile or lookup, the agent shows a single *"What would you like to view next?"* heading followed by a vertical bullet list of the remaining categories (Credentials, Service Locations, Provider Networks, Provider Network Contracts, Compliance Issues) — never inline or delimiter-separated.
- A category is considered "viewed" only after its action successfully returns and displays; failed or empty lookups keep the category available.
- Only non-empty fields are displayed — no "Not Available" / "None" placeholders.
- Salesforce record IDs, Provider IDs, flow names, and other implementation details are never exposed to the user.
- Compliance retrieval requires user confirmation before running.

## What's Inside This Folder

| Component | Type | Purpose |
|---|---|---|
| `Provider_Search_Service_Sunny_1.agent` | Agent Script (aiAuthoringBundle) | The Provider Search & Profile Lookup agent definition — router, two subagents, and their action-to-flow bindings. |
| `Search_Healthcare_Provider` | Flow (AutoLaunched) | Searches Healthcare Provider records by Provider Name, NPI, or Tax ID and returns provider demographics plus `providerId`. |
| `Get_Provider_Credentials_Multiple` | Flow (AutoLaunched) | Returns a provider's credential records — a single credential's details, a numbered list for selection, or a no-credentials message. |
| `Fetch_selected_credential_details` | Flow (AutoLaunched) | Given a selected credential number and provider ID, returns the full detail of that one credential. |
| `Get_Provider_Network_multiple` | Flow (AutoLaunched) | Returns all provider network (participation) records for the selected provider. |
| `Get_Active_Provider_Contracts_Multiple` | Flow (AutoLaunched) | Returns all active provider network contract records for the selected provider. |
| `Get_Provider_Service_Locations_Multiple` | Flow (AutoLaunched) | Returns all service/practice locations (name, address, city, country) for the selected provider. |
| `Get_Provider_Compliance_Issue` | Flow (AutoLaunched) | Returns all compliance issue records for the selected provider. |
| `Credential__c` | Custom Object | Provider credentialing lifecycle records. |
| `Service_Location__c` | Custom Object | Provider service/practice location records. |
| `Provider_Compliance_Issues__c` | Custom Object | Provider compliance/regulatory issue records. |
| `vlocity_ins__ProviderNetwork__c` | Object (Health/Insurance) | Provider network participation records linking providers to networks. |
| `AFDX_Agent_Perms` | Permission Set Group | Runtime permissions required by the Agentforce service agent. |
| `AFDX_User_Perms` | Permission Set Group | Permissions required by AFDX admin/builder users. |

> **Scaffolding note:** This folder was scaffolded from a template and still contains unused leftover files that are **not** part of this agent: the `Local_Info_Agent` bundle, the Apex classes `CheckWeather`, `CurrentDate`, and `WeatherService` (and their tests), the `Get_Event_Info` prompt template, and the `Resort_Admin` / `Resort_Agent` permission sets (the latter two are still referenced by the AFDX permission set groups but are generically named). They can be ignored or removed; the functional agent is described above.

## Data Model

All lookup objects relate back to a provider through a `Healthcare_Provider__c` lookup to the **HealthcareProvider** record (Health Cloud), which is the anchor the `Search_Healthcare_Provider` flow resolves from the user's search term.

- **`Credential__c`** — *"Tracks credentialing lifecycle."* Fields: `Credentialing_Status__c`, `Application_Date__c`, `Current_Stage__c`, `Assigned_Analyst__c`, `Expected_Completion__c`, `Committee_Review_Date__c`, `Rejection_Reason__c`, and `Healthcare_Provider__c` (lookup → HealthcareProvider). One provider can have many credentials.

- **`Service_Location__c`** — Practice/service locations. Fields: `Location_Name__c`, `Address__c`, `City__c`, `State__c`, `Country__c`, and `Healthcare_Provider__c` (lookup → HealthcareProvider). One provider can have many service locations.

- **`Provider_Compliance_Issues__c`** — Compliance and regulatory records. Fields: `Issue_Title__c`, `Compliance_Type__c` (License Compliance, Credentialing, Regulatory, Documentation, Privacy, Quality, Others), `Severity__c` (Low / Medium / High / Critical), `Status__c` (Open, Under Review, Remediation Required, Resolved, Closed), `Identified_date__c`, `Resolution_Due_Date__c`, `Resolution_Date__c`, and `Healthcare_Provider__c` (lookup → HealthcareProvider). One provider can have many compliance issues.

- **`vlocity_ins__ProviderNetwork__c`** — *"A group of service providers … that an insurance company has contracted with to provide services at prenegotiated rates to its members."* Represents provider network participation. Fields include `Network__c` (lookup → Network), `ProviderNetworkTier__c` (Tier 1 / 2 / 3), `vlocity_ins__LineofBusiness__c` (Group/Individual × Dental/Medical/Vision), `vlocity_ins__IsActive__c`, `vlocity_ins__EffectiveStartDate__c` / `vlocity_ins__EffectiveEndDate__c`, `vlocity_ins__CarrierAccountId__c`, `vlocity_ins__ParentNetworkId__c` (self-lookup), `vlocity_ins__RegionAvailability__c`, and `Healthcare_Provider__c` (lookup → HealthcareProvider). One provider can participate in many networks. Record types include Provider, Producer, and Pharmacy.

## Try It Out

- "Find provider **John Smith**." / "Search for NPI **1234567890**." / "Look up the provider with Tax ID **12-3456789**."
- (after selecting a provider) "Show me this provider's **credentials**." → then "View credential **2**."
- "List this provider's **service locations**."
- "Which **provider networks** does this provider participate in?" / "Show the **active contracts**."
- "Are there any **compliance issues** for this provider?"

## Deploy

Deploy this agent folder to your org:

```bash
sf project deploy start -d force-app/main/ProviderNetworkAgents/ProviderAgents/ProviderSearchNProfileLookupAgent
```

Then assign the folder's two permission set groups to the appropriate users:

```bash
# Runtime permissions for the Agentforce service-agent user
sf org assign permset --name AFDX_Agent_Perms

# Admin/builder permissions
sf org assign permset --name AFDX_User_Perms
```

Assigning these groups grants all of the bundled object, field, Apex, and flow access, so the individual objects and classes do not need to be assigned separately.

> Requires an org with Agentforce (Service) and Health Cloud / Insurance (`vlocity_ins`) enabled, and a **HealthcareProvider** data set for the search and lookup flows to resolve against.
