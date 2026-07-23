/* ============================================================
   healthEdge AI — Provider Termination Agent
   Mock / demo data only. No real PHI/PII. For sales-engineering
   demo purposes.
   ============================================================ */

const heAI_DATA = {

  agent: {
    name: "Provider Termination Agent",
    shortName: "Provider Termination"
  },

  // ---------------------------------------------------------
  // Overview stat tiles
  // ---------------------------------------------------------
  overviewStats: [
    { label: "Pending Termination Requests", value: "3", tone: "warning" },
    { label: "Providers Reviewed", value: "18", tone: "neutral" },
    { label: "Active Authorizations Flagged", value: "7", tone: "warning" },
    { label: "Impacted Members Identified", value: "12", tone: "positive" }
  ],

  overviewDescription:
    "The Provider Termination Agent helps network operations and contact-center staff safely remove a provider " +
    "from the network. Given an NPI, it looks up the HealthcareProvider record and immediately surfaces an " +
    "impact analysis — every impacted member and every active authorization tied to that provider — before any " +
    "action is taken. Only after the user reviews that impact and explicitly confirms does the agent collect an " +
    "effective date and reason, then create a Provider Termination Request. Built-in duplicate-request protection " +
    "checks for an existing non-Approved request first, so the same provider is never submitted twice.",

  // ---------------------------------------------------------
  // Provider profile (looked up by NPI)
  // ---------------------------------------------------------
  provider: {
    name: "Dr. Aaron Kessler",
    npi: "1932584710",
    status: "Active",
    specialty: "Orthopedic Surgery"
  },

  // ---------------------------------------------------------
  // Impacted members (Account records linked to the provider)
  // ---------------------------------------------------------
  impactedMembers: [
    { name: "Linda Marsh", phone: "(555) 240-1187", email: "linda.marsh@example.com" },
    { name: "Terrence Okafor", phone: "(555) 240-2093", email: "terrence.okafor@example.com" },
    { name: "Priya Chandrasekaran", phone: "(555) 240-3325", email: "priya.chandra@example.com" },
    { name: "Miguel Fuentes", phone: "(555) 240-4461", email: "miguel.fuentes@example.com" },
    { name: "Sandra Blume", phone: "(555) 240-5578", email: "sandra.blume@example.com" }
  ],

  // ---------------------------------------------------------
  // Active authorizations (Authorization__c, Status__c = Active)
  // ---------------------------------------------------------
  activeAuthorizations: [
    { authorizationNumber: "Auth-0142", type: "Surgery", status: "Active", startDate: "2026-06-01", endDate: "2026-09-30" },
    { authorizationNumber: "Auth-0158", type: "Consultation", status: "Active", startDate: "2026-07-01", endDate: "2026-08-15" },
    { authorizationNumber: "Auth-0163", type: "Lab Test", status: "Active", startDate: "2026-06-20", endDate: "2026-07-31" },
    { authorizationNumber: "Auth-0171", type: "Medication", status: "Active", startDate: "2026-05-15", endDate: "2026-11-15" },
    { authorizationNumber: "Auth-0184", type: "Home Care", status: "Active", startDate: "2026-07-10", endDate: "2026-10-10" }
  ],

  // ---------------------------------------------------------
  // Termination requests (Provider_Termination_Request__c)
  // ---------------------------------------------------------
  terminationRequests: [
    {
      requestNumber: "PTR-0021",
      status: "Pending",
      effectiveDate: "2026-09-01",
      reason: "Contract Expired",
      impactedMembersCount: 5,
      activeAuthorizationsCount: 5
    },
    {
      requestNumber: "PTR-0019",
      status: "Approved",
      effectiveDate: "2026-06-30",
      reason: "Retirement",
      impactedMembersCount: 3,
      activeAuthorizationsCount: 1
    },
    {
      requestNumber: "PTR-0014",
      status: "Draft",
      effectiveDate: "2026-08-15",
      reason: "Network Change",
      impactedMembersCount: 8,
      activeAuthorizationsCount: 4
    },
    {
      requestNumber: "PTR-0009",
      status: "Cancelled",
      effectiveDate: "2026-05-01",
      reason: "Compliance Issue",
      impactedMembersCount: 2,
      activeAuthorizationsCount: 0
    }
  ],

  // ---------------------------------------------------------
  // Sidebar tab configuration
  // ---------------------------------------------------------
  tabs: [
    { id: "overview", label: "Overview" },
    { id: "providerLookup", label: "Provider Lookup" },
    { id: "impactedMembers", label: "Impacted Members" },
    { id: "activeAuthorizations", label: "Active Authorizations" },
    { id: "terminationRequests", label: "Termination Requests" }
  ],

  // ---------------------------------------------------------
  // Login page "Try asking..." prompts
  // ---------------------------------------------------------
  samplePrompts: [
    "I need to terminate a provider with NPI 1932584710.",
    "Show me the impacted members and active authorizations for this provider.",
    "Yes, go ahead and submit the termination request. Effective date is September 1st, 2026, reason is Contract Expired.",
    "Is there already a termination request for this provider?"
  ],

  // ---------------------------------------------------------
  // Demo credentials
  // ---------------------------------------------------------
  credentials: {
    username: "network.ops.admin",
    password: "Demo@123"
  }
};
