# Employer Agent

An Agentforce Service Agent — branded "HealthBridge's Employer Support AI Agent" — that helps **employer groups** (not individual members) with policy, enrollment, billing, eligibility, group-change, and case-status questions, gated behind identity verification, with escalation to a live human agent.

## Table of Contents

- [Overview](#overview)
- [Key Capabilities](#key-capabilities)
- [How It Works](#how-it-works)
- [What's Inside This Folder](#whats-inside-this-folder)
- [Data Model](#data-model)
- [Try It Out](#try-it-out)
- [Deploy](#deploy)

## Overview

**Purpose:** Contact-center support for the employer/group side of a payer's book of business. The agent will not answer any employer-specific question until the employer is verified by exact **Employer Account Name** and **Employer Account Number**. Once verified, it retrieves and summarizes the employer's insurance policies, participants, coverages, contacts, and cases from Salesforce, and can hand the conversation to a live agent on request.

The real agent in this folder is the **`Employer_Agent_6`** bundle (Agent Script / Agent DSL authoring format). It runs as an `EinsteinServiceAgent` (`ExternalCopilot`), bot developer name `Employer_Agent`, bot version `v4`, planner `Employer_Agent_v4`, default agent user `payer_contact_center_agent@00dfj00000q85ss699465383.ext`, locale `en_US`, tone `Casual`.

## Key Capabilities

- Verifies an employer group by exact Employer Account Name + Employer Account Number match before revealing any data.
- Answers policy, enrollment, billing/premium, eligibility, coverage, participant, and case questions for the verified employer.
- Retrieves and summarizes Insurance Policies, Policy Participants, Policy Coverages, Contacts, and Cases tied to the employer's `Account`.
- Escalates to a live human agent on request, offering to log a support case if the transfer fails.
- Redirects off-topic requests and resists prompt-injection attempts; never fabricates data or reveals internal record Ids.

## How It Works

**Start agent — `Agent Router`:** Uses the classifier model `model://sfdc_ai__DefaultEinsteinHyperClassifier` to route to `Employer_Verification`, `Employer_Inquiries`, `Escalation`, or `Off_Topic` based on whether the employer is already verified and whether the request is employer-specific, an explicit escalation request, or unrelated.

**Variables:** Linked/read-only — `EndUserId`, `RoutableId`, `ContactId`, `EndUserLanguage` (sourced from the messaging session). Mutable — `employer_verified` (boolean, default `False`), `employer_account_id` (string, never shown to the user), `employer_name`, `employer_account_number`.

**Subagent — `Employer_Verification`:** Prompts exactly: *"Before I can access your employer policy information, could you please provide your Employer Account Name and Employer Account Number for verification?"* Then calls the `Employer_Verification_Action` (target `apex://EmployerVerificationAction`) with inputs `employerName`/`employerAccountNumber`, mapping `accountId`, `employerName`, `employerAccountNumber`, and `isVerified` into the mutable variables. On success it transitions to `Employer_Inquiries`; on failure it shows a fixed refusal message.

**Subagent — `Employer_Inquiries`:** Guarded by `employer_verified == True and employer_account_id is not None`; runs `Employer_Inquiry_Action` (target `apex://EmployerInquiryAction`) with `accountId = @variables.employer_account_id`, then converts the returned JSON into a human-readable answer — never exposing raw JSON unless asked, and never fabricating data. If unverified, it redirects back to verification.

**Subagent — `Escalation`:** Calls `@utils.escalate`; on failure, offers to log a case instead.

**Subagent — `Off_Topic`:** Redirects politely, refuses general-knowledge questions, and carries guardrail instructions against prompt-injection and disclosure of system/config information.

**Apex action — `EmployerVerificationAction.verifyEmployer`** (`with sharing`): Rejects blank inputs up front. Otherwise runs `SELECT Id, Name, AccountNumber FROM Account WHERE Name = :employerName AND AccountNumber = :employerAccountNumber LIMIT 1` — an exact match on both fields, enforced by the running user's sharing rules. No match returns `isVerified = false`; a match returns the `accountId` and `isVerified = true`. Test coverage (`EmployerVerificationActionTest`) confirms both the successful exact-match path and the non-matching path returning a null `accountId`.

**Apex action — `EmployerInquiryAction.getEmployerInformation`** (`without sharing`, runs queries via `AccessLevel.SYSTEM_MODE`): Validates `accountId`, queries the `Account` (`Name, AccountNumber, BillingStreet/City/State/Country, OwnerId`), then — via a resilient helper that catches per-query exceptions rather than failing the whole action — queries `InsurancePolicy` (`NameInsuredId = accountId`), `InsurancePolicyParticipant` and `InsurancePolicyCoverage` (scoped to those policy Ids), `Contact` (`AccountId = accountId`), and `Case` (`AccountId = accountId`, newest first). Every record passes through a sanitizer that strips any field whose API name ends in "Id" before it's serialized — this is the mechanism that keeps internal Salesforce Ids out of what the agent sees. The result is returned as a JSON `employerInquiryJson` plus a computed `inquirySummary` (e.g., "Retrieved employer information for X: N policies, N participants, N coverages, N contacts, and N cases."). Test coverage (`EmployerInquiryActionTest`) confirms a full retrieval returns `success = true`, an `inquirySummary` containing the employer name, and that the Account's own Id is **not** present in the JSON; a missing `accountId` returns `success = false`.

## What's Inside This Folder

| Component | Type | Purpose |
| --- | --- | --- |
| `Employer_Agent_6` | AI Authoring Bundle (`.agent`) | The agent definition: router, `Employer_Verification`, `Employer_Inquiries`, `Escalation`, and `Off_Topic` subagents. |
| `Employer_Agent` | Bot / BotVersion (`v4`) | Bot shell and compiled dialogs referencing the planner bundle. |
| `Employer_Agent_v4` | GenAI Planner Bundle | Compiled planner artifacts; the `.agent` file above is the human-readable source of truth. |
| `EmployerVerificationAction` | Apex Class | Verifies an employer by exact Account Name + Account Number match. |
| `EmployerVerificationActionTest` | Apex Test Class | Covers the successful and non-matching verification paths. |
| `EmployerInquiryAction` | Apex Class | Retrieves and sanitizes a consolidated employer profile (policies, participants, coverages, contacts, cases). |
| `EmployerInquiryActionTest` | Apex Test Class | Covers a full retrieval (confirming Ids are stripped) and a missing-`accountId` failure. |
| `Employer_Agent_Permission_Set` | Permission Set | Grants the agent's runtime user read access to Account, Case, Contact, InsurancePolicy, InsurancePolicyCoverage, and InsurancePolicyParticipant. |

## Data Model

No custom objects or fields are shipped in this folder — the Apex classes rely entirely on standard/Financial Services Cloud Insurance objects already present in the org:

| Object | Key fields used | Relationship |
| --- | --- | --- |
| `Account` | `Id, Name, AccountNumber, BillingStreet, BillingCity, BillingState, BillingCountry, OwnerId` | Verification match key: `Name` + `AccountNumber`. |
| `InsurancePolicy` | `Id, Name, PolicyName, Status, EffectiveFromDate, EffectiveToDate, PolicyType, PremiumAmount, PremiumFrequency, NameInsuredId, RenewalDate, PolicyDescription` | `NameInsuredId` = the verified `Account.Id`. |
| `InsurancePolicyParticipant` | `Id, Name, ParticipantName, PrimaryParticipantContactId, InsurancePolicyId, Role, IsActiveParticipant, EffectiveFromDate, EffectiveToDate, RelationshipToInsured` | `InsurancePolicyId` in the employer's policy Ids. |
| `InsurancePolicyCoverage` | `Id, CoverageName, Category, EffectiveFromDate, EffectiveToDate, DeductibleAmount, InsurancePolicyId` | `InsurancePolicyId` in the employer's policy Ids. |
| `Contact` | `Id, Name, Email, Phone, Title, AccountId` | `AccountId` = the verified `Account.Id`. |
| `Case` | `Id, CaseNumber, Subject, Status, Priority, Type, Description, AccountId` | `AccountId` = the verified `Account.Id`. |

The permission set grants read-only access (`viewAllFields = true`) on Account, Case, Contact, InsurancePolicy, InsurancePolicyCoverage, and InsurancePolicyParticipant, with `viewAllRecords = true` on Account and Contact.

## Try It Out

Once deployed and activated, start a conversation with the agent and try prompts such as:

- _I need to check on my group's policy — can you help?_ (triggers the verification prompt)
- _Employer Account Name: Acme Health Benefits, Account Number: EMP-1001_ (completes verification)
- _What's the premium amount and renewal date on our policy?_ (post-verification inquiry)
- _Can you show me the status of our open cases?_ / _I'd like to speak to a live agent._ (escalation path)

## Deploy

Deploy this agent folder to an authorized org:

```bash
sf project deploy start -d payer_agentforce_agents/EmployerGroupSupportAgent
```

Then assign the folder's permission set:

```bash
sf org assign permset --name Employer_Agent_Permission_Set
```
