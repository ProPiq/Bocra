<template>
  <ClientWorkspaceLayout>
    <div class="app-page licensing-page">
      <section class="app-panel app-page-hero">
        <div>
          <p class="app-eyebrow">Licensing workspace</p>
          <h2>Manage your licences, applications, renewals, and modifications in one flow.</h2>
          <p>
            This page now uses live catalogue and application data. The stepper is generated from
            the API's dynamic form sections so each service lane stays aligned with BOCRA's latest
            workflow definition.
          </p>
        </div>

        <span class="app-status-pill app-status-pill--info">
          {{ applicationTypes.length }} active workflow{{ applicationTypes.length === 1 ? "" : "s" }}
        </span>
      </section>

      <p v-if="loading" class="app-note">Loading your licensing workspace...</p>
      <p v-else-if="errorMessage" class="app-note app-note--error">{{ errorMessage }}</p>

      <template v-else>
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
              <h3>Service lanes</h3>
              <p>Choose the service you want to start or continue.</p>
            </div>
          </div>

          <div class="app-tab-row">
            <button
              v-for="serviceCode in availableServiceCodes"
              :key="serviceCode"
              class="app-tab"
              :class="{ 'is-active': serviceCode === selectedServiceType }"
              type="button"
              @click="selectServiceType(serviceCode)"
            >
              {{ getServiceTypeMeta(serviceCode).label }}
            </button>
          </div>
        </section>

        <section class="licensing-page__overview">
          <article class="app-panel">
            <div class="app-section-head">
              <div>
                <h3>Your licences</h3>
                <p>
                  Verified licences are derived from your issued application history, then enriched
                  with the public licence verification endpoint for status and expiry details.
                </p>
              </div>
            </div>

            <div v-if="licenses.length" class="licensing-page__license-grid">
              <article
                v-for="license in licenses"
                :key="license.license_number"
                class="licensing-page__license-card"
              >
                <div class="licensing-page__license-head">
                  <div>
                    <strong>{{ license.license_number }}</strong>
                    <p>{{ license.license_type_name || humanizeToken(license.license_type_code) }}</p>
                  </div>
                  <span class="app-status-pill" :class="getLicenseStatusMeta(license.status).tone">
                    {{ getLicenseStatusMeta(license.status).label }}
                  </span>
                </div>

                <div class="licensing-page__license-meta">
                  <span>
                    Effective {{ license.effective_from ? formatDate(license.effective_from) : "Not available" }}
                  </span>
                  <span>
                    {{
                      license.expires_at
                        ? `${formatDate(license.expires_at)} • ${formatDaysUntilExpiry(
                            license.days_until_expiry,
                          )}`
                        : "Expiry details not available"
                    }}
                  </span>
                </div>

                <div class="licensing-page__license-actions">
                  <button
                    v-for="serviceCode in followOnActionCodes"
                    :key="`${license.license_number}-${serviceCode}`"
                    class="app-button app-button--secondary"
                    type="button"
                    :disabled="saving || submitting"
                    @click="startLicenseAction(license, serviceCode)"
                  >
                    {{ licenseActionLabel(license, serviceCode) }}
                  </button>
                </div>

                <div class="licensing-page__license-links">
                  <a
                    v-if="license.document_download_url"
                    :href="license.document_download_url"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View certificate
                  </a>
                  <a
                    v-if="license.verification_url"
                    :href="license.verification_url"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Verify licence
                  </a>
                </div>
              </article>
            </div>
            <p v-else class="app-note">
              No issued licences are available yet. Start with a new application below, and once it
              is issued it will appear here with renewal and modification options.
            </p>
          </article>

          <article class="app-panel">
            <div class="app-section-head">
              <div>
                <h3>Your applications</h3>
                <p>Open a draft, resubmit after feedback, or review the latest status.</p>
              </div>
            </div>

            <div class="app-table-wrap">
              <table v-if="applications.length" class="app-table">
                <thead>
                  <tr>
                    <th>Reference</th>
                    <th>Application</th>
                    <th>Service</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="application in applications" :key="application.id">
                    <td>{{ application.reference_number || "Draft" }}</td>
                    <td>{{ application.title }}</td>
                    <td>{{ applicationServiceLabel(application) }}</td>
                    <td>
                      <span
                        class="app-status-pill"
                        :class="getApplicationStatusMeta(application.status).tone"
                      >
                        {{ getApplicationStatusMeta(application.status).label }}
                      </span>
                    </td>
                    <td>{{ formatDateTime(application.updated_at || application.created_at) }}</td>
                    <td>
                      <button
                        class="app-button app-button--secondary licensing-page__table-action"
                        type="button"
                        @click="openExistingApplication(application)"
                      >
                        {{ isEditableApplicationStatus(application.status) ? "Continue" : "View" }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <p v-else class="app-note">No applications have been created yet.</p>
            </div>
          </article>
        </section>

        <section class="licensing-page__editor-grid">
          <article class="app-panel">
            <div class="app-section-head">
              <div>
                <h3>{{ editorTitle }}</h3>
                <p>{{ editorDescription }}</p>
              </div>

              <button
                v-if="currentApplication"
                class="app-button app-button--secondary"
                type="button"
                @click="closeEditor"
              >
                Close
              </button>
            </div>

            <p v-if="successMessage" class="licensing-page__success">{{ successMessage }}</p>

            <div v-if="currentApplication" class="licensing-page__application-banner">
              <div>
                <strong>{{ currentApplication.title }}</strong>
                <p>
                  {{
                    currentApplication.reference_number
                      ? `Reference ${currentApplication.reference_number}`
                      : "Draft application"
                  }}
                </p>
              </div>

              <span
                class="app-status-pill"
                :class="getApplicationStatusMeta(currentApplication.status).tone"
              >
                {{ getApplicationStatusMeta(currentApplication.status).label }}
              </span>
            </div>

            <div
              v-if="selectedServiceType === 'new_application' && !currentApplication"
              class="licensing-page__selection-grid"
            >
              <div class="app-form-field">
                <label for="organization-select">Organization</label>
                <select
                  id="organization-select"
                  v-model="selectedOrganizationId"
                  class="app-select"
                >
                  <option value="">Choose an organization</option>
                  <option
                    v-for="organizationId in organizationOptions"
                    :key="organizationId"
                    :value="organizationId"
                  >
                    {{ formatOrganizationOption(organizationId) }}
                  </option>
                </select>
              </div>

              <div class="app-form-field">
                <label for="application-type-select">Licence workflow</label>
                <select
                  id="application-type-select"
                  v-model="selectedApplicationTypeId"
                  class="app-select"
                >
                  <option value="">Choose a licence workflow</option>
                  <option
                    v-for="item in applicationOptionsForSelectedService"
                    :key="item.id"
                    :value="item.id"
                  >
                    {{ item.name }}
                  </option>
                </select>
              </div>
            </div>

            <p
              v-else-if="selectedServiceType !== 'new_application' && !currentApplication"
              class="app-note"
            >
              Select a licence above to start a {{ getServiceTypeMeta(selectedServiceType).label.toLowerCase() }}
              request. Existing drafts for this service will reopen automatically when available.
            </p>

            <template v-if="showDynamicForm">
              <section class="licensing-page__stepper">
                <div class="app-section-head">
                  <div>
                    <h3>Dynamic form steps</h3>
                    <p>These steps are generated directly from the form schema returned by the API.</p>
                  </div>
                </div>

                <div class="app-progress">
                  <button
                    v-for="(section, index) in sections"
                    :key="section.code || section.title || index"
                    class="app-progress-step licensing-page__progress-step"
                    :class="{
                      'is-active': index === currentStep,
                      'licensing-page__progress-step--complete': sectionCompletion(section).complete,
                    }"
                    type="button"
                    @click="goToStep(index)"
                  >
                    <span>{{ index + 1 }}</span>
                    <strong>{{ section.title }}</strong>
                    <p>
                      {{
                        section.description ||
                        `${sectionCompletion(section).requiredCount} required field${
                          sectionCompletion(section).requiredCount === 1 ? "" : "s"
                        }`
                      }}
                    </p>
                  </button>
                </div>
              </section>

              <section v-if="currentSection" class="licensing-page__form-section">
                <div class="licensing-page__section-header">
                  <h4>{{ currentSection.title }}</h4>
                  <p>{{ currentSection.description || "Complete the fields below to continue." }}</p>
                </div>

                <div class="app-form-grid">
                  <div
                    v-for="(field, index) in currentSection.fields || []"
                    :key="getFieldKey(field, index)"
                    class="app-form-field"
                  >
                    <label
                      v-if="getFieldType(field) !== 'checkbox'"
                      :for="getFieldKey(field, index)"
                    >
                      {{ field.label || field.name || `Field ${index + 1}` }}
                      <span v-if="isFieldRequired(field)">*</span>
                    </label>

                    <textarea
                      v-if="getFieldType(field) === 'textarea'"
                      :id="getFieldKey(field, index)"
                      v-model="formValues[getFieldKey(field, index)]"
                      class="app-textarea"
                      :disabled="!isEditorEditable"
                      :placeholder="field.description || field.label || ''"
                    ></textarea>

                    <select
                      v-else-if="getFieldType(field) === 'select'"
                      :id="getFieldKey(field, index)"
                      v-model="formValues[getFieldKey(field, index)]"
                      class="app-select"
                      :disabled="!isEditorEditable"
                    >
                      <option value="">
                        Select {{ field.label || field.name || "an option" }}
                      </option>
                      <option
                        v-for="option in getFieldOptions(field)"
                        :key="option.value"
                        :value="option.value"
                      >
                        {{ option.label }}
                      </option>
                    </select>

                    <label
                      v-else-if="getFieldType(field) === 'checkbox'"
                      class="licensing-page__checkbox"
                    >
                      <input
                        :id="getFieldKey(field, index)"
                        v-model="formValues[getFieldKey(field, index)]"
                        type="checkbox"
                        :disabled="!isEditorEditable"
                      />
                      <span>
                        {{ field.label || field.name || `Field ${index + 1}` }}
                        <em v-if="isFieldRequired(field)">*</em>
                      </span>
                    </label>

                    <input
                      v-else
                      :id="getFieldKey(field, index)"
                      v-model="formValues[getFieldKey(field, index)]"
                      class="app-input"
                      :disabled="!isEditorEditable"
                      :type="getFieldType(field)"
                      :placeholder="field.description || field.label || ''"
                    />

                    <p v-if="field.description" class="licensing-page__field-help">
                      {{ field.description }}
                    </p>
                    <p v-if="fieldErrors[getFieldKey(field, index)]" class="licensing-page__field-error">
                      {{ fieldErrors[getFieldKey(field, index)] }}
                    </p>
                  </div>
                </div>

                <div class="licensing-page__actions">
                  <div class="licensing-page__step-actions">
                    <button
                      v-if="sections.length > 1"
                      class="app-button app-button--secondary"
                      type="button"
                      :disabled="currentStep === 0"
                      @click="previousStep"
                    >
                      Previous
                    </button>
                    <button
                      v-if="sections.length > 1"
                      class="app-button app-button--secondary"
                      type="button"
                      :disabled="currentStep >= sections.length - 1"
                      @click="nextStep"
                    >
                      Next step
                    </button>
                  </div>

                  <div class="licensing-page__submit-actions">
                    <button
                      v-if="isEditorEditable"
                      class="app-button app-button--secondary"
                      type="button"
                      :disabled="saveDisabled"
                      @click="saveDraft"
                    >
                      {{ currentApplication ? "Save draft" : "Create draft" }}
                    </button>
                    <button
                      v-if="isEditorEditable"
                      class="app-button"
                      type="button"
                      :disabled="submitDisabled"
                      @click="submitCurrentApplication"
                    >
                      {{ submitLabel }}
                    </button>
                  </div>
                </div>

                <p v-if="!isEditorEditable" class="app-note">
                  This application is no longer editable in its current status. You can review the
                  submitted data and start a new action from your licences above when needed.
                </p>
              </section>
            </template>
          </article>

          <article class="app-panel">
            <div class="app-section-head">
              <div>
                <h3>Application guidance</h3>
                <p>Required fields, document expectations, and submission feedback appear here.</p>
              </div>
            </div>

            <div v-if="apiValidationIssues.length" class="licensing-page__feedback-block">
              <strong>Submission issues</strong>
              <ul class="licensing-page__feedback-list">
                <li v-for="issue in apiValidationIssues" :key="`${issue.code}-${issue.field}`">
                  {{ issue.message }}
                </li>
              </ul>
            </div>

            <p v-if="requirementsLoading" class="app-note">Loading application requirements...</p>
            <p v-else-if="requirementsError" class="app-note app-note--error">{{ requirementsError }}</p>

            <template v-else-if="requirements">
              <div class="licensing-page__summary-grid">
                <article class="app-panel-muted">
                  <strong>Required fields</strong>
                  <p>{{ requirements.required_fields.length }}</p>
                </article>
                <article class="app-panel-muted">
                  <strong>Required documents</strong>
                  <p>{{ requirements.documents.length }}</p>
                </article>
                <article class="app-panel-muted">
                  <strong>Missing documents</strong>
                  <p>{{ requirements.document_check?.missing_count || 0 }}</p>
                </article>
              </div>

              <div v-if="requirements.documents.length" class="licensing-page__requirements-list">
                <article
                  v-for="document in requirements.documents"
                  :key="document.code"
                  class="licensing-page__requirement-card"
                >
                  <div>
                    <strong>{{ document.name }}</strong>
                    <p>{{ document.description || document.code }}</p>
                  </div>
                  <span
                    class="app-status-pill"
                    :class="document.uploaded ? 'app-status-pill--success' : 'app-status-pill--warning'"
                  >
                    {{ document.uploaded ? "Uploaded" : "Pending" }}
                  </span>
                </article>
              </div>
            </template>

            <p v-else class="app-note">
              Open or create an application to see required fields and document expectations from the
              API.
            </p>
          </article>
        </section>
      </template>
    </div>
  </ClientWorkspaceLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import ClientWorkspaceLayout from "../components/auth/ClientWorkspaceLayout.vue";
