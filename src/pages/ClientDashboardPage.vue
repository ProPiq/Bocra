<template>
  <div class="dashboard-page">
    <div class="layout">
      <aside class="sidebar" :class="{ active: sidebarOpen }">
        <div class="brand">BOCRA Portal</div>

        <nav>
          <a
            v-for="link in navigation"
            :key="link.label"
            :href="link.href || undefined"
            :class="{ active: link.active, disabled: !link.href }"
            @click.prevent="handleNavClick(link)"
          >
            {{ link.label }}
          </a>
        </nav>

        <div class="sidebar-footer">
          <a href="#/login">Logout</a>
        </div>
      </aside>

      <main>
        <div class="topbar">
          <button class="menu-toggle" type="button" @click="toggleSidebar">Menu</button>
          <div>{{ currentDate }}</div>
          <div class="user">
            <img :src="user.avatar" :alt="user.name" />
            <span>{{ user.name }}</span>
          </div>
        </div>

        <div class="stats">
          <div v-for="stat in stats" :key="stat.label" class="card">
            <h4>{{ stat.label }}</h4>
            <div class="value">
              {{ stat.value }}
              <span class="trend">{{ stat.trend }}</span>
            </div>
          </div>
        </div>

        <div class="content">
          <div class="card">
            <h3>Quality of Network</h3>
            <div class="chart-container">
              <canvas ref="barChartRef"></canvas>
            </div>
          </div>

          <div class="card">
            <h3>Business Spend</h3>
            <div class="chart-container">
              <canvas ref="donutChartRef"></canvas>
            </div>
          </div>
        </div>

        <div class="card">
          <h3>Applications</h3>

          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>License Type</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="application in applications" :key="application.id">
                  <td>{{ application.name }}</td>
                  <td>{{ application.type }}</td>
                  <td>
                    <span class="status" :class="application.statusClass">
                      {{ application.status }}
                    </span>
                  </td>
                  <td>{{ application.date }}</td>
                  <td>
                    <button class="action-btn" type="button" @click="viewApplication(application)">
                      View
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div id="overlay" :class="{ active: sidebarOpen }" @click="closeSidebar"></div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import Chart from "chart.js/auto";

const currentDate = ref("");
const sidebarOpen = ref(false);
const barChartRef = ref(null);
const donutChartRef = ref(null);

const user = {
  name: "Aupa Moleofe",
  avatar: "https://i.pravatar.cc/40",
};

const navigation = [
  { label: "Home", href: "#/clientDash", active: true },
  { label: "Licensing", href: "#/licensing", active: false },
  { label: "Compliance", href: "#/compliance", active: false },
  { label: "Type Approval", href: "", active: false },
  { label: "QoS Monitoring", href: "", active: false },
  { label: "Complaints", href: "", active: false },
  { label: "Reports", href: "", active: false },
  { label: "Support", href: "", active: false },
  { label: "Settings", href: "", active: false },
  { label: "Profile", href: "", active: false },
];

const stats = [
  { label: "Active Applications", value: 5, trend: "+27%" },
  { label: "Pending Applications", value: 3, trend: "+10%" },
  { label: "Expired Licenses", value: 2, trend: "+27%" },
  { label: "Total Licenses", value: 14, trend: "+27%" },
];

const applications = [
  {
    id: "app-1",
    name: "Arifbillah",
    type: "Dealer",
    status: "Complete",
    statusClass: "approved",
    date: "Jul 21, 2023",
  },
  {
    id: "app-2",
    name: "Arifbillah",
    type: "Spectrum",
    status: "In Process",
    statusClass: "pending",
    date: "Jul 21, 2023",
  },
];

let barChart;
let donutChart;

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

function closeSidebar() {
  sidebarOpen.value = false;
}

function handleResize() {
  if (window.innerWidth > 768) {
    closeSidebar();
  }
}

function handleNavClick(link) {
  if (!link.href) {
    return;
  }

  window.location.href = link.href;
}

function viewApplication(application) {
  window.alert(`Opening ${application.type} application for ${application.name}.`);
}

