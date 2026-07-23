/* ==========================================================================
   healthEdge AI — Provider Enrollment Agent
   Mock / demo data only. No network calls, no backend. Everything below is
   fabricated for sales-engineering demo purposes.
   ========================================================================== */

/* ---------- Marketing content (login page, left panel) ---------- */

const HEAI_AGENT_NAME = "Provider Enrollment Agent";

const HEAI_CAPABILITY_BADGES = [
  {
    label: "Guided Enrollment Form",
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" stroke-width="1.6"/><path d="M8 8h8M8 12h8M8 16h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  },
  {
    label: "Credential Document Upload",
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 3v12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M7.5 8.5 12 4l4.5 4.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 16v2.5A2.5 2.5 0 0 0 6.5 21h11a2.5 2.5 0 0 0 2.5-2.5V16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  },
  {
    label: "Specialty & Network Capture",
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.2" stroke="currentColor" stroke-width="1.6"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  },
  {
    label: "Real-Time Application Status",
    icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.2" stroke="currentColor" stroke-width="1.6"/><path d="M12 7.5V12l3 2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  }
];

const HEAI_TRY_ASKING = [
  "I need to enroll a new provider.",
  "Start a provider enrollment.",
  "I'd like to submit an enrollment application for Dr. Jane Smith, Cardiology, NPI 1234567890.",
  "Enroll me as a provider and I'll attach my license document."
];

/* ---------- Demo login credentials ---------- */

const HEAI_DEMO_USERNAME = "enrollment.specialist";
const HEAI_DEMO_PASSWORD = "Demo@123";

/* ---------- Sidebar tabs ---------- */

const HEAI_TABS = [
  { id: "overview", label: "Overview", icon: "&#9673;" },
  { id: "new-enrollment", label: "New Enrollment", icon: "&#10133;" },
  { id: "enrollment-queue", label: "Enrollment Queue", icon: "&#128203;" },
  { id: "document-uploads", label: "Document Uploads", icon: "&#128206;" },
  { id: "specialties-directory", label: "Specialties Directory", icon: "&#127973;" }
];

/* ---------- Specialties ---------- */

const HEAI_SPECIALTIES = [
  {
    name: "Cardiology",
    description: "Diagnosis and treatment of heart and cardiovascular system conditions, including arrhythmias and heart failure."
  },
  {
    name: "Dermatology",
    description: "Care for conditions of the skin, hair, and nails, including chronic skin disease and minor dermatologic procedures."
  },
  {
    name: "Family Medicine",
    description: "Comprehensive primary care for patients of all ages, covering preventive care and common acute conditions."
  },
  {
    name: "Internal Medicine",
    description: "Primary and consultative care for adults, with a focus on prevention, diagnosis, and management of chronic disease."
  },
  {
    name: "Neurology",
    description: "Diagnosis and treatment of disorders of the brain, spinal cord, and nervous system, including migraine and epilepsy."
  },
  {
    name: "Orthopedics",
    description: "Care for musculoskeletal conditions, including joint, bone, and sports-related injuries and post-surgical recovery."
  },
  {
    name: "Pediatrics",
    description: "Medical care for infants, children, and adolescents, including well-child visits and immunizations."
  },
  {
    name: "Psychiatry",
    description: "Evaluation and treatment of mental health conditions, including medication management and behavioral health support."
  }
];

/* ---------- Enrollment Queue (mock, mutable at runtime) ---------- */

const HEAI_ENROLLMENTS = [
  {
    id: "BE-000101",
    applicantName: "Dr. Jane Smith",
    npi: "1234567890",
    license: "MD-48213-CA",
    specialty: "Cardiology",
    network: "PPO Statewide",
    status: "Completed",
    planLevel: "Gold"
  },
  {
    id: "BE-000102",
    applicantName: "Dr. Marcus Alderly",
    npi: "1982736450",
    license: "MD-29831-TX",
    specialty: "Orthopedics",
    network: "HMO Regional",
    status: "Processing",
    planLevel: "Silver"
  },
  {
    id: "BE-000103",
    applicantName: "Dr. Priya Natarajan",
    npi: "1029384756",
    license: "MD-77120-NY",
    specialty: "Pediatrics",
    network: "PPO Statewide",
    status: "New",
    planLevel: "Bronze"
  },
  {
    id: "BE-000104",
    applicantName: "Dr. Ellis Whitfield",
    npi: "1456789023",
    license: "MD-55672-FL",
    specialty: "Family Medicine",
    network: "EPO Metro",
    status: "Payment Processing",
    planLevel: "Silver"
  },
  {
    id: "BE-000105",
    applicantName: "Dr. Renata Okafor",
    npi: "1876543209",
    license: "MD-30945-IL",
    specialty: "Neurology",
    network: "HMO Regional",
    status: "Finish Application",
    planLevel: "Gold"
  },
  {
    id: "BE-000106",
    applicantName: "Dr. Samuel Voss",
    npi: "1298765401",
    license: "MD-61183-WA",
    specialty: "Dermatology",
    network: "PPO Statewide",
    status: "Completed",
    planLevel: "Gold"
  },
  {
    id: "BE-000107",
    applicantName: "Dr. Corinne Ashby",
    npi: "1765432098",
    license: "MD-40277-OH",
    specialty: "Psychiatry",
    network: "EPO Metro",
    status: "Processing",
    planLevel: "Bronze"
  },
  {
    id: "BE-000108",
    applicantName: "Dr. Nathaniel Cruz",
    npi: "1345098276",
    license: "MD-88452-AZ",
    specialty: "Internal Medicine",
    network: "HMO Regional",
    status: "New",
    planLevel: "Silver"
  },
  {
    id: "BE-000109",
    applicantName: "Dr. Helena Marchetti",
    npi: "1654098732",
    license: "MD-19938-PA",
    specialty: "Cardiology",
    network: "PPO Statewide",
    status: "Completed",
    planLevel: "Gold"
  },
  {
    id: "BE-000110",
    applicantName: "Dr. Owen Fitzgerald",
    npi: "1987601234",
    license: "MD-70216-CO",
    specialty: "Orthopedics",
    network: "EPO Metro",
    status: "Payment Processing",
    planLevel: "Silver"
  }
];

/* ---------- Document Uploads (mock) ---------- */

const HEAI_DOCUMENTS = [
  {
    name: "Jane_Smith_Board_Certification.pdf",
    type: "PDF",
    enrollmentId: "BE-000101",
    uploadedDate: "2026-06-02"
  },
  {
    name: "Marcus_Alderly_State_License.pdf",
    type: "PDF",
    enrollmentId: "BE-000102",
    uploadedDate: "2026-06-15"
  },
  {
    name: "Priya_Natarajan_Malpractice_Insurance.png",
    type: "PNG",
    enrollmentId: "BE-000103",
    uploadedDate: "2026-06-28"
  },
  {
    name: "Ellis_Whitfield_DEA_Certificate.jpg",
    type: "JPEG",
    enrollmentId: "BE-000104",
    uploadedDate: "2026-07-03"
  },
  {
    name: "Renata_Okafor_License_Verification.pdf",
    type: "PDF",
    enrollmentId: "BE-000105",
    uploadedDate: "2026-07-09"
  },
  {
    name: "Samuel_Voss_Board_Certification.pdf",
    type: "PDF",
    enrollmentId: "BE-000106",
    uploadedDate: "2026-07-14"
  }
];
