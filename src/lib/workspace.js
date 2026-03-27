import {
  fetchApplicationTimeline,
  fetchApplicationTypes,
  fetchApplications,
  fetchCurrentUser,
  fetchPublicLicenseVerification,
  resolveApiUrl,
} from "./platformApi";

const APPLICATION_STATUS_META = {
  draft: { label: "Draft", tone: "app-status-pill--info" },
  submitted: { label: "Submitted", tone: "app-status-pill--info" },
  under_review: { label: "Under Review", tone: "app-status-pill--warning" },
  awaiting_information: { label: "Awaiting Information", tone: "app-status-pill--warning" },
  awaiting_payment: { label: "Awaiting Payment", tone: "app-status-pill--warning" },
  approved: { label: "Approved", tone: "app-status-pill--success" },
  rejected: { label: "Rejected", tone: "app-status-pill--danger" },
  issued: { label: "Issued", tone: "app-status-pill--success" },
};

const LICENSE_STATUS_META = {
  active: { label: "Active", tone: "app-status-pill--success" },
  expired: { label: "Expired", tone: "app-status-pill--danger" },
  suspended: { label: "Suspended", tone: "app-status-pill--warning" },
  revoked: { label: "Revoked", tone: "app-status-pill--danger" },
};

export const SERVICE_TYPE_META = {
  new_application: {
    label: "Apply",
    description: "Start a new licence application.",
  },
  license_renewal: {
    label: "Renew",
    description: "Extend an existing licence before it expires.",
  },
  license_modification: {
    label: "Modify",
    description: "Request updates to an existing licence.",
  },
  license_transfer: {
    label: "Transfer",
    description: "Move an existing licence to another entity.",
  },
  duplicate_license_request: {
    label: "Duplicate",
    description: "Request a replacement licence copy.",
  },
};

const EDITABLE_APPLICATION_STATUSES = new Set(["draft", "awaiting_information", "rejected"]);
const SUBMITTABLE_APPLICATION_STATUSES = new Set(["draft", "awaiting_information", "rejected"]);

function titleCaseWord(word) {
  return word ? `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}` : "";
}

export function humanizeToken(value) {
  return String(value || "")
    .split(/[_-]+/)
    .filter(Boolean)
    .map(titleCaseWord)
    .join(" ");
}

export function getApplicationStatusMeta(status) {
  return APPLICATION_STATUS_META[status] || {
    label: humanizeToken(status),
    tone: "app-status-pill--info",
  };
}

export function getLicenseStatusMeta(status) {
  return LICENSE_STATUS_META[status] || {
    label: humanizeToken(status),
    tone: "app-status-pill--info",
  };
}

export function getServiceTypeMeta(code) {
  return SERVICE_TYPE_META[code] || {
    label: humanizeToken(code),
    description: "Complete the BOCRA workflow for this service type.",
  };
}

export function isEditableApplicationStatus(status) {
  return EDITABLE_APPLICATION_STATUSES.has(status);
}

export function isSubmittableApplicationStatus(status) {
  return SUBMITTABLE_APPLICATION_STATUSES.has(status);
}

export function formatDate(value, options = {}) {
  if (!value) {
    return "Not available";
  }

  try {
    return new Intl.DateTimeFormat("en-BW", {
      day: "numeric",
      month: "short",
      year: "numeric",
      ...options,
    }).format(new Date(value));
  } catch (_error) {
    return String(value);
  }
}

