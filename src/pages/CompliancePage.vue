<template>
  <ClientWorkspaceLayout>
    <div class="app-page compliance-page">
      <section class="app-panel app-page-hero">
        <div>
          <p class="app-eyebrow">Compliance workspace</p>
          <h2>Submit compliance returns, continue drafts, and track expiry exposure in one place.</h2>
          <p>
            This page now uses the live compliance modules, submissions, and expiry tracker
            endpoints instead of demo data.
          </p>
        </div>

        <span class="app-status-pill app-status-pill--info">
          {{ complianceModules.length }} module{{ complianceModules.length === 1 ? "" : "s" }}
        </span>
      </section>

      <p v-if="loading" class="app-note">Loading your compliance workspace...</p>

      <template v-else>
        <p v-if="errorMessage" class="app-note app-note--error">{{ errorMessage }}</p>
        <p v-if="successMessage" class="compliance-page__success">{{ successMessage }}</p>

        <section class="app-meta-grid">
          <article v-for="stat in stats" :key="stat.label" class="app-stat-card">
            <p>{{ stat.label }}</p>
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.caption }}</span>
          </article>
        </section>

        <section class="app-panel">
          <div class="app-section-head">
            <div>
              <h3>Compliance modules</h3>
              <p>Select the module you want to file against or inspect.</p>
            </div>

            <button
              class="app-button app-button--secondary"
              type="button"
              :disabled="saving"
              @click="resetEditor"
            >
              New draft
            </button>
          </div>

          <div v-if="complianceModules.length" class="app-tab-row">
            <button
              v-for="module in complianceModules"
              :key="module.code"
              class="app-tab"
              :class="{ 'is-active': module.code === selectedModuleCode }"
              type="button"
              :title="module.description"
              @click="selectModule(module.code)"
            >
              {{ module.name }}
            </button>
          </div>
          <p v-else class="app-note">No compliance modules are configured for this environment.</p>
        </section>

        <section class="compliance-page__grid">
          <article class="app-panel">
            <div class="app-section-head">
              <div>
                <h3>{{ selectedModule?.name || "Compliance draft" }}</h3>
                <p>{{ selectedModule?.description || "Select a module to load its reporting fields." }}</p>
              </div>
            </div>

            <form v-if="selectedModule" class="app-form-grid" @submit.prevent="saveDraft">
              <div class="app-form-field">
                <label for="compliance-organization">Organization</label>
                <select
                  id="compliance-organization"
                  v-model="editorForm.organization_id"
                  class="app-select"
                  :disabled="Boolean(selectedSubmissionId)"
                >
                  <option value="">Select organization</option>
                  <option v-for="organization in organizations" :key="organization.id" :value="organization.id">
                    {{ organization.name }}
                  </option>
                </select>
              </div>

              <div class="app-form-field">
                <label for="compliance-start">Reporting period start</label>
                <input
                  id="compliance-start"
                  v-model="editorForm.reporting_period_start"
                  class="app-input"
                  type="date"
                />
              </div>

              <div class="app-form-field">
                <label for="compliance-end">Reporting period end</label>
                <input
                  id="compliance-end"
                  v-model="editorForm.reporting_period_end"
                  class="app-input"
                  type="date"
                />
              </div>

              <div
                v-for="(field, index) in selectedModule.payload_fields || []"
                :key="getFieldKey(field, index)"
                class="app-form-field"
              >
                <label :for="`compliance-${getFieldKey(field, index)}`">
                  {{ field.label }}
                  <span v-if="field.required">*</span>
                </label>

                <textarea
                  v-if="getFieldType(field) === 'textarea'"
                  :id="`compliance-${getFieldKey(field, index)}`"
                  v-model="moduleValues[getFieldKey(field, index)]"
                  class="app-textarea"
                  :placeholder="field.description || field.label"
                ></textarea>

                <select
                  v-else-if="getFieldType(field) === 'select'"
                  :id="`compliance-${getFieldKey(field, index)}`"
                  v-model="moduleValues[getFieldKey(field, index)]"
                  class="app-select"
                >
                  <option value="">Select {{ field.label }}</option>
                  <option
                    v-for="option in getFieldOptions(field)"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>

                <input
                  v-else
                  :id="`compliance-${getFieldKey(field, index)}`"
                  v-model="moduleValues[getFieldKey(field, index)]"
                  class="app-input"
                  :type="getFieldType(field)"
                  :placeholder="field.description || field.label"
                />
              </div>

              <div class="app-form-field">
                <label for="compliance-certificate-name">Certificate name</label>
                <input
                  id="compliance-certificate-name"
                  v-model="editorForm.certificate_name"
                  class="app-input"
                  type="text"
                />
              </div>

              <div class="app-form-field">
                <label for="compliance-certificate-reference">Certificate reference</label>
                <input
                  id="compliance-certificate-reference"
                  v-model="editorForm.certificate_reference"
                  class="app-input"
                  type="text"
                />
              </div>

              <div class="app-form-field">
                <label for="compliance-certificate-expiry">Certificate expiry date</label>
                <input
                  id="compliance-certificate-expiry"
                  v-model="editorForm.certificate_expiry_date"
                  class="app-input"
                  type="date"
                />
              </div>

              <div class="compliance-page__actions">
                <button class="app-button" type="submit" :disabled="saving">
                  {{ selectedSubmissionId ? "Save draft changes" : "Save draft" }}
                </button>
                <button
                  class="app-button app-button--secondary"
                  type="button"
                  :disabled="saving"
                  @click="submitRecord"
                >
                  {{ selectedSubmissionId ? "Submit record" : "Save and submit" }}
                </button>
              </div>
            </form>

            <p v-else class="app-note">Select a module to start a compliance submission.</p>
          </article>

          <article class="app-panel">
            <div class="app-section-head">
              <div>
                <h3>Expiry tracker</h3>
                <p>Live compliance and licence expiry exposure across your linked organizations.</p>
              </div>
            </div>

            <div class="compliance-page__expiry-stack">
              <article class="app-panel-muted">
                <strong>License expiries</strong>
                <ul v-if="expiryTracker.license_expiries?.length" class="compliance-page__mini-list">
                  <li v-for="license in expiryTracker.license_expiries.slice(0, 6)" :key="license.license_number">
                    <span>{{ license.license_number }}</span>
                    <strong>{{ formatDaysUntilExpiry(license.days_until_expiry) }}</strong>
                  </li>
                </ul>
                <p v-else>No licence expiries are currently inside the tracker window.</p>
              </article>

              <article class="app-panel-muted">
                <strong>Certificate expiries</strong>
                <ul
                  v-if="expiryTracker.certificate_expiries?.length"
                  class="compliance-page__mini-list"
                >
                  <li
                    v-for="certificate in expiryTracker.certificate_expiries.slice(0, 6)"
                    :key="certificate.compliance_submission_id"
                  >
                    <span>{{ certificate.certificate_name }}</span>
                    <strong>{{ formatDaysUntilExpiry(certificate.days_until_expiry) }}</strong>
                  </li>
                </ul>
                <p v-else>No compliance certificate expiries are currently tracked.</p>
              </article>
            </div>
          </article>
        </section>

        <section class="app-panel">
          <div class="app-section-head">
            <div>
              <h3>Submission history</h3>
              <p>Filtered to the active module so drafts and submitted records stay easy to scan.</p>
            </div>
          </div>

          <div class="app-table-wrap">
            <table v-if="paginatedSubmissions.items.length" class="app-table">
              <thead>
                <tr>
                  <th>Module</th>
                  <th>Organization</th>
                  <th>Reporting period</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="submission in paginatedSubmissions.items" :key="submission.id">
                  <td>{{ moduleName(submission.submission_type) }}</td>
                  <td>{{ organizationName(submission.organization_id) }}</td>
                  <td>
                    {{ formatDate(submission.reporting_period_start) }} to
                    {{ formatDate(submission.reporting_period_end) }}
                  </td>
                  <td>
                    <span class="app-status-pill" :class="statusTone(submission.status)">
                      {{ humanizeToken(submission.status) }}
                    </span>
                  </td>
                  <td>
                    {{
                      submission.submitted_at
                        ? formatDateTime(submission.submitted_at)
                        : "Draft only"
                    }}
                  </td>
                  <td>
                    <button
                      class="app-button app-button--secondary"
                      type="button"
                      @click="openSubmission(submission)"
                    >
                      {{ isEditableComplianceStatus(submission.status) ? "Continue" : "View" }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-else class="app-note">No submissions were found for the selected module.</p>
          </div>

          <div v-if="paginatedSubmissions.totalPages > 1" class="compliance-page__pagination">
            <button
              class="app-button app-button--secondary"
              type="button"
              :disabled="paginatedSubmissions.page <= 1"
              @click="setPage(submissionPage, paginatedSubmissions.page - 1, paginatedSubmissions.totalPages)"
            >
              Previous
            </button>
            <span>Page {{ paginatedSubmissions.page }} of {{ paginatedSubmissions.totalPages }}</span>
            <button
              class="app-button app-button--secondary"
              type="button"
              :disabled="paginatedSubmissions.page >= paginatedSubmissions.totalPages"
              @click="setPage(submissionPage, paginatedSubmissions.page + 1, paginatedSubmissions.totalPages)"
            >
              Next
            </button>
          </div>
        </section>
      </template>
    </div>
  </ClientWorkspaceLayout>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import ClientWorkspaceLayout from "../components/auth/ClientWorkspaceLayout.vue";
import {
  createComplianceSubmission,
  fetchComplianceExpiryTracker,
  fetchComplianceModules,
  fetchComplianceSubmissions,
  fetchOrganizations,
  submitComplianceSubmission,
  updateComplianceSubmission,
} from "../lib/platformApi";
import {
  formatDate,
  formatDateTime,
  formatDaysUntilExpiry,
  getFieldKey,
  getFieldOptions,
  getFieldType,
  humanizeToken,
} from "../lib/workspace";

const loading = ref(true);
const saving = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const complianceModules = ref([]);
const submissions = ref([]);
const organizations = ref([]);
const expiryTracker = ref({
  within_days: 90,
  license_expiries: [],
  certificate_expiries: [],
});
const selectedModuleCode = ref("");
const selectedSubmissionId = ref("");
const submissionPage = ref(1);
const moduleValues = reactive({});
const editorForm = reactive({
  organization_id: "",
  reporting_period_start: "",
  reporting_period_end: "",
  certificate_name: "",
  certificate_reference: "",
  certificate_expiry_date: "",
});

const selectedModule = computed(
  () => complianceModules.value.find((module) => module.code === selectedModuleCode.value) || null,
);
const filteredSubmissions = computed(() =>
  selectedModuleCode.value
    ? submissions.value.filter((submission) => submission.submission_type === selectedModuleCode.value)
    : submissions.value,
);
const paginatedSubmissions = computed(() => paginateItems(filteredSubmissions.value, submissionPage.value, 6));
const stats = computed(() => [
  {
    label: "Modules",
    value: String(complianceModules.value.length).padStart(2, "0"),
    caption: "Available filing modules",
  },
  {
    label: "Drafts",
    value: String(submissions.value.filter((item) => item.status === "draft").length).padStart(2, "0"),
    caption: "Editable submissions",
  },
  {
    label: "Submitted",
    value: String(submissions.value.filter((item) => item.status === "submitted").length).padStart(2, "0"),
    caption: "Awaiting BOCRA review",
  },
  {
    label: "Tracked expiries",
    value: String(
      (expiryTracker.value.license_expiries?.length || 0) +
        (expiryTracker.value.certificate_expiries?.length || 0),
    ).padStart(2, "0"),
    caption: "Licence and certificate exposure",
  },
]);

loadPageData();

function paginateItems(items = [], page = 1, pageSize = 5) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize) || 1);
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  return {
    page: currentPage,
    totalPages,
    items: items.slice(startIndex, startIndex + pageSize),
  };
}

