<template>
  <div class="compliance-page">
    <div class="layout">
      <aside class="sidebar">
        <div class="brand">BOCRA Portal</div>

        <nav>
          <a href="#/clientDash">Home</a>
          <a href="#/licensing">Licensing</a>
          <a class="active" href="#/compliance">Compliance</a>
          <a class="disabled">Type Approval</a>
          <a class="disabled">QoS Monitoring</a>
          <a class="disabled">Complaints</a>
          <a class="disabled">Reports</a>
          <a class="disabled">Support</a>
          <a class="disabled">Settings</a>
          <a class="disabled">Profile</a>
        </nav>

        <div class="logout">
          <a href="#/login">Logout</a>
        </div>
      </aside>

      <main>
        <div class="topbar">
          <div>{{ currentDate }}</div>
          <div class="user">
            <img :src="user.avatar" :alt="user.name" />
            <span>{{ user.name }}</span>
          </div>
        </div>

        <div class="stats-grid">
          <div v-for="stat in stats" :key="stat.label" class="stat-card">
            <div class="stat-number">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>

        <div class="tabs-container">
          <div v-if="modulesLoading" class="loading">Loading compliance modules...</div>
          <div v-else-if="modulesError" class="loading error">{{ modulesError }}</div>

          <div v-if="complianceModules.length" class="tabs">
            <button
              v-for="module in complianceModules"
              :key="module.code"
              class="tab"
              :class="{ active: module.code === selectedModuleCode }"
              type="button"
              :title="module.description"
              @click="selectModule(module.code)"
            >
              {{ module.name }}
            </button>
          </div>
        </div>

        <div v-if="selectedModule" class="application-form">
          <h3>{{ selectedModule.name }} Submission</h3>
          <p>{{ selectedModule.description }}</p>

          <form @submit.prevent="submitComplianceForm">
            <div
              v-for="(field, index) in selectedModule.payload_fields || []"
              :key="getFieldKey(field, index)"
              class="form-field"
            >
              <label :for="getFieldKey(field, index)">
                {{ field.label || field.name || `Field ${index + 1}` }}
                <span v-if="field.required" class="required">*</span>
              </label>

              <textarea
                v-if="getFieldType(field) === 'textarea'"
                :id="getFieldKey(field, index)"
                v-model="moduleValues[getFieldKey(field, index)]"
                :placeholder="field.description || field.label || ''"
              ></textarea>

              <select
                v-else-if="getFieldType(field) === 'select'"
                :id="getFieldKey(field, index)"
                v-model="moduleValues[getFieldKey(field, index)]"
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

              <input
                v-else
                :id="getFieldKey(field, index)"
                v-model="moduleValues[getFieldKey(field, index)]"
                :type="getFieldType(field)"
                :placeholder="field.description || field.label || ''"
              />
            </div>

            <div class="form-actions">
              <button type="submit" class="submit-button">Submit Compliance Report</button>
            </div>
          </form>
        </div>

        <div class="table-container">
          <div class="table-header">
            <h3>Recent Submissions</h3>
          </div>
          <div class="table-scroll">
            <table v-if="submissions.length" class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Module</th>
                  <th>Licensee</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="submission in submissions" :key="submission.id">
                  <td>{{ submission.id }}</td>
                  <td>{{ submission.module }}</td>
                  <td>{{ submission.licensee }}</td>
                  <td>
                    <span class="status-badge" :class="statusClass(submission.status)">
                      {{ submission.status.toUpperCase() }}
                    </span>
                  </td>
                  <td>{{ submission.date }}</td>
                  <td>
                    <button
                      class="action-btn"
                      type="button"
                      @click="viewSubmission(submission.id)"
                    >
                      View
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="loading">No submissions found</div>
          </div>
        </div>

        <div class="table-container">
          <div class="table-header">
            <h3>Issued Licenses</h3>
          </div>
          <div class="table-scroll">
            <table v-if="issuedLicenses.length" class="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Licensee</th>
                  <th>Type</th>
                  <th>Expiry</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="license in issuedLicenses" :key="license.id">
                  <td>{{ license.id }}</td>
                  <td>{{ license.licensee }}</td>
                  <td>{{ license.type }}</td>
                  <td>{{ license.expiry }}</td>
                  <td>
                    <span class="status-badge" :class="statusClass(license.status)">
                      {{ license.status.toUpperCase() }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div v-else class="loading">No licenses found</div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";

const MODULES_ENDPOINT = "https://bocra-api.skidotools.co.bw/api/v1/compliance/modules";

const currentDate = ref("");
const modulesLoading = ref(true);
const modulesError = ref("");
const complianceModules = ref([]);
const selectedModuleCode = ref("");
const moduleValues = reactive({});
const submissions = ref([]);
const issuedLicenses = ref([]);

const user = {
  name: "Aupa Moleofe",
  avatar: "https://i.pravatar.cc/40",
};

const selectedModule = computed(
  () => complianceModules.value.find((module) => module.code === selectedModuleCode.value) || null,
);

const stats = computed(() => [
  {
    label: "Compliance Modules",
    value: complianceModules.value.length,
  },
  {
    label: "Pending Submissions",
    value: submissions.value.filter((submission) => submission.status === "pending").length,
  },
  {
    label: "Approved Submissions",
    value: submissions.value.filter((submission) => submission.status === "approved").length,
  },
  {
    label: "Active Licenses",
    value: issuedLicenses.value.filter((license) => license.status === "active").length,
  },
]);

function demoModules() {
  return [
    {
      code: "annual_return",
      name: "Annual Return",
      description: "Annual compliance return",
      payload_fields: [
        {
          key: "reporting_period",
          label: "Reporting Period",
          description: "Enter the financial year or reporting period",
          field_type: "text",
          required: true,
        },
      ],
    },
    {
      code: "regulatory_report",
      name: "Regulatory Report",
      description: "Regulatory filing",
      payload_fields: [
        {
          key: "summary",
          label: "Summary",
          description: "Provide a short summary",
          field_type: "textarea",
          required: true,
        },
      ],
    },
    {
      code: "spectrum_usage_report",
      name: "Spectrum Usage",
      description: "Spectrum report",
      payload_fields: [],
    },
    {
      code: "quality_of_service_report",
      name: "QoS Report",
      description: "Quality of service",
      payload_fields: [],
    },
  ];
}

function demoSubmissions() {
  return [
    {
      id: "sub001",
      module: "Annual Return",
      status: "pending",
      date: "2024-01-15",
      licensee: "ABC Corp",
    },
    {
      id: "sub002",
      module: "QoS Report",
      status: "approved",
      date: "2024-01-10",
      licensee: "XYZ Ltd",
    },
    {
      id: "sub003",
      module: "Spectrum Usage",
      status: "pending",
      date: "2024-01-12",
      licensee: "Telecom BW",
    },
  ];
}

function demoLicenses() {
  return [
    {
      id: "lic001",
      licensee: "ABC Corp",
      type: "Network Services",
      expiry: "2024-12-31",
      status: "active",
    },
    {
      id: "lic002",
      licensee: "XYZ Ltd",
      type: "Application Services",
      expiry: "2024-06-30",
      status: "expiring",
    },
    {
      id: "lic003",
      licensee: "Telecom BW",
      type: "Frequency Assignment",
      expiry: "2025-03-15",
      status: "active",
    },
  ];
}

function clearModuleValues() {
  Object.keys(moduleValues).forEach((key) => {
    delete moduleValues[key];
  });
}

function getFieldKey(field, index) {
  return (
    field.key ||
    field.name ||
    field.label?.toLowerCase().replace(/[^a-z0-9]+/g, "_") ||
    `field_${index}`
  );
}

function getFieldType(field) {
  const rawType = String(field.type || field.field_type || "text").toLowerCase();
  if (rawType === "textarea") {
    return "textarea";
  }

  if (rawType === "select" || Array.isArray(field.options) || Array.isArray(field.choices)) {
    return "select";
  }

  if (["date", "email", "number", "password", "tel", "url"].includes(rawType)) {
    return rawType;
  }

  return "text";
}

function getFieldOptions(field) {
  const source = field.options || field.choices || [];
  return source.map((option) => {
    if (typeof option === "string") {
      return { label: option, value: option };
    }

    return {
      label: option.label || option.name || option.value || "Option",
      value: option.value || option.code || option.id || option.label || option.name,
    };
  });
}

function initializeModuleValues(module) {
  clearModuleValues();
  (module?.payload_fields || []).forEach((field, index) => {
    moduleValues[getFieldKey(field, index)] = "";
  });
}

function selectModule(code) {
  selectedModuleCode.value = code;
  initializeModuleValues(selectedModule.value);
}

function statusClass(status) {
  if (status === "approved" || status === "active") {
    return "status-approved";
  }

  if (status === "expiring" || status === "expired") {
    return "status-expired";
  }

  return "status-pending";
}

function viewSubmission(id) {
  window.alert(`Opening submission ${id}.`);
}

function submitComplianceForm() {
  console.log("Compliance submission:", {
    module: selectedModule.value,
    values: { ...moduleValues },
  });
  window.alert("Compliance report submitted successfully!");
}

async function loadModules() {
  modulesLoading.value = true;
  modulesError.value = "";

  try {
    const response = await fetch(MODULES_ENDPOINT);
    const payload = await response.json();
    const modules = Array.isArray(payload) ? payload : payload.data || [];
    complianceModules.value = modules.length ? modules : demoModules();
  } catch (error) {
    console.error("Failed to load modules:", error);
    complianceModules.value = demoModules();
    modulesError.value = "Failed to load live modules. Showing demo data.";
  } finally {
    selectedModuleCode.value = complianceModules.value[0]?.code || "";
    initializeModuleValues(selectedModule.value);
    modulesLoading.value = false;
  }
}

onMounted(() => {
  currentDate.value = new Date().toDateString();
  submissions.value = demoSubmissions();
  issuedLicenses.value = demoLicenses();
  loadModules();
});
</script>

<style>
.compliance-page,
.compliance-page * {
  box-sizing: border-box;
  font-family: "Inter", sans-serif;
}

.compliance-page {
  background: #f8fafc;
  color: #1e293b;
  min-height: 100vh;
}

.compliance-page .layout {
  display: flex;
  min-height: 100vh;
}

.compliance-page .sidebar {
  width: 240px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.compliance-page .brand {
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 25px;
}

.compliance-page .sidebar nav a,
.compliance-page .logout a {
  display: block;
  padding: 10px;
  border-radius: 10px;
  color: #475569;
  text-decoration: none;
  margin-bottom: 5px;
}

.compliance-page .sidebar nav a:hover,
.compliance-page .logout a:hover {
  background: #f1f5f9;
}

.compliance-page .sidebar nav a.active {
  background: #e0ecff;
  color: #2563eb;
}

.compliance-page .sidebar nav a.disabled {
  color: #94a3b8;
  cursor: default;
}

.compliance-page .logout {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.compliance-page main {
  flex: 1;
  padding: 20px;
}

.compliance-page .topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 15px 20px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  margin-bottom: 20px;
}

.compliance-page .user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.compliance-page .user img {
  width: 40px;
  border-radius: 50%;
}

.compliance-page .stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.compliance-page .stat-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  padding: 24px;
  text-align: center;
}

.compliance-page .stat-number {
  font-size: 36px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.compliance-page .stat-label {
  color: #64748b;
  font-size: 14px;
  font-weight: 500;
}

.compliance-page .table-container {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin-bottom: 20px;
}

.compliance-page .table-header {
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.compliance-page .table-header h3 {
  margin: 0;
}

.compliance-page .table-scroll {
  overflow-x: auto;
}

.compliance-page .data-table {
  width: 100%;
  border-collapse: collapse;
}

.compliance-page .data-table th {
  background: #f8fafc;
  padding: 15px 20px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

.compliance-page .data-table td {
  padding: 15px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.compliance-page .data-table tr:hover {
  background: #f8fafc;
}

.compliance-page .status-badge {
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
}

.compliance-page .status-pending {
  background: #fef3c7;
  color: #92400e;
}

.compliance-page .status-approved {
  background: #d1fae5;
  color: #065f46;
}

.compliance-page .status-expired {
  background: #fee2e2;
  color: #991b1b;
}

.compliance-page .tabs-container {
  margin-bottom: 20px;
}

.compliance-page .tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.compliance-page .tab {
  padding: 10px 20px;
  border-radius: 10px;
  background: #e5e7eb;
  cursor: pointer;
  font-weight: 500;
  border: none;
}

.compliance-page .tab.active {
  background: #2563eb;
  color: #fff;
}

.compliance-page .application-form {
  background: #fff;
  padding: 20px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  margin-bottom: 20px;
}

.compliance-page .application-form p {
  color: #64748b;
}

.compliance-page .application-form input,
.compliance-page .application-form select,
.compliance-page .application-form textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
}

.compliance-page .form-field {
  margin-bottom: 16px;
}

.compliance-page .form-field label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-weight: 500;
}

.compliance-page .required {
  color: #ef4444;
}

.compliance-page .form-actions {
  text-align: center;
  margin-top: 30px;
}

.compliance-page .submit-button,
.compliance-page .action-btn {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
}

.compliance-page .loading {
  color: #64748b;
}

.compliance-page .loading.error {
  color: #b91c1c;
}

@media (max-width: 900px) {
  .compliance-page .layout {
    flex-direction: column;
  }

  .compliance-page .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
}

@media (max-width: 600px) {
  .compliance-page main {
    padding: 12px;
  }

  .compliance-page .topbar {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .compliance-page .data-table th,
  .compliance-page .data-table td {
    padding: 12px;
  }
}
</style>
