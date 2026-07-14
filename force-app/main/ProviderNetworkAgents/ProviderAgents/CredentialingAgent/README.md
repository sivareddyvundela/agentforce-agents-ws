# Credentialing Agent

An Agentforce employee agent that helps credentialing and provider-services teams track and manage healthcare provider credentialing — surfacing credential status, generating case summaries, and identifying (and chasing) missing documents in plain language, always grounded in Salesforce data.

## Table of Contents

- [Overview](#overview)
- [Key Capabilities](#key-capabilities)
- [How It Works](#how-it-works)
- [What's Inside This Folder](#whats-inside-this-folder)
- [Data Model](#data-model)
- [Try It Out](#try-it-out)
- [Deploy](#deploy)

## Overview

**Purpose:** Give Credentialing Specialists, Provider Services Representatives, and Provider Relations Representatives a conversational way to inquire about the credentialing lifecycle without navigating records manually. The agent summarizes credentialing cases, explains what a given status or stage means, identifies outstanding documents, and automatically sends the provider a reminder email when documents are missing.

The agent is defined in the `Credentialing_Agent_Sai_Advaitha` authoring bundle (label: *Credentialing Agent - Sai Advaitha*), built on the `EmployeeCopilot__AgentforceEmployeeAgent` template. It is instructed to always use Salesforce data, never invent information, never return a blank response, and to clearly tell the user when information is unavailable.

## Key Capabilities

- **Case summarization** — Retrieves a consolidated credentialing summary for a provider, including provider name, NPI, current stage, credentialing status, committee review date, expected completion date, and pending documents.
- **Status explanation** — Translates the current credentialing status and stage (Verification, Committee Review, Approved, Rejected, and other statuses) into plain-language explanations for the user.
- **Missing document identification** — Determines which required credentialing documents have not yet been uploaded, returns the list and a count, and reports whether all documents have already been submitted.
- **Automated reminders** — When missing documents are found, automatically emails the provider a reminder listing the outstanding documents and the expected submission date, and confirms to the user that the reminder was sent.
- **Committee review and completion dates** — Provides scheduled committee review dates and expected completion dates.
- **Approval / rejection outcomes** — Explains why a case was approved or could not be approved.

## How It Works

**Start / router agent — `Agent Router`.** The agent opens with a welcome message and routes each request. Its classifier uses the `sfdc_ai__DefaultEinsteinHyperClassifier` model to select the best tool based on conversation history and user intent, then transitions to the credentialing subagent.

**Subagent — `Case Summarization`.** This subagent handles all provider credentialing requests and, based on the user's intent, invokes one of three flow-backed actions. Its reasoning rules include:

- Invoke **Get Credentialing Summary** for case summaries, case details, or overall case status.
- Invoke **Explain Credential Status** when the user asks what a status/stage means (e.g., Verification, Pending Review, Committee Review, Approved, Rejected).
- Invoke **Missing Document Identification** when the user asks about missing, pending, outstanding, or required documents — including how many are missing.
- Never return blank output; if no record is found, respond that no matching records were found and ask the user to verify the Credential ID.
- Keep responses concise and professional, without exposing internal flows or system processing.

Each action targets an autolaunched Flow. The status and missing-document actions accept the credential identifier (the `Credential__c` auto-number `Name`, format `CR-{000000}`) as input; the summary flow instead looks the provider up by NPI.

## What's Inside This Folder

| Component | Type | Purpose |
|-----------|------|---------|
| `Credentialing_Agent_Sai_Advaitha` | Agentforce authoring bundle (`.agent`) | The agent definition: `Agent Router` start agent, `Case Summarization` subagent, and its three actions. |
| `Get_Credentialing_Summary` | Flow (autolaunched) | Looks up the `HealthcareProvider` by NPI, gathers related `Credential__c` and `Credentialing_Document__c` records, and returns a summary (provider name, NPI, stage, status, committee date, expected date, missing docs). *(Status: Draft.)* |
| `Get_Credential_Status` | Flow (autolaunched) | Loads the `Credential__c` record by Name and returns a plain-language `statusExplanation` based on status + stage (Verification, Committee Review, Approved, Rejected, or a default). *(Status: Active.)* |
| `Identify_Missing_Documents` | Flow (autolaunched) | Loads the credential and its `Credentialing_Document__c` records, checks each for an uploaded `ContentDocumentLink`, builds the missing-document list and count, and sends the provider a reminder email when any are missing. *(Status: Active.)* |
| `Credential__c` | Custom Object | Tracks the credentialing lifecycle for a provider. |
| `Credentialing_Document__c` | Custom Object | Tracks individual credentialing documents and their status. |
| `AFDX_Agent_Perms` | Permission Set Group | Runtime perms for the Agentforce service agent (bundles `force__AgentforceServiceAgentBase`, `force__AgentforceServiceAgentUser`, `force__EinsteinGPTPromptTemplateUser`). |
| `AFDX_User_Perms` | Permission Set Group | Perms for AFDX admin / builder users (bundles `force__AgentforceServiceAgentBuilder`, `force__CopilotSalesforceAdmin` / `User`, `force__EinsteinGPTPromptTemplateManager` / `User`). |

> **Scaffolding note:** This folder was scaffolded from a template and still contains leftover, unrelated sample files that are **not** part of the Credentialing Agent — a second `Local_Info_Agent` authoring bundle, the `CheckWeather`, `CurrentDate`, and `WeatherService` Apex classes (and their tests), the `Get_Event_Info` prompt template, and the `Resort_Agent` / `Resort_Admin` permission sets (referenced by the permission set groups above). These can be removed once the agent is finalized.

## Data Model

**`Credential__c`** (label *Credential*, name format `CR-{000000}`, description "Tracks credentialing lifecycle.") holds one credentialing case per provider. Key fields:

| Field | Type | Notes |
|-------|------|-------|
| `Healthcare_Provider__c` | Lookup → `HealthcareProvider` | The provider being credentialed (relationship: *Credentials*). |
| `Credentialing_Status__c` | Text | e.g., In Progress, Approved, Rejected, Pending. |
| `Current_Stage__c` | Text | e.g., Verification, Committee Review. |
| `Application_Date__c` | Date | When the application was submitted. |
| `Committee_Review_Date__c` | Date | Scheduled committee review date. |
| `Expected_Completion__c` | Date | Anticipated completion date. |
| `Assigned_Analyst__c` | Text | Analyst handling the case. |
| `Rejection_Reason__c` | Long Text Area | Explanation captured when a case is rejected. |

**`Credentialing_Document__c`** (label *Credentialing Document*) tracks each required document. Key fields:

| Field | Type | Notes |
|-------|------|-------|
| `Credentialing__c` | Lookup → `Credential__c` | Parent credential (relationship: *Credentialing Documents*). |
| `Status__c` | Picklist (restricted) | Missing, Submitted, Pending Review, Approved, Rejected. |

**Relationships:** A `HealthcareProvider` has one or more `Credential__c` records; each `Credential__c` has one or more related `Credentialing_Document__c` records. The missing-document logic further checks whether each `Credentialing_Document__c` has an associated `ContentDocumentLink` (uploaded file) to decide whether it is still outstanding.

## Try It Out

Sample prompts once the agent is deployed and connected to a channel:

- "Summarize credentialing case CR-000123."
- "What does the current status mean for credential CR-000123?"
- "What documents are missing for credential CR-000123?"
- "How many documents are still outstanding for CR-000123, and send the provider a reminder."

## Deploy

Deploy this agent folder to your org:

```bash
sf project deploy start -d force-app/main/ProviderNetworkAgents/ProviderAgents/CredentialingAgent
```

Then assign the folder's two permission set groups:

```bash
# Agentforce runtime / service-agent user
sf org assign permset --name AFDX_Agent_Perms

# Admin / builder
sf org assign permset --name AFDX_User_Perms
```

Assigning these groups grants all bundled object, field, Apex, and flow access, so individual objects and classes do not need to be assigned separately. After deployment, verify that the `Get_Credentialing_Summary` flow (currently *Draft*) is activated before relying on case summaries in production.
