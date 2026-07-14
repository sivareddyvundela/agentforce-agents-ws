# Provider Directory Maintenance Agent

An Agentforce Service Agent that helps external providers and members keep provider directory data accurate and compliant. It searches provider records, submits controlled change requests for a single field at a time, reports request status, and surfaces audit history — while enforcing that no external submission ever goes live without Provider Data Steward review.

## Table of Contents

- [Overview](#overview)
- [Key Capabilities](#key-capabilities)
- [How It Works](#how-it-works)
- [What's Inside This Folder](#whats-inside-this-folder)
- [Data Model](#data-model)
- [Try It Out](#try-it-out)
- [Deploy](#deploy)

## Overview

Health plans are required to maintain accurate, up-to-date provider directories. Wrong addresses, phone numbers, office hours, or "accepting new patients" flags create member abrasion and regulatory exposure. This agent gives providers and members a conversational channel to propose corrections, while keeping every change governed:

- Providers can request updates to their own practice information.
- Members can report that a listed detail appears incorrect (treated as an unverified report, not a confirmed fact).
- Every submission becomes a `Provider_Change_Request__c` record that flows through validation and steward approval before the underlying `Contact` (provider) record is updated.
- Every change is written to an immutable `Directory_Audit_Log__c` trail for compliance and history.

The agent never publishes directly. It never allows emergency/fast-lane publishing for external users, regardless of stated urgency.

## Key Capabilities

- **Provider lookup** by name, NPI, or Tax ID before any update or report.
- **Single-field change requests** for a controlled set of directory attributes: Address, Phone, Office Hours, Languages, Accessibility, Telehealth, or Accepting New Patients (one field per submission).
- **Member "report incorrect data"** flow that is captured for verification rather than applied as fact.
- **Request status lookup** in plain language (under review, approved and applied, not approved, published).
- **Audit history** of what changed for a provider over time, limited to publicly appropriate summary detail.
- **Duplicate awareness** — if a duplicate is flagged the agent surfaces it and does not proceed without user acknowledgment.
- **Automatic audit logging and approval application** via record-triggered background flows.

## How It Works

**Start / router agent — `Agent Router`.** The conversation begins at `agent_router`, which welcomes the user and classifies intent using the `sfdc_ai__DefaultEinsteinHyperClassifier` model, then transitions to the single subagent below.

**Subagent — `Provider Directory Management`.** Handles all provider update and report interactions. Its reasoning rules enforce the governance model:

- Always confirm the exact old value and new value with the user before submitting.
- Always ask the external user for their name; if a provider is updating their own record, confirm they speak on behalf of that provider.
- Never allow emergency or fast-lane publishing for any external user — all external submissions route to Provider Data Steward review.
- Treat member submissions as reports to be verified, never as confirmed directory updates.
- Never state a change is live until its status is `Published`.
- Only use data returned by the actions — never fabricate provider information.

**Actions exposed to the subagent** (each backed by a Flow):

1. `SearchProviderByIdentifier` — always called first; finds the provider and returns a record summary. Its result supplies the `ProviderId` and current field values used later.
2. `SubmitProviderChangeRequestUpdatedFlow` — creates one change request for one field; `OldValue` is taken from the retrieved record (not asked of the user), `IsEmergency` is always false for external users. Returns a change-request reference ID.
3. `ProviderChangeRequestStatus` (Flow `NewChangeRequestStatus`) — returns a plain-language status summary for a submitted request.
4. `GetAuditHistory` — returns publicly appropriate change history for a provider.

**Change-request + audit lifecycle.** A submission creates a `Provider_Change_Request__c` in `Draft`, moving through `Pending Validation → Pending Approval → Approved / Rejected → Published` (with `Emergency-Published` reserved for internal, non-external use). Two record-triggered background flows govern the outcome:

- `Provider_Approval_Checking_Flow` — triggers on `Provider_Change_Request__c` update; once approved, applies the requested value to the correct `Contact` field based on which directory attribute was changed (Address, Phone, Office Hours, Languages, Accessibility, Telehealth, or Accepting New Patients).
- `DirectoryAuditLogRecordTriggerFlow` — triggers on `Provider_Change_Request__c` create/update and writes a `Directory_Audit_Log__c` entry capturing the field, old/new values, requester, and timestamp.
- `SubmitEmergencyChangeRequest` — triggers on `Provider_Change_Request__c` create/update to raise a follow-up `Task` for internal handling of emergency-flagged requests.

## What's Inside This Folder

| Component | Type | Purpose |
| --- | --- | --- |
| `DheerajServiceAgentProviderDirectoryMaintainance` | Agent blueprint (aiAuthoringBundle) | The real agent: router, `Provider Directory Management` subagent, reasoning rules, actions, and variables |
| `SearchProviderByIdentifier` | Flow (autolaunched) | Finds a provider by name, NPI, or Tax ID and returns a record summary |
| `SubmitProviderChangeRequestUpdatedFlow` | Flow (autolaunched) | Creates a single-field `Provider_Change_Request__c` and returns its reference ID |
| `NewChangeRequestStatus` | Flow (autolaunched) | Returns a plain-language status summary for a submitted change request |
| `GetAuditHistory` | Flow (autolaunched) | Retrieves publicly appropriate change history for a provider |
| `Provider_Approval_Checking_Flow` | Flow (record-triggered on `Provider_Change_Request__c` update) | On approval, applies the change to the matching `Contact` directory field |
| `DirectoryAuditLogRecordTriggerFlow` | Flow (record-triggered on `Provider_Change_Request__c` create/update) | Writes a `Directory_Audit_Log__c` entry for each change |
| `SubmitEmergencyChangeRequest` | Flow (record-triggered on `Provider_Change_Request__c` create/update) | Creates a follow-up `Task` for emergency-flagged requests |
| `Provider_Change_Request__c` | Custom object | The governed change-request record and its lifecycle status |
| `Directory_Audit_Log__c` | Custom object | Immutable audit trail of applied/attempted directory changes |
| `Contact` | Standard object (extended) | The provider record, with directory fields such as `NPI__c`, `Office_Hours_Summary__c`, `Telehealth_Available__c`, `Accessibility_Features__c`, and `Directory_Last_verified_Date__c` |
| `AFDX_Agent_Perms` | Permission set group | Permissions required by the Agentforce service agent runtime |
| `AFDX_User_Perms` | Permission set group | Permissions required by AFDX admin users |

**Template scaffolding (not part of this agent):** this folder was scaffolded from a Salesforce starter template and still contains unrelated leftover files — `CheckWeather.cls`, `CurrentDate.cls`, `WeatherService.cls` (and their tests), the `Local_Info_Agent` bundle, the `Get_Resort_Hours` flow, the `Get_Event_Info` prompt template, and the `Resort_Admin` / `Resort_Agent` permission sets. These can be removed and are not referenced by the Provider Directory Maintenance agent.

## Data Model

**`Provider_Change_Request__c`** — one record per requested change to a single provider field. Key fields:

- `Provider__c` (Lookup → `Contact`) — the provider being changed.
- `Field_Being_Changed__c`, `Old_Value__c`, `New_Value__c` — the proposed edit.
- `Status__c` (picklist: `Draft`, `Pending Validation`, `Pending Approval`, `Approved`, `Rejected`, `Published`, `Emergency-Published`; defaults to `Draft`).
- `Submitter_Name__c`, `Requested_By__c`, `Requested_Date__c` — provenance.
- `Is_Emergency__c`, `Emergency_Justification__c` — internal emergency handling (not available externally).
- `Duplicate_Check_Result__c`, `Duplicate_Match__c`, `External_Validation_Result__c`, `Validation_Source__c` — validation outcomes.
- `Approver__c`, `Approval_Date__c`, `Rejection_Reason__c` — approval decision.

**`Directory_Audit_Log__c`** — the immutable history trail. Key fields:

- `Change_Request__c` (Lookup → `Provider_Change_Request__c`) — the originating request.
- `Provider__c` (Lookup → `Contact`) — the provider affected.
- `Action__c`, `Field_Changed__c`, `Old_Value__c`, `New_Value__c` — what happened.
- `Requested_By__c`, `Approved_By__c`, `TimeStamp__c` — who and when.

**`Contact`** — represents the provider whose directory listing is maintained. Directory-relevant custom fields include `NPI__c`, `Accessibility_Features__c`, `Office_Hours_Summary__c`, `Telehealth_Available__c`, `Directory_Last_verified_Date__c`, and `vlocity_ins__ProviderIsAcceptingNewPatients__c`.

**Relationships:** A `Contact` (provider) can have many `Provider_Change_Request__c` records (via `Provider__c`). Each `Provider_Change_Request__c` can generate one or more `Directory_Audit_Log__c` entries (via `Change_Request__c`), which also link back to the provider `Contact` (via `Provider__c`). Approved change requests write their new value onto the corresponding `Contact` field.

## Try It Out

- "I'm Dr. Lee's office manager. Can you update the phone number for Dr. Anita Lee, NPI 1234567890?"
- "I'm a member — the address listed for City Health Clinic looks wrong; it should be 200 Main St, Suite 4."
- "What's the status of the change request I submitted earlier?"
- "Can you show me what has changed for Dr. Anita Lee's listing recently?"

## Deploy

Deploy this folder to your org:

```bash
sf project deploy start -d force-app/main/ProviderNetworkAgents/ProviderAgents/ProviderDirectoryMaintananceAgent
```

Then assign this folder's two permission set groups to the appropriate users:

```bash
sf org assign permset --name AFDX_Agent_Perms
sf org assign permset --name AFDX_User_Perms
```

Assign `AFDX_Agent_Perms` to the Agentforce service-agent runtime user and `AFDX_User_Perms` to the admin/builder who manages the agent. Assigning these groups grants all bundled object, field, Apex, and flow access, so individual objects and classes do not need to be assigned separately. (The `Resort_Admin` / `Resort_Agent` permission sets are leftover template scaffolding and are not required.)
