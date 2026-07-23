# Provider Contract Inquiry Agent

An Agentforce Employee Agent that helps internal healthcare payer staff quickly look up provider contract information — contract dates, network participation, fee schedules, reimbursement rates, and amendment history — using a contract number, provider name, or NPI.

## Table of Contents

- [Overview](#overview)
- [Key Capabilities](#key-capabilities)
- [How It Works](#how-it-works)
- [What's Inside This Folder](#whats-inside-this-folder)
- [Data Model](#data-model)
- [Try It Out](#try-it-out)
- [Deploy](#deploy)

## Overview

**Purpose:** Give internal employees a single conversational entry point to pull up a provider's contract — by contract number, provider name, or NPI — and drill into network participation, fee schedules, reimbursement rates, and amendment/renewal history, without leaving the chat or hunting through related lists.

The real agent in this folder is the **`Provider_Contract_Inquiry_Agent`** bundle (Agent Script / Agent DSL authoring format). It is built on the `EmployeeCopilot__AgentforceEmployeeAgent` template (agent type `AgentforceEmployeeAgent`, bot `type=InternalCopilot`), bot version `v4`, planner `Provider_Contract_Inquiry_Agent_v4`, locale `en_US` with `en_GB` as an additional locale.

## Key Capabilities

- Looks up a provider's contract using a **Contract Number** (e.g., `00000105`), **Provider Name** (e.g., "Dr. John Smith"), or **NPI Number** — the single Flow action figures out which kind of input it received.
- Shows an initial summary of Healthcare Provider Name, Contract Number, Contract Effective Date, and Contract Expiration Date, then offers to drill into three sections on request: Provider Network Information, Fee Schedule Information, and Amendment History.
- Flags contracts that have already expired or are expiring within 30 days with an inline alert and a renewal recommendation.
- Enforces strict plain-text, section-at-a-time formatting rules (no raw HTML, no separator lines, no "Records data:"/"Total records:" boilerplate) and user-friendly error messages that never expose technical exceptions to the end user.

## How It Works

**Start agent — `Agent Router`:** Uses the classifier model `model://sfdc_ai__DefaultEinsteinHyperClassifier` and transitions to the `Provider_Contract_Inquiry` subagent based on intent.

**Subagent — `Provider Contract Inquiry`:** Calls a single action, `Get_Provider_Contract_Information` (target `flow://ALF_Provider_contract_enquiry`), with one required input `inputName` (the user's search value). Its reasoning instructions are unusually detailed: the flow returns *all* data in one `output` string, and the agent must never dump the whole thing at once — it extracts and displays only the section the user asks for (initial summary, then Provider Network, Fee Schedule, or Amendment History on request), always as clean plain text, one field per line, ignoring any HTML markup embedded in the flow's output.

**Flow — `ALF_Provider_contract_enquiry`:** An `AutoLaunchedFlow` that takes `inputName` and returns `output` (string) plus `userFound` (boolean):
1. A formula (`trueContract`) decides whether the input looks like a Contract Number (`LEN(inputName) = 8 AND BEGINS(inputName, "0")`) or a provider search term.
2. If it's a contract number, it looks up `Contract` by `ContractNumber`, then the related `HealthcareProvider` via the `Healthcare_Provider__c` lookup. If it's a provider search, it looks up `HealthcareProvider` first (matching `Name` contains `inputName` OR `NPI__c` equals `inputName`), then the provider's `Contract`.
3. Once both the contract and provider are resolved, it looks up the provider's `vlocity_ins__ProviderNetwork__c` records, `Fee_Schedules_contract__c` records (filtered by `Contract__c`), and `Contract_Amendment__c` records (filtered by `Contract__c`), looping over each set and appending formatted text blocks (with record counts) into the single `output` string. `userFound` is set to `true` as soon as a contract/provider pair is matched.
4. If no contract is found at all, the flow falls through without populating `output`/`userFound`, which the agent's error message and reasoning instructions handle gracefully.

## What's Inside This Folder

| Component | Type | Purpose |
| --- | --- | --- |
| `Provider_Contract_Inquiry_Agent` | AI Authoring Bundle (`.agent`) | The agent definition: Agent Router and the `Provider_Contract_Inquiry` subagent/action. |
| `Provider_Contract_Inquiry_Agent` | Bot / BotVersion (`v4`) | Bot shell (`InternalCopilot`) and compiled dialogs referencing the planner bundle. |
| `Provider_Contract_Inquiry_Agent_v4` | GenAI Planner Bundle | Compiled planner artifacts; the `.agent` file above is the human-readable source of truth. |
| `ALF_Provider_contract_enquiry` | Flow (AutoLaunchedFlow) | Resolves the contract/provider pair from the search input and assembles the network, fee schedule, and amendment data into one output string. |
| `Provider_Network_Record_Page` | Flexipage | Record page layout referencing the provider network object. |
| `Contract` | Standard Object (extended) | Adds the `Healthcare_Provider__c` lookup to `HealthcareProvider`. |
| `Contract_Amendment__c` | Custom Object | Tracks individual field-level changes made to a contract (autonumber `CAMID-{0000}`). |
| `Fee_Schedules_contract__c` | Custom Object | Contract-level reimbursement rate lines by product/service code (autonumber `FSC-{0000}`). |
| `Network__c` | Custom Object | A simple network reference record (text-named). |
| `vlocity_ins__ProviderNetwork__c` | Managed-Package Object (extended) | Adds `Healthcare_Provider__c`, `Network__c`, `Enrollment__c`, and `ProviderNetworkTier__c` fields. |
| `Provider_Contract_Inquiry_Agent_All_permissions_set` | Permission Set | Grants the agent's runtime user access to the Contract, Contract_Amendment__c, Fee_Schedules_contract__c, HealthcareProvider, Network__c, and vlocity_ins__ProviderNetwork__c objects/fields. |

> **Note on scaffolding:** This folder was scaffolded from the same "Local Info Agent" SFDX template used elsewhere in this workspace and still contains a leftover, unrelated `Get_Event_Info` prompt template (invents fictional local events for a resort). It is not referenced by this agent and is not part of the deploy manifest — it can be ignored or removed.

## Data Model

- **`Contract`** (standard object, extended) — custom field `Healthcare_Provider__c` (Lookup to `HealthcareProvider`, relationship `Contracts`). Also read by the flow: `ContractNumber`, `StartDate`, `SBQQ__ExpirationDate__c`.
- **`Contract_Amendment__c`** — child of `Contract` via `Contract__c` (**Master-Detail**, relationship `Contract_Amendments`). Fields: `Amendment_Date__c` (Date), `Amendment_Summary__c`, `Changed_Field__c`, `New_Value__c`, `Old_Value__c`.
- **`Fee_Schedules_contract__c`** — child of `Contract` via `Contract__c` (**Master-Detail**, relationship `Fee_Schedules_contracts`); also has a `Product__c` lookup to the standard `Product2` object (relationship `Fee_Schedules`). Fields: `Effective_Date__c`, `End_Date__c`, `Rate_Type__c`, `Reimbursement_Rate__c`, `Service_code__c`.
- **`Network__c`** — a simple, text-named custom object with `Enrollment__c` and `Status__c` fields, referenced from `vlocity_ins__ProviderNetwork__c.Network__c`.
- **`vlocity_ins__ProviderNetwork__c`** (managed package, extended) — custom fields `Healthcare_Provider__c` (Lookup to `HealthcareProvider`), `Network__c` (Lookup to `Network__c`), `Enrollment__c`, and `ProviderNetworkTier__c` (Picklist: Tier 1, Tier 2, Tier 3), alongside standard/managed fields the flow reads (`Name`, `vlocity_ins__IsActive__c`, etc. via the `Network__r.Name` relationship used in the fee-schedule/network text templates).

```
HealthcareProvider
└─ Contract                        (Healthcare_Provider__c lookup)
   ├─ Contract_Amendment__c        (Contract__c master-detail)
   └─ Fee_Schedules_contract__c    (Contract__c master-detail)
      └─ Product2                  (Product__c lookup)

HealthcareProvider
└─ vlocity_ins__ProviderNetwork__c (Healthcare_Provider__c lookup)
   └─ Network__c                  (Network__c lookup)
```

## Try It Out

Once deployed and activated, start a conversation with the agent and try prompts such as:

- _Look up contract 00000105._ (searches by Contract Number)
- _Show me the contract for Dr. John Smith._ (searches by Provider Name)
- _What's the contract for NPI 1234567890?_
- _Show me the fee schedule for this contract._ / _What's the amendment history?_ / _What networks does this provider participate in?_ (drill-down after the initial summary)

## Deploy

Deploy this folder to your org:

```bash
sf project deploy start -d "payer_agentforce_agents/ProviderContractEnquiryAgent/Provider Contract Enquiry"
```

Then assign the folder's permission set:

```bash
sf org assign permset --name Provider_Contract_Inquiry_Agent_All_permissions_set
```

> **Note:** The permission set grants broad create/edit/delete access (not just read) on `Contract`, `Contract_Amendment__c`, `Fee_Schedules_contract__c`, `HealthcareProvider`, `Network__c`, and `vlocity_ins__ProviderNetwork__c` — review and scope it down for production use if this agent should only ever read contract data.
