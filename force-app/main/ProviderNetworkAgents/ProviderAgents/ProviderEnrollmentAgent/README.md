# Provider Enrollment Agent

An Agentforce Employee Agent that helps enroll healthcare providers into the network. When a user starts a conversation, the agent immediately renders a custom enrollment form, collects the provider's demographic and credentialing details plus a supporting document, and creates an `Enrollment__c` record in Salesforce.

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

The real agent in this folder is the **`Enrollment_agent_Simran`** bundle. It is built on the `EmployeeCopilot__AgentforceEmployeeAgent` template (agent type `AgentforceEmployeeAgent`) and is designed to run inside Agentforce agent windows in the flow of work.

## Key Capabilities

- Immediately presents a custom **Enrollment Details** form (the `providerEnrollment` Lightning Web Component) on conversation start, without greeting or prompting the user for fields conversationally.
- Collects provider demographics: First Name, Last Name, Phone, Email, NPI Number, License Number, Specialist (picklist), and Network.
- Accepts an uploaded supporting document (PDF or PNG, up to ~4.5 MB) as base64 content.
- Creates an `Enrollment__c` record from the submitted data via an Apex invocable action.
- Attaches the uploaded document to the newly created enrollment record.
- Returns a confirmation message (and record outcome) back to the user once the enrollment is submitted.

## How It Works

**Start agent — `Agent Router`:** The conversation begins at the `agent_router` start agent, which welcomes the user and routes to the appropriate subagent based on intent. It uses the classifier model `model://sfdc_ai__DefaultEinsteinHyperClassifier` and transitions to the `Provider_demographics_check` subagent.

**Subagent — `Provider demographics check`:** This subagent handles new enrollment requests. Its instructions direct it to immediately invoke the enrollment action and render the custom form (no greeting, no field explanations, no questions), then wait for the user to submit the form before continuing.

**Action — `Enrollment Creation`:** The subagent calls the `Enrollment_Creation` action, which targets `apex://EnrollmentCreationService`. The action takes a single required input, `enrollmentData`, typed as the complex data type `c__Enrollment_Details_Input`, and returns `enrollmentRecordId`, `isSuccess`, and `message` outputs.

**Custom input UI — `providerEnrollment` LWC:** The `Enrollment_Details_Input` complex type is rendered by the `providerEnrollment` Lightning Web Component (master label "Enrollment Submission"), which is exposed to the `lightning__AgentforceInput` target. The component builds a Lightning form for all provider fields, offers a specialist combobox (Cardiology, Dermatology, Family Medicine, Internal Medicine, Neurology, Orthopedics, Pediatrics, Psychiatry), and provides a file upload. On file selection it enforces the ~4.5 MB limit, strips the data-URI prefix, and emits the field values plus the base64 document through a `valuechange` event.

**Apex action — `EnrollmentCreationService`:** The `@InvocableMethod` `createEnrollment` (label "Create Provider Enrollment Record") maps the submitted `EnrollmentLightningTypesInput.EnrollmentInputFields` onto a new `Enrollment__c` record (First Name, Last Name, Phone, Email, NPI Number, License Number, Speciality, Network) and inserts it. On success, if a document was supplied it calls `attachDocument`, which creates a `ContentVersion` (base64-decoded) with `FirstPublishLocationId` set to the enrollment record so the `ContentDocumentLink` is created automatically. Results are returned as a list of `ProviderEnrollmentResult` (`isSuccess`, `enrollmentRecordId`, `message`), with per-record error messages surfaced on failure.

> **Note on scaffolding:** This folder was scaffolded from a template and still contains leftover, unrelated sample files that are **not** part of the Provider Enrollment agent: `CheckWeather.cls`, `CurrentDate.cls`/`CurrentDateTest.cls`, `WeatherService.cls`/`WeatherServiceTest.cls`, the `Local_Info_Agent` bundle, the `Get_Resort_Hours` flow, the `Get_Event_Info` prompt template, and the `Resort_Admin`/`Resort_Agent` permission sets. They can be ignored or removed.

## What's Inside This Folder