import {
  createApplicationDraft,
  deriveApplication,
  fetchApplicationRequirements,
  renewApplication,
  submitApplication,
  updateApplicationDraft,
  resubmitApplication,
} from "../lib/platformApi";
import {
  buildApplicationTitle,
  buildOrganizationLabel,
  findExistingFollowOnApplication,
  findFirstIncompleteSectionIndex,
  formatDate,
  formatDateTime,
  formatDaysUntilExpiry,
  getApplicationStatusMeta,
  getDynamicSections,
  getFieldKey,
  getFieldOptions,
  getFieldType,
  getLicenseStatusMeta,
  getServiceTypeMeta,
  groupApplicationTypesByService,
  humanizeToken,
  isEditableApplicationStatus,
  loadClientWorkspace,
  upsertApplication,
  validateApplicationForm,
  getSectionCompletion,
} from "../lib/workspace";

const SERVICE_ORDER = [
  "new_application",
  "license_renewal",
  "license_modification",
  "license_transfer",
  "duplicate_license_request",
];
const followOnActionCodes = [
  "license_renewal",
  "license_modification",
  "license_transfer",
  "duplicate_license_request",
];

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const saving = ref(false);
const submitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");
const requirementsLoading = ref(false);
const requirementsError = ref("");
const workspace = ref({
  currentUser: null,
  applicationTypes: [],
  applicationTypeMap: new Map(),
  groupedApplicationTypes: {},
  applications: [],
  licenses: [],
});
const selectedServiceType = ref("new_application");
const selectedApplicationTypeId = ref("");
const selectedOrganizationId = ref("");
const currentApplication = ref(null);
const currentStep = ref(0);
const requirements = ref(null);
const apiValidationIssues = ref([]);
const formValues = reactive({});
const fieldErrors = reactive({});

