/* ============================================================
   healthEdge AI — Network Participation Verification Agent
   Mock / demo data only. No real PHI/PII. For sales-engineering
   demo purposes.
   ============================================================ */

const heAI_DATA = {

  agent: {
    name: "Network Participation Verification Agent",
    shortName: "Network Participation Verification"
  },

  // ---------------------------------------------------------
  // Mock provider record returned by the two-factor lookup
  // (Provider Name + Provider NPI required to search).
  // ---------------------------------------------------------
  provider: {
    name: "Dr. Amara Okafor",
    npi: "1740283961",
    specialty: "Cardiology",
    city: "Denver",
    state: "CO",
    country: "USA"
  },

  // ---------------------------------------------------------
  // Overview stat tiles
  // ---------------------------------------------------------
  overviewStats: [
    { label: "Active Network Participations", value: "3", tone: "positive" },
    { label: "Inactive Participations", value: "1", tone: "warning" },
    { label: "Service Locations on File", value: "3", tone: "neutral" },
    { label: "Knowledge Articles Indexed", value: "128", tone: "positive" }
  ],

  overviewDescription:
    "The Network Participation Verification Agent helps internal payer staff confirm whether a provider " +
    "participates in a network before routing claims, scheduling, or referrals. Staff supply both the " +
    "Provider Name and Provider NPI — the agent will not search on just one of the two — and it returns the " +
    "provider's specialty, city, state, and country, every network they participate in with Active/Inactive " +
    "status and network tier, and every service location on file. A separate knowledge-search subagent handles " +
    "general policy and procedure questions, and dedicated guardrail subagents redirect off-topic chatter or " +
    "vague requests instead of guessing.",

  // ---------------------------------------------------------
  // Network participation
  // ---------------------------------------------------------
  networkParticipation: [
    {
      networkName: "Meridian Preferred PPO Network",
      status: "Active",
      tier: "Tier 1"
    },
    {
      networkName: "Advantage HMO Network",
      status: "Active",
      tier: "Tier 2"
    },
    {
      networkName: "Regional Value Network",
      status: "Active",
      tier: "Tier 2"
    },
    {
      networkName: "Legacy Community Care Network",
      status: "Inactive",
      tier: "Tier 3"
    }
  ],

  // ---------------------------------------------------------
  // Service locations
  // ---------------------------------------------------------
  serviceLocations: [
    {
      locationName: "Downtown Cardiology Clinic",
      address: "480 Larimer St, Suite 220",
      city: "Denver",
      state: "CO",
      country: "USA"
    },
    {
      locationName: "Westside Heart Center",
      address: "1275 Sheridan Blvd",
      city: "Lakewood",
      state: "CO",
      country: "USA"
    },
    {
      locationName: "Foothills Outpatient Center",
      address: "8901 Wadsworth Blvd",
      city: "Arvada",
      state: "CO",
      country: "USA"
    }
  ],

  // ---------------------------------------------------------
  // Knowledge FAQ (General FAQ subagent — knowledge search)
  // ---------------------------------------------------------
  faqs: [
    {
      question: "What's our policy for updating provider demographics?",
      answer:
        "Demographic changes (address, phone, specialty) must be submitted through the Provider Data " +
        "Management workflow and are reflected in the provider record within 2 business days of approval."
    },
    {
      question: "How do I request an expedited network participation review?",
      answer:
        "Submit an expedite request through the Network Operations queue with the provider's NPI and the " +
        "business justification. Standard turnaround is 5 business days; expedited requests are reviewed within 24 hours."
    },
    {
      question: "Where can I find the current fee schedule for a network?",
      answer:
        "Fee schedules are maintained by the Provider Contracting team and published to the internal Network " +
        "Operations knowledge base under each network's contract page."
    },
    {
      question: "Who do I contact if a provider can't be located with Name and NPI?",
      answer:
        "Verify both values with the provider's credentialing file first. If the record still can't be located, " +
        "escalate to the Provider Data Integrity team via case queue PDI-SUPPORT."
    }
  ],

  // ---------------------------------------------------------
  // Sidebar tab configuration
  // ---------------------------------------------------------
  tabs: [
    { id: "overview", label: "Overview" },
    { id: "providerLookup", label: "Provider Lookup" },
    { id: "networkParticipation", label: "Network Participation" },
    { id: "serviceLocations", label: "Service Locations" },
    { id: "knowledgeFaq", label: "Knowledge FAQ" }
  ],

  // ---------------------------------------------------------
  // Login page "Try asking..." prompts
  // (from the agent README's "Try It Out" section)
  // ---------------------------------------------------------
  samplePrompts: [
    "I need to check network participation for Dr. Jane Smith.",
    "NPI 1234567890.",
    "Can you verify network participation for Dr. Jane Smith, NPI 1234567890?",
    "What service locations does this provider have?",
    "What's our policy for updating provider demographics?"
  ],

  // ---------------------------------------------------------
  // Demo credentials
  // ---------------------------------------------------------
  credentials: {
    username: "network.ops",
    password: "Demo@123"
  }
};
