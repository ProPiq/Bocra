const DEFAULT_API_BASE_URL = "/api/v1";
const AUTH_STORAGE_KEY = "bocra_platform_auth_session";
const LEGACY_TOKEN_KEY = "token";
const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;

export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL)
  .trim()
  .replace(/\/+$/, "");
const API_BASE_IS_ABSOLUTE = ABSOLUTE_URL_PATTERN.test(API_BASE_URL);
const API_ORIGIN = API_BASE_IS_ABSOLUTE ? new URL(API_BASE_URL).origin : "";
const API_BASE_PATH = API_BASE_IS_ABSOLUTE
  ? new URL(API_BASE_URL).pathname.replace(/\/+$/, "")
  : API_BASE_URL || DEFAULT_API_BASE_URL;

function joinUrlParts(base, path) {
  return `${String(base || "").replace(/\/+$/, "")}/${String(path || "").replace(/^\/+/, "")}`;
}

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== undefined && item !== null && item !== "") {
          searchParams.append(key, String(item));
        }
      });
      return;
    }

    searchParams.set(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export class PlatformApiError extends Error {
  constructor(message, { status = 500, detail = null, data = null } = {}) {
    super(message);
    this.name = "PlatformApiError";
    this.status = status;
    this.detail = detail;
    this.data = data;
  }
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function parseStoredJson(rawValue) {
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch (_error) {
    return null;
  }
}

function readLegacySession() {
  if (!canUseStorage()) {
    return null;
  }

  const accessToken = localStorage.getItem(LEGACY_TOKEN_KEY);
  if (!accessToken) {
    return null;
  }

  return {
    access_token: accessToken,
    refresh_token: "",
    token_type: "bearer",
    expires_at: null,
    refresh_expires_at: null,
    user: null,
  };
}

function errorMessageFromData(data, fallbackMessage) {
  if (!data) {
    return fallbackMessage;
  }

  if (typeof data === "string") {
    return data;
  }

  if (typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }

  if (typeof data.detail === "string" && data.detail.trim()) {
    return data.detail;
  }

  if (Array.isArray(data.detail) && data.detail.length) {
    const firstItem = data.detail[0];
    if (typeof firstItem === "string") {
      return firstItem;
    }
    if (typeof firstItem?.msg === "string") {
      return firstItem.msg;
    }
  }

  if (data.detail && typeof data.detail === "object" && Array.isArray(data.detail.issues)) {
    return "The request has validation issues that need attention.";
  }

  return fallbackMessage;
}

async function parseResponseBody(response) {
  const rawBody = await response.text();
  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch (_error) {
    return rawBody;
  }
}

export function resolveApiUrl(path) {
  if (!path) {
    return API_BASE_URL || DEFAULT_API_BASE_URL;
  }

  if (ABSOLUTE_URL_PATTERN.test(path)) {
    return path;
  }

  if (path === API_BASE_PATH || path.startsWith(`${API_BASE_PATH}/`)) {
    return API_ORIGIN ? `${API_ORIGIN}${path}` : path;
  }

  if (path.startsWith("/")) {
    const resolvedPath = joinUrlParts(API_BASE_PATH || DEFAULT_API_BASE_URL, path);
    return API_ORIGIN ? `${API_ORIGIN}${resolvedPath}` : resolvedPath;
  }

  return joinUrlParts(API_BASE_URL || DEFAULT_API_BASE_URL, path);
}

export function getStoredSession() {
  if (!canUseStorage()) {
    return null;
  }

  const storedSession = parseStoredJson(localStorage.getItem(AUTH_STORAGE_KEY));
  return storedSession || readLegacySession();
}

export function getAccessToken() {
  return getStoredSession()?.access_token || "";
}

export function getStoredUser() {
  return getStoredSession()?.user || null;
}

export function persistAuthSession(payload) {
  if (!canUseStorage()) {
    return null;
  }

  const session = payload?.session || payload;
  if (!session?.access_token) {
    return null;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  localStorage.setItem(LEGACY_TOKEN_KEY, session.access_token);
  return session;
}

export function updateStoredUser(user) {
  if (!canUseStorage() || !user) {
    return null;
  }

  const session = getStoredSession();
  if (!session?.access_token) {
    return null;
  }

  const nextSession = {
    ...session,
    user,
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession));
  localStorage.setItem(LEGACY_TOKEN_KEY, nextSession.access_token);
  return nextSession;
}

export function clearAuthSession() {
  if (!canUseStorage()) {
    return;
  }

  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export async function apiRequest(
  path,
  { method = "GET", body, headers = {}, auth = true, token = getAccessToken() } = {},
) {
  const requestHeaders = {
    Accept: "application/json",
    ...headers,
  };

  const options = {
    method,
    headers: requestHeaders,
  };

  if (auth && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    if (body instanceof FormData) {
      options.body = body;
      delete requestHeaders["Content-Type"];
    } else {
      requestHeaders["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }
  }

  const response = await fetch(resolveApiUrl(path), options);
  const data = await parseResponseBody(response);

  if (!response.ok) {
    throw new PlatformApiError(
      errorMessageFromData(data, `Request failed with status ${response.status}.`),
      {
        status: response.status,
        detail: data?.detail ?? null,
        data,
      },
    );
  }

  return data;
}

export function hasAuthSession() {
  return Boolean(getAccessToken());
}

export async function fetchCurrentUser() {
  return apiRequest("/auth/me");
}

export async function fetchApplicationTypes(activeOnly = true) {
  return apiRequest(`/licenses/application-types${buildQueryString({ active_only: activeOnly })}`, {
    auth: false,
  });
}

export async function fetchApplications() {
  return apiRequest("/applications");
}

export async function fetchApplicationTimeline(applicationId) {
  return apiRequest(`/applications/${applicationId}/timeline`);
}

export async function fetchApplicationRequirements(applicationId) {
  return apiRequest(`/applications/${applicationId}/requirements`);
}

export async function createApplicationDraft(payload) {
  return apiRequest("/applications", {
    method: "POST",
    body: payload,
  });
}

export async function updateApplicationDraft(applicationId, payload) {
  return apiRequest(`/applications/${applicationId}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function submitApplication(applicationId, payload = {}) {
  return apiRequest(`/applications/${applicationId}/submit`, {
    method: "POST",
    body: payload,
  });
}

export async function resubmitApplication(applicationId, payload = {}) {
  return apiRequest(`/applications/${applicationId}/resubmit`, {
    method: "POST",
    body: payload,
  });
}

export async function renewApplication(applicationId, payload = {}) {
  return apiRequest(`/applications/${applicationId}/renew`, {
    method: "POST",
    body: payload,
  });
}

export async function deriveApplication(applicationId, payload) {
  return apiRequest(`/applications/${applicationId}/derive`, {
    method: "POST",
    body: payload,
  });
}

export async function fetchApplicationMessageThreads(applicationId) {
  return apiRequest(`/applications/${applicationId}/messages`);
}

export async function createApplicationMessageThread(applicationId, payload) {
  return apiRequest(`/applications/${applicationId}/messages`, {
    method: "POST",
    body: payload,
  });
}

export async function replyToApplicationMessageThread(applicationId, threadId, payload) {
  return apiRequest(`/applications/${applicationId}/messages/${threadId}/reply`, {
    method: "POST",
    body: payload,
  });
}

export async function fetchPublicLicenseVerification(licenseNumber) {
  return apiRequest(`/public/licenses/verify/${encodeURIComponent(licenseNumber)}`, {
    auth: false,
  });
}

export async function fetchComplianceModules() {
  return apiRequest("/compliance/modules");
}

export async function fetchComplianceSubmissions(filters = {}) {
  return apiRequest(`/compliance/submissions${buildQueryString(filters)}`);
}

export async function createComplianceSubmission(payload) {
  return apiRequest("/compliance/submissions", {
    method: "POST",
    body: payload,
  });
}

export async function updateComplianceSubmission(submissionId, payload) {
  return apiRequest(`/compliance/submissions/${submissionId}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function submitComplianceSubmission(submissionId, payload = {}) {
  return apiRequest(`/compliance/submissions/${submissionId}/submit`, {
    method: "POST",
    body: payload,
  });
}

export async function fetchComplianceExpiryTracker(withinDays = 60) {
  return apiRequest(`/compliance/expiry-tracker${buildQueryString({ within_days: withinDays })}`);
}

export async function fetchOrganizations() {
  return apiRequest("/organizations");
}

export async function createOrganization(payload) {
  return apiRequest("/organizations", {
    method: "POST",
    body: payload,
  });
}

export async function updateOrganization(organizationId, payload) {
  return apiRequest(`/organizations/${organizationId}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function addOrganizationMember(organizationId, payload) {
  return apiRequest(`/organizations/${organizationId}/members`, {
    method: "POST",
    body: payload,
  });
}

export async function updateOrganizationMember(organizationId, memberId, payload) {
  return apiRequest(`/organizations/${organizationId}/members/${memberId}`, {
    method: "PATCH",
    body: payload,
  });
}

export async function removeOrganizationMember(organizationId, memberId) {
  return apiRequest(`/organizations/${organizationId}/members/${memberId}`, {
    method: "DELETE",
  });
}

export async function fetchPaymentProviders() {
  return apiRequest("/payments/providers");
}

export async function fetchInvoices() {
  return apiRequest("/payments/invoices");
}

export async function fetchInvoice(invoiceId) {
  return apiRequest(`/payments/invoices/${invoiceId}`);
}

export async function initiateInvoicePayment(invoiceId, payload) {
  return apiRequest(`/payments/invoices/${invoiceId}/payments`, {
    method: "POST",
    body: payload,
  });
}

export async function fetchPayments() {
  return apiRequest("/payments");
}

export async function fetchPayment(paymentId) {
  return apiRequest(`/payments/${paymentId}`);
}

export async function checkPaymentStatus(paymentId) {
  return apiRequest(`/payments/${paymentId}/status-check`, {
    method: "POST",
    body: {},
  });
}

export async function fetchReceipt(receiptId) {
  return apiRequest(`/payments/receipts/${receiptId}`);
}

export async function fetchPublicGuidelines() {
  return apiRequest("/public/guidelines", {
    auth: false,
  });
}

export async function fetchPublicGuideline(guidelineCode) {
  return apiRequest(`/public/guidelines/${guidelineCode}`, {
    auth: false,
  });
}

export async function fetchPublicNotices() {
  return apiRequest("/public/notices", {
    auth: false,
  });
}

export async function fetchPublicNotice(noticeCode) {
  return apiRequest(`/public/notices/${noticeCode}`, {
    auth: false,
  });
}

export async function fetchPublicFeeStructure() {
  return apiRequest("/public/fee-structure", {
    auth: false,
  });
}

export async function fetchPublicLicenseCategories() {
  return apiRequest("/public/license-categories", {
    auth: false,
  });
}

export async function submitPublicComplaint(payload) {
  return apiRequest("/public/intake/complaints", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export async function submitPublicDispute(payload) {
  return apiRequest("/public/intake/disputes", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export async function submitPublicAppeal(payload) {
  return apiRequest("/public/intake/appeals", {
    method: "POST",
    body: payload,
    auth: false,
  });
}

export async function fetchDqoEnhancedMetrics(service = "all") {
  return apiRequest(`/dqo/metrics/enhanced${buildQueryString({ service })}`, {
    auth: false,
  });
}

export async function verifyCitizenIdentity(payload) {
  return apiRequest("/auth/identity/citizen/verify", {
    method: "POST",
    body: payload,
  });
}

export async function verifyForeignNationalIdentity(payload) {
  return apiRequest("/auth/identity/foreign-national/verify", {
    method: "POST",
    body: payload,
  });
}