const currentUser = computed(() => workspace.value.currentUser);
const applications = computed(() => workspace.value.applications || []);
const licenses = computed(() => workspace.value.licenses || []);
const applicationTypes = computed(() => workspace.value.applicationTypes || []);
const applicationTypeMap = computed(() => workspace.value.applicationTypeMap || new Map());
const groupedApplicationTypes = computed(
  () => workspace.value.groupedApplicationTypes || groupApplicationTypesByService([]),
);
const availableServiceCodes = computed(() => {
  const presentCodes = Object.keys(groupedApplicationTypes.value);
  return SERVICE_ORDER.filter((serviceCode) => presentCodes.includes(serviceCode));
});
const organizationOptions = computed(() => {
  const currentUserOrganizations = currentUser.value?.organization_ids || [];
  if (currentUserOrganizations.length) {
    return currentUserOrganizations;
  }

  return Array.from(
    new Set(applications.value.map((application) => application.organization_id).filter(Boolean)),
  );
});
const applicationOptionsForSelectedService = computed(
  () => groupedApplicationTypes.value[selectedServiceType.value] || [],
);
const previewApplicationType = computed(() =>
  selectedApplicationTypeId.value ? applicationTypeMap.value.get(selectedApplicationTypeId.value) : null,
);
const activeApplicationType = computed(() => {
  if (currentApplication.value) {
    return applicationTypeMap.value.get(currentApplication.value.application_type_id) || null;
  }

  return previewApplicationType.value;
});
const sections = computed(() => getDynamicSections(activeApplicationType.value));
const currentSection = computed(() => sections.value[currentStep.value] || null);
const isEditorEditable = computed(
  () => !currentApplication.value || isEditableApplicationStatus(currentApplication.value.status),
);
const showDynamicForm = computed(() => {
  if (!activeApplicationType.value || !sections.value.length) {
    return false;
  }

  return selectedServiceType.value === "new_application" || Boolean(currentApplication.value);
});
const editorTitle = computed(() => {
  if (currentApplication.value) {
    return "Continue application";
  }

  if (selectedServiceType.value === "new_application") {
    return "Start a new licence application";
  }

  return `${getServiceTypeMeta(selectedServiceType.value).label} an existing licence`;
});
const editorDescription = computed(() => {
  if (currentApplication.value) {
    return "The form and stepper below are loaded from the dynamic schema for this application type.";
  }

  if (selectedServiceType.value === "new_application") {
    return "Choose a workflow, complete the dynamic form, then save or submit the application.";
  }

  return "Pick a licence above to create a follow-on request. Existing drafts will reopen when available.";
});
const saveDisabled = computed(
  () =>
    saving.value ||
    submitting.value ||
    !showDynamicForm.value ||
    !activeApplicationType.value ||
    (selectedServiceType.value === "new_application" && !selectedOrganizationId.value),
);
const submitDisabled = computed(
  () =>
    saveDisabled.value ||
    !isEditorEditable.value ||
    !sections.value.length,
);
const submitLabel = computed(() => {
  if (!currentApplication.value) {
    return "Submit application";
  }

  return currentApplication.value.status === "draft" ? "Submit application" : "Resubmit application";
});
const stats = computed(() => [
  {
    label: "Issued Licences",
    value: licenses.value.length,
    caption: licenses.value.length ? "Derived from your issued applications" : "No licences yet",
  },
  {
    label: "Editable Applications",
    value: applications.value.filter((application) => isEditableApplicationStatus(application.status)).length,
    caption: "Drafts and resubmissions you can work on now",
  },
  {
    label: "Submitted Applications",
    value: applications.value.filter((application) =>
      ["submitted", "under_review", "awaiting_payment"].includes(application.status),
    ).length,
    caption: "Already with BOCRA for review or payment",
  },
  {
    label: "Expiring Soon",
    value: licenses.value.filter(
      (license) =>
        license.status === "active" &&
        typeof license.days_until_expiry === "number" &&
        license.days_until_expiry <= 90,
    ).length,
    caption: "Licences expiring within the next 90 days",
  },
]);

