# Provider Enrollment Agent

An Agentforce Employee Agent that helps enroll healthcare providers into the network. When a user starts a conversation, the agent immediately renders a custom enrollment form, collects the provider's demographic details plus a supporting document, and creates an `Enrollment__c` record in Salesforce.

## Table of Contents

- [Overview](#overview)
- [Key Capabilities](#key-capabilities)
- [How It Works](#how-it-works)
- [What's Inside This Folder](#whats-inside-this-folder)
- [Data Model](#data-model)
- [Try It Out](#try-it-out)
- [Deploy](#deploy)

## Overview

**Purpose:** Streamline onboarding of new healthcare providers by capturing their demographic and credentialing information (name, contact details, NPI number, license number, specialty, and network) along with a supporting document, then persisting the submission as a new `Enrollment__c` record and confirming success to the user.

The real agent in this folder is the **`Enrollment_agent_Simran`** bundle (bot version `v18`). It is built on the `EmployeeCopilot__AgentforceEmployeeAgent` template (agent type `AgentforceEmployeeAgent`, planner type `Atlas__ConcurrentMultiAgentOrchestration`) and is designed to run inside Agentforce agent windows in the flow of work.

## Key Capabilities

- Immediately presents a custom enrollment form (the `enrollmentSubmission` Lightning Web Component, master label "Enrollment Submission") on conversation start, without greeting or prompting the user for fields conversationally.
- Collects provider demographics: First Name, Last Name, Phone, Email, NPI Number, License Number, Specialist (picklist), and Network.
- Accepts an uploaded supporting document (PDF, PNG, or JPEG, up to ~4.5 MB).
- Creates an `Enrollment__c` record from the submitted data via an Apex invocable action.
- Attaches the uploaded document to the newly created enrollment record.
- Returns a confirmation message back to the user once the enrollment is submitted.

## How It Works

**Start agent — `Agent Router`:** The conversation begins at the `agent_router` start agent, which uses the classifier model `model://sfdc_ai__DefaultEinsteinHyperClassifier` and transitions straight to the `Provider_demographics_check` subagent.

**Subagent — `Provider demographics check`:** Its instructions direct it to immediately invoke the enrollment action and render the custom form — no greeting, no field explanations, no questions — then wait for the user to submit the form before continuing.

**Action — `Enrollment_Creation`:** The subagent calls the `Enrollment_Creation` action, which targets `apex://EnrollmentCreationService`. The action takes a single required, user-input input, `enrollmentData`, typed as the complex data type `c__newui`, and returns `enrollmentRecordId`, `isSuccess`, and `message` outputs.

**Custom input UI — `enrollmentSubmission` LWC:** The `newui` lightning type is rendered by the `enrollmentSubmission` Lightning Web Component, exposed to the `lightning__AgentforceInput` target. The component builds a form for all provider fields, offers a specialist combobox (Cardiology, Dermatology, Family Medicine, Internal Medicine, Neurology, Orthopedics, Pediatrics, Psychiatry — hardcoded, with a `// TODO: replace with actual picklist values` comment in the source), and provides a file upload. On file selection it enforces a 4,500,000-byte limit and reads the file via `FileReader.readAsDataURL`, stripping the data-URI prefix. It then emits the field values plus the document through a `valuechange` event.

**Apex action — `EnrollmentCreationService`:** The `@InvocableMethod` `createEnrollment` (label "Create Provider Enrollment Record") maps the submitted fields onto a new `Enrollment__c` record (`First_Name__c`, `Last_Name__c`, `Phone__c`, `Email__c`, `NPI_Number__c`, `License_Number__c`, `Speciality__c`, `Network__c`) and bulk-inserts with partial-success allowed (`Database.insert(..., false)`). On success, if a document was supplied it calls `attachDocument`, which creates a `ContentVersion` (base64-decoded) with `FirstPublishLocationId` set to the enrollment record so the `ContentDocumentLink` is created automatically; a failed attachment downgrades to a partial-success message rather than rolling back the Enrollment record. Results are returned as a list of `ProviderEnrollmentResult` (`isSuccess`, `enrollmentRecordId`, `message`).

> **Known issues to be aware of when testing:** In `enrollmentSubmission.js`, after the file is read and base64-decoded, the component currently assigns the literal string `"Test"` to `documentBase64` instead of the computed value — so the document content actually sent to Apex is not the real file bytes. Separately, `EnrollmentCreationService` sets `result.enrollmentRecordId = ''` on the success path rather than the newly inserted record's Id, so the agent currently only receives a real Id back on failure (`null`). Both are worth fixing before relying on document capture or the returned record Id in production.

## What's Inside This Folder

| Component | Type | Purpose |
| --- | --- | --- |
| `Enrollment_agent_Simran` | AI Authoring Bundle (`.agent`) | The Provider Enrollment agent definition: Agent Router start agent, `Provider_demographics_check` subagent, and the `Enrollment_Creation` action. |
| `Enrollment_agent_Simran` | Bot / BotVersion (`v18`) | Bot shell and compiled dialogs referencing the planner bundle. |
| `Enrollment_agent_Simran_v18` | GenAI Planner Bundle | Compiled planner artifacts; the `.agent` file above is the human-readable source of truth. |
| `EnrollmentCreationService` | Apex Class | Invocable action that creates the `Enrollment__c` record and attaches the uploaded document. |
| `EnrollmentLightningTypesInput` | Apex Class | Defines the `EnrollmentInputFields` input type used by the action and LWC. |
| `ProviderEnrollmentResult` | Apex Class | Output type returned by the action (`isSuccess`, `enrollmentRecordId`, `message`). |
| `newui` | Lightning Type Bundle | Maps the `c__newui` complex type to the `enrollmentSubmission` LWC as its input editor. |
| `enrollmentSubmission` | Lightning Web Component | "Enrollment Submission" form rendered as the agent input; captures provider details and document upload. |
| `Enrollment__c` | Custom Object | Stores submitted enrollment records (auto-numbered `BE-{000000}`). |

## Data Model

**`Enrollment__c`** — Custom object (label "Enrollment", plural "Enrollments"), records named by AutoNumber format `BE-{000000}`.

Fields written or used by the enrollment flow:

| Field | Type | Notes |
| --- | --- | --- |
| `First_Name__c` | Text(80) | Required. Provider first name. |
| `Last_name__c` | Text(80) | Required. Provider last name. |
| `Email__c` | Text(80) | Required. Provider email. |
| `Phone__c` | Number(10,0) | Provider phone. |
| `NPI_Number__c` | Text(10) | Required. National Provider Identifier. |
| `License_Number__c` | Text(10) | Required. Provider license number. |
| `Speciality__c` | Text(20) | Required. Provider specialty (set from the form's Specialist picklist). |
| `Network__c` | Text(100) | Provider network. |
| `Status__c` | Picklist | Restricted: New, Processing, Payment Processing, Finish Application, Completed. Field history tracked. Not populated by the current Apex action. |
| `Plan_Level__c` | Picklist | Restricted: Bronze Plan, Silver Plan, Gold Plan. Not populated by the current Apex action. |
| `Plan_Name__c` | Text(255) | Plan name. Not populated by the current Apex action. |
| `Applicant_Name__c` | Lookup(Account) | Related applicant account. Not populated by the current Apex action. |
| `Broker__c` | Lookup(Contact) | Related broker contact. Not populated by the current Apex action. |
| `Prospect_Name__c` | Lookup(Contact) | Related prospect contact. Not populated by the current Apex action. |
| `UCIN_External_ID__c` | Text(18), External ID, Unique | Cross-system external ID for integration tracking. |

Uploaded documents are stored as standard Salesforce Files (`ContentVersion`/`ContentDocument`) linked to the enrollment record via `FirstPublishLocationId`. The Apex action currently maps First Name, Last Name, Phone, Email, NPI Number, License Number, Speciality, and Network from the form; the remaining fields above are available on the object for downstream processing.

## Try It Out

Open the agent in an Agentforce window and start a conversation. The enrollment form appears immediately. Example prompts:

- _I need to enroll a new provider._
- _Start a provider enrollment._
- _I'd like to submit an enrollment application for Dr. Jane Smith, Cardiology, NPI 1234567890._
- _Enroll me as a provider and I'll attach my license document._

After you submit the form, the agent creates the `Enrollment__c` record, attaches the document, and returns a confirmation message.

## Deploy

Deploy this folder to your org:

```bash
sf project deploy start -d payer_agentforce_agents/ProviderEnrollmentAgent
```

> **Note on permissions:** This folder does not include a permission set or permission set group. Grant the deploying/agent user access to the `Enrollment__c` object and its fields, the `EnrollmentCreationService`/`EnrollmentLightningTypesInput`/`ProviderEnrollmentResult` Apex classes, and the `enrollmentSubmission` LWC surface manually, or via your org's standard admin/agent permission sets.