function setPage(targetRef, nextPage, totalPages) {
  targetRef.value = Math.min(Math.max(nextPage, 1), Math.max(totalPages, 1));
}

function clearModuleValues() {
  Object.keys(moduleValues).forEach((key) => {
    delete moduleValues[key];
  });
}

function populateModuleValues(payload = {}) {
  clearModuleValues();
  (selectedModule.value?.payload_fields || []).forEach((field, index) => {
    const key = getFieldKey(field, index);
    moduleValues[key] = payload?.[key] ?? "";
  });
}

function normalizeValueByField(field, value) {
  if (value === undefined || value === null || value === "") {
    return value;
  }

  if (getFieldType(field) === "number") {
    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? value : numericValue;
  }

  return typeof value === "string" ? value.trim() : value;
}

function buildPayload() {
  return (selectedModule.value?.payload_fields || []).reduce((payload, field, index) => {
    const key = getFieldKey(field, index);
    const normalizedValue = normalizeValueByField(field, moduleValues[key]);
    if (normalizedValue !== undefined && normalizedValue !== null && normalizedValue !== "") {
      payload[key] = normalizedValue;
    }
    return payload;
  }, {});
}

function statusTone(status) {
  const normalized = String(status || "").toLowerCase();

  if (["accepted", "approved", "active", "verified"].includes(normalized)) {
    return "app-status-pill--success";
  }

  if (["rejected", "expired", "overdue", "suspended", "revoked"].includes(normalized)) {
    return "app-status-pill--danger";
  }

  return "app-status-pill--warning";
}