function clearMessages() {
  errorMessage.value = "";
  successMessage.value = "";
}

function clearReactiveObject(target) {
  Object.keys(target).forEach((key) => {
    delete target[key];
  });
}

function syncApplicationCollection(application) {
  workspace.value.applications = upsertApplication(workspace.value.applications, application);
}

function normalizeFieldValue(field, value) {
  if (getFieldType(field) === "checkbox") {
    return Boolean(value);
  }

  if (getFieldType(field) === "number") {
    return value === "" || value === null || value === undefined ? null : Number(value);
  }

  return value;
}

function buildFormPayload() {
  const payload = { ...(currentApplication.value?.form_data || {}) };

  sections.value.forEach((section) => {
    (section.fields || []).forEach((field, index) => {
      const key = getFieldKey(field, index);
      payload[key] = normalizeFieldValue(field, formValues[key]);
    });
  });

  return payload;
}

function setFieldErrors(nextErrors) {
  clearReactiveObject(fieldErrors);
  Object.assign(fieldErrors, nextErrors);
}

function setFormDefaults(applicationType, sourceValues = {}) {
  clearReactiveObject(formValues);
  setFieldErrors({});

  getDynamicSections(applicationType).forEach((section) => {
    (section.fields || []).forEach((field, index) => {
      const key = getFieldKey(field, index);
      if (sourceValues[key] !== undefined) {
        formValues[key] = sourceValues[key];
        return;
      }

      formValues[key] = getFieldType(field) === "checkbox" ? false : "";
    });
  });
}