export function formatDateTime(value) {
  return formatDate(value, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDaysUntilExpiry(daysUntilExpiry) {
  if (typeof daysUntilExpiry !== "number") {
    return "No expiry data";
  }

  if (daysUntilExpiry < 0) {
    return `${Math.abs(daysUntilExpiry)} day${Math.abs(daysUntilExpiry) === 1 ? "" : "s"} overdue`;
  }

  if (daysUntilExpiry === 0) {
    return "Expires today";
  }

  return `${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"} remaining`;
}

export function formatRoleCodes(roleCodes = []) {
  if (!Array.isArray(roleCodes) || !roleCodes.length) {
    return "Portal user";
  }

  return roleCodes.map((code) => humanizeToken(code)).join(", ");
}

export function buildApplicationTypeMap(applicationTypes = []) {
  return new Map(applicationTypes.map((item) => [item.id, item]));
}

export function groupApplicationTypesByService(applicationTypes = []) {
  return applicationTypes.reduce((grouped, item) => {
    const serviceCode = item.service_type_code;
    if (!grouped[serviceCode]) {
      grouped[serviceCode] = [];
    }

    grouped[serviceCode].push(item);
    grouped[serviceCode].sort((left, right) => left.name.localeCompare(right.name));
    return grouped;
  }, {});
}

export function getDynamicSections(applicationType) {
  const sections = applicationType?.dynamic_form_schema?.sections;
  return Array.isArray(sections) ? sections : [];
}

export function getFieldKey(field, index = 0) {
  const explicitKey = field?.key || field?.name;
  if (explicitKey) {
    return explicitKey;
  }

  const fallbackLabel = String(field?.label || `field_${index}`)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return fallbackLabel || `field_${index}`;
}

export function getFieldType(field) {
  const rawType = String(field?.type || field?.field_type || "text").toLowerCase();

  if (rawType === "checkbox" || rawType === "boolean") {
    return "checkbox";
  }

  if (rawType === "textarea") {
    return "textarea";
  }

  if (rawType === "select" || Array.isArray(field?.options) || Array.isArray(field?.choices)) {
    return "select";
  }

  if (["date", "email", "number", "password", "tel", "url"].includes(rawType)) {
    return rawType;
  }

  return "text";
}

export function getFieldOptions(field) {
  const source = field?.options || field?.choices || [];
  return source.map((option) => {
    if (typeof option === "string") {
      return { label: option, value: option };
    }

    return {
      label: option?.label || option?.name || option?.value || "Option",
      value: option?.value || option?.code || option?.id || option?.label || option?.name || "",
    };
  });
}

function isBlankValue(value) {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  return false;
}

function isRequiredField(field, applicationType) {
  const requiredFields = new Set(applicationType?.validation_rules?.required_fields || []);
  return Boolean(field?.required) || requiredFields.has(getFieldKey(field));
}

function fieldRuleFor(field, applicationType) {
  return applicationType?.validation_rules?.field_rules?.[getFieldKey(field)] || {};
}

export function validateField(field, value, applicationType) {
  const fieldType = getFieldType(field);
  const fieldLabel = field?.label || humanizeToken(getFieldKey(field));
  const rules = fieldRuleFor(field, applicationType);

  if (isRequiredField(field, applicationType)) {
    if (fieldType === "checkbox" && value !== true) {
      return `Please confirm ${fieldLabel.toLowerCase()}.`;
    }

    if (fieldType !== "checkbox" && isBlankValue(value)) {
      return `${fieldLabel} is required.`;
    }
  }

  if (isBlankValue(value)) {
    return "";
  }

  const normalizedValue = fieldType === "checkbox" ? value : String(value).trim();

  if (rules.min_length && String(normalizedValue).length < Number(rules.min_length)) {
    return `${fieldLabel} must be at least ${rules.min_length} characters.`;
  }

  if (rules.equals !== undefined && normalizedValue !== rules.equals) {
    return `${fieldLabel} must match the required value.`;
  }

  if (rules.format === "email" || fieldType === "email") {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(String(normalizedValue))) {
      return `Enter a valid email for ${fieldLabel.toLowerCase()}.`;
    }
  }

  return "";
}

export function validateApplicationForm(applicationType, formValues) {
  const errors = {};

  getDynamicSections(applicationType).forEach((section) => {
    (section.fields || []).forEach((field, index) => {
      const key = getFieldKey(field, index);
      const message = validateField(field, formValues[key], applicationType);
      if (message) {
        errors[key] = message;
      }
    });
  });

  return errors;
}

export function getSectionCompletion(section, formValues, applicationType) {
  const fields = Array.isArray(section?.fields) ? section.fields : [];
  const requiredFields = fields
    .map((field, index) => ({
      field,
      key: getFieldKey(field, index),
    }))
    .filter(({ field }) => isRequiredField(field, applicationType));
  const incompleteRequiredFields = requiredFields.filter(({ field, key }) =>
    Boolean(validateField(field, formValues[key], applicationType)),
  );

  return {
    complete: incompleteRequiredFields.length === 0,
    requiredCount: requiredFields.length,
    incompleteCount: incompleteRequiredFields.length,
  };
}

export function findFirstIncompleteSectionIndex(applicationType, formValues) {
  const sections = getDynamicSections(applicationType);
  const firstIncompleteIndex = sections.findIndex(
    (section) => !getSectionCompletion(section, formValues, applicationType).complete,
  );

  return firstIncompleteIndex >= 0 ? firstIncompleteIndex : 0;
}

export function extractLicenseNumberFromTimeline(timeline) {
  const issuedEvent = timeline?.events?.find((event) => event.event_type === "license_issued");
  const licenseMatch = issuedEvent?.message?.match(/License\s+([A-Z0-9-]+)\s+has been issued/i);
  return licenseMatch?.[1] || "";
}

export function sortApplications(applications = []) {
  return [...applications].sort((left, right) => {
    const rightTimestamp = new Date(right.updated_at || right.created_at || 0).getTime();
    const leftTimestamp = new Date(left.updated_at || left.created_at || 0).getTime();
    return rightTimestamp - leftTimestamp;
  });
}

export function upsertApplication(applications = [], application) {
  const filtered = applications.filter((item) => item.id !== application.id);
  return sortApplications([application, ...filtered]);
}

export function buildApplicationTitle(applicationType, organizationLabel) {
  if (!applicationType) {
    return "BOCRA licence application";
  }

  if (!organizationLabel) {
    return applicationType.name;
  }

  return `${applicationType.name} - ${organizationLabel}`;
}

export function buildOrganizationLabel(currentUser, applications = []) {
  if (applications.length) {
    const titlePrefix = applications[0].title.split(" - ")[1];
    if (titlePrefix) {
      return titlePrefix;
    }
  }

  return currentUser?.full_name || "Portal applicant";
}

export function findExistingFollowOnApplication(applications, licenseNumber, serviceTypeCode, applicationTypeMap) {
  return applications.find((application) => {
    const applicationType = applicationTypeMap.get(application.application_type_id);
    if (!applicationType || applicationType.service_type_code !== serviceTypeCode) {
      return false;
    }

    return (
      application.form_data?.current_license_number === licenseNumber &&
      isEditableApplicationStatus(application.status)
    );
  });
}

export async function deriveIssuedLicenses(applications = []) {
  const sourceApplications = applications.filter((application) =>
    ["approved", "issued"].includes(application.status),
  );

  if (!sourceApplications.length) {
    return [];
  }

  const timelineResponses = await Promise.allSettled(
    sourceApplications.map((application) => fetchApplicationTimeline(application.id)),
  );

  const verificationRequests = sourceApplications.map(async (application, index) => {
    const timeline = timelineResponses[index].status === "fulfilled" ? timelineResponses[index].value : null;
    const licenseNumber = extractLicenseNumberFromTimeline(timeline);

    if (!licenseNumber) {
      return null;
    }

    try {
      const details = await fetchPublicLicenseVerification(licenseNumber);
      return {
        ...details,
        source_application_id: application.id,
        source_application_status: application.status,
        source_application_title: application.title,
        verification_url: resolveApiUrl(details.qr_code_url || details.details?.verification_url || ""),
        document_download_url: resolveApiUrl(details.document_url || details.details?.document_url || ""),
      };
    } catch (_error) {
      return {
        license_number: licenseNumber,
        status: application.status === "issued" ? "active" : application.status,
        application_id: application.id,
        source_application_id: application.id,
        source_application_status: application.status,
        source_application_title: application.title,
        effective_from: null,
        expires_at: null,
        verification_url: "",
        document_download_url: "",
      };
    }
  });

  const verifiedLicenses = (await Promise.all(verificationRequests)).filter(Boolean);

  return verifiedLicenses.sort((left, right) => {
    const leftTime = new Date(left.expires_at || left.issued_at || 0).getTime();
    const rightTime = new Date(right.expires_at || right.issued_at || 0).getTime();
    return leftTime - rightTime;
  });
}

export async function loadClientWorkspace() {
  const [currentUser, applicationTypes, rawApplications] = await Promise.all([
    fetchCurrentUser(),
    fetchApplicationTypes(true),
    fetchApplications(),
  ]);

  const applications = sortApplications(rawApplications || []);
  const licenses = await deriveIssuedLicenses(applications);

  return {
    currentUser,
    applicationTypes: applicationTypes || [],
    applicationTypeMap: buildApplicationTypeMap(applicationTypes || []),
    groupedApplicationTypes: groupApplicationTypesByService(applicationTypes || []),
    applications,
    licenses,
  };
}
