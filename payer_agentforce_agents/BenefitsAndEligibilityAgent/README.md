# Member Benefits and Eligibility Agent

An Agentforce Service Agent for healthcare payer member portals that verifies a member's identity and answers questions about their benefits, plan coverage, and claims — over both messaging and voice, with the ability to escalate to a live human agent.

## Table of Contents

- [Overview](#overview)
- [Key Capabilities](#key-capabilities)
- [How It Works](#how-it-works)
- [What's Inside This Folder](#whats-inside-this-folder)
- [Data Model](#data-model)
- [Try It Out](#try-it-out)
- [Deploy](#deploy)

## Overview

**Purpose:** Members calling or messaging a payer's member portal repeatedly ask the same front-line questions — "What's my deductible?", "Is this covered?", "Why was my claim denied?", "What's my member responsibility?" This agent automates that first line of contact: it authenticates the member by name, date of birth, and phone number, then answers benefit/plan-coverage/prior-authorization questions and surfaces recent claims (with denial reasons) in a clean, conversational format. It is built to run on both a messaging channel and a telephony (voice) channel, and the conversation can be handed off to a live agent at any time.

The real agent in this folder is the **`HealthBridgeMemberQueriesAgent_3`** bundle (Agent Script / Agent DSL authoring format), whose source of truth is duplicated verbatim as the compiled `HealthBridgeMemberQueriesAgent_v3_definition.agent` inside the `HealthBridgeMemberQueriesAgent_v3` planner bundle. It runs as an `EinsteinServiceAgent` (bot `type` = `ExternalCopilot`), bot developer name `HealthBridgeMemberQueriesAgent`, bot version `v3`, planner `HealthBridgeMemberQueriesAgent_v3` (`plannerType` = `Atlas__ConcurrentMultiAgentOrchestration`), classifier model `model://sfdc_ai__DefaultEinsteinHyperClassifier`, default agent user `payer_contact_center_agent@00dfj00000q85ss699465383.ext`, and a `en_US` voice definition (voice `Mark`, inbound model `sfdc_ai__Default_Nova_2_PhoneCall`, outbound model `sfdc_ai__Default_Eleven_Flash_V2_5`). The bot's own comment describes it plainly: *"Member agent helps in member queries from Payer-Member Portal, this agent should be invoked only when there is a user query from Payer-Member Portal."*

## Key Capabilities

- **Member verification** — collects Date of Birth, Member Name, and Phone Number and authenticates the member against `Account` (Person Account) records before disclosing any data.
- **Verification gating** — the Claims and Inquiries subagents both check `member_verified` first and route an unverified user back to verification.
- **Claims lookup** — retrieves a member's `Claim` records (with denial reasons, CPT/diagnosis codes, member responsibility, provider name) and renders them as a strictly formatted, capped bulleted list (at most 5 claims, sorted most-recent-first).
- **Benefits / plan coverage inquiries** — retrieves a member's `PlanBenefit` and `PlanBenefitItem` records (copays, deductibles, coinsurance, out-of-pocket maximums, prior-authorization details).
- **Escalation to a live agent** — transfers the conversation to a human on request, with two independent hand-off routes: an Omni-Channel messaging flow and a dedicated voice/telephony routing flow.
- **Voice channel support** — the agent is configured with its own voice identity (`modality voice`) and a telephony-specific outbound routing flow, in addition to the standard messaging channel.

## How It Works

**Start agent — `agent_router`:** Uses the classifier model `model://sfdc_ai__DefaultEinsteinHyperClassifier` and, based on user intent and conversation history, transitions to one of four subagents: `Member_Verification`, `Member_Claims`, `Member_Inquiries`, or `Escalation`.

**Subagent — `Member_Verification`:** Asks for the three required inputs — Date of Birth, Member Name, Phone Number — then calls the `HealthBridge_Member_Verification` action (target `apex://MemberVerificationAction`), storing `@outputs.isVerified` into the mutable variable `member_verified` and `@outputs.memberId` into `member_id`. It then asks whether the member wants claim or benefit information and transitions to the corresponding subagent based on what the conversation started with.

**Apex action — `MemberVerificationAction.verifyMember`:** For each request, validates that `memberName`, `dateOfBirth`, and `phoneNumber` are all present (else `InvalidInputException`); normalizes the phone number by stripping all non-digit characters. It runs one bulk query — `SELECT Id, Name, PersonBirthdate, Phone FROM Account WHERE Name IN :memberNames AND PersonBirthdate IN :datesOfBirth AND Phone != NULL LIMIT 1000 WITH USER_MODE` — and matches on a composite key of lowercased/trimmed name + date of birth + normalized phone. While building the account map it detects and flags duplicate composite keys; on lookup it returns one of three outcomes per request: a `MultipleMatchesException` if the key matched more than one Account, a `NoMatchException` if nothing matched, or success with `isVerified = true`, `memberId`, and `memberName`. Any unexpected exception is caught and reported with `errorType = e.getTypeName()`.

**Subagent — `Member_Claims`:** If `member_verified == True`, runs the `Healthbridge_Member_Claims` action with `memberId = @variables.member_id`, then applies unusually strict rendering instructions: format as a bulleted list showing only ID, Name, Status, `Service_Type__c`, and `ApprovedAmount` per claim; sort by `ClaimLossDate` descending (falling back to `CreatedDate` descending); cap the list at 5 claims; never show raw objects/JSON/debug blobs; render each claim in an exact `"- ID: {Id} | Name: {Name}\n  - Status: {Status}\n  - Service: {Service_Type__c or 'N/A'}\n  - Approved: ${ApprovedAmount}"` template, substituting `'N/A'`/`'$0.00'` for nulls. If the member isn't verified, it transitions back to `Member_Verification`.

**Apex action — `MemberClaimAction.getMemberClaims`:** Validates each request's `memberId` (missing or non-castable-to-`Id` values are reported per-request), then runs a single query against the standard **`Claim`** object — `Name, AccountId, Status, ClaimLossDate, EstimatedAmount, ApprovedAmount, ActualAmount`, the ten custom fields shipped in this package, plus `Submitting_Provider__c` and its related `Name/Credentials__c/Group_Name__c/Network_Status__c/Provider_Phone__c` fields — filtered `WHERE AccountId IN :memberIds`, with a nested `ClaimItems` subquery (`Id, Name, ClaimId, Description, Category, InsurancePolicyCoverageId, ClaimParticipantId, InsurancePolicyAssetId`). It returns `claimSummary` as `String.valueOf(claimList)` — the raw Apex list's string representation, not curated JSON — so the strict formatting described above is entirely enforced by the agent's reasoning instructions, not by the Apex layer. Note: this query has no `LIMIT` and does not use `WITH USER_MODE`.

**Subagent — `Member_Inquiries`:** If `member_verified == True`, it responds using the member's benefit/plan information (the `HealthBridge_Member_Inquiry_Service` action is always available to this subagent, called with `memberId = @variables.member_id`). If not verified, it transitions back to `Member_Verification`.

**Apex action — `MemberInquiryAction.getInquiryInformation`:** Validates each request's `memberId` the same way as the claims action, then queries the standard **`PlanBenefit`** object — copays (primary care, specialist, ER, urgent care), individual/family in-network and out-of-network deductibles, coinsurance percentages, and individual/family in-network and out-of-network out-of-pocket maximums, plus `BenefitNotes` — where `PurchaserPlanId` is in a subquery of `MemberPlan.PlanId` for the given `MemberId`, limited to 200 rows, with a nested `PlanBenefitItems` subquery (`BenefitCategory, ServiceType, Notes, IsInPlanNetwork, InNetworkCoverage`, limited to 200 rows). It returns `inquirySummary` as `String.valueOf(planBenefitList)` — again the raw Apex list string, not curated JSON.

**GenAI Functions:** `HealthBridge_Member_Verification`, `Healthbridge_Member_Claims`, and `HealthBridge_Member_Inquiry_Service` are the formal `GenAiFunction` wrappers around the three Apex classes, each with `input`/`output` JSON schemas (`lightning:type`, `copilotAction:isDisplayable`, etc.) that mirror the Apex request/response shapes and the `.agent` action definitions exactly.

**Subagent — `Escalation`:** Triggered when a user explicitly asks for a human ("talk to human", "live agent", "customer support", "escalation", or expresses dissatisfaction); calls `@utils.escalate`. If escalation fails, it acknowledges the issue and offers to log a support case instead. Two separate `connection` blocks define where escalation actually routes: `connection messaging` uses `outbound_route_name: "flow://Route_to_Live_Human_Agent"` (an `OmniChannelFlow` — **not shipped in this folder**, expected to already exist in the target org), and `connection telephony` uses `outbound_route_name: "flow://Outbound_Flow_for_Voice_Agent"` (shipped here), each with its own escalation message.

**Flow — `Outbound_Flow_for_Voice_Agent`:** A `RoutingFlow` (status Active) that takes one input variable, `recordId`, and immediately calls the `routeWork` action (`Route_to_Human_Agent`, action version `2.0.0`) with `routingType = "QueueBased"`, `serviceChannelDevName = "sfdc_phone"` (label "Phone"), `queueLabel = "Agentforce Voice Callback"`, and a hardcoded `queueId` of `00Gfj00000CEwejEAD` — this is the mechanism behind voice-channel escalation to a live representative. Because the queue Id is hardcoded to a specific org, it will need to be updated (or the queue re-created with a matching Id) after deploying to a different org.

**Voice modality:** `modality voice` configures `voice_id: "UgBBYS2sOqTuMpoF3BR0"`, `outbound_speed: 1.0`, `outbound_stability: 0.65`, `outbound_similarity: 0.75` — mirrored in the planner bundle's `voiceDefinition` (outbound voice `Mark`).

## What's Inside This Folder

| Component | Type | Purpose |
| --- | --- | --- |
| `HealthBridgeMemberQueriesAgent_3` | AI Authoring Bundle (`.agent`) | The agent definition: `agent_router`, and the `Member_Verification`, `Member_Claims`, `Member_Inquiries`, and `Escalation` subagents. |
| `HealthBridgeMemberQueriesAgent` | Bot / BotVersion (`v3`) | Bot shell (`ExternalCopilot` / `EinsteinServiceAgent`) and compiled dialogs referencing the planner bundle. |
| `HealthBridgeMemberQueriesAgent_v3` | GenAI Planner Bundle | Compiled planner artifacts (`agentGraph`, `localActions`) plus an `agentScript/HealthBridgeMemberQueriesAgent_v3_definition.agent` file that is byte-for-byte identical (once base64-decoded) to the `.agent` bundle above. |
| `HealthBridge_Member_Verification` | GenAI Function | Formal wrapper/schema for the verification action. |
| `Healthbridge_Member_Claims` | GenAI Function | Formal wrapper/schema for the claims action. |
| `HealthBridge_Member_Inquiry_Service` | GenAI Function | Formal wrapper/schema for the benefits/inquiry action. |
| `MemberVerificationAction` | Apex Class | Verifies a member by name, date of birth, and phone against `Account`; returns verification status and member Id. |
| `MemberClaimAction` | Apex Class | Returns a member's `Claim` records (with denial reasons and provider/CPT/diagnosis detail) and their `ClaimItems`. |
| `MemberInquiryAction` | Apex Class | Returns a member's `PlanBenefit`/`PlanBenefitItem` records (copays, deductibles, coinsurance, out-of-pocket, PA notes). |
| `Outbound_Flow_for_Voice_Agent` | Flow (RoutingFlow) | Routes a voice/telephony conversation to a live agent queue via Omni-Channel `routeWork`. |
| `Claim` | Standard Object (extended) | Ships 10 custom fields onto the standard `Claim` object — see Data Model. |

> **Note on scaffolding:** This folder still contains generic, unrelated Salesforce DX template scaffolding — `scripts/apex/hello.apex` (a "Hello World" anonymous Apex sample) and `scripts/soql/account.soql` (a plain `SELECT Id, Name FROM Account` sample query). Neither is referenced by the agent or listed in `manifest/package.xml`; they can be ignored or removed.
>
> **Note on missing dependencies:** The agent script references `flow://Route_to_Live_Human_Agent` for messaging escalation, and `MemberClaimAction` queries a `Submitting_Provider__c` lookup (with related `Name`, `Credentials__c`, `Group_Name__c`, `Network_Status__c`, `Provider_Phone__c` fields) on `Claim` — neither the flow nor that field/its related object is shipped in this package. Both are expected to already exist in the target org.

## Data Model

- **`Claim`** (standard object, extended — its `Claim.object-meta.xml` is an empty stub, confirming it is a pre-existing standard object rather than a new custom object). This package ships 10 custom fields on it:
  - `CPT_Codes__c` (Text, 255)
  - `CPT_Descriptions__c` (Long Text Area, 1000, 3 visible lines)
  - `Claim_External_ID__c` (Text, 50 — **External ID, Unique**, case-insensitive)
  - `Date_Submitted__c` (Date)
  - `Denial_Reason__c` (Long Text Area, 500, 2 visible lines)
  - `Diagnosis_Codes__c` (Text, 255)
  - `ERA_Number__c` (Text, 50)
  - `Member_Responsibility__c` (Currency, 12.2)
  - `Provider_Name__c` (Text, 255)
  - `Service_Type__c` (Text, 100)

  `MemberClaimAction` also reads the standard fields `Name`, `AccountId`, `Status`, `ClaimLossDate`, `EstimatedAmount`, `ApprovedAmount`, `ActualAmount`, the standard child relationship **`ClaimItems`** (standard `ClaimItem` object — not shipped, expected to pre-exist), and a `Submitting_Provider__c` lookup and its related fields (also not shipped — see note above).

- Objects referenced by the Apex classes but **not shipped in this package** (expected to already exist in the target org):
  - **`Account`** (standard, Person Account fields `Name`, `PersonBirthdate`, `Phone`) — the member verification match target.
  - **`MemberPlan`** (standard) — joined on `MemberId`/`PlanId` to resolve a member's plan.
  - **`PlanBenefit`** (standard) — plan-level benefit/coverage detail, joined via `PurchaserPlanId`.
  - **`PlanBenefitItem`** (standard, child of `PlanBenefit` via `PlanBenefitId`, relationship `PlanBenefitItems`) — line-item benefit/coverage/PA detail.
  - **`ClaimItem`** (standard, child of `Claim` via `ClaimId`, relationship `ClaimItems`).
  - **`VoiceCall`** (standard) — source of the agent's `VoiceCallId` linked variable.

```
Account (Member, Person Account)
├─ Claim                     (AccountId)
│  ├─ ClaimItem               (ClaimId)               [standard, not shipped]
│  └─ Submitting_Provider__c  (lookup, expected but not shipped)
└─ MemberPlan                 (MemberId)               [standard, not shipped]
   └─ PlanBenefit             (PurchaserPlanId = MemberPlan.PlanId)  [standard, not shipped]
      └─ PlanBenefitItem      (PlanBenefitId)          [standard, not shipped]
```

## Try It Out

Once deployed and activated, start a conversation (messaging or voice) with the agent and try prompts such as:

- _My name is Jane Doe, date of birth 1985-04-12, and my phone number is 555-987-6543._ (member verification)
- _Can you show me my recent claims?_
- _Why was my last claim denied?_
- _What's my specialist copay and my in-network deductible?_
- _Do I need prior authorization for this service?_
- _I'd like to speak with a live agent._

## Deploy

Deploy this agent folder to an authorized org:

```bash
sf project deploy start -d payer_agentforce_agents/BenefitsAndEligibilityAgent
```

> **Note on permissions:** This folder does **not** ship its own permission set or permission set group. Rather than assigning the individual Apex classes and objects it uses, grant the Agentforce agent user access through an Agentforce agent permission set group managed at the org level — for example a shared `AFDX_Agent_Perms`-style group if one exists in your org, or the standard Agentforce user permissions. Because no permission metadata deploys with this folder, treat this as guidance and align it with however agent access is administered in your org.

After deploying:

- Ensure the Agentforce agent user is entitled to the resources this agent uses (`MemberVerificationAction`, `MemberClaimAction`, and `MemberInquiryAction` Apex classes, and the `Account`, `Claim`, `ClaimItem`, `MemberPlan`, `PlanBenefit`, and `PlanBenefitItem` objects/fields) via the org-level permission set group described above.
- Create or verify the `Route_to_Live_Human_Agent` flow for messaging escalation, and the `Submitting_Provider__c` lookup on `Claim`, since neither ships with this package.
- Confirm the `sfdc_phone` service channel and the **Agentforce Voice Callback** queue (hardcoded Id `00Gfj00000CEwejEAD` in `Outbound_Flow_for_Voice_Agent`) exist in the target org, updating the Id if it differs, so voice escalation works.
- Activate the agent and its connected messaging and telephony channels, then test in the Agent preview or a live messaging/voice deployment.
