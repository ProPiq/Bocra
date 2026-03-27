<template>
  <div class="auth-shell">
    <div class="auth-shell__glow auth-shell__glow--primary"></div>
    <div class="auth-shell__glow auth-shell__glow--accent"></div>

    <div
      class="auth-shell__backdrop"
      :class="{ 'is-open': sidebarOpen }"
      @click="closeSidebar"
    ></div>

    <aside class="auth-shell__sidebar" :class="{ 'is-open': sidebarOpen }">
      <div class="auth-shell__sidebar-inner">
        <div class="auth-shell__sidebar-head">
          <RouterLink class="auth-shell__brand" to="/dashboard" @click="closeSidebar">
            <img src="/img/logo-transparent.png" alt="BOCRA" />
            <div class="auth-shell__brand-copy">
              <p>BOCRA Public Portal</p>
              <strong>Client workspace</strong>
              <span>Aligned to the portal brand, adapted for applicants.</span>
            </div>
          </RouterLink>

          <button class="auth-shell__close" type="button" @click="closeSidebar">
            Close
          </button>
        </div>

        <div class="auth-shell__nav-block">
          <p class="auth-shell__nav-label">Workspace</p>

          <nav class="auth-shell__nav">
            <RouterLink
              v-for="item in authNavigation"
              :key="item.key"
              class="auth-shell__nav-item"
              :class="{ 'is-active': isActive(item) }"
              :to="item.path"
              @click="closeSidebar"
            >
              <span class="auth-shell__nav-icon">{{ item.shortLabel }}</span>
              <span class="auth-shell__nav-copy">
                <span class="auth-shell__nav-row">
                  <strong>{{ item.label }}</strong>
                  <em v-if="item.status === 'shell'">Shell</em>
                </span>
                <small>{{ item.description }}</small>
              </span>
            </RouterLink>
          </nav>
        </div>

        <div class="auth-shell__snapshot">
          <p class="auth-shell__snapshot-label">Account snapshot</p>
          <div class="auth-shell__snapshot-list">
            <div v-for="item in resolvedSnapshot" :key="item.label" class="auth-shell__snapshot-row">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </div>

        <button class="auth-shell__logout" type="button" @click="logout">
          Log out
        </button>
      </div>
    </aside>

    <div class="auth-shell__content">
      <header class="auth-shell__header">
        <div class="auth-shell__header-card">
          <div class="auth-shell__header-main">
            <button class="auth-shell__menu" type="button" @click="toggleSidebar">
              Menu
            </button>

            <div class="auth-shell__title-block">
              <p class="auth-shell__eyebrow">{{ resolvedEyebrow }}</p>
              <h1>{{ resolvedTitle }}</h1>
              <p>{{ resolvedDescription }}</p>
            </div>
          </div>

          <div class="auth-shell__header-side">
            <div class="auth-shell__today">
              <span>Today</span>
              <strong>{{ today }}</strong>
            </div>

            <div class="auth-shell__user">
              <img :src="resolvedUser.avatar" :alt="resolvedUser.name" />
              <div>
                <strong>{{ resolvedUser.name }}</strong>
                <span>{{ resolvedUser.role }}</span>
                <small>{{ resolvedUser.organization }}</small>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main class="auth-shell__main">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import {
  authNavigation,
  getAuthNavigationByPath,
  workspaceSnapshot,
  workspaceUser,
} from "../../data/authWorkspace";
import { clearAuthSession, getStoredUser } from "../../lib/platformApi";
import { formatRoleCodes } from "../../lib/workspace";

const props = defineProps({
  eyebrow: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
});

const route = useRoute();
const router = useRouter();
const sidebarOpen = ref(false);

const activeItem = computed(() => getAuthNavigationByPath(route.path));
const storedUser = computed(() => getStoredUser());

const resolvedEyebrow = computed(() => props.eyebrow || "BOCRA Public Portal");
const resolvedTitle = computed(() => props.title || route.meta?.title || activeItem.value.title);
const resolvedDescription = computed(
  () => props.description || route.meta?.description || activeItem.value.headerDescription,
);
const resolvedUser = computed(() => {
  if (!storedUser.value) {
    return workspaceUser;
  }

  return {
    name: storedUser.value.full_name || workspaceUser.name,
    role: formatRoleCodes(storedUser.value.role_codes),
    organization:
      storedUser.value.organization_ids?.length > 0
        ? `${storedUser.value.organization_ids.length} linked organization${
            storedUser.value.organization_ids.length === 1 ? "" : "s"
          }`
        : "No linked organization",
    avatar: `https://i.pravatar.cc/96?u=${encodeURIComponent(storedUser.value.email || storedUser.value.id || "bocra")}`,
  };
});
const resolvedSnapshot = computed(() => {
  if (!storedUser.value) {
    return workspaceSnapshot;
  }

  return [
    {
      label: "User type",
      value: storedUser.value.user_type ? String(storedUser.value.user_type).toUpperCase() : "N/A",
    },
    {
      label: "Role count",
      value: String(storedUser.value.role_codes?.length || 0).padStart(2, "0"),
    },
    {
      label: "Linked orgs",
      value: String(storedUser.value.organization_ids?.length || 0).padStart(2, "0"),
    },
  ];
});

const today = new Intl.DateTimeFormat("en-BW", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
}).format(new Date());

watch(
  () => route.fullPath,
  () => {
    sidebarOpen.value = false;
  },
);

function isActive(item) {
  return route.path === item.path || item.aliases?.includes(route.path);
}

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}

function closeSidebar() {
  sidebarOpen.value = false;
}

function logout() {
  clearAuthSession();
  closeSidebar();
  router.push("/login");
}
</script>
