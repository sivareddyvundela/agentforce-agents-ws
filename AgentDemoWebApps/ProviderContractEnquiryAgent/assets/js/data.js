/* ==========================================================================
   healthEdge AI — Provider Contract Inquiry Agent
   Mock / demo data only. No real provider, contract, or PHI data.
   ========================================================================== */

const HE_DATA = {

  agentName: "Provider Contract Inquiry",

  /* ------------------------------------------------------------------
     Contracts
     Statuses are derived at build time relative to a fixed "today" of
     2026-07-21 so the "Expiring Soon" / "Expired" badges line up with
     the dates below without needing a live date engine for the demo.
     ------------------------------------------------------------------ */
  contracts: [
    {
      contractNumber: "00000105",
      providerName: "Dr. John Smith",
      npi: "1234567890",
      specialty: "Internal Medicine",
      effectiveDate: "2023-01-01",
      expirationDate: "2027-01-01",
      status: "Active",
      daysToExpiration: 529
    },
    {
      contractNumber: "00000112",
      providerName: "Dr. Angela Rivera",
      npi: "1457892036",
      specialty: "Cardiology",
      effectiveDate: "2022-05-01",
      expirationDate: "2026-08-05",
      status: "Expiring Soon",
      daysToExpiration: 15
    },
    {
      contractNumber: "00000128",
      providerName: "Dr. Michael Chen",
      npi: "1689234570",
      specialty: "Orthopedic Surgery",
      effectiveDate: "2021-03-15",
      expirationDate: "2026-08-14",
      status: "Expiring Soon",
      daysToExpiration: 24
    },
    {
      contractNumber: "00000134",
      providerName: "Dr. Sarah Thompson",
      npi: "1902345671",
      specialty: "Family Medicine",
      effectiveDate: "2020-11-01",
      expirationDate: "2026-06-30",
      status: "Expired",
      daysToExpiration: -21
    },
    {
      contractNumber: "00000147",
      providerName: "Dr. Robert Nguyen",
      npi: "1023456782",
      specialty: "Endocrinology",
      effectiveDate: "2024-01-01",
      expirationDate: "2028-01-01",
      status: "Active",
      daysToExpiration: 894
    },
    {
      contractNumber: "00000159",
      providerName: "Dr. Linda Martinez",
      npi: "1345678903",
      specialty: "OB/GYN",
      effectiveDate: "2023-07-01",
      expirationDate: "2027-07-01",
      status: "Active",
      daysToExpiration: 710
    },
    {
      contractNumber: "00000163",
      providerName: "Dr. David Okafor",
      npi: "1567890124",
      specialty: "Dermatology",
      effectiveDate: "2022-09-01",
      expirationDate: "2026-09-15",
      status: "Active",
      daysToExpiration: 56
    },
    {
      contractNumber: "00000178",
      providerName: "Dr. Emily Park",
      npi: "1789012345",
      specialty: "Behavioral Health",
      effectiveDate: "2021-01-01",
      expirationDate: "2025-12-31",
      status: "Expired",
      daysToExpiration: -202
    },
    {
      contractNumber: "00000185",
      providerName: "Dr. James Wilson",
      npi: "1890123456",
      specialty: "Gastroenterology",
      effectiveDate: "2024-04-01",
      expirationDate: "2029-04-01",
      status: "Active",
      daysToExpiration: 984
    },
    {
      contractNumber: "00000192",
      providerName: "Dr. Priya Patel",
      npi: "1912345067",
      specialty: "Pediatrics",
      effectiveDate: "2023-02-01",
      expirationDate: "2026-07-25",
      status: "Expiring Soon",
      daysToExpiration: 4
    }
  ],

  /* ------------------------------------------------------------------
     Provider Network Information
     ------------------------------------------------------------------ */
  networkInfo: [
    {
      contractNumber: "00000105",
      providerName: "Dr. John Smith",
      networkName: "PPO Premier Network",
      tier: "Tier 1",
      enrollmentStatus: "Enrolled"
    },
    {
      contractNumber: "00000105",
      providerName: "Dr. John Smith",
      networkName: "HMO Select Network",
      tier: "Tier 2",
      enrollmentStatus: "Enrolled"
    },
    {
      contractNumber: "00000112",
      providerName: "Dr. Angela Rivera",
      networkName: "PPO Premier Network",
      tier: "Tier 1",
      enrollmentStatus: "Enrolled"
    },
    {
      contractNumber: "00000128",
      providerName: "Dr. Michael Chen",
      networkName: "Specialty Surgical Network",
      tier: "Tier 2",
      enrollmentStatus: "Enrolled"
    },
    {
      contractNumber: "00000134",
      providerName: "Dr. Sarah Thompson",
      networkName: "PPO Premier Network",
      tier: "Tier 3",
      enrollmentStatus: "Pending Renewal"
    },
    {
      contractNumber: "00000147",
      providerName: "Dr. Robert Nguyen",
      networkName: "Specialty Care Network",
      tier: "Tier 1",
      enrollmentStatus: "Enrolled"
    },
    {
      contractNumber: "00000159",
      providerName: "Dr. Linda Martinez",
      networkName: "HMO Select Network",
      tier: "Tier 2",
      enrollmentStatus: "Enrolled"
    },
    {
      contractNumber: "00000163",
      providerName: "Dr. David Okafor",
      networkName: "PPO Premier Network",
      tier: "Tier 1",
      enrollmentStatus: "Enrolled"
    }
  ],

  /* ------------------------------------------------------------------
     Fee Schedule Information (primarily contract 00000105 for demo flow)
     ------------------------------------------------------------------ */
  feeSchedules: [
    {
      contractNumber: "00000105",
      code: "99213",
      description: "Office Visit, Established Patient (Low)",
      rateType: "Fee-for-Service",
      rate: "$92.50",
      effectiveDate: "2023-01-01",
      endDate: "2026-12-31"
    },
    {
      contractNumber: "00000105",
      code: "99214",
      description: "Office Visit, Established Patient (Moderate)",
      rateType: "Fee-for-Service",
      rate: "$128.75",
      effectiveDate: "2023-01-01",
      endDate: "2026-12-31"
    },
    {
      contractNumber: "00000105",
      code: "99203",
      description: "Office Visit, New Patient",
      rateType: "Fee-for-Service",
      rate: "$145.00",
      effectiveDate: "2023-01-01",
      endDate: "2026-12-31"
    },
    {
      contractNumber: "00000105",
      code: "90837",
      description: "Psychotherapy, 60 Minutes",
      rateType: "Fee-for-Service",
      rate: "$165.00",
      effectiveDate: "2023-01-01",
      endDate: "2026-12-31"
    },
    {
      contractNumber: "00000105",
      code: "99396",
      description: "Preventive Visit, Established (40-64yr)",
      rateType: "Fee-for-Service",
      rate: "$175.00",
      effectiveDate: "2023-01-01",
      endDate: "2026-12-31"
    },
    {
      contractNumber: "00000105",
      code: "99385",
      description: "Preventive Visit, New Patient (18-39yr)",
      rateType: "Fee-for-Service",
      rate: "$160.00",
      effectiveDate: "2023-01-01",
      endDate: "2026-12-31"
    },
    {
      contractNumber: "00000105",
      code: "93000",
      description: "Electrocardiogram, Complete",
      rateType: "Fee-for-Service",
      rate: "$45.00",
      effectiveDate: "2023-01-01",
      endDate: "2026-12-31"
    },
    {
      contractNumber: "00000105",
      code: "71046",
      description: "Chest X-Ray, 2 Views",
      rateType: "Fee-for-Service",
      rate: "$58.25",
      effectiveDate: "2023-01-01",
      endDate: "2026-12-31"
    },
    {
      contractNumber: "00000105",
      code: "80053",
      description: "Comprehensive Metabolic Panel",
      rateType: "Fee-for-Service",
      rate: "$32.00",
      effectiveDate: "2023-01-01",
      endDate: "2026-12-31"
    },
    {
      contractNumber: "00000105",
      code: "99490",
      description: "Chronic Care Management, 20 min/month",
      rateType: "Value-Based",
      rate: "$62.00",
      effectiveDate: "2024-01-01",
      endDate: "2026-12-31"
    }
  ],

  /* ------------------------------------------------------------------
     Amendment History (primarily contract 00000105 for demo flow)
     ------------------------------------------------------------------ */
  amendments: [
    {
      contractNumber: "00000105",
      amendmentDate: "2024-01-15",
      changedField: "Reimbursement Rate (CPT 99213)",
      oldValue: "$85.00",
      newValue: "$92.50",
      summary: "Annual fee schedule adjustment applied per CMS rate update."
    },
    {
      contractNumber: "00000105",
      amendmentDate: "2024-06-01",
      changedField: "Contract Expiration Date",
      oldValue: "2025-01-01",
      newValue: "2027-01-01",
      summary: "Two-year renewal extension executed with provider group."
    },
    {
      contractNumber: "00000105",
      amendmentDate: "2025-02-10",
      changedField: "Provider Network Tier",
      oldValue: "Tier 2",
      newValue: "Tier 1",
      summary: "Provider upgraded to Tier 1 following quality performance review."
    },
    {
      contractNumber: "00000105",
      amendmentDate: "2025-08-01",
      changedField: "Service Location",
      oldValue: "N/A",
      newValue: "Downtown Medical Plaza, Suite 400",
      summary: "New practice location added to existing contract terms."
    },
    {
      contractNumber: "00000105",
      amendmentDate: "2026-01-05",
      changedField: "Reimbursement Rate (CPT 99214)",
      oldValue: "$118.00",
      newValue: "$128.75",
      summary: "Mid-year rate adjustment negotiated with provider group."
    },
    {
      contractNumber: "00000105",
      amendmentDate: "2026-05-20",
      changedField: "Amendment Type",
      oldValue: "Standard",
      newValue: "Value-Based Addendum",
      summary: "Added value-based care addendum covering chronic care management services."
    }
  ]
};

/* Convenience stat computations used by the Overview tab. */
HE_DATA.stats = {
  totalContracts: HE_DATA.contracts.length,
  activeContracts: HE_DATA.contracts.filter(c => c.status === "Active").length,
  expiringSoon: HE_DATA.contracts.filter(c => c.status === "Expiring Soon").length,
  expired: HE_DATA.contracts.filter(c => c.status === "Expired").length
};