| Component | Type | Purpose |
| --- | --- | --- |
| `Enrollment_agent_Simran` | AI Authoring Bundle (`.agent`) | The real Provider Enrollment agent definition: Agent Router start agent, `Provider_demographics_check` subagent, and the `Enrollment_Creation` action. |
| `EnrollmentCreationService` | Apex Class | Invocable action that creates the `Enrollment__c` record and attaches the uploaded document. |
| `EnrollmentLightningTypesInput` | Apex Class | Defines the `EnrollmentInputFields` input type (provider fields + `contentDocumentId`/`fileName`) used by the action and LWC. |
| `ProviderEnrollmentResult` | Apex Class | Output type returned by the action (`isSuccess`, `enrollmentRecordId`, `message`). |
| `providerEnrollment` | Lightning Web Component | "Enrollment Submission" form rendered as the `c__Enrollment_Details_Input` agent input; captures provider details and document upload. |
| `Enrollment__c` | Custom Object | Stores submitted enrollment records (auto-numbered `BE-{000000}`). |
| `AFDX_Agent_Perms` | Permission Set Group | Bundles the permissions required by the Agentforce service agent. |
| `AFDX_User_Perms` | Permission Set Group | Bundles the permissions required by Agentforce admin/builder users. |
| `Local_Info_Agent`, `CheckWeather`, `WeatherService`, `CurrentDate`, `Get_Resort_Hours`, `Get_Event_Info`, `Resort_Admin`, `Resort_Agent` | Mixed (leftover) | Template scaffolding, not part of this agent (see note above). |

## Data Model

**`Enrollment__c`** — Custom object (label "Enrollment", plural "Enrollments"), Public read/write sharing, records named by AutoNumber format `BE-{000000}`.

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
| `Status__c` | Picklist | Restricted: New, Processing, Payment Processing, Finish Application, Completed. Field history tracked. |
| `Plan_Level__c` | Picklist | Restricted: Bronze Plan, Silver Plan, Gold Plan. |
| `Plan_Name__c` | Text(255) | Plan name. |
| `Applicant_Name__c` | Lookup(Account) | Related applicant account. |
| `Broker__c` | Lookup(Contact) | Related broker contact. |
| `Prospect_Name__c` | Lookup(Contact) | Related prospect contact. |
| `UCIN_External_ID__c` | Text(18), External ID, Unique | Cross-system external ID for integration tracking. |

Uploaded documents are stored as standard Salesforce Files (`ContentVersion`/`ContentDocument`) linked to the enrollment record. The Apex action currently maps First Name, Last Name, Phone, Email, NPI Number, License Number, Speciality, and Network from the form; the remaining fields above are available on the object for downstream processing.

## Try It Out

Open the agent in an Agentforce window and start a conversation. The enrollment form appears immediately. Example prompts:

- _I want to enroll a new provider._
- _Start a new provider enrollment._
- _Enroll Dr. Jane Smith, NPI 1234567890, License AB12345, Cardiology, in the Premier network._ (then complete/submit the rendered form and attach a PDF or PNG)
- _Add a new provider to the network and upload their credentialing document._

After you submit the form, the agent creates the `Enrollment__c` record, attaches the document, and returns a confirmation message.

## Deploy

Deploy this folder to your org:

```bash
sf project deploy start -d force-app/main/ProviderNetworkAgents/ProviderAgents/ProviderEnrollmentAgent
```

Then assign the folder's two permission set groups:

```bash
# Agentforce runtime / service-agent user
sf org assign permset --name AFDX_Agent_Perms

# Admin / builder
sf org assign permset --name AFDX_User_Perms
```

Assigning these groups grants all bundled object, field, Apex, and flow access — including the `providerEnrollment` LWC surface and the `Enrollment__c` object — so individual objects and classes do not need to be assigned separately.

> **Template scaffolding:** The `AFDX_Agent_Perms` and `AFDX_User_Perms` groups currently include the leftover `Resort_Agent` / `Resort_Admin` permission sets from the template. Review the group membership and remove unrelated scaffolding as appropriate for your org.