function applyApplicationToEditor(application, { syncRoute = true } = {}) {
  const applicationType = applicationTypeMap.value.get(application.application_type_id);
  currentApplication.value = application;
  selectedServiceType.value = applicationType?.service_type_code || selectedServiceType.value;
  selectedApplicationTypeId.value = application.application_type_id;
  selectedOrganizationId.value = application.organization_id || selectedOrganizationId.value;
  setFormDefaults(applicationType, application.form_data || {});
  currentStep.value = findFirstIncompleteSectionIndex(applicationType, formValues);
  apiValidationIssues.value = [];
  loadRequirements(application.id);

  if (syncRoute) {
    router.replace({
      path: "/licensing",
      query: {
        applicationId: application.id,
      },
    });
  }
}

function closeEditor() {
  currentApplication.value = null;
  requirements.value = null;
  requirementsError.value = "";
  apiValidationIssues.value = [];
  currentStep.value = 0;
  clearMessages();

  if (selectedServiceType.value === "new_application") {
    const nextType = previewApplicationType.value || applicationOptionsForSelectedService.value[0] || null;
    selectedApplicationTypeId.value = nextType?.id || "";
    if (nextType) {
      setFormDefaults(nextType);
    } else {
      clearReactiveObject(formValues);
      setFieldErrors({});
    }
  } else {
    clearReactiveObject(formValues);
    setFieldErrors({});
  }

  router.replace({ path: "/licensing" });
}

