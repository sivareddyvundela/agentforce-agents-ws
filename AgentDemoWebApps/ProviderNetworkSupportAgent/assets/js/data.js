/* ============================================================
   healthEdge AI — Provider Network Support
   Mock / demo data only. No real PHI/PII. For sales-engineering
   demo purposes.
   ============================================================ */

const heAI_DATA = {

  agent: {
    name: "Provider Network Inquiries Agent",
    shortName: "Provider Network Support"
  },

  // ---------------------------------------------------------
  // Provider profile (the caller on the other end of the chat)
  // ---------------------------------------------------------
  provider: {
    name: "Dr. Jane Smith",
    npi: "1234567890",
    phone: "(555) 123-4567",
    email: "jane.smith@meridianfamilyhealth.com",
    taxId: "82-4471096",
    specialty: "Family Medicine",
    practiceName: "Meridian Family Health Associates",
    verified: true
  },

  // ---------------------------------------------------------
  // Overview stat tiles
  // ---------------------------------------------------------
  overviewStats: [
    { label: "Credentialing Status", value: "In Review", tone: "warning" },
    { label: "Active Contracts", value: "4", tone: "positive" },
    { label: "Open Support Cases", value: "2", tone: "neutral" },
    { label: "Fee Schedules on File", value: "9", tone: "positive" }
  ],

  overviewDescription:
    "The Provider Network Inquiries Agent handles inbound calls from participating and prospective providers. " +
    "After verifying the caller's identity using Provider Name, NPI, and Provider Phone, the agent can confirm " +
    "demographic details, credentialing status, network contract participation, and CPT fee schedule allowed " +
    "amounts — reducing average handle time and freeing contact-center staff for complex cases. When a caller " +
    "needs a live representative, the agent offers a warm transfer and, if that fails, automatically logs a " +
    "support case so nothing falls through the cracks.",

  // ---------------------------------------------------------
  // Credentialing
  // ---------------------------------------------------------
  credentialing: {
    current: {
      status: "In Review",
      currentStage: "Primary Source Verification",
      applicationDate: "2026-05-04",
      committeeReviewDate: "2026-08-12",
      expectedCompletion: "2026-08-25",
      assignedAnalyst: "Marcus Whitfield",
      rejectionReason: null
    },
    history: [
      {
        cycle: "2023 Recredentialing",
        status: "Approved",
        applicationDate: "2023-02-10",
        completionDate: "2023-04-18",
        analyst: "Priya Nadarajan"
      },
      {
        cycle: "2020 Recredentialing",
        status: "Approved",
        applicationDate: "2020-01-22",
        completionDate: "2020-03-30",
        analyst: "Deborah Chu"
      },
      {
        cycle: "2018 Initial Credentialing",
        status: "Approved",
        applicationDate: "2018-06-15",
        completionDate: "2018-09-02",
        analyst: "Ray Ostrowski"
      },
      {
        cycle: "2017 Application (Withdrawn)",
        status: "Rejected",
        applicationDate: "2017-11-01",
        completionDate: "2017-12-20",
        analyst: "Ray Ostrowski",
        rejectionReason: "Incomplete work history documentation"
      }
    ]
  },

  // ---------------------------------------------------------
  // Network contracts
  // ---------------------------------------------------------
  contracts: [
    {
      contractName: "Meridian Preferred PPO",
      contractNumber: "CNT-100234",
      network: "Meridian Preferred Network",
      status: "Active",
      startDate: "2022-01-01",
      endDate: "2027-12-31"
    },
    {
      contractName: "healthEdge Advantage HMO",
      contractNumber: "CNT-100561",
      network: "Advantage HMO Network",
      status: "Active",
      startDate: "2023-03-15",
      endDate: "2026-12-31"
    },
    {
      contractName: "Regional Value Network",
      contractNumber: "CNT-100892",
      network: "Regional Value Network",
      status: "Active",
      startDate: "2021-07-01",
      endDate: "2026-09-30"
    },
    {
      contractName: "Behavioral Health Alliance",
      contractNumber: "CNT-101045",
      network: "Behavioral Health Alliance",
      status: "Active",
      startDate: "2024-01-01",
      endDate: "2027-01-01"
    },
    {
      contractName: "Legacy Community Care",
      contractNumber: "CNT-098711",
      network: "Community Care Network",
      status: "Expired",
      startDate: "2018-01-01",
      endDate: "2022-12-31"
    },
    {
      contractName: "Senior Choice Medicare Advantage",
      contractNumber: "CNT-101299",
      network: "Senior Choice Network",
      status: "Pending",
      startDate: "2026-10-01",
      endDate: "2029-09-30"
    }
  ],

  // ---------------------------------------------------------
  // Fee schedules
  // ---------------------------------------------------------
  feeSchedules: [
    { cpt: "99213", description: "Office/outpatient visit, established patient, low complexity", allowedAmount: "$96.42", contract: "Meridian Preferred PPO" },
    { cpt: "99214", description: "Office/outpatient visit, established patient, moderate complexity", allowedAmount: "$135.18", contract: "Meridian Preferred PPO" },
    { cpt: "99396", description: "Periodic preventive exam, established patient, 40-64 years", allowedAmount: "$182.75", contract: "healthEdge Advantage HMO" },
    { cpt: "90837", description: "Psychotherapy, 60 minutes with patient", allowedAmount: "$148.30", contract: "Behavioral Health Alliance" },
    { cpt: "99203", description: "Office/outpatient visit, new patient, low-moderate complexity", allowedAmount: "$121.55", contract: "Regional Value Network" },
    { cpt: "99204", description: "Office/outpatient visit, new patient, moderate complexity", allowedAmount: "$178.90", contract: "Regional Value Network" },
    { cpt: "90834", description: "Psychotherapy, 45 minutes with patient", allowedAmount: "$112.60", contract: "Behavioral Health Alliance" },
    { cpt: "99406", description: "Smoking and tobacco use cessation counseling, 3-10 minutes", allowedAmount: "$18.25", contract: "Meridian Preferred PPO" },
    { cpt: "99385", description: "Initial preventive exam, new patient, 18-39 years", allowedAmount: "$165.40", contract: "healthEdge Advantage HMO" },
    { cpt: "G0439", description: "Annual wellness visit, subsequent", allowedAmount: "$142.10", contract: "Senior Choice Medicare Advantage" }
  ],

  // ---------------------------------------------------------
  // Support cases
  // ---------------------------------------------------------
  supportCases: [
    {
      caseNumber: "CASE-88213",
      subject: "Request to expedite recredentialing committee review",
      status: "Open",
      priority: "High"
    },
    {
      caseNumber: "CASE-87990",
      subject: "Fee schedule discrepancy for CPT 99214 under Meridian Preferred PPO",
      status: "Open",
      priority: "Medium"
    },
    {
      caseNumber: "CASE-86502",
      subject: "Live agent transfer failed — callback requested",
      status: "Closed",
      priority: "Medium"
    },
    {
      caseNumber: "CASE-85117",
      subject: "Update practice mailing address on file",
      status: "Closed",
      priority: "Low"
    },
    {
      caseNumber: "CASE-84330",
      subject: "Clarify Senior Choice Medicare Advantage contract effective date",
      status: "Closed",
      priority: "Low"
    }
  ],

  // ---------------------------------------------------------
  // Sidebar tab configuration
  // ---------------------------------------------------------
  tabs: [
    { id: "overview", label: "Overview" },
    { id: "profile", label: "My Profile" },
    { id: "credentialing", label: "Credentialing Status" },
    { id: "contracts", label: "Network Contracts" },
    { id: "feeSchedules", label: "Fee Schedules" },
    { id: "supportCases", label: "Support Cases" }
  ],

  // ---------------------------------------------------------
  // Login page "Try asking..." prompts
  // ---------------------------------------------------------
  samplePrompts: [
    "I'd like to verify my provider details. My name is Dr. Jane Smith, NPI 1234567890, phone 555-123-4567.",
    "What is my current credentialing status and what stage is my application in?",
    "What's the allowed amount for CPT code 99213 under my contract?",
    "Can you connect me to a live agent?"
  ],

  // ---------------------------------------------------------
  // Demo credentials
  // ---------------------------------------------------------
  credentials: {
    username: "provider.rep",
    password: "Demo@123"
  }
};
