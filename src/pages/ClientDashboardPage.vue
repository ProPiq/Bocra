<template>
  <ClientWorkspaceLayout>
    <div class="app-page dashboard-page">
      <section class="app-panel app-page-hero">
        <div>
          <p class="app-eyebrow">Workspace overview</p>
          <h2>
            {{ currentUser?.full_name || "Your BOCRA portal account" }},
            keep licensing work moving from one place.
          </h2>
          <p>
            The dashboard now uses live application and licence data so applicants can see what is
            active, what needs attention, and what to open next.
          </p>
        </div>

        <div class="dashboard-page__hero-side">
          <span class="app-status-pill app-status-pill--info">Updated {{ lastUpdated }}</span>
          <button class="app-button" type="button" @click="openLicensingWorkspace">
            Open licensing workspace
          </button>
        </div>
      </section>

      <p v-if="loading" class="app-note">Loading your dashboard...</p>
      <p v-else-if="errorMessage" class="app-note app-note--error">{{ errorMessage }}</p>

      <template v-else>
        <section class="app-meta-grid">
          <article v-for="stat in stats" :key="stat.label" class="app-stat-card">
            <p>{{ stat.label }}</p>
            <strong>{{ stat.value }}</strong>
            <span>{{ stat.caption }}</span>
          </article>
        </section>

        <section class="dashboard-page__highlights">
          <article class="app-panel">
            <div class="app-section-head">
              <div>
                <h3>Application mix</h3>
                <p>Current activity across your licence applications and service requests.</p>
              </div>
            </div>

            <p v-if="!applications.length" class="app-note">No applications found yet.</p>
            <div v-else class="dashboard-page__chart">
              <canvas ref="statusChartRef"></canvas>
            </div>
          </article>

          <article class="app-panel">
            <div class="app-section-head">
              <div>
                <h3>Licence portfolio</h3>
                <p>Distribution of verified licences currently linked to your application history.</p>
              </div>
            </div>

            <p v-if="!licenseChartLabels.length" class="app-note">No issued licences found yet.</p>
            <div v-else class="dashboard-page__chart dashboard-page__chart--compact">
              <canvas ref="licenseChartRef"></canvas>
            </div>
          </article>
        </section>

        <section class="dashboard-page__highlights">
          <article class="app-panel">
            <div class="app-section-head">
              <div>
                <h3>Priority actions</h3>
                <p>Items that are ready for you to review, submit, or renew.</p>
              </div>
            </div>

            <div v-if="priorityActions.length" class="dashboard-page__action-list">
              <article
                v-for="action in priorityActions"
                :key="action.title"
                class="dashboard-page__action-card"
              >
                <strong>{{ action.title }}</strong>
                <p>{{ action.description }}</p>
                <button class="app-button app-button--secondary" type="button" @click="action.run">
                  {{ action.cta }}
                </button>
              </article>
            </div>
            <p v-else class="app-note">
              Nothing urgent is waiting right now. Your current portfolio is in a healthy state.
            </p>
          </article>

          <article class="app-panel">
            <div class="app-section-head">
              <div>
                <h3>Recent licences</h3>
                <p>Quick access to active licences, expiry dates, and certificate downloads.</p>
              </div>
            </div>

            <div v-if="recentLicenses.length" class="dashboard-page__license-list">
              <article
                v-for="license in recentLicenses"
                :key="license.license_number"
                class="dashboard-page__license-card"
              >
                <div>
                  <strong>{{ license.license_number }}</strong>
                  <p>{{ license.license_type_name || humanizeToken(license.license_type_code) }}</p>
                </div>
                <span class="app-status-pill" :class="getLicenseStatusMeta(license.status).tone">
                  {{ getLicenseStatusMeta(license.status).label }}
                </span>
                <small>
                  {{
                    license.expires_at
                      ? `${formatDate(license.expires_at)} • ${formatDaysUntilExpiry(
                          license.days_until_expiry,
                        )}`
                      : "Expiry details not yet available"
                  }}
                </small>
                <div class="dashboard-page__card-actions">
                  <a
                    v-if="license.document_download_url"
                    class="app-button app-button--secondary"
                    :href="license.document_download_url"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View certificate
                  </a>
                  <button class="app-button app-button--secondary" type="button" @click="openLicensingWorkspace">
                    Manage
                  </button>
                </div>
              </article>
            </div>
            <p v-else class="app-note">No issued licences are available for this account yet.</p>
          </article>
        </section>

        <section class="app-panel">
          <div class="app-section-head">
            <div>
              <h3>Recent applications</h3>
              <p>Open any application to continue the draft or review the latest status.</p>
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
                <tr v-for="application in recentApplications" :key="application.id">
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
                      class="app-button app-button--secondary dashboard-page__table-action"
                      type="button"
                      @click="openApplication(application)"
                    >
                      {{ isEditableApplicationStatus(application.status) ? "Continue" : "View" }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
            <p v-else class="app-note">
              You have not started any licence applications yet. Open the licensing workspace to
              begin.
            </p>
          </div>
        </section>
      </template>
    </div>
  </ClientWorkspaceLayout>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import Chart from "chart.js/auto";
import ClientWorkspaceLayout from "../components/auth/ClientWorkspaceLayout.vue";
import {
  formatDate,
  formatDateTime,
  formatDaysUntilExpiry,
  getApplicationStatusMeta,
  getLicenseStatusMeta,
  getServiceTypeMeta,
  humanizeToken,
  isEditableApplicationStatus,
  loadClientWorkspace,
} from "../lib/workspace";

const router = useRouter();

const loading = ref(true);
const errorMessage = ref("");
const lastUpdated = ref("");
const workspace = ref({
  currentUser: null,
  applications: [],
  applicationTypeMap: new Map(),
  licenses: [],
});
const statusChartRef = ref(null);
const licenseChartRef = ref(null);

let statusChart = null;
let licenseChart = null;

const currentUser = computed(() => workspace.value.currentUser);
const applications = computed(() => workspace.value.applications || []);
const licenses = computed(() => workspace.value.licenses || []);
const recentApplications = computed(() => applications.value.slice(0, 8));
const recentLicenses = computed(() => licenses.value.slice(0, 4));
const licenseChartLabels = computed(() => {
  const grouped = new Map();

  licenses.value.forEach((license) => {
    const key = license.license_type_name || humanizeToken(license.license_type_code);
    grouped.set(key, (grouped.get(key) || 0) + 1);
  });

  return Array.from(grouped.keys());
});
const stats = computed(() => {
  const activeLicenseCount = licenses.value.filter((license) => license.status === "active").length;
  const openApplications = applications.value.filter((application) =>
    ["draft", "submitted", "under_review", "awaiting_information", "awaiting_payment"].includes(
      application.status,
    ),
  ).length;
  const awaitingYourActionCount = applications.value.filter((application) =>
    ["draft", "awaiting_information", "rejected"].includes(application.status),
  ).length;
  const expiringSoonCount = licenses.value.filter(
    (license) =>
      license.status === "active" &&
      typeof license.days_until_expiry === "number" &&
      license.days_until_expiry <= 90,
  ).length;

  return [
    {
      label: "Active Licences",
      value: activeLicenseCount,
      caption: activeLicenseCount ? "Verified from issued applications" : "No active licences yet",
    },
    {
      label: "Open Applications",
      value: openApplications,
      caption: openApplications ? "Still moving through the portal" : "Nothing is in progress",
    },
    {
      label: "Awaiting Your Action",
      value: awaitingYourActionCount,
      caption: awaitingYourActionCount ? "Drafts or resubmissions need attention" : "No applicant actions due",
    },
    {
      label: "Renewals Due Soon",
      value: expiringSoonCount,
      caption: expiringSoonCount ? "Expiring within the next 90 days" : "Nothing close to expiry",
    },
  ];
});
const priorityActions = computed(() => {
  const editableDraft = applications.value.find((application) => application.status === "draft");
  const resubmission = applications.value.find((application) =>
    ["awaiting_information", "rejected"].includes(application.status),
  );
  const expiringLicense = licenses.value.find(
    (license) =>
      license.status === "active" &&
      typeof license.days_until_expiry === "number" &&
      license.days_until_expiry <= 90,
  );

  return [
    editableDraft
      ? {
          title: "Finish a saved draft",
          description: `${editableDraft.title} is still in draft and ready for completion.`,
          cta: "Open draft",
          run: () => openApplication(editableDraft),
        }
      : null,
    resubmission
      ? {
          title: "Respond to BOCRA feedback",
          description: `${resubmission.title} can be updated and resubmitted from the licensing workspace.`,
          cta: "Review application",
          run: () => openApplication(resubmission),
        }
      : null,
    expiringLicense
      ? {
          title: "Prepare a renewal",
          description: `${expiringLicense.license_number} expires on ${formatDate(expiringLicense.expires_at)}.`,
          cta: "Manage licences",
          run: () => openLicensingWorkspace(),
        }
      : null,
  ].filter(Boolean);
});

function applicationServiceLabel(application) {
  const applicationType = workspace.value.applicationTypeMap.get(application.application_type_id);
  return getServiceTypeMeta(applicationType?.service_type_code).label;
}

function destroyCharts() {
  statusChart?.destroy();
  statusChart = null;
  licenseChart?.destroy();
  licenseChart = null;
}

function renderCharts() {
  destroyCharts();

  if (statusChartRef.value && applications.value.length) {
    const groupedStatuses = new Map();
    applications.value.forEach((application) => {
      const statusLabel = getApplicationStatusMeta(application.status).label;
      groupedStatuses.set(statusLabel, (groupedStatuses.get(statusLabel) || 0) + 1);
    });

    statusChart = new Chart(statusChartRef.value, {
      type: "bar",
      data: {
        labels: Array.from(groupedStatuses.keys()),
        datasets: [
          {
            label: "Applications",
            data: Array.from(groupedStatuses.values()),
            backgroundColor: [
              "#0f766e",
              "#d97706",
              "#0f172a",
              "#3b82f6",
              "#b91c1c",
              "#047857",
            ],
            borderRadius: 12,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
          },
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
            },
            grid: {
              color: "rgba(148, 163, 184, 0.18)",
            },
          },
        },
      },
    });
  }

  if (licenseChartRef.value && licenseChartLabels.value.length) {
    const groupedLicenses = new Map();
    licenses.value.forEach((license) => {
      const key = license.license_type_name || humanizeToken(license.license_type_code);
      groupedLicenses.set(key, (groupedLicenses.get(key) || 0) + 1);
    });

    licenseChart = new Chart(licenseChartRef.value, {
      type: "doughnut",
      data: {
        labels: Array.from(groupedLicenses.keys()),
        datasets: [
          {
            data: Array.from(groupedLicenses.values()),
            backgroundColor: ["#0f766e", "#d97706", "#1e293b", "#84cc16", "#3b82f6", "#ef4444"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
        cutout: "68%",
      },
    });
  }
}

async function loadDashboard() {
  loading.value = true;
  errorMessage.value = "";

  try {
    workspace.value = await loadClientWorkspace();
    lastUpdated.value = formatDate(new Date());
    await nextTick();
    renderCharts();
  } catch (error) {
    console.error("Failed to load dashboard:", error);
    errorMessage.value = error?.message || "Failed to load the dashboard right now.";
  } finally {
    loading.value = false;
  }
}

function openLicensingWorkspace() {
  router.push("/licensing");
}

function openApplication(application) {
  router.push({
    path: "/licensing",
    query: {
      applicationId: application.id,
    },
  });
}

watch([applications, licenses], async () => {
  await nextTick();
  renderCharts();
});

onMounted(() => {
  loadDashboard();
});

onBeforeUnmount(() => {
  destroyCharts();
});
</script>

<style scoped>
.dashboard-page__hero-side {
  display: grid;
  gap: 0.75rem;
  justify-items: end;
}

.dashboard-page__highlights {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
}

.dashboard-page__chart {
  position: relative;
  height: 20rem;
}

.dashboard-page__chart--compact {
  height: 18rem;
}

.dashboard-page__action-list,
.dashboard-page__license-list {
  display: grid;
  gap: 0.9rem;
}

.dashboard-page__action-card,
.dashboard-page__license-card {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 1.3rem;
  background: rgba(255, 255, 255, 0.72);
}

.dashboard-page__action-card p,
.dashboard-page__license-card p,
.dashboard-page__license-card small {
  margin: 0;
  color: var(--auth-muted);
  line-height: 1.55;
}

.dashboard-page__card-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.dashboard-page__table-action {
  min-height: 2.35rem;
  padding: 0.55rem 0.9rem;
  font-size: 0.82rem;
}

@media (max-width: 1080px) {
  .dashboard-page__highlights {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .dashboard-page__hero-side {
    width: 100%;
    justify-items: stretch;
  }
}
</style>
