/* ============================================================
   healthEdge AI — Credentialing Status Agent
   Mock / demo data only. No real PHI/PII. For sales-engineering
   demo purposes.
   ============================================================ */

const heAI_DATA = {

  agent: {
    name: "Credentialing Status Agent",
    shortName: "Credentialing Status"
  },

  // ---------------------------------------------------------
  // Provider on the credentialing case (Healthcare_Provider__c
  // lookup on Credential__c)
  // ---------------------------------------------------------
  provider: {
    name: "Dr. Amara Chen",
    npi: "1922456780",
    specialty: "Cardiology",
    practiceName: "Cascade Cardiology Partners",
    email: "amara.chen@cascadecardiology.com",
    phone: "(555) 664-2210",
    verified: true
  },

  // ---------------------------------------------------------
  // Overview stat tiles
  // ---------------------------------------------------------
  overviewStats: [
    { label: "Credentialing Status", value: "In Progress", tone: "warning" },
    { label: "Current Stage", value: "Committee Review", tone: "neutral" },
    { label: "Missing Documents", value: "2", tone: "warning" },
    { label: "Expected Completion", value: "2026-08-25", tone: "positive" }
  ],

  overviewDescription:
    "The Credentialing Status Agent gives credentialing specialists, provider services representatives, " +
    "and provider relations representatives a single conversational entry point for the questions they field " +
    "every day: “Where does this case stand?”, “What does Committee Review actually mean?”, and " +
    "“What's still missing before we can approve this?” Give it a Credential record's CR-###### Name and it " +
    "returns the case summary, explains the current status and stage in plain language, and checks for missing " +
    "documents — automatically emailing the provider a reminder whenever documents are still outstanding.",

  // ---------------------------------------------------------
  // Credentialing case (Credential__c, Name = CR-000045)
  // ---------------------------------------------------------
  credentialing: {
    current: {
      credentialId: "CR-000045",
      status: "In Progress",
      currentStage: "Committee Review",
      applicationDate: "2026-05-04",
      committeeReviewDate: "2026-08-12",
      expectedCompletion: "2026-08-25",
      assignedAnalyst: "Renee Okafor",
      rejectionReason: null
    },
    history: [
      {
        cycle: "2023 Recredentialing (CR-000031)",
        status: "Approved",
        applicationDate: "2023-02-14",
        completionDate: "2023-05-02",
        analyst: "Priya Nadarajan"
      },
      {
        cycle: "2020 Recredentialing (CR-000018)",
        status: "Approved",
        applicationDate: "2020-01-20",
        completionDate: "2020-04-11",
        analyst: "Deborah Chu"
      },
      {
        cycle: "2018 Initial Credentialing (CR-000004)",
        status: "Rejected",
        applicationDate: "2018-06-01",
        completionDate: "2018-08-15",
        analyst: "Ray Ostrowski",
        rejectionReason: "Missing verification of malpractice insurance history"
      }
    ]
  },

  // ---------------------------------------------------------
  // Plain-language status/stage explanations
  // (mirrors the canned strings returned by the
  // Explaining_Credentialing_Status flow)
  // ---------------------------------------------------------
  statusExplanations: [
    {
      status: "In Progress",
      stage: "Verification",
      explanation:
        "Provider is currently in the Verification stage and credentialing remains in progress. Required " +
        "reviews are being completed before the case can move to committee review."
    },
    {
      status: "In Progress",
      stage: "Committee Review",
      explanation:
        "The provider's credentialing application is currently in the Committee Review stage and remains in " +
        "progress. Verification activities have been completed, and the case is awaiting final review and " +
        "decision by the credentialing committee."
    },
    {
      status: "Approved",
      stage: "—",
      explanation: "Credentialing activities have been completed successfully and the provider has been approved."
    },
    {
      status: "Rejected",
      stage: "—",
      explanation: "The credentialing request could not be approved because one or more requirements were not satisfied."
    },
    {
      status: "Other / Not Configured",
      stage: "—",
      explanation:
        "Current credentialing status information is available but no specific explanation has been configured " +
        "for this status."
    }
  ],

  // ---------------------------------------------------------
  // Missing document check (Credentialing_Document__c)
  // Status__c picklist: Missing, Submitted, Pending Review,
  // Approved, Rejected
  // ---------------------------------------------------------
  missingDocuments: [
    { name: "Board Certification Copy", status: "Missing" },
    { name: "Malpractice Insurance Certificate", status: "Submitted" },
    { name: "DEA Registration", status: "Pending Review" },
    { name: "State License Verification", status: "Approved" },
    { name: "W-9 Form", status: "Missing" }
  ],

  // ---------------------------------------------------------
  // Sidebar tab configuration
  // ---------------------------------------------------------
  tabs: [
    { id: "overview", label: "Overview" },
    { id: "providerLookup", label: "Provider Lookup" },
    { id: "caseSummary", label: "Case Summary" },
    { id: "statusExplanation", label: "Status Explanation" },
    { id: "missingDocuments", label: "Missing Documents" }
  ],

  // ---------------------------------------------------------
  // Login page "Try asking..." prompts (from the agent's README)
  // ---------------------------------------------------------
  samplePrompts: [
    "Can you summarize credentialing case CR-000045?",
    "What does the Committee Review status mean for this case?",
    "What documents are still missing for CR-000045?",
    "Show me the current credentialing status for CR-000012."
  ],

  // ---------------------------------------------------------
  // Demo credentials
  // ---------------------------------------------------------
  credentials: {
    username: "credentialing.analyst",
    password: "Demo@123"
  }
};
