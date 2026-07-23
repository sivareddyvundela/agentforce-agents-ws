/* ============================================================
   healthEdge AI — Member Benefits and Eligibility
   Mock / demo data only. No real PHI/PII. For sales-engineering
   demo purposes.
   ============================================================ */

const heAI_DATA = {

  agent: {
    name: "Member Benefits and Eligibility Agent",
    shortName: "Benefits and Eligibility"
  },

  // ---------------------------------------------------------
  // Member profile (the caller/chatter on the other end)
  // ---------------------------------------------------------
  member: {
    name: "Jane Doe",
    dob: "1985-04-12",
    phone: "(555) 987-6543",
    memberId: "MBR-5540192",
    plan: "healthEdge Advantage PPO 2500",
    verified: true
  },

  // ---------------------------------------------------------
  // Overview stat tiles
  // ---------------------------------------------------------
  overviewStats: [
    { label: "Plan Status", value: "Active", tone: "positive" },
    { label: "Claims This Year", value: "6", tone: "neutral" },
    { label: "Denied Claims", value: "1", tone: "warning" },
    { label: "YTD Member Responsibility", value: "$612.40", tone: "neutral" }
  ],

  overviewDescription:
    "The Member Benefits and Eligibility Agent handles inbound messaging and voice conversations from " +
    "health plan members. After verifying the member's identity using Member Name, Date of Birth, and " +
    "Phone Number, the agent can answer plan benefit and coverage questions — copays, deductibles, " +
    "coinsurance, out-of-pocket maximums, and prior-authorization requirements — and surface recent " +
    "claims, including the reason behind any denial. When a member needs a live representative, the " +
    "agent can transfer the conversation over messaging or voice to a human agent.",

  // ---------------------------------------------------------
  // Benefits / plan coverage (PlanBenefit + PlanBenefitItem)
  // ---------------------------------------------------------
  benefits: {
    planName: "healthEdge Advantage PPO 2500",
    copayPrimaryCare: "$25",
    copaySpecialist: "$50",
    copayER: "$250",
    copayUrgentCare: "$75",
    deductibleIndividualInNetwork: "$2,500",
    deductibleFamilyInNetwork: "$5,000",
    deductibleIndividualOutNetwork: "$5,000",
    deductibleFamilyOutNetwork: "$10,000",
    coinsurance: "20% in-network / 40% out-of-network",
    oopMaxIndividualInNetwork: "$6,500",
    oopMaxFamilyInNetwork: "$13,000",
    oopMaxIndividualOutNetwork: "$13,000",
    oopMaxFamilyOutNetwork: "$26,000",
    benefitNotes:
      "Prior authorization is required for advanced imaging (MRI/CT/PET), inpatient admissions, and " +
      "durable medical equipment over $500. No referral is required to see an in-network specialist.",

    items: [
      { benefitCategory: "Primary Care Visit", serviceType: "Office Visit", network: "In-Network", coverage: "$25 copay", notes: "No prior authorization required" },
      { benefitCategory: "Specialist Visit", serviceType: "Office Visit", network: "In-Network", coverage: "$50 copay", notes: "No referral required" },
      { benefitCategory: "Advanced Imaging", serviceType: "MRI / CT / PET", network: "In-Network", coverage: "20% coinsurance after deductible", notes: "Prior authorization required" },
      { benefitCategory: "Inpatient Hospital", serviceType: "Facility Admission", network: "In-Network", coverage: "20% coinsurance after deductible", notes: "Prior authorization required; notify within 24 hours of admission" },
      { benefitCategory: "Emergency Room", serviceType: "ER Visit", network: "In-Network & Out-of-Network", coverage: "$250 copay, then 20% coinsurance", notes: "Copay waived if admitted" },
      { benefitCategory: "Durable Medical Equipment", serviceType: "DME over $500", network: "In-Network", coverage: "20% coinsurance after deductible", notes: "Prior authorization required for items over $500" }
    ]
  },

  // ---------------------------------------------------------
  // Claims history (standard Claim object + custom fields)
  // ---------------------------------------------------------
  claims: [
    {
      claimExternalId: "CLM-2026-04471",
      provider: "Dr. Amara Kessler, Family Medicine",
      serviceType: "Office Visit",
      dateSubmitted: "2026-06-18",
      cptCodes: "99214",
      cptDescriptions: "Office/outpatient visit, established patient, moderate complexity",
      diagnosisCodes: "J06.9",
      memberResponsibility: "$25.00",
      eraNumber: "ERA-88214471",
      status: "Paid",
      denialReason: null
    },
    {
      claimExternalId: "CLM-2026-04512",
      provider: "Northgate Radiology Associates",
      serviceType: "Advanced Imaging",
      dateSubmitted: "2026-06-29",
      cptCodes: "70553",
      cptDescriptions: "MRI brain, without and with contrast",
      diagnosisCodes: "G43.909",
      memberResponsibility: "$420.00",
      eraNumber: "ERA-88214512",
      status: "Approved",
      denialReason: null
    },
    {
      claimExternalId: "CLM-2026-04588",
      provider: "Lakeside Urgent Care",
      serviceType: "Urgent Care Visit",
      dateSubmitted: "2026-07-03",
      cptCodes: "99203",
      cptDescriptions: "Office/outpatient visit, new patient, low-moderate complexity",
      diagnosisCodes: "S93.401A",
      memberResponsibility: "$75.00",
      eraNumber: "ERA-88214588",
      status: "Processing",
      denialReason: null
    },
    {
      claimExternalId: "CLM-2026-04390",
      provider: "Summit Orthopedic Group",
      serviceType: "Durable Medical Equipment",
      dateSubmitted: "2026-05-22",
      cptCodes: "L1833",
      cptDescriptions: "Knee orthosis, adjustable range of motion, rigid support",
      diagnosisCodes: "M25.561",
      memberResponsibility: "$0.00",
      eraNumber: "ERA-88214390",
      status: "Denied",
      denialReason: "Prior authorization was not obtained before the equipment was dispensed."
    },
    {
      claimExternalId: "CLM-2026-04255",
      provider: "Riverside Emergency Physicians",
      serviceType: "Emergency Room",
      dateSubmitted: "2026-04-11",
      cptCodes: "99284",
      cptDescriptions: "Emergency department visit, high severity",
      diagnosisCodes: "R10.11",
      memberResponsibility: "$250.00",
      eraNumber: "ERA-88214255",
      status: "Paid",
      denialReason: null
    },
    {
      claimExternalId: "CLM-2026-04198",
      provider: "Dr. Priya Ramanathan, Endocrinology",
      serviceType: "Specialist Visit",
      dateSubmitted: "2026-03-27",
      cptCodes: "99244",
      cptDescriptions: "Office consultation, comprehensive history and exam",
      diagnosisCodes: "E11.9",
      memberResponsibility: "$50.00",
      eraNumber: "ERA-88214198",
      status: "Paid",
      denialReason: null
    }
  ],

  // ---------------------------------------------------------
  // Sidebar tab configuration
  // ---------------------------------------------------------
  tabs: [
    { id: "overview", label: "Overview" },
    { id: "profile", label: "My Profile" },
    { id: "benefits", label: "Benefits & Coverage" },
    { id: "claims", label: "Claims History" }
  ],

  // ---------------------------------------------------------
  // Login page "Try asking..." prompts
  // (verbatim from the agent's README "Try It Out" section)
  // ---------------------------------------------------------
  samplePrompts: [
    "My name is Jane Doe, date of birth 1985-04-12, and my phone number is 555-987-6543.",
    "Can you show me my recent claims?",
    "Why was my last claim denied?",
    "What's my specialist copay and my in-network deductible?",
    "Do I need prior authorization for this service?",
    "I'd like to speak with a live agent."
  ],

  // ---------------------------------------------------------
  // Demo credentials
  // ---------------------------------------------------------
  credentials: {
    username: "member.portal.user",
    password: "Demo@123"
  }
};
