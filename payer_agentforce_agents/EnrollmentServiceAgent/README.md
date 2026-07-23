# Enrollment Service Agent

An Agentforce Service Agent for healthcare payer operations that helps members submit **Coverage Change** requests (adding or removing a dependent), with a **PCP Change Request** option reserved for future implementation. It logs the request as a `Case` against the member's `Account` and hands back a tracking Issue Id, and can escalate to a live human agent on request.

## Table of Contents

- [Overview](#overview)
- [Key Capabilities](#key-capabilities)
- [How It Works](#how-it-works)
- [What's Inside This Folder](#whats-inside-this-folder)
- [Data Model](#data-model)
- [Try It Out](#try-it-out)
- [Deploy](#deploy)

## Overview

**Purpose:** Give members a self-service way to request a coverage change (add or remove a dependent) without waiting on a phone queue. The agent asks for the member's account and dependent details, creates a `Case` capturing the request, and returns an Issue Id the member can use to track it. Requests outside its scope are redirected, and users can ask to be transferred to a live agent at any time.

The real agent in this folder is the **`Enrollment_Service_Agent`** bundle (Agent Script / Agent DSL authoring format). It runs as an `EinsteinServiceAgent` (`ExternalCopilot`), developer name `Enrollment_Service_Agent`, label "Enrollment Service Agent", default agent user `enrollment_service_agent@00dhs00000ttgxg456844516.ext`. It also defines a `voice` modality, so it can run over voice channels in addition to messaging.

## Key Capabilities

- Greets the user and asks whether they need a **Coverage Change** or a **PCP Change Request**.
- Collects Account Name, Coverage Change Type (Add Dependent / Remove Dependent), Dependent Name, Dependent Gender, Dependent DOB, Relation to Subscriber, and Effective Date of Change.
- Creates a `Case` record for the request via an Apex invocable action and returns a generated **Issue Id** to the user.
- Redirects off-topic questions and asks for clarification on ambiguous requests, without answering general-knowledge questions.
- Escalates to a live human agent on request via Omni-Channel routing, offering to log a support case if escalation fails.
- Ships a routing flow that can route inbound work into this agent's own Omni-Channel queue.

## How It Works

**Start agent — `Agent Router`:** Uses the classifier model `model://sfdc_ai__DefaultEinsteinHyperClassifier` to present the menu ("1. Coverage Change / 2. PCP Change Request") and route to `coverage_change_enrollment`, `pcp_change_enrollment`, `escalation`, `off_topic`, or `ambiguous_question` based on intent.

**Subagent — `Coverage Change Enrollment`:** Asks for the account and dependent details, then invokes the `Coverage_Change_Action` action (target `apex://CoverageChangeEnrollmentAction`) with inputs `accountName`, `coverageChangeType`, `dependentName`, `dependentGender`, `dependentDob`, `relationToSubscriber`, `effectiveDateOfChange`. On success it stores `account_name`, `account_id`, `coverage_change_type`, `issue_id`, and `message` in conversation variables and shows the Issue Id to the user.

**Subagent — `PCP Change Enrollment`:** Only has a label and a placeholder description ("hello this is pcp_change_enrollment description") — it has **no reasoning instructions and no actions wired up**. It's advertised in the router's menu but is currently a stub with no defined behavior; treat PCP Change as not yet implemented.

**Subagent — `Escalation`:** On an explicit request to reach a person, calls `@utils.escalate`, which routes out via the `customer_web_client` connection (`flow://Route_to_Live_Human_Agent`, `OmniChannelFlow`) with the message "One moment, I'm transferring our conversation to get you more help." If escalation fails, the agent offers to log a support case instead.

**Subagent — `Off Topic` / `Ambiguous Question`:** Redirect the conversation back to enrollment topics, refuse to answer general-knowledge questions, and carry guardrail instructions against prompt-injection and disclosure of system/config/function information.

**Apex action — `CoverageChangeEnrollmentAction.enrollCoverageChange`:** Bulk-queries `Account` by name (`SELECT Id, Name FROM Account WHERE Name IN :accountNames`) to resolve the account. For each request it validates the required fields (note: the null-checks for `dependentDob` and `effectiveDateOfChange` are currently commented out, so those two are effectively optional at runtime despite being marked required in the action schema). If the account isn't found it returns a "not found" message and skips that row; otherwise it builds and bulk-inserts a `Case` (`Subject`, `Priority = Medium`, `Origin = Web`, `Status = New`, `AccountId`, plus the custom fields below) with a randomly generated 5-digit `Issue_Id__c` (not guaranteed unique — no dedup check). It returns `accountId`, `accountName`, `coverageChangeType`, `caseNumber`, `issueId`, and a message per request; a partially-successful batch still returns per-row results.

**Routing flows:** `Route_to_Live_Human_Agent` is the escalation target — a `RoutingFlow` that calls `routeWork` (routing type `QueueBased`) to the "Messaging Queue" on the `sfdc_livemessage` channel. `Route_To_Enrollment_Service_Agent` is the inbound counterpart — a `RoutingFlow` (routing type `Copilot`) that routes work *into* this bot's own "Enrollment Service Queue".

## What's Inside This Folder

| Component | Type | Purpose |
| --- | --- | --- |
| `Enrollment_Service_Agent` | AI Authoring Bundle (`.agent`) | The agent definition: Agent Router, 5 subagents, actions, variables, and escalation connection. |
| `Enrollment_Service_Agent` | Bot / BotVersion (`v2`) | Bot shell and compiled dialogs referencing the planner bundle. |
| `Enrollment_Service_Agent_v2` | GenAI Planner Bundle | Compiled planner artifacts (agent graph + binary agent script); the `.agent` file above is the human-readable source of truth. |
| `CoverageChangeEnrollmentAction` | Apex Class | Invocable action that resolves the Account and creates the `Case` for a coverage change request. |
| `Route_To_Enrollment_Service_Agent` | Flow (RoutingFlow) | Routes inbound work to this agent's own queue. |
| `Route_to_Live_Human_Agent` | Flow (RoutingFlow) | Escalation target: routes the conversation to a live-agent queue. |
| `Case` | Standard Object (extended) | Carries the 7 custom fields used to capture a coverage change request. |
| `Enrollment_Service_Agent715879732_Permissions` | Permission Set | Grants the agent's runtime user access to the Apex class and the Account/Case/Contact objects and fields it uses. |

## Data Model

All custom fields live on the standard **Case** object — no custom objects are used.

| Field | Type | Notes |
| --- | --- | --- |
| `Coverage_Change_Type__c` | Picklist (Add Dependent, Remove Dependent) | Type of coverage change requested. |
| `Dependent_Name__c` | Text(255) | Name of the dependent being added/removed. |
| `Dependent_Gender__c` | Text(30) | Dependent's gender. |
| `Dependent_DOB__c` | Date | Dependent's date of birth. |
| `Relation_To_Subscriber__c` | Picklist (Spouse, Child) | Dependent's relationship to the subscriber. |
| `Effective_Date_of_Change__c` | Date | Effective date of the coverage change. |
| `Issue_Id__c` | Text(20) | Randomly generated 5-digit tracking number shown to the user as the "Issue Id". |

The Apex action resolves the member's `Account` by name (`SELECT Id, Name FROM Account WHERE Name IN :accountNames`) and then inserts a `Case` with `AccountId` set to the matched account plus the fields above. No `Contact` record is created or queried by this action.

## Try It Out

Once deployed and activated, start a conversation with the agent and try prompts such as:

- _I need to add my spouse as a dependent to my coverage._
- _Can you remove my child from my health plan? Account name is Acme Corp, dependent is Jane Doe, born 2015-04-02, effective 2026-08-01._
- _I want to talk to a real person._ (exercises escalation to a live agent)

A PCP-change request such as _"I want to change my primary care doctor"_ will currently land in the unfinished `PCP Change Enrollment` subagent, which has no reasoning or actions configured yet.

## Deploy

Deploy this folder to your org:

```bash
sf project deploy start -d payer_agentforce_agents/EnrollmentServiceAgent
```

Then assign the folder's permission set:

```bash
sf org assign permset --name Enrollment_Service_Agent715879732_Permissions
```

> **Note on scaffolding:** This folder still carries generic SFDX-template files (`scripts/apex/hello.apex`, `scripts/soql/account.soql`, `.vscode/launch.json`, `.husky/`, `.prettierrc`, `eslint.config.js`) that are unrelated to the agent itself and can be ignored or removed.