function isEditableComplianceStatus(status) {
  return ["draft", "rejected"].includes(String(status || "").toLowerCase());
}

function upsertById(collection = [], record) {
  const nextCollection = collection.filter((item) => item.id !== record.id);
  return [record, ...nextCollection].sort((left, right) => {
    const rightValue = new Date(right.updated_at || right.created_at || 0).getTime();
    const leftValue = new Date(left.updated_at || left.created_at || 0).getTime();
    return rightValue - leftValue;
  });
}

function moduleName(code) {
  return complianceModules.value.find((item) => item.code === code)?.name || humanizeToken(code);
}

function organizationName(organizationId) {
  return organizations.value.find((item) => item.id === organizationId)?.name || "Linked organization";
}

function pushError(error, fallbackMessage) {
  errorMessage.value = error?.message || fallbackMessage;
}

function resetEditor() {
  selectedSubmissionId.value = "";
  editorForm.organization_id = organizations.value[0]?.id || "";
  editorForm.reporting_period_start = "";
  editorForm.reporting_period_end = "";
  editorForm.certificate_name = "";
  editorForm.certificate_reference = "";
  editorForm.certificate_expiry_date = "";
  populateModuleValues({});
}

function selectModule(moduleCode) {
  selectedModuleCode.value = moduleCode;
  submissionPage.value = 1;
  resetEditor();
}

