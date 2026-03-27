<template>
  <div class="licensing-page">
    <div class="layout">
      <aside class="sidebar">
        <div class="brand">BOCRA Portal</div>

        <nav>
          <a href="#/clientDash">Home</a>
          <a class="active" href="#/licensing">Licensing</a>
          <a href="#/compliance">Compliance</a>
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

        <div v-if="tabNames.length" class="tabs">
          <button
            v-for="tab in tabNames"
            :key="tab"
            class="tab"
            :class="{ active: tab === currentTab }"
            type="button"
            @click="switchTab(tab)"
          >
            {{ tab }}
          </button>
        </div>

        <div v-if="selectedItem" class="progress-bar">
          <div
            v-for="(section, index) in sections"
            :key="section.title || index"
            class="progress-step"
            :class="{ active: index <= currentStep }"
          >
            <div class="step-circle">{{ index + 1 }}</div>
            <div class="step-label">{{ section.title }}</div>
          </div>
        </div>

        <div class="application-form">
          <p v-if="loading" class="notice">Loading license types...</p>
          <p v-else-if="errorMessage" class="notice error">{{ errorMessage }}</p>

          <template v-if="!loading && !selectedItem">
            <h3>Select License Type</h3>
            <select v-model="selectedLicenseIndex" @change="handleLicenseSelection">
              <option value="">Select license</option>
              <option
                v-for="(item, index) in currentLicenses"
                :key="item.id || item.name || index"
                :value="String(index)"
              >
                {{ item.name }}
              </option>
            </select>
          </template>

          <template v-else-if="currentSection">
            <h3>{{ currentSection.title }}</h3>

            <div
              v-for="(field, index) in currentSection.fields || []"
              :key="getFieldKey(field, index)"
              class="field-row"
            >
              <label :for="getFieldKey(field, index)">
                {{ field.label || field.name || `Field ${index + 1}` }}
              </label>

              <textarea
                v-if="getFieldType(field) === 'textarea'"
                :id="getFieldKey(field, index)"
                v-model="formValues[getFieldKey(field, index)]"
                :placeholder="field.label || field.description || ''"
              ></textarea>

              <select
                v-else-if="getFieldType(field) === 'select'"
                :id="getFieldKey(field, index)"
                v-model="formValues[getFieldKey(field, index)]"
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
                v-model="formValues[getFieldKey(field, index)]"
                :type="getFieldType(field)"
                :placeholder="field.label || field.description || ''"
              />
            </div>

            <div class="button-row">
              <button v-if="currentStep > 0" type="button" class="secondary" @click="prevStep">
                Previous
              </button>
              <button type="button" @click="nextStep">
                {{ currentStep === sections.length - 1 ? "Submit" : "Next" }}
              </button>
            </div>
          </template>

          <template v-else-if="!loading && selectedItem">
            <h3>No form schema available</h3>
            <p class="notice">The selected license type does not have a usable form.</p>
          </template>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";

const API_URL =
  "https://bocra-api.skidotools.co.bw/api/v1/licenses/application-types?active_only=true";

const tabMap = {
  new_application: "Apply",
  license_renewal: "Renewal",
  license_modification: "Modification",
  license_transfer: "Transfer",
  duplicate_license_request: "Duplicate",
};

const currentDate = ref("");
const loading = ref(true);
const errorMessage = ref("");
const dataByTab = ref({});
const currentTab = ref("");
const currentStep = ref(0);
const selectedItem = ref(null);
const selectedLicenseIndex = ref("");
const formValues = reactive({});

const user = {
  name: "Aupa Moleofe",
  avatar: "https://i.pravatar.cc/40",
};

const tabNames = computed(() => Object.keys(dataByTab.value));
const currentLicenses = computed(() => dataByTab.value[currentTab.value] || []);
const sections = computed(
  () => selectedItem.value?.dynamic_form_schema?.sections || [],
);
const currentSection = computed(() => sections.value[currentStep.value] || null);

function clearFormValues() {
  Object.keys(formValues).forEach((key) => {
    delete formValues[key];
  });
}

