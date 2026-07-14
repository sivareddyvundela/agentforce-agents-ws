# Provider Agents

A collection of Agentforce agents that support the **provider-facing** side of the provider network — helping staff and providers look up contracts, search provider profiles, maintain directory data, manage credentialing, enroll new providers, and answer network questions.

Each agent lives in its own folder with a self-contained Agent Script bundle (`aiAuthoringBundles`), its supporting Apex, Flows, custom objects, and permission set groups. Open an agent's folder `README.md` for full details on how it works, what's inside, and how to deploy it.

## Table of Contents

- [Overview](#overview)
- [Agents](#agents)
  - [Provider Contract Inquiry Agent](#provider-contract-inquiry-agent)
  - [Provider Directory Maintenance Agent](#provider-directory-maintenance-agent)
  - [Provider Search & Profile Lookup Agent](#provider-search--profile-lookup-agent)
  - [Provider Network Inquiries Agent](#provider-network-inquiries-agent)
  - [Credentialing Agent](#credentialing-agent)
  - [Provider Enrollment Agent](#provider-enrollment-agent)
- [Agent Summary Table](#agent-summary-table)
- [Deploy](#deploy)

## Overview

These agents automate common provider-network workflows so that internal staff spend less time searching across records and external providers can self-serve routine requests. They share a common pattern: a router (start) agent classifies the user's intent with the `sfdc_ai__DefaultEinsteinHyperClassifier` model and hands off to a purpose-built subagent, which calls Flows or Apex actions to read from and write to the provider data model (`HealthcareProvider`, `Credential__c`, `vlocity_ins__ProviderNetwork__c`, `Contract`, and related objects).

## Agents

### Provider Contract Inquiry Agent

Retrieve and understand a provider's contract by contract number, provider name, or NPI — contract dates, network participation, fee schedules, reimbursement rates, and amendment history.

- **Usage:** Look up a contract and drill into network, fee-schedule, or amendment details on request.
- **Persona:** Internal **provider-network / payer staff** (Agentforce **Employee** agent) — e.g. contract managers and network operations analysts reviewing provider agreements.
- **Details:** [ProviderContractInquiryAgent/README.md](ProviderContractInquiryAgent/README.md)

### Provider Directory Maintenance Agent

Let providers and members propose corrections to provider directory data (address, phone, hours, languages, accessibility, telehealth, accepting-new-patients) through a governed change-request and audit-log lifecycle.

- **Usage:** Submit a directory change request; changes flow through validation and steward approval before publishing, with an immutable audit trail.
- **Persona:** External **providers / members** (Agentforce **Service** agent), with **directory data stewards** reviewing and approving submitted changes.
- **Details:** [ProviderDirectoryMaintananceAgent/README.md](ProviderDirectoryMaintananceAgent/README.md)

### Provider Search & Profile Lookup Agent

Search for a healthcare provider and look up their full profile — credentials, active contracts, network participation, service locations, and compliance issues.

- **Usage:** Find a provider by name or NPI, then pull their credentials, contracts, networks, locations, or compliance history.
- **Persona:** **Service / contact-center agents** and network staff (Agentforce **Service** agent) who need a 360° view of a provider during a case.
- **Details:** [ProviderSearchNProfileLookupAgent/README.md](ProviderSearchNProfileLookupAgent/README.md)

### Provider Network Inquiries Agent

Answer provider-network questions, verify a provider's identity, and route to a live service agent when needed.

- **Usage:** Verify a provider (name / NPI / phone), answer network participation and fee questions, and hand off to a live agent on escalation.
- **Persona:** **Providers contacting support** through a messaging channel (Agentforce **Service** agent), with escalation to **live service agents**.
- **Details:** [ProviderNetworkSupportAgent/README.md](ProviderNetworkSupportAgent/README.md)

### Credentialing Agent

Track and manage provider credentialing — credential status, a credentialing summary by NPI, and identification of missing documents (with automated reminders).

- **Usage:** Check a provider's credential status, get a credentialing summary, or find out which documents are still missing.
- **Persona:** Internal **credentialing specialists** (Agentforce **Employee** agent) managing provider onboarding compliance.
- **Details:** [CredentialingAgent/README.md](CredentialingAgent/README.md)

### Provider Enrollment Agent

Enroll new healthcare providers into the network, capturing demographics through a guided Lightning Web Component form and creating `Enrollment__c` records with supporting documents.

- **Usage:** Start a provider enrollment, complete the demographics form, and create the enrollment record with an attached document.
- **Persona:** **Provider onboarding / enrollment staff** capturing new provider applications.
- **Details:** [ProviderEnrollmentAgent/README.md](ProviderEnrollmentAgent/README.md)

## Agent Summary Table

| Agent | What it does | Typical usage | Persona |
|---|---|---|---|
| [Provider Contract Inquiry](ProviderContractInquiryAgent/README.md) | Retrieve provider contracts, dates, networks, fee schedules, and amendments | Look up and explain a provider agreement | Provider-network / payer staff (Employee agent) |
| [Provider Directory Maintenance](ProviderDirectoryMaintananceAgent/README.md) | Governed directory change requests with approval and audit trail | Submit and track a directory correction | Providers / members + directory stewards (Service agent) |
| [Provider Search & Profile Lookup](ProviderSearchNProfileLookupAgent/README.md) | Search providers and view credentials, contracts, networks, locations, compliance | Get a 360° provider profile during a case | Service / contact-center agents (Service agent) |
| [Provider Network Inquiries](ProviderNetworkSupportAgent/README.md) | Verify providers, answer network questions, route to a live agent | Support and escalate provider network inquiries | Providers contacting support (Service agent) |
| [Credentialing](CredentialingAgent/README.md) | Credential status, credentialing summary, and missing-document checks | Manage credentialing compliance | Credentialing specialists (Employee agent) |
| [Provider Enrollment](ProviderEnrollmentAgent/README.md) | Enroll new providers via a guided form, creating enrollment records | Onboard a new provider | Provider onboarding / enrollment staff |

## Deploy

Each agent folder is self-contained and deploys independently. Deploy an individual agent and assign the permission set groups documented in its folder `README.md`, for example:

```bash
sf project deploy start -d force-app/main/ProviderNetworkAgents/ProviderAgents/ProviderContractInquiryAgent
```

To deploy every provider agent at once, deploy this folder:

```bash
sf project deploy start -d force-app/main/ProviderNetworkAgents/ProviderAgents
```

See each agent's own **Deploy** section for the specific permission set groups to assign to the Agentforce agent user and to admin / builder users.