function openSubmission(submission) {
  selectedModuleCode.value = submission.submission_type;
  selectedSubmissionId.value = submission.id;
  editorForm.organization_id = submission.organization_id || "";
  editorForm.reporting_period_start = String(submission.reporting_period_start || "").slice(0, 10);
  editorForm.reporting_period_end = String(submission.reporting_period_end || "").slice(0, 10);
  editorForm.certificate_name = submission.certificate_name || "";
  editorForm.certificate_reference = submission.certificate_reference || "";
  editorForm.certificate_expiry_date = String(submission.certificate_expiry_date || "").slice(0, 10);
  populateModuleValues(submission.payload || {});
}

function buildDraftPayload() {
  return {
    organization_id: editorForm.organization_id,
    submission_type: selectedModuleCode.value,
    reporting_period_start: editorForm.reporting_period_start,
    reporting_period_end: editorForm.reporting_period_end,
    payload: buildPayload(),
    certificate_name: editorForm.certificate_name || undefined,
    certificate_reference: editorForm.certificate_reference || undefined,
    certificate_expiry_date: editorForm.certificate_expiry_date || undefined,
  };
}

async function loadPageData() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const [moduleData, submissionData, organizationData, expiryTrackerData] = await Promise.all([
      fetchComplianceModules(),
      fetchComplianceSubmissions(),
      fetchOrganizations(),
      fetchComplianceExpiryTracker(90),
    ]);

    complianceModules.value = moduleData;
    submissions.value = submissionData;
    organizations.value = organizationData;
    expiryTracker.value = expiryTrackerData;
    selectedModuleCode.value = moduleData[0]?.code || "";
    resetEditor();
  } catch (error) {
    pushError(error, "We couldn't load the compliance workspace.");
  } finally {
    loading.value = false;
  }
}

async function saveDraft() {
  saving.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    const payload = buildDraftPayload();
    let submission = null;

    if (selectedSubmissionId.value) {
      submission = await updateComplianceSubmission(selectedSubmissionId.value, {
        reporting_period_start: payload.reporting_period_start,
        reporting_period_end: payload.reporting_period_end,
        payload: payload.payload,
        certificate_name: payload.certificate_name,
        certificate_reference: payload.certificate_reference,
        certificate_expiry_date: payload.certificate_expiry_date,
      });
    } else {
      submission = await createComplianceSubmission(payload);
    }

    selectedSubmissionId.value = submission.id;
    submissions.value = upsertById(submissions.value, submission);
    openSubmission(submission);
    successMessage.value = "Compliance draft saved successfully.";
  } catch (error) {
    pushError(error, "We couldn't save the compliance draft.");
  } finally {
    saving.value = false;
  }
}

async function submitRecord() {
  saving.value = true;
  errorMessage.value = "";
  successMessage.value = "";

  try {
    let submissionId = selectedSubmissionId.value;
    if (!submissionId) {
      const draft = await createComplianceSubmission(buildDraftPayload());
      submissionId = draft.id;
      selectedSubmissionId.value = draft.id;
      submissions.value = upsertById(submissions.value, draft);
    }

    const submitted = await submitComplianceSubmission(submissionId, {
      payload: buildPayload(),
      certificate_name: editorForm.certificate_name || undefined,
      certificate_reference: editorForm.certificate_reference || undefined,
      certificate_expiry_date: editorForm.certificate_expiry_date || undefined,
    });

    submissions.value = upsertById(submissions.value, submitted);
    openSubmission(submitted);
    successMessage.value = "Compliance record submitted to BOCRA.";
  } catch (error) {
    pushError(error, "We couldn't submit the compliance record.");
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.compliance-page__success {
  margin: 0;
  padding: 0.95rem 1rem;
  border-radius: 1rem;
  background: rgba(15, 118, 110, 0.1);
  color: #0f766e;
  font-weight: 600;
}

.compliance-page__grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.compliance-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  align-items: center;
}

.compliance-page__expiry-stack {
  display: grid;
  gap: 0.9rem;
}

.compliance-page__mini-list {
  display: grid;
  gap: 0.55rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.compliance-page__mini-list li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.compliance-page__pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
}

@media (max-width: 1100px) {
  .compliance-page__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 780px) {
  .compliance-page__pagination,
  .compliance-page__actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
