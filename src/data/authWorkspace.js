export const workspaceUser = {
  name: "Aupa Moleofe",
  role: "Account administrator",
  organization: "Aupa Telecom (Pty) Ltd",
  avatar: "https://i.pravatar.cc/96?img=32",
};

export const workspaceSnapshot = [
  { label: "Open applications", value: "03" },
  { label: "Compliance items", value: "02" },
  { label: "Unread notices", value: "05" },
];

export const authNavigation = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/dashboard",
    aliases: ["/clientDash"],
    shortLabel: "DB",
    status: "live",
    description: "Overview, recent applications, and service health.",
    title: "Dashboard",
    headerDescription:
      "Track licences, compliance submissions, and next actions from one client workspace.",
  },
  {
    key: "licensing",
    label: "Licensing",
    path: "/licensing",
    shortLabel: "LI",
    status: "live",
    description: "Apply for new, renewal, transfer, and modification services.",
    title: "Licensing",
    headerDescription:
      "Start or continue licence applications with a cleaner, guided BOCRA workflow.",
  },
  {
    key: "compliance",
    label: "Compliance",
    path: "/compliance",
    shortLabel: "CO",
    status: "live",
    description: "Submit returns, follow up on compliance items, and check status.",
    title: "Compliance",
    headerDescription:
      "Submit compliance information and monitor certificates, follow-ups, and licence health.",
  },
  {
    key: "type-approval",
    label: "Type Approval",
    path: "/type-approval",
    shortLabel: "TA",
    status: "live",
    description: "Review type approval guidance, categories, notices, and fee structure.",
    title: "Type Approval",
    headerDescription:
      "A client-facing shell for device approval requests, supporting evidence, and status checks.",
  },
  {
    key: "qos-monitoring",
    label: "QoS Monitoring",
    path: "/qos-monitoring",
    shortLabel: "QS",
    status: "live",
    description: "Submit QoS returns and inspect DQO monitoring signals.",
    title: "QoS Monitoring",
    headerDescription:
      "A shell for quality-of-service submissions, results, and regulatory follow-up.",
  },
  {
    key: "complaints",
    label: "Complaints",
    path: "/complaints",
    shortLabel: "CP",
    status: "live",
    description: "Submit complaints, disputes, and appeals with live receipt capture.",
    title: "Complaints",
    headerDescription:
      "A shell for public complaints, escalations, supporting evidence, and resolution timelines.",
  },
  {
    key: "reports",
    label: "Reports",
    path: "/reports",
    shortLabel: "RP",
    status: "live",
    description: "Review invoices, payments, receipts, and provider actions.",
    title: "Reports",
    headerDescription:
      "A shell for downloadable summaries, payment history, and client-facing reporting.",
  },
  {
    key: "support",
    label: "Support",
    path: "/support",
    shortLabel: "SP",
    status: "live",
    description: "Open application-linked message threads with BOCRA support.",
    title: "Support",
    headerDescription:
      "A shell for support requests, contact channels, and case progress updates.",
  },
  {
    key: "settings",
    label: "Settings",
    path: "/settings",
    shortLabel: "ST",
    status: "live",
    description: "Manage organizations, members, and linked contact details.",
    title: "Settings",
    headerDescription:
      "A shell for account preferences, communication rules, and organization configuration.",
  },
  {
    key: "profile",
    label: "Profile",
    path: "/profile",
    shortLabel: "PF",
    status: "live",
    description: "Inspect your live profile and submit identity verification.",
    title: "Profile",
    headerDescription:
      "A shell for identity details, verification status, and key account contacts.",
  },
];

