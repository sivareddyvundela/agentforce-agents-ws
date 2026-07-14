# Provider Contract Inquiry Agent

An Agentforce (Employee) agent that lets payer / provider-network staff look up and understand a healthcare provider's contract using a contract number, provider name, or NPI number, and returns contract, network, fee-schedule, and amendment details in a clean, business-friendly format.

## Table of Contents

- [Overview](#overview)
- [Key Capabilities](#key-capabilities)
- [How It Works](#how-it-works)
- [What's Inside This Folder](#whats-inside-this-folder)
- [Data Model](#data-model)
- [Try It Out](#try-it-out)
- [Deploy](#deploy)
- [Template scaffolding](#template-scaffolding)

## Overview

Provider-network and contracting teams frequently need to answer point-in-time questions about a provider agreement: When does this contract expire? Which networks does the provider participate in? What are the reimbursement rates on the fee schedule? Has the contract been amended recently? Traditionally this means clicking through several related records (Contract, Healthcare Provider, Provider Network, Fee Schedule, and amendment history) across the org.

The **Provider Contract Inquiry Agent** collapses that work into a single conversational request. A user supplies one identifier (contract number, provider name, or NPI), and the agent resolves the correct records, then presents the contract summary first and lets the user drill into network, fee-schedule, or amendment details on demand. It is built on the Agentforce Employee (`EmployeeCopilot__AgentforceEmployeeAgent`) template and is grounded strictly in returned Salesforce data, so it will not invent contract terms that aren't in the source records.

## Key Capabilities

- Look up a provider contract by **contract number**, **provider name**, or **NPI number**.
- Return core **contract details**: healthcare provider name, contract number, effective (start) date, and expiration date.
- Show **provider network participation** (network name and network type).
- Show **fee schedule** information: product, reimbursement rate, rate type, and schedule effective/end dates, listed per record.
- Show **contract amendment history**, summarizing each change (field changed, old value, new value).
- Guide the user with a menu after the initial summary so they choose which section to expand, rather than dumping everything at once.
- Fall back gracefully: if no matching contract is found, it asks the user to verify the contract number, provider name, or NPI.
- Answer general company/policy questions via knowledge search, and politely redirect off-topic or ambiguous requests.

## How It Works

**Architecture.** The bundle [`Provider_Contract_Inquiry_Agent.agent`](aiAuthoringBundles/Provider_Contract_Inquiry_Agent/Provider_Contract_Inquiry_Agent.agent) defines a router-plus-subagents design:

- **Start agent — `agent_router`** greets the user and classifies intent, then transitions to the appropriate subagent. It uses the classifier model `model://sfdc_ai__DefaultEinsteinHyperClassifier`.
- **Subagent — `Provider_Contract_Inquiry`** is the domain worker. It invokes the single action `Get_Provider_Contract_Information` and applies strict formatting rules: strip any HTML/rich-text returned by the action, render everything as plain text with one field per line, show only the contract summary first, and reveal Provider Network / Fee Schedule / Amendment sections only when the user explicitly asks.
- **Standard subagents** round out the experience: `GeneralFAQ` (answers company/policy questions via the `AnswerQuestionsWithKnowledge` knowledge-search action), `off_topic` (redirects off-topic requests), and `ambiguous_question` (asks the user to clarify vague requests). The last two enforce guardrails against prompt-injection and revealing system configuration.

**Request flow.** The `Get_Provider_Contract_Information` action targets the flow [`ALF_Provider_contract_enquiry`](flows/ALF_Provider_contract_enquiry.flow-meta.xml) and passes the user's search value as `inputName`. The flow:

1. Uses a formula (`trueContract`) to detect a contract number — an 8-character value beginning with `0` — versus a provider name/NPI.
2. If a contract number, it queries **Contract** by `ContractNumber`, then loads the related **HealthcareProvider** via `Healthcare_Provider__c`. Otherwise it queries **HealthcareProvider** by `Name` (contains) or `NPI__c`, then finds that provider's **Contract**.
3. Loads related **Provider Network**, **Fee Schedule**, and **Contract Amendment** records, formats each section into text templates, and returns a single `output` string plus a `userFound` boolean.

**Amendment tracking.** Amendment history is populated automatically. The [`ContractTrigger`](triggers/ContractTrigger.trigger) fires `after update` on Contract and calls [`ContractAmendmentHandler`](classes/ContractAmendmentHandler.cls), which compares old and new values of `Status`, `StartDate`, and `EndDate` and inserts a `Contract_Amendment__c` record (with a human-readable summary) for each changed field.

## What's Inside This Folder

| Component | Type | Purpose |
| --- | --- | --- |
| [`Provider_Contract_Inquiry_Agent`](aiAuthoringBundles/Provider_Contract_Inquiry_Agent/Provider_Contract_Inquiry_Agent.agent) | Agent bundle (aiAuthoringBundle) | The agent blueprint: system instructions, router, subagents, the `Get_Provider_Contract_Information` action, and session variables. |
| [`ALF_Provider_contract_enquiry`](flows/ALF_Provider_contract_enquiry.flow-meta.xml) | Autolaunched Flow | Backing logic for the action: resolves the identifier, queries related records, and builds the formatted `output` string and `userFound` flag. |
| [`ContractAmendmentHandler`](classes/ContractAmendmentHandler.cls) | Apex class | Detects changes to a Contract's Status, Start Date, and End Date and creates `Contract_Amendment__c` records. |
| [`ContractTrigger`](triggers/ContractTrigger.trigger) | Apex trigger | `after update` trigger on Contract that invokes `ContractAmendmentHandler`. |
| [`Contract`](objects/Contract/Contract.object-meta.xml) | Standard object (extended) | Provider contracts, with the custom `Healthcare_Provider__c` lookup and SBQQ/vlocity fields. |
| [`Contract_Amendment__c`](objects/Contract_Amendment__c/Contract_Amendment__c.object-meta.xml) | Custom object | Amendment history log (Changed Field, Old/New Value, Summary, Amendment Date) related to a Contract. |
| [`Fee_Schedules_contract__c`](objects/Fee_Schedules_contract__c/Fee_Schedules_contract__c.object-meta.xml) | Custom object | Fee schedule lines per contract: Product, Reimbursement Rate, Rate Type, Effective/End dates, Service code. |
| [`HealthcareProvider`](objects/HealthcareProvider/HealthcareProvider.object-meta.xml) | Standard object (extended) | The provider, keyed by `Name` and `NPI__c`; source of the provider identity used in lookups. |
| [`vlocity_ins__ProviderNetwork__c`](objects/vlocity_ins__ProviderNetwork__c/vlocity_ins__ProviderNetwork__c.object-meta.xml) | Custom object (Vlocity / Industries) | Provider network participation records surfaced in the "Provider Network Information" section. |
| [`AFDX_Agent_Perms`](permissionsetgroups/AFDX_Agent_Perms.permissionsetgroup-meta.xml) | Permission set group | Permissions required by the Agentforce service-agent user. |
| [`AFDX_User_Perms`](permissionsetgroups/AFDX_User_Perms.permissionsetgroup-meta.xml) | Permission set group | Permissions required by admin / builder users of the agent. |

## Data Model

The agent joins one standard-object chain with three supporting custom objects:

- **HealthcareProvider** — the provider record, matched by `Name` (contains) or `NPI__c`.
- **Contract** (standard object, extended for this app) — linked to a provider through the custom `Healthcare_Provider__c` lookup. Contract number, `StartDate` (effective date), and `SBQQ__ExpirationDate__c` (expiration date) drive the summary.
- **Fee_Schedules_contract__c** — child of Contract via `Contract__c`; holds reimbursement rates by product / service code.
- **Contract_Amendment__c** — child of Contract via `Contract__c`; an audit trail written automatically by the Contract trigger.
- **vlocity_ins__ProviderNetwork__c** — related to the provider via `Healthcare_Provider__c`; represents network participation and tier.

Relationship in brief: `HealthcareProvider 1—* Contract 1—* Fee_Schedules_contract__c` and `1—* Contract_Amendment__c`, with `HealthcareProvider 1—* vlocity_ins__ProviderNetwork__c`.

## Try It Out

- "Look up contract number 00000105."
- "Show me the contract for NPI 1043210987."
- "What contract do we have with Dr. John Smith?"
- After the summary appears: "Show me the fee schedule information." / "Show the amendment history." / "Which networks is this provider in?"

## Deploy

Deploy the whole folder with the Salesforce CLI:

```bash
sf project deploy start -d force-app/main/ProviderNetworkAgents/ProviderAgents/ProviderContractInquiryAgent
```

Then assign the two permission set groups that ship with this folder:

```bash
# Agentforce runtime / service-agent user
sf org assign permset --name AFDX_Agent_Perms

# Admin / builder users
sf org assign permset --name AFDX_User_Perms
```

Assigning these groups grants all bundled object, field, Apex, and flow access, so you do **not** need to assign individual objects or classes separately.

---

### Template scaffolding

This folder was scaffolded from a Salesforce Agentforce template, and a few template artifacts remain that are unrelated to contract inquiry: the permission set groups still list `Resort_Agent` and `Resort_Admin` permission sets, and the agent's `config.agent_label` carries a personalized `"Prasanth Provider Contract Inquiry Agent"` label. The functional agent, flow, Apex, and data model documented above are the real contract-inquiry implementation.