function applicationServiceLabel(application) {
  const applicationType = applicationTypeMap.value.get(application.application_type_id);
  return getServiceTypeMeta(applicationType?.service_type_code).label;
}

function formatOrganizationOption(organizationId) {
  return `Linked organization ${organizationId.slice(0, 8).toUpperCase()}`;
}

function isFieldRequired(field) {
  const requiredFields = new Set(activeApplicationType.value?.validation_rules?.required_fields || []);
  return Boolean(field?.required) || requiredFields.has(getFieldKey(field));
}

function sectionCompletion(section) {
  return getSectionCompletion(section, formValues, activeApplicationType.value);
}

function goToStep(index) {
  currentStep.value = index;
}

function previousStep() {
  if (currentStep.value > 0) {
    currentStep.value -= 1;
  }
}

function nextStep() {
  if (currentStep.value >= sections.value.length - 1) {
    return;
  }

  const validationErrors = validateApplicationForm(activeApplicationType.value, formValues);
  setFieldErrors(validationErrors);

  const currentSectionKeys = (currentSection.value?.fields || []).map((field, index) =>
    getFieldKey(field, index),
  );
  const sectionHasErrors = currentSectionKeys.some((key) => Boolean(validationErrors[key]));

  if (!sectionHasErrors) {
    currentStep.value += 1;
  }
}

async function loadRequirements(applicationId) {
  requirementsLoading.value = true;
  requirementsError.value = "";

  try {
    requirements.value = await fetchApplicationRequirements(applicationId);
  } catch (error) {
    console.error("Failed to load requirements:", error);
    requirements.value = null;
    requirementsError.value = error?.message || "Unable to load the application requirements.";
  } finally {
    requirementsLoading.value = false;
  }
}

async function persistDraft({ silentSuccess = false } = {}) {
  const applicationType = activeApplicationType.value;
  if (!applicationType) {
    throw new Error("Choose a licence workflow first.");
  }

  const isExistingApplication = Boolean(currentApplication.value);

  if (selectedServiceType.value === "new_application" && !selectedOrganizationId.value) {
    throw new Error("Choose an organization before saving the draft.");
  }

  const payload = {
    title: currentApplication.value?.title || buildApplicationTitle(applicationType, buildOrganizationLabel(currentUser.value, applications.value)),
    organization_id: currentApplication.value?.organization_id || selectedOrganizationId.value,
    license_type_id: applicationType.license_type_id,
    service_type_id: applicationType.service_type_id,
    application_type_id: applicationType.id,
    form_data: buildFormPayload(),
  };

  const savedApplication = currentApplication.value
    ? await updateApplicationDraft(currentApplication.value.id, {
        title: payload.title,
        form_data: payload.form_data,
      })
    : await createApplicationDraft(payload);

  syncApplicationCollection(savedApplication);
  applyApplicationToEditor(savedApplication);

  if (!silentSuccess) {
    successMessage.value = isExistingApplication
      ? "Draft saved successfully."
      : "Draft created successfully.";
  }

  return savedApplication;
}

async function saveDraft() {
  clearMessages();
  saving.value = true;

  try {
    await persistDraft();
  } catch (error) {
    console.error("Failed to save draft:", error);
    errorMessage.value = error?.message || "Unable to save the draft right now.";
  } finally {
    saving.value = false;
  }
}

async function submitCurrentApplication() {
  clearMessages();
  const validationErrors = validateApplicationForm(activeApplicationType.value, formValues);
  setFieldErrors(validationErrors);

  if (Object.keys(validationErrors).length) {
    currentStep.value = findFirstIncompleteSectionIndex(activeApplicationType.value, formValues);
    errorMessage.value = "Please fix the highlighted fields before submitting.";
    return;
  }

  submitting.value = true;
  apiValidationIssues.value = [];

  try {
    const savedApplication = await persistDraft({ silentSuccess: true });
    const submittedApplication =
      savedApplication.status === "draft"
        ? await submitApplication(savedApplication.id, {})
        : await resubmitApplication(savedApplication.id, {
            form_data: buildFormPayload(),
          });

    syncApplicationCollection(submittedApplication);
    applyApplicationToEditor(submittedApplication);
    successMessage.value =
      savedApplication.status === "draft"
        ? "Application submitted successfully."
        : "Application resubmitted successfully.";
  } catch (error) {
    console.error("Failed to submit application:", error);
    const detail = error?.detail;
    if (detail && Array.isArray(detail.issues)) {
      apiValidationIssues.value = detail.issues;
    }
    errorMessage.value = error?.message || "Unable to submit the application right now.";
  } finally {
    submitting.value = false;
  }
}