export const placeholderPageContent = {
  "type-approval": {
    badge: "Public reference workspace",
    summary:
      "Create and track equipment approval requests without forcing applicants back into email and paper-heavy loops.",
    highlights: [
      "Equipment catalogue, model submissions, and supporting documentation.",
      "Approval statuses with milestones for receipt, technical review, and decision.",
      "Clear reminders for missing documents, fees, and next regulatory actions.",
    ],
    readiness: [
      "Sidebar route and page shell are now live for navigation and design reviews.",
      "The structure is ready for form wiring, document uploads, and fee integration.",
      "Status components can be reused later for certificate issue and expiry views.",
    ],
    metrics: [
      { label: "Primary flows", value: "3" },
      { label: "Review states", value: "4" },
      { label: "Upload groups", value: "5" },
    ],
  },
  "qos-monitoring": {
    badge: "QoS filing workspace",
    summary:
      "Give regulated entities a clean place to submit QoS returns, inspect trends, and respond to regulatory requests.",
    highlights: [
      "Scheduled reporting windows and submission history by monitoring period.",
      "Trend cards for service availability, complaints rate, and performance thresholds.",
      "Follow-up prompts when BOCRA requests clarification or fresh evidence.",
    ],
    readiness: [
      "This shell gives us the permanent route, header, and section structure up front.",
      "Charts, tables, and filters can slot into the current panel layout without rework.",
      "The design already lines up with the refreshed authenticated dashboard language.",
    ],
    metrics: [
      { label: "Trend cards", value: "4" },
      { label: "Filters", value: "3" },
      { label: "Exports", value: "2" },
    ],
  },
  complaints: {
    badge: "Public intake workspace",
    summary:
      "Bring complaint submission and follow-up into a single client workspace with clearer visibility on case progress.",
    highlights: [
      "Complaint intake with subject, channel, attachments, and response expectations.",
      "A timeline of updates, officer responses, and outstanding client actions.",
      "Quick resolution markers for in review, waiting on BOCRA, and resolved cases.",
    ],
    readiness: [
      "The route shell is ready for public complaint forms and threaded updates.",
      "Shared table and badge styles already support complaint states and SLA cues.",
      "This page can grow into both complaint intake and resolution history without redesigning navigation.",
    ],
    metrics: [
      { label: "Case states", value: "5" },
      { label: "Response lanes", value: "3" },
      { label: "Attachment areas", value: "2" },
    ],
  },
  reports: {
    badge: "Billing and payments workspace",
    summary:
      "Offer clients polished operational downloads so they can self-serve common reporting without contacting staff.",
    highlights: [
      "Application history, payment summaries, and active licence snapshots.",
      "Time-based filters for monthly, quarterly, and annual views.",
      "Prepared export actions for PDF summaries and spreadsheet downloads.",
    ],
    readiness: [
      "The shell supports KPI cards, report filters, and export actions from day one.",
      "We can reuse the existing table treatment for report history and generated files.",
      "The page copy already positions reports as a self-service client tool, not a staff console clone.",
    ],
    metrics: [
      { label: "Report packs", value: "4" },
      { label: "Filters", value: "3" },
      { label: "Export types", value: "2" },
    ],
  },
  support: {
    badge: "Application support workspace",
    summary:
      "Give applicants a clear way to request help, track responses, and keep context attached to each support case.",
    highlights: [
      "Ticket intake for licensing, compliance, payments, and technical help.",
      "Contextual links back to the affected application or submission.",
      "Response timelines and next-step guidance without losing the conversational history.",
    ],
    readiness: [
      "The workspace shell is ready for a ticket list, knowledge links, and contact actions.",
      "Current panel spacing already supports a split between intake actions and active tickets.",
      "Support can later share status components with complaints and notifications.",
    ],
    metrics: [
      { label: "Ticket queues", value: "3" },
      { label: "Help channels", value: "3" },
      { label: "Linked records", value: "4" },
    ],
  },
  settings: {
    badge: "Organization management workspace",
    summary:
      "Centralize organization preferences, communication choices, and account defaults in one calm settings surface.",
    highlights: [
      "Notification preferences across email, SMS, and portal alerts.",
      "Organization defaults for contacts, addresses, and preferred submission details.",
      "Security preferences such as password updates and future MFA controls.",
    ],
    readiness: [
      "The shell is now available for settings work without touching global navigation again.",
      "Shared form styles are in place for profile, organization, and communication settings.",
      "The layout keeps this page aligned with the portal brand while staying client friendly.",
    ],
    metrics: [
      { label: "Preference groups", value: "3" },
      { label: "Security cards", value: "2" },
      { label: "Form blocks", value: "4" },
    ],
  },
  profile: {
    badge: "Account profile workspace",
    summary:
      "Keep account identity, contact details, verification state, and key organization information together in one profile view.",
    highlights: [
      "Primary account holder details and verification indicators.",
      "Organization contacts, registration details, and billing contact records.",
      "Read-only audit-friendly account summary for quick cross-checking.",
    ],
    readiness: [
      "The route is ready now for profile cards, editable fields, and verification indicators.",
      "We can reuse the shared card system for identity, organization, and contact sections.",
      "This shell also creates a stable destination for future profile completion prompts.",
    ],
    metrics: [
      { label: "Identity cards", value: "3" },
      { label: "Verification states", value: "3" },
      { label: "Contact groups", value: "2" },
    ],
  },
};

export function getAuthNavigationByKey(key) {
  return authNavigation.find((item) => item.key === key) || authNavigation[0];
}

export function getAuthNavigationByPath(path) {
  return (
    authNavigation.find(
      (item) => item.path === path || (Array.isArray(item.aliases) && item.aliases.includes(path)),
    ) || authNavigation[0]
  );
}

export function getAuthRouteMeta(key, extra = {}) {
  const item = getAuthNavigationByKey(key);

  return {
    authShell: true,
    title: item.title,
    description: item.headerDescription,
    documentTitle: `${item.title} | BOCRA Public Portal`,
    ...extra,
  };
}
