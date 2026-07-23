/* ============================================================
   healthEdge AI — Provider Issue Management
   Mock / demo data only. No real PHI/PII. For sales-engineering
   demo purposes.
   ============================================================ */

const heAI_DATA = {

  agent: {
    name: "Provider Issue Management Agent",
    shortName: "Provider Issue Management"
  },

  // ---------------------------------------------------------
  // Provider profile (the caller identified by Name + NPI)
  // ---------------------------------------------------------
  provider: {
    name: "Dr. Amara Okafor",
    npi: "1932584776",
    specialty: "Cardiology",
    practiceName: "Lakeside Cardiology Associates",
    phone: "(555) 402-8817",
    status: "Verified"
  },

  // ---------------------------------------------------------
  // Overview stat tiles
  // ---------------------------------------------------------
  overviewStats: [
    { label: "Issues Triaged Today", value: "47", tone: "neutral" },
    { label: "Escalation Rate", value: "18%", tone: "warning" },
    { label: "Avg Confidence Score", value: "82", tone: "positive" },
    { label: "Live Escalations Today", value: "6", tone: "warning" }
  ],

  overviewDescription:
    "The Provider Issue Management Agent handles inbound provider contacts about claims, payments, " +
    "credentialing, contracts, and directory listings. After confirming the provider's identity by Name " +
    "and NPI, it classifies the provider's free-text issue with a confidence score and, when that score is " +
    "60 or higher, pulls the relevant record data and recommends a resolution path — a status update, a " +
    "request for more information, or escalation to the Escalation Team queue. Low-confidence or unmatched " +
    "issues are routed straight to a live agent instead of guessing.",

  // ---------------------------------------------------------
  // Example issue classification result
  // ---------------------------------------------------------
  classification: {
    issueType: "Claims Issue",
    confidenceScore: 88,
    summary:
      "Provider reports submitting a claim roughly two weeks ago and has not received any status update. " +
      "Message indicates a claims-status inquiry rather than a payment dispute."
  },

  // ---------------------------------------------------------
  // Example resolution recommendation
  // ---------------------------------------------------------
  recommendation: {
    action: "Provide Status Update",
    explanation:
      "Claim CLM-70213 for this provider is in Finalized status with no denial recorded. Share the finalized " +
      "status and claim details directly with the provider; no further action or escalation is required."
  },

  // ---------------------------------------------------------
  // Recent cases (spanning issue types, confidence, actions)
  // ---------------------------------------------------------
  recentCases: [
    {
      caseNumber: "CASE-91042",
      issueType: "Claims Issue",
      confidenceScore: 88,
      recommendedAction: "Provide Status Update",
      status: "Resolved"
    },
    {
      caseNumber: "CASE-91039",
      issueType: "Payment Inquiry",
      confidenceScore: 74,
      recommendedAction: "Request Additional Information",
      status: "Pending"
    },
    {
      caseNumber: "CASE-91027",
      issueType: "Credentialing Issue",
      confidenceScore: 91,
      recommendedAction: "Provide Status Update",
      status: "Resolved"
    },
    {
      caseNumber: "CASE-91015",
      issueType: "Contract Issue",
      confidenceScore: 65,
      recommendedAction: "Escalate to Support Queue",
      status: "Escalated"
    },
    {
      caseNumber: "CASE-91002",
      issueType: "Directory Issue",
      confidenceScore: 79,
      recommendedAction: "Escalate to Support Queue",
      status: "Escalated"
    },
    {
      caseNumber: "CASE-90988",
      issueType: "Unknown",
      confidenceScore: 32,
      recommendedAction: "No Action Available – Recommend Escalation",
      status: "Escalated"
    }
  ],

  // ---------------------------------------------------------
  // Sidebar tab configuration
  // ---------------------------------------------------------
  tabs: [
    { id: "overview", label: "Overview" },
    { id: "profile", label: "Provider Profile" },
    { id: "classification", label: "Issue Classification" },
    { id: "recommendation", label: "Resolution Recommendation" },
    { id: "cases", label: "Recent Cases" }
  ],

  // ---------------------------------------------------------
  // Login page "Try asking..." prompts
  // ---------------------------------------------------------
  samplePrompts: [
    "My name is Dr. Jane Smith, NPI 1234567890. I submitted a claim two weeks ago and haven't heard anything.",
    "What's the status of my credentialing application?",
    "My contract seems to have expired — can you check?",
    "My phone number and specialty are listed incorrectly in the directory.",
    "Can you connect me to a live agent?"
  ],

  // ---------------------------------------------------------
  // Demo credentials
  // ---------------------------------------------------------
  credentials: {
    username: "support.rep",
    password: "Demo@123"
  }
};
