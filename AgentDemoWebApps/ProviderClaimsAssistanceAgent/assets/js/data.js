/* ============================================================
   healthEdge AI — Provider Claims Assistance
   Mock / demo data only. No real PHI/PII. For sales-engineering
   demo purposes.
   ============================================================ */

const heAI_DATA = {

  agent: {
    name: "Provider Claims Assistance Agent",
    shortName: "Claims Issue Agent"
  },

  // ---------------------------------------------------------
  // Overview stat tiles
  // ---------------------------------------------------------
  overviewStats: [
    { label: "Open Claims", value: "6", tone: "warning" },
    { label: "Denied Claims", value: "1", tone: "negative" },
    { label: "Total Paid Amount", value: "$4,820.00", tone: "positive" },
    { label: "Claims on File", value: "6", tone: "neutral" }
  ],

  overviewDescription:
    "The Provider Claims Assistance Agent handles inbound questions from providers and support staff about a " +
    "specific submitted claim. After the caller supplies a Claim Number (format CLM-00000), the agent looks up " +
    "the matching Provider Claim record and reports back the Healthcare Provider, Claim Type, Status, key dates, " +
    "and dollar amounts in a clear, conversational summary — surfacing the Claim Denial Reason only when the " +
    "claim's status is Denied. The agent is strictly read-only: it never creates, updates, or deletes claim data, " +
    "and it tells the caller to verify the claim number and try again if no matching record is found.",

  // ---------------------------------------------------------
  // Claim Lookup tab — one example claim rendered as a card
  // ---------------------------------------------------------
  currentClaim: {
    claimNumber: "CLM-00042",
    healthcareProvider: "Dr. Anita Wexler — Lakeshore Family Medicine",
    claimType: "Medical Claim",
    status: "Denied",
    initiationDate: "2026-04-02",
    finalizedDate: "2026-05-19",
    estimatedAmount: "$1,240.00",
    actualAmount: "$1,240.00",
    approvedAmount: "$0.00",
    claimDenialReason: "Service not covered under the member's active plan benefit; prior authorization was not obtained before the procedure was performed."
  },

  // ---------------------------------------------------------
  // Claim History table
  // ---------------------------------------------------------
  claimHistory: [
    {
      claimNumber: "CLM-00042",
      claimType: "Medical Claim",
      status: "Denied",
      initiationDate: "2026-04-02",
      approvedAmount: "$0.00"
    },
    {
      claimNumber: "CLM-00107",
      claimType: "Professional Claim",
      status: "Paid",
      initiationDate: "2026-06-11",
      approvedAmount: "$860.00"
    },
    {
      claimNumber: "CLM-00118",
      claimType: "Institutional Claim",
      status: "Under Review",
      initiationDate: "2026-07-01",
      approvedAmount: "$0.00"
    },
    {
      claimNumber: "CLM-00095",
      claimType: "Pharmacy Claim",
      status: "Approved",
      initiationDate: "2026-05-22",
      approvedAmount: "$312.00"
    },
    {
      claimNumber: "CLM-00073",
      claimType: "Behavioral Health Claim",
      status: "Closed",
      initiationDate: "2026-03-14",
      approvedAmount: "$980.00"
    },
    {
      claimNumber: "CLM-00061",
      claimType: "Dental Claim",
      status: "Submitted",
      initiationDate: "2026-07-15",
      approvedAmount: "$0.00"
    }
  ],

  // ---------------------------------------------------------
  // Sidebar tab configuration
  // ---------------------------------------------------------
  tabs: [
    { id: "overview", label: "Overview" },
    { id: "claimLookup", label: "Claim Lookup" },
    { id: "claimHistory", label: "Claim History" }
  ],

  // ---------------------------------------------------------
  // Login page "Try asking..." prompts
  // ---------------------------------------------------------
  samplePrompts: [
    "What's the status of claim CLM-00042?",
    "Can you pull up the details for claim number CLM-00107?",
    "Why was my claim denied?",
    "I don't have my claim number — can you look it up another way?"
  ],

  // ---------------------------------------------------------
  // Demo credentials
  // ---------------------------------------------------------
  credentials: {
    username: "claims.support",
    password: "Demo@123"
  }
};
