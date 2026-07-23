/* ==========================================================================
   healthEdge AI — Employer Support Agent
   Mock / demo data only. No real member, employer, or PHI data.
   ========================================================================== */

const HE_DATA = {
  employer: {
    name: "Acme Health Benefits",
    accountNumber: "EMP-1001",
    billingCity: "Charlotte",
    billingState: "NC",
    accountOwner: "Priya Natarajan",
    verified: true
  },

  stats: {
    activePolicies: 5,
    totalParticipants: 9,
    openCases: 3,
    upcomingRenewals: 2
  },

  policies: [
    {
      policyName: "Acme Group Medical - PPO Plus",
      status: "Active",
      effectiveFrom: "2025-01-01",
      effectiveTo: "2025-12-31",
      policyType: "Group Medical",
      premiumAmount: "$48,250.00",
      premiumFrequency: "Monthly",
      renewalDate: "2026-01-01"
    },
    {
      policyName: "Acme Group Dental - Standard",
      status: "Active",
      effectiveFrom: "2025-01-01",
      effectiveTo: "2025-12-31",
      policyType: "Group Dental",
      premiumAmount: "$6,120.00",
      premiumFrequency: "Monthly",
      renewalDate: "2026-01-01"
    },
    {
      policyName: "Acme Group Vision - Essential",
      status: "Active",
      effectiveFrom: "2025-01-01",
      effectiveTo: "2025-12-31",
      policyType: "Group Vision",
      premiumAmount: "$1,840.00",
      premiumFrequency: "Monthly",
      renewalDate: "2026-01-01"
    },
    {
      policyName: "Acme Group Medical - HDHP",
      status: "Pending Renewal",
      effectiveFrom: "2025-02-01",
      effectiveTo: "2026-01-31",
      policyType: "Group Medical",
      premiumAmount: "$31,400.00",
      premiumFrequency: "Monthly",
      renewalDate: "2026-02-01"
    },
    {
      policyName: "Acme Group Dental - Premier",
      status: "Pending Renewal",
      effectiveFrom: "2025-03-01",
      effectiveTo: "2026-02-28",
      policyType: "Group Dental",
      premiumAmount: "$4,980.00",
      premiumFrequency: "Annual",
      renewalDate: "2026-03-01"
    },
    {
      policyName: "Acme Legacy Medical - EPO",
      status: "Lapsed",
      effectiveFrom: "2023-06-01",
      effectiveTo: "2024-05-31",
      policyType: "Group Medical",
      premiumAmount: "$27,900.00",
      premiumFrequency: "Monthly",
      renewalDate: "2024-06-01"
    },
    {
      policyName: "Acme Group Vision - Enhanced",
      status: "Active",
      effectiveFrom: "2025-04-01",
      effectiveTo: "2026-03-31",
      policyType: "Group Vision",
      premiumAmount: "$2,260.00",
      premiumFrequency: "Annual",
      renewalDate: "2026-04-01"
    }
  ],

  participants: [
    {
      name: "Daniel Foster",
      role: "Subscriber",
      isActive: "Y",
      effectiveFrom: "2025-01-01",
      effectiveTo: "2025-12-31",
      relationship: "Self"
    },
    {
      name: "Marissa Foster",
      role: "Dependent",
      isActive: "Y",
      effectiveFrom: "2025-01-01",
      effectiveTo: "2025-12-31",
      relationship: "Spouse"
    },
    {
      name: "Owen Foster",
      role: "Dependent",
      isActive: "Y",
      effectiveFrom: "2025-01-01",
      effectiveTo: "2025-12-31",
      relationship: "Child"
    },
    {
      name: "Renee Castillo",
      role: "Subscriber",
      isActive: "Y",
      effectiveFrom: "2025-02-01",
      effectiveTo: "2025-12-31",
      relationship: "Self"
    },
    {
      name: "Marcus Castillo",
      role: "Dependent",
      isActive: "Y",
      effectiveFrom: "2025-02-01",
      effectiveTo: "2025-12-31",
      relationship: "Child"
    },
    {
      name: "Alicia Vance",
      role: "Subscriber",
      isActive: "Y",
      effectiveFrom: "2025-01-15",
      effectiveTo: "2025-12-31",
      relationship: "Self"
    },
    {
      name: "Grant Whitfield",
      role: "Subscriber",
      isActive: "N",
      effectiveFrom: "2024-01-01",
      effectiveTo: "2024-12-31",
      relationship: "Self"
    },
    {
      name: "Bianca Whitfield",
      role: "Dependent",
      isActive: "N",
      effectiveFrom: "2024-01-01",
      effectiveTo: "2024-12-31",
      relationship: "Spouse"
    },
    {
      name: "Tomas Herrera",
      role: "Subscriber",
      isActive: "Y",
      effectiveFrom: "2025-03-01",
      effectiveTo: "2025-12-31",
      relationship: "Self"
    }
  ],

  coverages: [
    {
      coverageName: "PPO Plus - In-Network Medical",
      category: "Medical",
      effectiveFrom: "2025-01-01",
      effectiveTo: "2025-12-31",
      deductible: "$1,500.00"
    },
    {
      coverageName: "PPO Plus - Out-of-Network Medical",
      category: "Medical",
      effectiveFrom: "2025-01-01",
      effectiveTo: "2025-12-31",
      deductible: "$3,000.00"
    },
    {
      coverageName: "Standard Dental - Preventive & Basic",
      category: "Dental",
      effectiveFrom: "2025-01-01",
      effectiveTo: "2025-12-31",
      deductible: "$50.00"
    },
    {
      coverageName: "Standard Dental - Major Services",
      category: "Dental",
      effectiveFrom: "2025-01-01",
      effectiveTo: "2025-12-31",
      deductible: "$150.00"
    },
    {
      coverageName: "Essential Vision - Annual Exam",
      category: "Vision",
      effectiveFrom: "2025-01-01",
      effectiveTo: "2025-12-31",
      deductible: "$0.00"
    },
    {
      coverageName: "HDHP - Medical Base Plan",
      category: "Medical",
      effectiveFrom: "2025-02-01",
      effectiveTo: "2026-01-31",
      deductible: "$3,500.00"
    },
    {
      coverageName: "Rx - Tiered Prescription Coverage",
      category: "Rx",
      effectiveFrom: "2025-01-01",
      effectiveTo: "2025-12-31",
      deductible: "$250.00"
    }
  ],

  contacts: [
    {
      name: "Priya Natarajan",
      email: "priya.natarajan@acmehealthbenefits.com",
      phone: "(704) 555-0132",
      title: "HR Benefits Manager"
    },
    {
      name: "Ellen Marsh",
      email: "ellen.marsh@acmehealthbenefits.com",
      phone: "(704) 555-0187",
      title: "Payroll Administrator"
    },
    {
      name: "Victor Osei",
      email: "victor.osei@acmehealthbenefits.com",
      phone: "(704) 555-0219",
      title: "Total Rewards Director"
    },
    {
      name: "Camille Dupree",
      email: "camille.dupree@acmehealthbenefits.com",
      phone: "(704) 555-0245",
      title: "Benefits Coordinator"
    },
    {
      name: "Harold Jennings",
      email: "harold.jennings@acmehealthbenefits.com",
      phone: "(704) 555-0301",
      title: "VP of People Operations"
    }
  ],

  cases: [
    {
      caseNumber: "CASE-10234",
      subject: "Renewal premium discrepancy on HDHP plan",
      status: "Escalated",
      priority: "High",
      type: "Billing",
      description: "Employer reports quoted renewal premium does not match invoice amount for the HDHP plan effective 2026-02-01."
    },
    {
      caseNumber: "CASE-10241",
      subject: "New participant enrollment delay",
      status: "In Progress",
      priority: "Medium",
      type: "Enrollment",
      description: "Two newly hired employees not yet reflected as active participants under Group Medical - PPO Plus."
    },
    {
      caseNumber: "CASE-10256",
      subject: "Dependent coverage termination request",
      status: "New",
      priority: "Medium",
      type: "Enrollment",
      description: "Request to terminate dependent coverage for a participant following a qualifying life event."
    },
    {
      caseNumber: "CASE-10262",
      subject: "Certificate of coverage document request",
      status: "Closed",
      priority: "Low",
      type: "Documentation",
      description: "HR requested certificates of coverage for all active policies for annual audit purposes."
    },
    {
      caseNumber: "CASE-10271",
      subject: "Vision plan deductible question",
      status: "Closed",
      priority: "Low",
      type: "General Inquiry",
      description: "Employer asked for clarification on deductible waiver for annual eye exams under Essential Vision."
    },
    {
      caseNumber: "CASE-10288",
      subject: "Group dental plan upgrade inquiry",
      status: "In Progress",
      priority: "Medium",
      type: "Plan Change",
      description: "Employer exploring upgrade from Standard Dental to Premier Dental ahead of renewal."
    },
    {
      caseNumber: "CASE-10299",
      subject: "Lapsed legacy medical plan reinstatement",
      status: "Escalated",
      priority: "High",
      type: "Billing",
      description: "Employer disputes lapse status of Acme Legacy Medical - EPO and is requesting reinstatement review."
    },
    {
      caseNumber: "CASE-10305",
      subject: "Employee census file upload issue",
      status: "New",
      priority: "Medium",
      type: "Technical",
      description: "Payroll administrator unable to upload the quarterly employee census file through the employer portal."
    }
  ]
};
