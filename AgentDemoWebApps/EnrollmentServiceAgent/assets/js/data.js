/* ============================================================
   healthEdge AI — Enrollment Service Agent
   Mock / demo data only. No real member data is used anywhere
   in this file. Replace with live data sources in production.
   ============================================================ */

const heAI_DATA = {
  member: {
    accountName: "Acme Corp",
    memberName: "Jordan Whitfield",
    memberId: "MBR-48213076",
    planName: "healthEdge Complete PPO",
    planLevel: "Gold",
    groupNumber: "GRP-119042",
    effectiveDate: "2025-01-01"
  },

  dependents: [
    { name: "Dana Whitfield", gender: "Female", dob: "1988-03-14", relation: "Spouse", status: "Active" },
    { name: "Miles Whitfield", gender: "Male", dob: "2012-07-22", relation: "Child", status: "Active" },
    { name: "Ella Whitfield", gender: "Female", dob: "2015-04-02", relation: "Child", status: "Pending Add" },
    { name: "Owen Whitfield", gender: "Male", dob: "2009-11-30", relation: "Child", status: "Active" },
    { name: "Grace Whitfield", gender: "Female", dob: "2018-01-19", relation: "Child", status: "Active" },
    { name: "Theo Whitfield", gender: "Male", dob: "2006-09-05", relation: "Child", status: "Pending Removal" }
  ],

  changeRequests: [
    { issueId: "48213", type: "Add Dependent", dependentName: "Ella Whitfield", effectiveDate: "2026-08-01", status: "New" },
    { issueId: "50987", type: "Remove Dependent", dependentName: "Theo Whitfield", effectiveDate: "2026-08-15", status: "Processing" },
    { issueId: "39215", type: "Add Dependent", dependentName: "Miles Whitfield", effectiveDate: "2025-08-01", status: "Completed" },
    { issueId: "62104", type: "Add Dependent", dependentName: "Grace Whitfield", effectiveDate: "2025-02-01", status: "Completed" },
    { issueId: "71830", type: "Remove Dependent", dependentName: "Sam Whitfield", effectiveDate: "2025-06-01", status: "Approved" },
    { issueId: "28456", type: "Add Dependent", dependentName: "Owen Whitfield", effectiveDate: "2024-11-15", status: "Completed" },
    { issueId: "93672", type: "Add Dependent", dependentName: "Dana Whitfield", effectiveDate: "2025-01-01", status: "Completed" },
    { issueId: "15409", type: "Remove Dependent", dependentName: "Riley Whitfield", effectiveDate: "2026-09-01", status: "New" }
  ],

  capabilityBadges: [
    {
      label: "Coverage Change Requests",
      svg: '<path d="M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'
    },
    {
      label: "Dependent Management",
      svg: '<circle cx="8" cy="8" r="3" stroke="currentColor" stroke-width="1.8" fill="none"/><circle cx="17" cy="9" r="2.4" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M3 20c0-3.3 2.5-6 6-6s6 2.7 6 6M14 20c0-2.6 1.8-5 4-5.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>'
    },
    {
      label: "Instant Issue Id Tracking",
      svg: '<circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.8" fill="none"/><path d="M12 7.5v5l3.2 2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" fill="none"/>'
    },
    {
      label: "Live Agent Escalation",
      svg: '<path d="M5 5h14v10H9l-4 4V5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" fill="none"/><path d="M9 9h6M9 12h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>'
    }
  ],

  tryAsking: [
    "I need to add my spouse as a dependent to my coverage.",
    "Can you remove my child from my health plan? Account name is Acme Corp, dependent is Jane Doe, born 2015-04-02, effective 2026-08-01.",
    "I want to talk to a real person.",
    "I want to change my primary care doctor."
  ]
};