function createCharts() {
  if (barChartRef.value) {
    barChart = new Chart(barChartRef.value, {
      type: "bar",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          {
            label: "Call",
            data: [12, 19, 8, 15, 10, 14],
            backgroundColor: "#ff7900",
          },
          {
            label: "Data",
            data: [8, 11, 6, 10, 7, 9],
            backgroundColor: "#ffe800",
          },
          {
            label: "SMS",
            data: [5, 9, 4, 7, 6, 8],
            backgroundColor: "#0d6731",
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
      },
    });
  }

  if (donutChartRef.value) {
    donutChart = new Chart(donutChartRef.value, {
      type: "doughnut",
      data: {
        labels: ["Income", "Expand", "Booking"],
        datasets: [
          {
            data: [50, 25, 25],
            backgroundColor: ["#f97316", "#c084fc", "#fde68a"],
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
      },
    });
  }
}

onMounted(() => {
  currentDate.value = new Date().toDateString();
  createCharts();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  barChart?.destroy();
  donutChart?.destroy();
});
</script>

<style>
.dashboard-page,
.dashboard-page * {
  box-sizing: border-box;
  font-family: "Inter", sans-serif;
}

.dashboard-page {
  margin: 0;
  background: #f8fafc;
  color: #1e293b;
  min-height: 100vh;
}

.dashboard-page .layout {
  display: flex;
  min-height: 100vh;
}

.dashboard-page .sidebar {
  width: 240px;
  background: #ffffff;
  border-right: 1px solid #e5e7eb;
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: left 0.3s ease;
}

.dashboard-page .brand {
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 25px;
}

.dashboard-page .sidebar nav a,
.dashboard-page .sidebar-footer a {
  display: block;
  padding: 10px;
  border-radius: 10px;
  color: #475569;
  text-decoration: none;
  margin-bottom: 5px;
}

.dashboard-page .sidebar nav a:hover,
.dashboard-page .sidebar-footer a:hover {
  background: #f1f5f9;
}

.dashboard-page .sidebar nav a.active {
  background: #e0ecff;
  color: #2563eb;
}

.dashboard-page .sidebar nav a.disabled {
  color: #94a3b8;
  cursor: default;
}

.dashboard-page .sidebar-footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.dashboard-page main {
  flex: 1;
  padding: 20px;
  position: relative;
}

.dashboard-page .topbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 15px 20px;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  margin-bottom: 20px;
}

.dashboard-page .user {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dashboard-page .user img {
  width: 40px;
  border-radius: 50%;
}

.dashboard-page .stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.dashboard-page .card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.04);
}

.dashboard-page .card h4 {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 8px;
}

.dashboard-page .card .value {
  font-size: 26px;
  font-weight: 600;
}

.dashboard-page .trend {
  font-size: 12px;
  background: #dcfce7;
  color: #16a34a;
  padding: 3px 6px;
  border-radius: 6px;
  margin-left: 5px;
}

.dashboard-page .content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.dashboard-page table {
  width: 100%;
  border-collapse: collapse;
}

.dashboard-page th {
  text-align: left;
  font-size: 12px;
  color: #64748b;
  padding: 10px 0;
}

.dashboard-page td {
  padding: 10px 0;
  font-size: 14px;
}

.dashboard-page tr:hover {
  background: #f8fafc;
}

.dashboard-page .status {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
}

.dashboard-page .approved {
  background: #dcfce7;
  color: #16a34a;
}

.dashboard-page .pending {
  background: #fef9c3;
  color: #ca8a04;
}

.dashboard-page .action-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 8px;
  background: #2563eb;
  color: #fff;
  font-size: 12px;
  cursor: pointer;
}

.dashboard-page .action-btn:hover {
  background: #1d4ed8;
}

.dashboard-page #overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s;
}

.dashboard-page #overlay.active {
  opacity: 1;
  visibility: visible;
}

.dashboard-page .menu-toggle {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  color: #475569;
  padding: 8px 12px;
  border-radius: 8px;
  display: none;
}

.dashboard-page .table-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.dashboard-page .chart-container {
  position: relative;
  height: 300px;
  width: 100%;
}

@media (max-width: 1200px) {
  .dashboard-page main {
    padding: 15px;
  }
}

@media (max-width: 900px) {
  .dashboard-page .content {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .dashboard-page .stats {
    grid-template-columns: 1fr;
    gap: 15px;
  }
}

@media (max-width: 768px) {
  .dashboard-page .menu-toggle {
    display: block;
  }

  .dashboard-page .sidebar {
    position: fixed;
    top: 0;
    left: -100%;
    width: 280px;
    height: 100vh;
    z-index: 999;
    border-right: none;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  }

  .dashboard-page .sidebar.active {
    left: 0;
  }

  .dashboard-page .layout {
    position: relative;
  }

  .dashboard-page main {
    padding: 10px;
  }

  .dashboard-page .topbar {
    padding: 12px 15px;
    flex-wrap: wrap;
    gap: 10px;
  }

  .dashboard-page .stats {
    gap: 12px;
  }

  .dashboard-page .card {
    padding: 15px;
  }

  .dashboard-page .card .value {
    font-size: 22px;
  }

  .dashboard-page .chart-container {
    height: 250px;
  }
}

@media (max-width: 480px) {
  .dashboard-page .topbar {
    padding: 10px;
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .dashboard-page .user span {
    display: none;
  }

  .dashboard-page .stats {
    gap: 10px;
  }

  .dashboard-page .card {
    padding: 12px;
  }

  .dashboard-page .card .value {
    font-size: 20px;
  }

  .dashboard-page th,
  .dashboard-page td {
    font-size: 12px;
    padding: 8px 4px;
  }

  .dashboard-page .status {
    font-size: 10px;
    padding: 2px 6px;
  }

  .dashboard-page .action-btn {
    font-size: 10px;
    padding: 4px 8px;
  }
}
</style>
