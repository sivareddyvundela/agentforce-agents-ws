# Credentialing Status Agent

An Agentforce Employee Agent for healthcare payer credentialing teams that summarizes a provider's credentialing case, explains what the current status/stage means in plain language, identifies missing documents, and automatically emails the provider a reminder when documents are outstanding.

## Table of Contents

- [Overview](#overview)
- [Key Capabilities](#key-capabilities)
- [How It Works](#how-it-works)
- [What's Inside This Folder](#whats-inside-this-folder)
- [Data Model](#data-model)
- [Try It Out](#try-it-out)
- [Deploy](#deploy)

## Overview

**Purpose:** Credentialing specialists, provider services representatives, and provider relations representatives spend a lot of time answering the same questions about a provider's credentialing case — "Where does this case stand?", "What does 'Committee Review' actually mean?", "What's still missing before we can approve this?" This agent gives those internal users a single conversational entry point: give it a Credential record's Name (its `CR-######` identifier), and it pulls the case summary, explains the current status/stage, and checks for missing documents — firing off a reminder email to the provider automatically when documents are still outstanding.

The real agent in this folder is the **`Credentialing_Agent`** bundle (Agent Script / Agent DSL authoring format, `bundleType: AGENT`, target `Credentialing_Agent.v1`). It is built on the `EmployeeCopilot__AgentforceEmployeeAgent` template (agent type `AgentforceEmployeeAgent`, bot `type=InternalCopilot`), bot version `v1`, planner `Credentialing_Agent_v1`, locale `en_US` with `en_GB` as an additional locale.

## Key Capabilities

- **Case summarization** — given a Credential record, returns the current stage, status, committee review date, expected completion date, missing-document list, and the associated provider's name and NPI in one pass.
- **Plain-language status explanation** — translates the raw `Credentialing_Status__c`/`Current_Stage__c` combination (Verification, Committee Review, Approved, Rejected, or any other status) into a short, human-readable explanation.
- **Missing document identification with automatic reminders** — checks every credentialing document tied to the case for an attached file and, if any are missing, counts them, lists them, and automatically emails the provider a reminder; if nothing is missing, it says so without sending an email.
- **Always grounded in Salesforce data** — the agent's instructions explicitly forbid inventing information and require it to say so plainly when data isn't available.

## How It Works

**Start agent — `Agent Router`:** Uses the classifier model `model://sfdc_ai__DefaultEinsteinHyperClassifier` and transitions to the single `Case_Summarization` subagent (`go_to_Case_Summarization: @utils.transition to @subagent.Case_Summarization`) based on the user's intent.

**Subagent — `Case_Summarization`:** Its reasoning instructions map user phrasing to one of three actions, all keyed on a `credentialId` input (the Credential record's `CR-######` Name):
- **"Get Credentialing Summary"** for requests like "case summary", "credentialing case details", "show case", "summarize case", or "status of a credentialing case."
- **"Explain Credential Status"** only for explicit explanation requests such as "What does this status mean?", "Explain Verification", "Explain Committee Review", "Explain Approved", "Explain Rejected."
- **"Missing Document Identification"** for requests about missing, pending, outstanding, or required documents (e.g., "What documents are missing?", "Show pending documents"). The instructions call out that identifying missing documents automatically triggers a reminder email, and the agent's response must state that the email was sent.

If no matching Credential record is found, the agent is instructed to say so politely and ask the user to verify the Credential ID, and to never return a blank response.

**Action — `Get_Credentialing_Summary`** (target `flow://Get_Credentialing_Summary`): An `AutoLaunchedFlow` that:
1. Looks up `Credential__c` where `Name = credentialId` (first record only).
2. Looks up the related `HealthcareProvider` via `Get_Credential_Records.Healthcare_Provider__c`.
3. Looks up all `Credentialing_Document__c` records where `Credentialing__c = Get_Credential_Records.Id` and `Status__c = "Missing"`.
4. Loops over the missing documents, appending each one's `Name` plus a `;` separator into a running `MissingDocuments` text variable.
5. Assigns the final outputs: `SummaryStage` (`Current_Stage__c`), `SummaryStatus` (`Credentialing_Status__c`), `SummaryCommitteeDate` (`Committee_Review_Date__c`), `SummaryExpectedDate` (`Expected_Completion__c`), `SummaryMissingDoc` (the built list), `SummaryProviderName` (provider `Name`), and `SummaryNPI` (provider `NPI__c`).

**Action — `Explaining_Credentialing_Status`** (target `flow://Get_Credential_Status`): An `AutoLaunchedFlow` that looks up `Credential__c` by `Name = credentialId`, then a decision (`Determine_Status_explanation`) picks a canned `statusExplanation` string:
- `Credentialing_Status__c = "In Progress"` AND `Current_Stage__c = "Verification"` → *"Provider is currently in the Verification stage and credentialing remains in progress. Required reviews are being completed before the case can move to committee review."*
- `Credentialing_Status__c = "In Progress"` AND `Current_Stage__c = "Committe Review"` (stage value is spelled this way in the flow) → *"The provider's credentialing application is currently in the Committee Review stage and remains in progress. Verification activities have been completed, and the case is awaiting final review and decision by the credentialing committee."*
- `Credentialing_Status__c = "Approved"` → *"Credentialing activities have been completed successfully and the provider has been approved."*
- `Credentialing_Status__c = "Rejected"` → *"The credentialing request could not be approved because one or more requirements were not satisfied."*
- Default (any other status) → *"Current credentialing status information is available but no specific explanation has been configured for this status."*

**Action — `Identifying_the_missing_documents`** (target `flow://Identify_Missing_Documents`): An `AutoLaunchedFlow` that:
1. Looks up `Credential__c` by `Name = credentialId`, then all related `Credentialing_Document__c` records (`Credentialing__c` lookup).
2. Loops over each document, looking up a `ContentDocumentLink` where `LinkedEntityId` equals the document's Id (i.e., checking whether a file is actually attached).
3. If a link is found, the document is treated as present and the loop continues; if none is found, `missingCount` is incremented and the document's `Name` plus `;` is appended to `missingDocumentList`.
4. After the loop, if `missingCount > 0`, it builds `missingDocumentResponse` ("The following documents are missing: {missingDocumentList}") and invokes the `emailSimple` action (`Send_Reminder_Email`) to email the provider (`Healthcare_Provider__r.Email__c`) with subject "Credential Document Reminder" and a body built from the `EmailTemplate` text template — addressed to the provider by name, listing the missing documents, quoting the `Expected_Completion__c` date, and signed "Credentialing Team."
5. If `missingCount` is still 0, it sets `missingDocumentResponse` to "No missing documents were found. All required documents have been submitted" and does **not** send an email.

## What's Inside This Folder

| Component | Type | Purpose |
| --- | --- | --- |
| `Credentialing_Agent` | AI Authoring Bundle (`.agent`) | The agent definition: Agent Router and the `Case_Summarization` subagent with its three flow-backed actions. |
| `Credentialing_Agent` | Bot / BotVersion (`v1`) | Bot shell (`InternalCopilot`, `EmployeeCopilot__AgentforceEmployeeAgent` template) referencing planner `Credentialing_Agent_v1`. |
| `Get_Credentialing_Summary` | Flow (AutoLaunchedFlow) | Assembles the case summary: stage, status, committee/expected dates, missing-document list, provider name and NPI. |
| `Get_Credential_Status` | Flow (AutoLaunchedFlow) | Maps status/stage to a plain-language explanation. |
| `Identify_Missing_Documents` | Flow (AutoLaunchedFlow) | Checks each credentialing document for an attached file, counts/lists what's missing, and emails the provider a reminder when needed. |
| `Credential__c` | Custom Object | The credentialing case record (autonumber `CR-{000000}`). |
| `Credentialing_Document__c` | Custom Object | Individual document requirements tied to a credentialing case, with a submission `Status__c`. |
| `Credential__c-Credential Layout` | Layout | Page layout for `Credential__c`. |
| `Credentialing_Document__c-Credentialing Document Layout` | Layout | Page layout for `Credentialing_Document__c`. |
| `Credential__c` / `Credentialing_Document__c` | Custom Tabs | Tabs exposing both objects in the app. |

> **Note on gaps versus sibling agents:** Unlike `ProviderNetworkSupportAgent` and `ProviderContractEnquiryAgent`, this folder ships **no Apex classes**, **no GenAI Functions**, **no permission set**, and **no compiled GenAI Planner Bundle** — the `classes`, `genAiPromptTemplates`, `permissionsets`, `permissionsetgroups`, and `genAiPlannerBundles` directories all exist under `force-app/main/default` but are empty. The planner referenced by the bot (`Credentialing_Agent_v1`) is expected to be generated/published from the org rather than deployed as source. There is no unrelated "Local Info Agent" scaffolding left in this folder (that generic boilerplate has been fully replaced), but note that `manifest/package.xml` still lists the `AiAuthoringBundle` member as `Credentialing_Agent_1`, which does not exist anywhere in this repo — the actual bundle's developer name is `Credentialing_Agent`. Treat the manifest as stale/incorrect and deploy by source path (see [Deploy](#deploy)) rather than by that package manifest.

## Data Model

- **`Credential__c`** — the credentialing case. Autonumber `CR-{000000}`. Fields: `Credentialing_Status__c` (Text), `Current_Stage__c` (Text), `Application_Date__c` (Date), `Committee_Review_Date__c` (Date), `Expected_Completion__c` (Date), `Assigned_Analyst__c` (Text), `Rejection_Reason__c` (Long Text Area), and `Healthcare_Provider__c` (Lookup to the standard `HealthcareProvider` object, relationship name `Credentials`).
- **`Credentialing_Document__c`** — a single document requirement for a case. Name is a plain Text field ("Document Name"), not an autonumber. Fields: `Credentialing__c` (Lookup to `Credential__c`, relationship name `Credentialing_Documents`) and `Status__c` (Picklist: Missing, Submitted, Pending Review, Approved, Rejected).
- The flows also read the standard **`ContentDocumentLink`** object (`LinkedEntityId`) to determine whether a `Credentialing_Document__c` record actually has a file attached — a link found means the document is present; none found means it's missing.

```
HealthcareProvider
└─ Credential__c                  (Healthcare_Provider__c lookup)
   └─ Credentialing_Document__c   (Credentialing__c lookup)
      └─ ContentDocumentLink      (LinkedEntityId — checks for an attached file)
```

## Try It Out

Once deployed and activated, start a conversation with the agent and try prompts such as:

- _Can you summarize credentialing case CR-000045?_
- _What does the Committee Review status mean for this case?_
- _What documents are still missing for CR-000045?_
- _Show me the current credentialing status for CR-000012._

## Deploy

Deploy this agent folder to an authorized org:

```bash
sf project deploy start -d payer_agentforce_agents/CredentialingStatusAgent
```

> **Note on permissions:** This folder does **not** ship its own permission set or permission set group (the `permissionsets`/`permissionsetgroups` directories are present but empty). Grant the Agentforce agent user access to the `Credential__c` and `Credentialing_Document__c` objects/fields (and the standard `HealthcareProvider` and `ContentDocumentLink` objects the flows read) through whatever org-level Agentforce agent permission set group is used to administer agent access in your org.

After deploying:

- Confirm the `Credentialing_Agent` bot compiles/publishes its `Credentialing_Agent_v1` planner in the org (no planner bundle is included as source in this folder).
- Ensure the agent's runtime user can send email (for the `Send_Reminder_Email` action in `Identify_Missing_Documents`) and has visibility to any `HealthcareProvider` records and their `Email__c` field.
- Ignore or fix `manifest/package.xml` before using it for a metadata-API deploy — it references a nonexistent `Credentialing_Agent_1` bundle member instead of the actual `Credentialing_Agent` bundle.
- Activate the agent and test it in the Agent preview or an internal Agentforce (Employee Agent) deployment.