async function openExistingApplication(application) {
  clearMessages();
  syncApplicationCollection(application);
  applyApplicationToEditor(application);
}

function followOnDraftFor(license, serviceCode) {
  return findExistingFollowOnApplication(
    applications.value,
    license.license_number,
    serviceCode,
    applicationTypeMap.value,
  );
}

function licenseActionLabel(license, serviceCode) {
  const existingDraft = followOnDraftFor(license, serviceCode);
  if (existingDraft) {
    return `Continue ${getServiceTypeMeta(serviceCode).label.toLowerCase()}`;
  }

  return getServiceTypeMeta(serviceCode).label;
}

async function startLicenseAction(license, serviceCode) {
  clearMessages();
  const existingDraft = followOnDraftFor(license, serviceCode);

  if (existingDraft) {
    await openExistingApplication(existingDraft);
    successMessage.value = `Opened the existing ${getServiceTypeMeta(serviceCode).label.toLowerCase()} draft.`;
    return;
  }

  saving.value = true;

  try {
    const followOnTitle = `${license.license_type_name || humanizeToken(license.license_type_code)} ${getServiceTypeMeta(serviceCode).label} - ${license.license_number}`;
    const createdApplication =
      serviceCode === "license_renewal"
        ? await renewApplication(license.source_application_id, {
            title: followOnTitle,
          })
        : await deriveApplication(license.source_application_id, {
            service_type_code: serviceCode,
            title: followOnTitle,
            form_data_overrides: {},
          });

    syncApplicationCollection(createdApplication);
    applyApplicationToEditor(createdApplication);
    successMessage.value = `${getServiceTypeMeta(serviceCode).label} draft created for ${license.license_number}.`;
  } catch (error) {
    console.error("Failed to create follow-on application:", error);
    errorMessage.value = error?.message || "Unable to start that licence action right now.";
  } finally {
    saving.value = false;
  }
}

function selectServiceType(serviceCode) {
  selectedServiceType.value = serviceCode;
  clearMessages();

  if (currentApplication.value) {
    closeEditor();
  } else if (serviceCode === "new_application") {
    selectedApplicationTypeId.value = applicationOptionsForSelectedService.value[0]?.id || "";
  } else {
    selectedApplicationTypeId.value = "";
    clearReactiveObject(formValues);
    setFieldErrors({});
  }
}

function applyRouteContext() {
  const applicationId = typeof route.query.applicationId === "string" ? route.query.applicationId : "";
  if (applicationId) {
    const matchingApplication = applications.value.find((application) => application.id === applicationId);
    if (matchingApplication) {
      applyApplicationToEditor(matchingApplication, { syncRoute: false });
      return;
    }
  }

  const requestedServiceType =
    typeof route.query.serviceType === "string" ? route.query.serviceType : "";
  if (requestedServiceType && availableServiceCodes.value.includes(requestedServiceType)) {
    selectedServiceType.value = requestedServiceType;
  }
}

async function loadWorkspace() {
  loading.value = true;
  errorMessage.value = "";

  try {
    workspace.value = await loadClientWorkspace();
    selectedServiceType.value =
      availableServiceCodes.value.find((serviceCode) => serviceCode === "new_application") ||
      availableServiceCodes.value[0] ||
      "new_application";
    selectedApplicationTypeId.value = applicationOptionsForSelectedService.value[0]?.id || "";
    selectedOrganizationId.value = organizationOptions.value[0] || "";
    if (previewApplicationType.value) {
      setFormDefaults(previewApplicationType.value);
    }
    applyRouteContext();
  } catch (error) {
    console.error("Failed to load licensing workspace:", error);
    errorMessage.value = error?.message || "Failed to load the licensing workspace.";
  } finally {
    loading.value = false;
  }
}

watch(
  () => route.fullPath,
  () => {
    if (!loading.value) {
      applyRouteContext();
    }
  },
);

