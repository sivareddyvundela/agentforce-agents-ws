/* ============================================================
   healthEdge AI — Provider Search & Profile
   Mock / demo data only. No real PHI/PII. For sales-engineering
   demo purposes.

   Data model:
   - providers: the searchable directory (Name / NPI / Tax ID / etc.)
   - credentialsByProvider, networkParticipationByProvider,
     contractsByProvider, serviceLocationsByProvider,
     complianceIssuesByProvider: each keyed by provider.id so the
     drill-down tabs can look up rows for whichever provider is
     currently selected in the Provider Search tab.
   ============================================================ */

const heAI_DATA = {

  agent: {
    name: "Provider Search Service — Sunny",
    shortName: "Provider Search & Profile"
  },

  // ---------------------------------------------------------
  // Provider directory
  // ---------------------------------------------------------
  providers: [
    {
      id: "PRV-10021",
      name: "Dr. John Mercer",
      npi: "1234567890",
      taxId: "47-2093115",
      specialty: "Cardiology",
      status: "Active",
      type: "Individual",
      phone: "(555) 214-7788",
      email: "john.mercer@lakeviewcardio.com",
      boardCertified: "Y",
      acceptingNewPatients: "Y"
    },
    {
      id: "PRV-10022",
      name: "Dr. Angela Reyes",
      npi: "1457902316",
      taxId: "83-1147920",
      specialty: "Family Medicine",
      status: "Active",
      type: "Individual",
      phone: "(555) 330-2210",
      email: "angela.reyes@brightpathfamily.com",
      boardCertified: "Y",
      acceptingNewPatients: "Y"
    },
    {
      id: "PRV-10023",
      name: "Dr. Michael Chen",
      npi: "1922384756",
      taxId: "56-7712048",
      specialty: "Orthopedic Surgery",
      status: "Active",
      type: "Individual",
      phone: "(555) 442-9012",
      email: "michael.chen@summitortho.com",
      boardCertified: "Y",
      acceptingNewPatients: "N"
    },
    {
      id: "PRV-10024",
      name: "Dr. Priya Kapoor",
      npi: "1650783492",
      taxId: "91-3350287",
      specialty: "Dermatology",
      status: "Active",
      type: "Individual",
      phone: "(555) 118-6634",
      email: "priya.kapoor@clearskinderm.com",
      boardCertified: "Y",
      acceptingNewPatients: "Y"
    },
    {
      id: "PRV-10025",
      name: "Dr. Samuel Osei",
      npi: "1783456210",
      taxId: "38-9942716",
      specialty: "Internal Medicine",
      status: "Inactive",
      type: "Individual",
      phone: "(555) 275-4409",
      email: "samuel.osei@meridianinternal.com",
      boardCertified: "Y",
      acceptingNewPatients: "N"
    },
    {
      id: "PRV-10026",
      name: "Dr. Linda Kowalski",
      npi: "1398567124",
      taxId: "64-2208871",
      specialty: "Pediatrics",
      status: "Active",
      type: "Individual",
      phone: "(555) 509-3321",
      email: "linda.kowalski@littleoakspeds.com",
      boardCertified: "Y",
      acceptingNewPatients: "Y"
    },
    {
      id: "PRV-10027",
      name: "Dr. Robert Nguyen",
      npi: "1287345690",
      taxId: "72-1183456",
      specialty: "Psychiatry",
      status: "Active",
      type: "Individual",
      phone: "(555) 664-7723",
      email: "robert.nguyen@harborbehavioral.com",
      boardCertified: "N",
      acceptingNewPatients: "Y"
    },
    {
      id: "PRV-10028",
      name: "Dr. Elena Vasquez",
      npi: "1839027465",
      taxId: "29-8804471",
      specialty: "Endocrinology",
      status: "Active",
      type: "Individual",
      phone: "(555) 890-1247",
      email: "elena.vasquez@vitalendocrine.com",
      boardCertified: "Y",
      acceptingNewPatients: "Y"
    },
    {
      id: "PRV-10029",
      name: "Dr. Thomas Whitfield",
      npi: "1560239817",
      taxId: "85-6621390",
      specialty: "General Surgery",
      status: "Active",
      type: "Individual",
      phone: "(555) 733-5560",
      email: "thomas.whitfield@ironbridgesurgical.com",
      boardCertified: "Y",
      acceptingNewPatients: "N"
    },
    {
      id: "PRV-10030",
      name: "Dr. Grace Okafor",
      npi: "1671894023",
      taxId: "13-9047762",
      specialty: "Obstetrics & Gynecology",
      status: "Active",
      type: "Individual",
      phone: "(555) 402-8871",
      email: "grace.okafor@willowcreekwomens.com",
      boardCertified: "Y",
      acceptingNewPatients: "Y"
    }
  ],

  // ---------------------------------------------------------
  // Credentials — keyed by provider.id
  // ---------------------------------------------------------
  credentialsByProvider: {
    "PRV-10021": [
      { status: "Approved", applicationDate: "2023-02-10", currentStage: "Complete", assignedAnalyst: "Marcus Whitfield", expectedCompletion: "2023-04-18" },
      { status: "In Progress", applicationDate: "2026-05-04", currentStage: "Primary Source Verification", assignedAnalyst: "Priya Nadarajan", expectedCompletion: "2026-08-25" },
      { status: "Approved", applicationDate: "2020-01-22", currentStage: "Complete", assignedAnalyst: "Deborah Chu", expectedCompletion: "2020-03-30" }
    ],
    "PRV-10022": [
      { status: "Approved", applicationDate: "2022-06-15", currentStage: "Complete", assignedAnalyst: "Ray Ostrowski", expectedCompletion: "2022-09-02" },
      { status: "Approved", applicationDate: "2025-06-20", currentStage: "Complete", assignedAnalyst: "Marcus Whitfield", expectedCompletion: "2025-08-14" },
      { status: "Pending Committee Review", applicationDate: "2026-06-30", currentStage: "Committee Review", assignedAnalyst: "Deborah Chu", expectedCompletion: "2026-09-05" }
    ],
    "PRV-10023": [
      { status: "Approved", applicationDate: "2021-03-11", currentStage: "Complete", assignedAnalyst: "Priya Nadarajan", expectedCompletion: "2021-05-30" },
      { status: "Approved", applicationDate: "2024-03-18", currentStage: "Complete", assignedAnalyst: "Ray Ostrowski", expectedCompletion: "2024-05-22" },
      { status: "In Progress", applicationDate: "2026-07-01", currentStage: "Application Intake", assignedAnalyst: "Marcus Whitfield", expectedCompletion: "2026-10-15" }
    ],
    "PRV-10024": [
      { status: "Approved", applicationDate: "2022-11-02", currentStage: "Complete", assignedAnalyst: "Deborah Chu", expectedCompletion: "2023-01-20" },
      { status: "Approved", applicationDate: "2025-11-10", currentStage: "Complete", assignedAnalyst: "Priya Nadarajan", expectedCompletion: "2026-01-18" },
      { status: "In Progress", applicationDate: "2026-06-12", currentStage: "Primary Source Verification", assignedAnalyst: "Marcus Whitfield", expectedCompletion: "2026-09-01" }
    ],
    "PRV-10025": [
      { status: "Expired", applicationDate: "2019-08-05", currentStage: "Complete", assignedAnalyst: "Ray Ostrowski", expectedCompletion: "2019-10-14" },
      { status: "Rejected", applicationDate: "2026-01-15", currentStage: "Closed", assignedAnalyst: "Deborah Chu", expectedCompletion: "2026-03-01" },
      { status: "Not Started", applicationDate: "—", currentStage: "Awaiting Application", assignedAnalyst: "Unassigned", expectedCompletion: "—" }
    ],
    "PRV-10026": [
      { status: "Approved", applicationDate: "2021-09-09", currentStage: "Complete", assignedAnalyst: "Marcus Whitfield", expectedCompletion: "2021-11-28" },
      { status: "Approved", applicationDate: "2024-09-14", currentStage: "Complete", assignedAnalyst: "Priya Nadarajan", expectedCompletion: "2024-11-20" },
      { status: "In Progress", applicationDate: "2026-05-30", currentStage: "Committee Review", assignedAnalyst: "Ray Ostrowski", expectedCompletion: "2026-08-10" }
    ],
    "PRV-10027": [
      { status: "Approved", applicationDate: "2022-04-19", currentStage: "Complete", assignedAnalyst: "Deborah Chu", expectedCompletion: "2022-07-01" },
      { status: "Remediation Required", applicationDate: "2026-03-02", currentStage: "Primary Source Verification", assignedAnalyst: "Marcus Whitfield", expectedCompletion: "2026-09-30" },
      { status: "Approved", applicationDate: "2019-05-06", currentStage: "Complete", assignedAnalyst: "Ray Ostrowski", expectedCompletion: "2019-07-24" }
    ],
    "PRV-10028": [
      { status: "Approved", applicationDate: "2023-07-21", currentStage: "Complete", assignedAnalyst: "Priya Nadarajan", expectedCompletion: "2023-09-29" },
      { status: "Approved", applicationDate: "2026-01-05", currentStage: "Complete", assignedAnalyst: "Deborah Chu", expectedCompletion: "2026-03-15" },
      { status: "In Progress", applicationDate: "2026-07-10", currentStage: "Application Intake", assignedAnalyst: "Marcus Whitfield", expectedCompletion: "2026-10-05" }
    ],
    "PRV-10029": [
      { status: "Approved", applicationDate: "2020-10-12", currentStage: "Complete", assignedAnalyst: "Ray Ostrowski", expectedCompletion: "2021-01-04" },
      { status: "Approved", applicationDate: "2023-10-18", currentStage: "Complete", assignedAnalyst: "Marcus Whitfield", expectedCompletion: "2024-01-02" },
      { status: "In Progress", applicationDate: "2026-04-22", currentStage: "Committee Review", assignedAnalyst: "Priya Nadarajan", expectedCompletion: "2026-08-05" }
    ],
    "PRV-10030": [
      { status: "Approved", applicationDate: "2021-12-01", currentStage: "Complete", assignedAnalyst: "Deborah Chu", expectedCompletion: "2022-02-18" },
      { status: "Approved", applicationDate: "2024-12-05", currentStage: "Complete", assignedAnalyst: "Ray Ostrowski", expectedCompletion: "2025-02-10" },
      { status: "In Progress", applicationDate: "2026-06-01", currentStage: "Primary Source Verification", assignedAnalyst: "Priya Nadarajan", expectedCompletion: "2026-09-12" }
    ]
  },

  // ---------------------------------------------------------
  // Network Participation — keyed by provider.id
  // ---------------------------------------------------------
  networkParticipationByProvider: {
    "PRV-10021": [
      { networkName: "Meridian Preferred Network", active: "Y", lineOfBusiness: "Commercial PPO", effectiveStartDate: "2022-01-01", effectiveEndDate: "—" },
      { networkName: "healthEdge Advantage HMO", active: "Y", lineOfBusiness: "Medicare Advantage", effectiveStartDate: "2023-03-15", effectiveEndDate: "—" },
      { networkName: "Regional Value Network", active: "N", lineOfBusiness: "Commercial HMO", effectiveStartDate: "2019-06-01", effectiveEndDate: "2024-05-31" },
      { networkName: "Senior Choice Network", active: "Y", lineOfBusiness: "Medicare Advantage", effectiveStartDate: "2025-01-01", effectiveEndDate: "—" }
    ],
    "PRV-10022": [
      { networkName: "Meridian Preferred Network", active: "Y", lineOfBusiness: "Commercial PPO", effectiveStartDate: "2021-04-01", effectiveEndDate: "—" },
      { networkName: "Community Care Network", active: "Y", lineOfBusiness: "Medicaid", effectiveStartDate: "2021-04-01", effectiveEndDate: "—" },
      { networkName: "Regional Value Network", active: "Y", lineOfBusiness: "Commercial HMO", effectiveStartDate: "2022-09-01", effectiveEndDate: "—" },
      { networkName: "Behavioral Health Alliance", active: "N", lineOfBusiness: "Commercial PPO", effectiveStartDate: "2020-01-01", effectiveEndDate: "2023-12-31" }
    ],
    "PRV-10023": [
      { networkName: "Meridian Preferred Network", active: "Y", lineOfBusiness: "Commercial PPO", effectiveStartDate: "2020-05-15", effectiveEndDate: "—" },
      { networkName: "healthEdge Advantage HMO", active: "Y", lineOfBusiness: "Medicare Advantage", effectiveStartDate: "2020-05-15", effectiveEndDate: "—" },
      { networkName: "Senior Choice Network", active: "Y", lineOfBusiness: "Medicare Advantage", effectiveStartDate: "2024-01-01", effectiveEndDate: "—" },
      { networkName: "Regional Value Network", active: "N", lineOfBusiness: "Commercial HMO", effectiveStartDate: "2018-02-01", effectiveEndDate: "2021-12-31" },
      { networkName: "Community Care Network", active: "Y", lineOfBusiness: "Medicaid", effectiveStartDate: "2023-06-01", effectiveEndDate: "—" }
    ],
    "PRV-10024": [
      { networkName: "Meridian Preferred Network", active: "Y", lineOfBusiness: "Commercial PPO", effectiveStartDate: "2022-08-01", effectiveEndDate: "—" },
      { networkName: "Regional Value Network", active: "Y", lineOfBusiness: "Commercial HMO", effectiveStartDate: "2022-08-01", effectiveEndDate: "—" },
      { networkName: "Community Care Network", active: "Y", lineOfBusiness: "Medicaid", effectiveStartDate: "2023-11-01", effectiveEndDate: "—" },
      { networkName: "healthEdge Advantage HMO", active: "N", lineOfBusiness: "Medicare Advantage", effectiveStartDate: "2019-01-01", effectiveEndDate: "2022-06-30" }
    ],
    "PRV-10025": [
      { networkName: "Meridian Preferred Network", active: "N", lineOfBusiness: "Commercial PPO", effectiveStartDate: "2017-01-01", effectiveEndDate: "2025-12-31" },
      { networkName: "Regional Value Network", active: "N", lineOfBusiness: "Commercial HMO", effectiveStartDate: "2017-01-01", effectiveEndDate: "2025-12-31" },
      { networkName: "Community Care Network", active: "N", lineOfBusiness: "Medicaid", effectiveStartDate: "2018-03-01", effectiveEndDate: "2025-12-31" }
    ],
    "PRV-10026": [
      { networkName: "Meridian Preferred Network", active: "Y", lineOfBusiness: "Commercial PPO", effectiveStartDate: "2021-09-09", effectiveEndDate: "—" },
      { networkName: "healthEdge Advantage HMO", active: "Y", lineOfBusiness: "Medicare Advantage", effectiveStartDate: "2021-09-09", effectiveEndDate: "—" },
      { networkName: "Community Care Network", active: "Y", lineOfBusiness: "Medicaid", effectiveStartDate: "2022-04-01", effectiveEndDate: "—" },
      { networkName: "Regional Value Network", active: "Y", lineOfBusiness: "Commercial HMO", effectiveStartDate: "2023-01-01", effectiveEndDate: "—" }
    ],
    "PRV-10027": [
      { networkName: "Behavioral Health Alliance", active: "Y", lineOfBusiness: "Commercial PPO", effectiveStartDate: "2022-04-19", effectiveEndDate: "—" },
      { networkName: "Meridian Preferred Network", active: "Y", lineOfBusiness: "Commercial PPO", effectiveStartDate: "2022-04-19", effectiveEndDate: "—" },
      { networkName: "Community Care Network", active: "N", lineOfBusiness: "Medicaid", effectiveStartDate: "2019-05-06", effectiveEndDate: "2023-05-05" },
      { networkName: "Senior Choice Network", active: "Y", lineOfBusiness: "Medicare Advantage", effectiveStartDate: "2025-06-01", effectiveEndDate: "—" }
    ],
    "PRV-10028": [
      { networkName: "Meridian Preferred Network", active: "Y", lineOfBusiness: "Commercial PPO", effectiveStartDate: "2023-07-21", effectiveEndDate: "—" },
      { networkName: "healthEdge Advantage HMO", active: "Y", lineOfBusiness: "Medicare Advantage", effectiveStartDate: "2023-07-21", effectiveEndDate: "—" },
      { networkName: "Regional Value Network", active: "Y", lineOfBusiness: "Commercial HMO", effectiveStartDate: "2024-02-01", effectiveEndDate: "—" },
      { networkName: "Senior Choice Network", active: "N", lineOfBusiness: "Medicare Advantage", effectiveStartDate: "2020-01-01", effectiveEndDate: "2023-06-30" }
    ],
    "PRV-10029": [
      { networkName: "Meridian Preferred Network", active: "Y", lineOfBusiness: "Commercial PPO", effectiveStartDate: "2020-10-12", effectiveEndDate: "—" },
      { networkName: "Regional Value Network", active: "Y", lineOfBusiness: "Commercial HMO", effectiveStartDate: "2020-10-12", effectiveEndDate: "—" },
      { networkName: "healthEdge Advantage HMO", active: "Y", lineOfBusiness: "Medicare Advantage", effectiveStartDate: "2021-06-01", effectiveEndDate: "—" },
      { networkName: "Community Care Network", active: "N", lineOfBusiness: "Medicaid", effectiveStartDate: "2018-01-01", effectiveEndDate: "2022-09-30" }
    ],
    "PRV-10030": [
      { networkName: "Meridian Preferred Network", active: "Y", lineOfBusiness: "Commercial PPO", effectiveStartDate: "2021-12-01", effectiveEndDate: "—" },
      { networkName: "Community Care Network", active: "Y", lineOfBusiness: "Medicaid", effectiveStartDate: "2021-12-01", effectiveEndDate: "—" },
      { networkName: "healthEdge Advantage HMO", active: "Y", lineOfBusiness: "Medicare Advantage", effectiveStartDate: "2022-05-01", effectiveEndDate: "—" },
      { networkName: "Regional Value Network", active: "N", lineOfBusiness: "Commercial HMO", effectiveStartDate: "2019-03-01", effectiveEndDate: "2023-02-28" }
    ]
  },

  // ---------------------------------------------------------
  // Active Contracts — keyed by provider.id
  // ---------------------------------------------------------
  contractsByProvider: {
    "PRV-10021": [
      { contractName: "Meridian Preferred PPO", payerNetwork: "Meridian Preferred Network", status: "Active", startDate: "2022-01-01", endDate: "2027-12-31" },
      { contractName: "healthEdge Advantage HMO", payerNetwork: "healthEdge Advantage HMO", status: "Active", startDate: "2023-03-15", endDate: "2026-12-31" },
      { contractName: "Senior Choice Medicare Advantage", payerNetwork: "Senior Choice Network", status: "Active", startDate: "2025-01-01", endDate: "2028-12-31" }
    ],
    "PRV-10022": [
      { contractName: "Meridian Preferred PPO", payerNetwork: "Meridian Preferred Network", status: "Active", startDate: "2021-04-01", endDate: "2026-12-31" },
      { contractName: "Community Care Medicaid Agreement", payerNetwork: "Community Care Network", status: "Active", startDate: "2021-04-01", endDate: "2027-03-31" },
      { contractName: "Regional Value Network Agreement", payerNetwork: "Regional Value Network", status: "Active", startDate: "2022-09-01", endDate: "2027-08-31" }
    ],
    "PRV-10023": [
      { contractName: "Meridian Preferred PPO", payerNetwork: "Meridian Preferred Network", status: "Active", startDate: "2020-05-15", endDate: "2026-05-14" },
      { contractName: "healthEdge Advantage HMO", payerNetwork: "healthEdge Advantage HMO", status: "Active", startDate: "2020-05-15", endDate: "2026-05-14" },
      { contractName: "Senior Choice Medicare Advantage", payerNetwork: "Senior Choice Network", status: "Active", startDate: "2024-01-01", endDate: "2027-12-31" },
      { contractName: "Community Care Medicaid Agreement", payerNetwork: "Community Care Network", status: "Active", startDate: "2023-06-01", endDate: "2026-05-31" }
    ],
    "PRV-10024": [
      { contractName: "Meridian Preferred PPO", payerNetwork: "Meridian Preferred Network", status: "Active", startDate: "2022-08-01", endDate: "2027-07-31" },
      { contractName: "Regional Value Network Agreement", payerNetwork: "Regional Value Network", status: "Active", startDate: "2022-08-01", endDate: "2027-07-31" },
      { contractName: "Community Care Medicaid Agreement", payerNetwork: "Community Care Network", status: "Active", startDate: "2023-11-01", endDate: "2026-10-31" }
    ],
    "PRV-10025": [
      { contractName: "Meridian Preferred PPO", payerNetwork: "Meridian Preferred Network", status: "Terminated", startDate: "2017-01-01", endDate: "2025-12-31" }
    ],
    "PRV-10026": [
      { contractName: "Meridian Preferred PPO", payerNetwork: "Meridian Preferred Network", status: "Active", startDate: "2021-09-09", endDate: "2027-09-08" },
      { contractName: "healthEdge Advantage HMO", payerNetwork: "healthEdge Advantage HMO", status: "Active", startDate: "2021-09-09", endDate: "2027-09-08" },
      { contractName: "Community Care Medicaid Agreement", payerNetwork: "Community Care Network", status: "Active", startDate: "2022-04-01", endDate: "2027-03-31" }
    ],
    "PRV-10027": [
      { contractName: "Behavioral Health Alliance Agreement", payerNetwork: "Behavioral Health Alliance", status: "Active", startDate: "2022-04-19", endDate: "2027-04-18" },
      { contractName: "Meridian Preferred PPO", payerNetwork: "Meridian Preferred Network", status: "Active", startDate: "2022-04-19", endDate: "2027-04-18" },
      { contractName: "Senior Choice Medicare Advantage", payerNetwork: "Senior Choice Network", status: "Active", startDate: "2025-06-01", endDate: "2028-05-31" }
    ],
    "PRV-10028": [
      { contractName: "Meridian Preferred PPO", payerNetwork: "Meridian Preferred Network", status: "Active", startDate: "2023-07-21", endDate: "2028-07-20" },
      { contractName: "healthEdge Advantage HMO", payerNetwork: "healthEdge Advantage HMO", status: "Active", startDate: "2023-07-21", endDate: "2028-07-20" },
      { contractName: "Regional Value Network Agreement", payerNetwork: "Regional Value Network", status: "Active", startDate: "2024-02-01", endDate: "2029-01-31" }
    ],
    "PRV-10029": [
      { contractName: "Meridian Preferred PPO", payerNetwork: "Meridian Preferred Network", status: "Active", startDate: "2020-10-12", endDate: "2026-10-11" },
      { contractName: "Regional Value Network Agreement", payerNetwork: "Regional Value Network", status: "Active", startDate: "2020-10-12", endDate: "2026-10-11" },
      { contractName: "healthEdge Advantage HMO", payerNetwork: "healthEdge Advantage HMO", status: "Active", startDate: "2021-06-01", endDate: "2027-05-31" }
    ],
    "PRV-10030": [
      { contractName: "Meridian Preferred PPO", payerNetwork: "Meridian Preferred Network", status: "Active", startDate: "2021-12-01", endDate: "2027-11-30" },
      { contractName: "Community Care Medicaid Agreement", payerNetwork: "Community Care Network", status: "Active", startDate: "2021-12-01", endDate: "2027-11-30" },
      { contractName: "healthEdge Advantage HMO", payerNetwork: "healthEdge Advantage HMO", status: "Active", startDate: "2022-05-01", endDate: "2028-04-30" }
    ]
  },

  // ---------------------------------------------------------
  // Service Locations — keyed by provider.id
  // ---------------------------------------------------------
  serviceLocationsByProvider: {
    "PRV-10021": [
      { locationName: "Lakeview Cardiology — Main Campus", address: "4820 Lakeview Terrace, Suite 220", city: "Columbus, OH", country: "United States" },
      { locationName: "Lakeview Cardiology — North Clinic", address: "1190 Ridgefield Ave", city: "Westerville, OH", country: "United States" }
    ],
    "PRV-10022": [
      { locationName: "Bright Path Family Health", address: "77 Riverside Blvd, Suite 4", city: "Denver, CO", country: "United States" },
      { locationName: "Bright Path Family Health — Aurora Annex", address: "2210 East Colfax Ave", city: "Aurora, CO", country: "United States" }
    ],
    "PRV-10023": [
      { locationName: "Summit Orthopedic Institute", address: "310 Summit Parkway", city: "Salt Lake City, UT", country: "United States" },
      { locationName: "Summit Orthopedic — Surgery Center", address: "88 Wasatch Blvd", city: "Sandy, UT", country: "United States" },
      { locationName: "Summit Orthopedic — Provo Satellite", address: "455 University Ave", city: "Provo, UT", country: "United States" }
    ],
    "PRV-10024": [
      { locationName: "Clear Skin Dermatology Clinic", address: "600 Magnolia Ave, Suite 12", city: "Tampa, FL", country: "United States" },
      { locationName: "Clear Skin Dermatology — St. Pete", address: "215 Central Ave", city: "St. Petersburg, FL", country: "United States" }
    ],
    "PRV-10025": [
      { locationName: "Meridian Internal Medicine Group", address: "930 Meridian St", city: "Indianapolis, IN", country: "United States" }
    ],
    "PRV-10026": [
      { locationName: "Little Oaks Pediatrics", address: "45 Chestnut St", city: "Portland, ME", country: "United States" },
      { locationName: "Little Oaks Pediatrics — South Portland", address: "12 Ocean Ave", city: "South Portland, ME", country: "United States" }
    ],
    "PRV-10027": [
      { locationName: "Harbor Behavioral Health Center", address: "310 Harborview Dr", city: "Seattle, WA", country: "United States" },
      { locationName: "Harbor Behavioral Health — Telehealth Hub", address: "310 Harborview Dr, Floor 3", city: "Seattle, WA", country: "United States" }
    ],
    "PRV-10028": [
      { locationName: "Vital Endocrine Associates", address: "701 Peachtree St NE, Suite 900", city: "Atlanta, GA", country: "United States" },
      { locationName: "Vital Endocrine — Decatur Clinic", address: "150 East Ponce de Leon Ave", city: "Decatur, GA", country: "United States" }
    ],
    "PRV-10029": [
      { locationName: "Ironbridge Surgical Associates", address: "88 Ironbridge Rd", city: "Richmond, VA", country: "United States" },
      { locationName: "Ironbridge Surgical — Ambulatory Center", address: "410 Broad St", city: "Richmond, VA", country: "United States" }
    ],
    "PRV-10030": [
      { locationName: "Willow Creek Women's Health", address: "220 Willow Creek Pkwy", city: "Austin, TX", country: "United States" },
      { locationName: "Willow Creek Women's Health — Round Rock", address: "3005 Gattis School Rd", city: "Round Rock, TX", country: "United States" },
      { locationName: "Willow Creek Women's Health — Birth Center", address: "500 East 6th St", city: "Austin, TX", country: "United States" }
    ]
  },

  // ---------------------------------------------------------
  // Compliance Issues — keyed by provider.id
  // ---------------------------------------------------------
  complianceIssuesByProvider: {
    "PRV-10021": [
      { issueTitle: "DEA registration renewal overdue", complianceType: "License Compliance", status: "Open", severity: "High", identifiedDate: "2026-06-02", resolutionDueDate: "2026-07-30" },
      { issueTitle: "Malpractice insurance certificate expiring", complianceType: "Credentialing", status: "Under Review", severity: "Medium", identifiedDate: "2026-06-20", resolutionDueDate: "2026-08-15" },
      { issueTitle: "Prior audit finding — resolved", complianceType: "Quality", status: "Resolved", severity: "Low", identifiedDate: "2025-11-05", resolutionDueDate: "2025-12-20" },
      { issueTitle: "CME hours documentation missing", complianceType: "Documentation", status: "Closed", severity: "Low", identifiedDate: "2025-02-14", resolutionDueDate: "2025-03-30" }
    ],
    "PRV-10022": [
      { issueTitle: "State license renewal pending confirmation", complianceType: "License Compliance", status: "Under Review", severity: "Medium", identifiedDate: "2026-05-18", resolutionDueDate: "2026-07-25" },
      { issueTitle: "HIPAA training attestation overdue", complianceType: "Privacy", status: "Open", severity: "Medium", identifiedDate: "2026-06-28", resolutionDueDate: "2026-08-01" },
      { issueTitle: "Practice address mismatch flagged", complianceType: "Documentation", status: "Resolved", severity: "Low", identifiedDate: "2025-09-01", resolutionDueDate: "2025-09-30" },
      { issueTitle: "Board certification lapse (prior cycle)", complianceType: "Credentialing", status: "Closed", severity: "High", identifiedDate: "2024-01-10", resolutionDueDate: "2024-03-01" }
    ],
    "PRV-10023": [
      { issueTitle: "Site visit corrective action plan due", complianceType: "Regulatory", status: "Remediation Required", severity: "Critical", identifiedDate: "2026-06-10", resolutionDueDate: "2026-07-28" },
      { issueTitle: "Surgical facility accreditation renewal", complianceType: "License Compliance", status: "Under Review", severity: "High", identifiedDate: "2026-06-15", resolutionDueDate: "2026-08-20" },
      { issueTitle: "Peer review documentation incomplete", complianceType: "Documentation", status: "Open", severity: "Medium", identifiedDate: "2026-07-01", resolutionDueDate: "2026-08-15" },
      { issueTitle: "Sanctions monitoring check — clear", complianceType: "Regulatory", status: "Resolved", severity: "Low", identifiedDate: "2025-12-01", resolutionDueDate: "2025-12-15" },
      { issueTitle: "Prior malpractice claim disclosure review", complianceType: "Others", status: "Closed", severity: "Medium", identifiedDate: "2024-08-19", resolutionDueDate: "2024-10-01" }
    ],
    "PRV-10024": [
      { issueTitle: "Continuing education credits below threshold", complianceType: "Credentialing", status: "Open", severity: "Medium", identifiedDate: "2026-06-25", resolutionDueDate: "2026-08-10" },
      { issueTitle: "Privacy incident — patient portal access", complianceType: "Privacy", status: "Under Review", severity: "High", identifiedDate: "2026-07-02", resolutionDueDate: "2026-07-31" },
      { issueTitle: "Facility inspection follow-up closed", complianceType: "Regulatory", status: "Closed", severity: "Low", identifiedDate: "2025-04-11", resolutionDueDate: "2025-05-01" },
      { issueTitle: "Billing documentation audit — resolved", complianceType: "Documentation", status: "Resolved", severity: "Low", identifiedDate: "2025-08-22", resolutionDueDate: "2025-09-10" }
    ],
    "PRV-10025": [
      { issueTitle: "License lapsed — not renewed", complianceType: "License Compliance", status: "Open", severity: "Critical", identifiedDate: "2026-01-20", resolutionDueDate: "2026-02-28" },
      { issueTitle: "Credentialing application withdrawn", complianceType: "Credentialing", status: "Closed", severity: "High", identifiedDate: "2026-01-15", resolutionDueDate: "2026-03-01" },
      { issueTitle: "Outstanding sanctions review", complianceType: "Regulatory", status: "Remediation Required", severity: "Critical", identifiedDate: "2026-02-05", resolutionDueDate: "2026-03-20" },
      { issueTitle: "Network termination notice on file", complianceType: "Others", status: "Closed", severity: "Medium", identifiedDate: "2025-12-31", resolutionDueDate: "2026-01-15" }
    ],
    "PRV-10026": [
      { issueTitle: "Vaccine storage compliance check due", complianceType: "Quality", status: "Under Review", severity: "Medium", identifiedDate: "2026-06-08", resolutionDueDate: "2026-07-29" },
      { issueTitle: "Staff HIPAA training refresh overdue", complianceType: "Privacy", status: "Open", severity: "Low", identifiedDate: "2026-06-30", resolutionDueDate: "2026-08-05" },
      { issueTitle: "Prior year site visit — passed", complianceType: "Regulatory", status: "Resolved", severity: "Low", identifiedDate: "2025-05-14", resolutionDueDate: "2025-06-01" },
      { issueTitle: "Recredentialing packet delay — resolved", complianceType: "Credentialing", status: "Closed", severity: "Low", identifiedDate: "2024-10-02", resolutionDueDate: "2024-11-15" }
    ],
    "PRV-10027": [
      { issueTitle: "Board certification not on file", complianceType: "Credentialing", status: "Remediation Required", severity: "High", identifiedDate: "2026-05-01", resolutionDueDate: "2026-08-01" },
      { issueTitle: "Telehealth licensure cross-state review", complianceType: "License Compliance", status: "Open", severity: "Medium", identifiedDate: "2026-06-18", resolutionDueDate: "2026-08-12" },
      { issueTitle: "Session note documentation gaps", complianceType: "Documentation", status: "Under Review", severity: "Medium", identifiedDate: "2026-07-05", resolutionDueDate: "2026-08-20" },
      { issueTitle: "Prior privacy complaint — closed", complianceType: "Privacy", status: "Closed", severity: "High", identifiedDate: "2025-03-09", resolutionDueDate: "2025-04-20" }
    ],
    "PRV-10028": [
      { issueTitle: "Malpractice insurance certificate updated", complianceType: "Credentialing", status: "Resolved", severity: "Low", identifiedDate: "2026-04-11", resolutionDueDate: "2026-05-01" },
      { issueTitle: "Quality metrics below network benchmark", complianceType: "Quality", status: "Open", severity: "Medium", identifiedDate: "2026-06-22", resolutionDueDate: "2026-08-15" },
      { issueTitle: "Site inspection scheduled", complianceType: "Regulatory", status: "Under Review", severity: "Low", identifiedDate: "2026-07-01", resolutionDueDate: "2026-08-30" },
      { issueTitle: "Prior documentation request — closed", complianceType: "Documentation", status: "Closed", severity: "Low", identifiedDate: "2025-06-17", resolutionDueDate: "2025-07-01" }
    ],
    "PRV-10029": [
      { issueTitle: "Surgical privileges renewal due", complianceType: "Credentialing", status: "Under Review", severity: "Medium", identifiedDate: "2026-06-14", resolutionDueDate: "2026-08-05" },
      { issueTitle: "OSHA compliance walkthrough overdue", complianceType: "Regulatory", status: "Open", severity: "Medium", identifiedDate: "2026-06-29", resolutionDueDate: "2026-08-10" },
      { issueTitle: "Patient consent form template outdated", complianceType: "Documentation", status: "Remediation Required", severity: "Low", identifiedDate: "2026-07-03", resolutionDueDate: "2026-08-18" },
      { issueTitle: "Prior sanctions check — clear", complianceType: "Regulatory", status: "Resolved", severity: "Low", identifiedDate: "2025-10-01", resolutionDueDate: "2025-10-15" },
      { issueTitle: "Facility license renewed on time", complianceType: "License Compliance", status: "Closed", severity: "Low", identifiedDate: "2025-01-08", resolutionDueDate: "2025-02-01" }
    ],
    "PRV-10030": [
      { issueTitle: "Birth center accreditation renewal", complianceType: "License Compliance", status: "Under Review", severity: "High", identifiedDate: "2026-06-05", resolutionDueDate: "2026-08-01" },
      { issueTitle: "Credentialing file missing reference letter", complianceType: "Credentialing", status: "Open", severity: "Medium", identifiedDate: "2026-06-26", resolutionDueDate: "2026-08-10" },
      { issueTitle: "Patient privacy notice update required", complianceType: "Privacy", status: "Remediation Required", severity: "Medium", identifiedDate: "2026-07-04", resolutionDueDate: "2026-08-18" },
      { issueTitle: "Prior quality review — resolved", complianceType: "Quality", status: "Resolved", severity: "Low", identifiedDate: "2025-07-20", resolutionDueDate: "2025-08-05" },
      { issueTitle: "Annual fire safety inspection passed", complianceType: "Regulatory", status: "Closed", severity: "Low", identifiedDate: "2025-03-11", resolutionDueDate: "2025-03-25" }
    ]
  },

  // ---------------------------------------------------------
  // Sidebar tab configuration
  // ---------------------------------------------------------
  tabs: [
    { id: "overview", label: "Overview" },
    { id: "providerSearch", label: "Provider Search" },
    { id: "credentials", label: "Credentials" },
    { id: "networkParticipation", label: "Network Participation" },
    { id: "activeContracts", label: "Active Contracts" },
    { id: "serviceLocations", label: "Service Locations" },
    { id: "complianceIssues", label: "Compliance Issues" }
  ],

  overviewDescription:
    "Provider Search Service — Sunny lets Provider Relations Representatives, Contact Center " +
    "Agents, and Network Operations Specialists look up any participating provider by Name, " +
    "NPI, or Tax ID and instantly pull that provider's credentials, network participation, " +
    "active contracts, service locations, and open compliance issues — all inside the chat, " +
    "without switching screens or logging into a separate directory system. Sunny is built " +
    "entirely on declarative Flow actions, so every lookup maps directly to governed backend " +
    "data with no custom code.",

  // ---------------------------------------------------------
  // Login page "Try asking..." prompts
  // ---------------------------------------------------------
  samplePrompts: [
    "Find provider John Mercer.",
    "Search NPI 1234567890.",
    "Show me the credentials for this provider.",
    "What networks does this provider participate in?",
    "Any compliance issues on file for this provider?"
  ],

  // ---------------------------------------------------------
  // Demo credentials
  // ---------------------------------------------------------
  credentials: {
    username: "network.ops",
    password: "Demo@123"
  }
};