function getFieldKey(field, index) {
  const base =
    field.key ||
    field.name ||
    field.label?.toLowerCase().replace(/[^a-z0-9]+/g, "_") ||
    `field_${index}`;

  return `${currentStep.value}_${base}`;
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

function initializeFields() {
  (currentSection.value?.fields || []).forEach((field, index) => {
    const key = getFieldKey(field, index);
    if (formValues[key] === undefined) {
      formValues[key] = "";
    }
  });
}

function resetSelection() {
  selectedItem.value = null;
  selectedLicenseIndex.value = "";
  currentStep.value = 0;
  clearFormValues();
}

function switchTab(tab) {
  currentTab.value = tab;
  resetSelection();
}

function handleLicenseSelection() {
  if (selectedLicenseIndex.value === "") {
    resetSelection();
    return;
  }

  selectedItem.value = currentLicenses.value[Number(selectedLicenseIndex.value)] || null;
  currentStep.value = 0;
  clearFormValues();
  initializeFields();
}

function prevStep() {
  if (currentStep.value === 0) {
    return;
  }

  currentStep.value -= 1;
  initializeFields();
}

function nextStep() {
  if (!selectedItem.value) {
    return;
  }

  if (currentStep.value < sections.value.length - 1) {
    currentStep.value += 1;
    initializeFields();
    return;
  }

  console.log("License application submitted:", {
    license: selectedItem.value,
    values: { ...formValues },
  });
  window.alert("Application submitted!");
  resetSelection();
}

async function loadApplicationTypes() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const response = await fetch(API_URL);
    const payload = await response.json();
    const list = Array.isArray(payload) ? payload : payload.data || [];
    const grouped = {};

    list.forEach((item) => {
      if (!item.dynamic_form_schema?.sections) {
        return;
      }

      const tabName = tabMap[item.service_type_code];
      if (!tabName) {
        return;
      }

      if (!grouped[tabName]) {
        grouped[tabName] = [];
      }

      grouped[tabName].push(item);
    });

    dataByTab.value = grouped;
    currentTab.value = Object.keys(grouped)[0] || "";

    if (!currentTab.value) {
      errorMessage.value = "No application types are available right now.";
    }
  } catch (error) {
    console.error("Failed to load application types:", error);
    errorMessage.value = "Failed to load application types right now.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  currentDate.value = new Date().toDateString();
  loadApplicationTypes();
});
</script>

<style>
.licensing-page,
.licensing-page * {
  box-sizing: border-box;
  font-family: "Inter", sans-serif;
}

.licensing-page {
  background: #f8fafc;
  color: #1e293b;
  min-height: 100vh;
}

.licensing-page .layout {
  display: flex;
  min-height: 100vh;
}

.licensing-page .sidebar {
  width: 240px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.licensing-page .brand {
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 25px;
}

.licensing-page .sidebar nav a,
.licensing-page .logout a {
  display: block;
  padding: 10px;
  border-radius: 10px;
  color: #475569;
  text-decoration: none;
  margin-bottom: 5px;
}

.licensing-page .sidebar nav a:hover,
.licensing-page .logout a:hover {
  background: #f1f5f9;
}

.licensing-page .sidebar nav a.active {
  background: #e0ecff;
  color: #2563eb;
}

.licensing-page .sidebar nav a.disabled {
  color: #94a3b8;
  cursor: default;
}

.licensing-page .logout {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.licensing-page main {
  flex: 1;
  padding: 20px;
}

.licensing-page .topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 15px 20px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  margin-bottom: 20px;
}

.licensing-page .user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.licensing-page .user img {
  width: 40px;
  border-radius: 50%;
}

.licensing-page .tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.licensing-page .tab {
  padding: 10px 20px;
  border-radius: 10px;
  background: #e5e7eb;
  cursor: pointer;
  font-weight: 500;
  border: none;
}

.licensing-page .tab.active {
  background: #2563eb;
  color: #fff;
}

.licensing-page .progress-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 30px;
  overflow-x: auto;
}

.licensing-page .progress-step {
  flex: 1;
  min-width: 140px;
  text-align: center;
  position: relative;
}

.licensing-page .progress-step:not(:last-child)::after {
  content: "";
  position: absolute;
  top: 12px;
  left: 50%;
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  z-index: -1;
}

.licensing-page .progress-step.active:not(:last-child)::after {
  background: #22c55e;
}

.licensing-page .step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e5e7eb;
  color: white;
  line-height: 28px;
  margin: 0 auto 5px;
  font-size: 13px;
}

.licensing-page .progress-step.active .step-circle {
  background: #22c55e;
}

.licensing-page .step-label {
  font-size: 13px;
  color: #64748b;
}

.licensing-page .progress-step.active .step-label {
  color: #22c55e;
  font-weight: 600;
}

.licensing-page .application-form {
  background: #fff;
  padding: 20px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
}

.licensing-page .application-form input,
.licensing-page .application-form select,
.licensing-page .application-form textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 8px;
  border: 1px solid #cbd5e1;
}

.licensing-page .field-row label {
  display: block;
  margin-bottom: 8px;
  color: #475569;
  font-size: 14px;
}

.licensing-page .button-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.licensing-page .application-form button {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 10px;
  cursor: pointer;
}

.licensing-page .application-form button.secondary {
  background: #64748b;
}

.licensing-page .notice {
  color: #475569;
  margin: 0 0 16px;
}

.licensing-page .notice.error {
  color: #b91c1c;
}

@media (max-width: 900px) {
  .licensing-page .layout {
    flex-direction: column;
  }

  .licensing-page .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid #e5e7eb;
  }
}

@media (max-width: 600px) {
  .licensing-page main {
    padding: 12px;
  }

  .licensing-page .topbar {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  .licensing-page .button-row {
    flex-direction: column;
  }

  .licensing-page .application-form button {
    width: 100%;
  }
}
</style>