watch(
  applicationOptionsForSelectedService,
  (nextOptions) => {
    if (currentApplication.value || selectedServiceType.value !== "new_application") {
      return;
    }

    if (!nextOptions.length) {
      selectedApplicationTypeId.value = "";
      clearReactiveObject(formValues);
      return;
    }

    const selectionStillValid = nextOptions.some((item) => item.id === selectedApplicationTypeId.value);
    if (!selectionStillValid) {
      selectedApplicationTypeId.value = nextOptions[0].id;
    }
  },
);

watch(previewApplicationType, (nextType) => {
  if (currentApplication.value || !nextType) {
    return;
  }

  setFormDefaults(nextType);
  currentStep.value = 0;
  apiValidationIssues.value = [];
}, { immediate: true });

watch(organizationOptions, (nextOrganizations) => {
  if (!selectedOrganizationId.value && nextOrganizations.length) {
    selectedOrganizationId.value = nextOrganizations[0];
  }
});

onMounted(() => {
  loadWorkspace();
});
</script>

<style scoped>
.licensing-page__overview,
.licensing-page__editor-grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
}

.licensing-page__license-grid {
  display: grid;
  gap: 0.9rem;
}

.licensing-page__license-card,
.licensing-page__requirement-card {
  display: grid;
  gap: 0.85rem;
  padding: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 1.3rem;
  background: rgba(255, 255, 255, 0.76);
}

.licensing-page__license-head {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
}

.licensing-page__license-head p,
.licensing-page__license-meta span,
.licensing-page__section-header p,
.licensing-page__field-help,
.licensing-page__requirement-card p,
.licensing-page__application-banner p {
  margin: 0;
  color: var(--auth-muted);
  line-height: 1.55;
}

.licensing-page__license-meta {
  display: grid;
  gap: 0.25rem;
}

.licensing-page__license-actions,
.licensing-page__license-links,
.licensing-page__selection-grid,
.licensing-page__summary-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.licensing-page__license-links a {
  color: var(--auth-primary);
  font-weight: 700;
  text-decoration: none;
}

.licensing-page__table-action {
  min-height: 2.35rem;
  padding: 0.55rem 0.9rem;
  font-size: 0.82rem;
}

.licensing-page__application-banner {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 1.3rem;
  background: rgba(248, 250, 252, 0.8);
}

.licensing-page__stepper {
  margin-bottom: 1.25rem;
}

.licensing-page__progress-step {
  text-align: left;
  cursor: pointer;
}

.licensing-page__progress-step--complete {
  border-color: rgba(4, 120, 87, 0.22);
  background: rgba(4, 120, 87, 0.08);
}

.licensing-page__progress-step--complete span {
  background: var(--auth-success);
  color: #ffffff;
}

.licensing-page__section-header {
  margin-bottom: 1rem;
}

.licensing-page__section-header h4 {
  margin-bottom: 0.35rem;
  font-size: 1.05rem;
}

.licensing-page__checkbox {
  display: flex;
  gap: 0.65rem;
  align-items: flex-start;
}

.licensing-page__checkbox input {
  margin-top: 0.2rem;
}

.licensing-page__checkbox span {
  color: var(--auth-text);
  font-weight: 700;
}

.licensing-page__checkbox em {
  color: var(--auth-danger);
  font-style: normal;
}

.licensing-page__field-help,
.licensing-page__field-error {
  font-size: 0.84rem;
}

.licensing-page__field-error,
.licensing-page__success {
  margin: 0.5rem 0 0;
  color: var(--auth-danger);
  font-weight: 600;
}

.licensing-page__success {
  margin: 0 0 1rem;
  color: var(--auth-success);
}

.licensing-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.25rem;
}

.licensing-page__step-actions,
.licensing-page__submit-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.licensing-page__feedback-block {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 1px solid rgba(185, 28, 28, 0.16);
  border-radius: 1.2rem;
  background: rgba(254, 242, 242, 0.9);
}

.licensing-page__feedback-list {
  margin: 0.75rem 0 0;
  padding-left: 1rem;
}

.licensing-page__summary-grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  margin-bottom: 1rem;
}

.licensing-page__summary-grid p {
  margin: 0.45rem 0 0;
  font-size: 1.3rem;
  font-weight: 800;
}

.licensing-page__requirements-list {
  display: grid;
  gap: 0.85rem;
}

.licensing-page__requirement-card {
  grid-template-columns: 1fr auto;
  align-items: start;
}

@media (max-width: 1080px) {
  .licensing-page__overview,
  .licensing-page__editor-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .licensing-page__application-banner,
  .licensing-page__actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
