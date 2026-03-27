import { createRouter, createWebHashHistory } from "vue-router";
import ClientDashboardPage from "../pages/ClientDashboardPage.vue";
import CompliancePage from "../pages/CompliancePage.vue";
import ContactPage from "../pages/generated/ContactPage.vue";
import AboutPage from "../pages/generated/AboutPage.vue";
import IndexPage from "../pages/generated/IndexPage.vue";
import PortfolioPage from "../pages/generated/PortfolioPage.vue";
import PricePage from "../pages/generated/PricePage.vue";
import ServicePage from "../pages/generated/ServicePage.vue";
import LicensingPage from "../pages/LicensingPage.vue";
import LoginPage from "../pages/LoginPage.vue";
import PlaceholderPage from "../pages/PlaceholderPage.vue";
import { getAuthRouteMeta } from "../data/authWorkspace";
import { hasAuthSession } from "../lib/platformApi";

const routes = [
  {
    path: "/",
    name: "home",
    component: IndexPage,
    meta: {
      marketing: true,
      title: "BOCRA | Public Portal",
    },
  },
  {
    path: "/about",
    name: "about",
    component: AboutPage,
    meta: {
      marketing: true,
      title: "About | BOCRA",
    },
  },
  {
    path: "/service",
    name: "service",
    component: ServicePage,
    meta: {
      marketing: true,
      title: "Services | BOCRA",
    },
  },
  {
    path: "/portfolio",
    name: "portfolio",
    component: PortfolioPage,
    meta: {
      marketing: true,
      title: "Portfolio | BOCRA",
    },
  },
  {
    path: "/price",
    name: "price",
    component: PricePage,
    meta: {
      marketing: true,
      title: "Pricing | BOCRA",
    },
  },
  {
    path: "/contact",
    name: "contact",
    component: ContactPage,
    meta: {
      marketing: true,
      title: "Contact | BOCRA",
    },
  },
  {
    path: "/login",
    name: "login",
    component: LoginPage,
    meta: {
      title: "Login",
      documentTitle: "Login | BOCRA Public Portal",
    },
  },
  {
    path: "/dashboard",
    alias: "/clientDash",
    name: "dashboard",
    component: ClientDashboardPage,
    meta: getAuthRouteMeta("dashboard"),
  },
  {
    path: "/licensing",
    name: "licensing",
    component: LicensingPage,
    meta: getAuthRouteMeta("licensing"),
  },
  {
    path: "/compliance",
    name: "compliance",
    component: CompliancePage,
    meta: getAuthRouteMeta("compliance"),
  },
  {
    path: "/type-approval",
    name: "type-approval",
    component: PlaceholderPage,
    meta: getAuthRouteMeta("type-approval", {
      shellKey: "type-approval",
    }),
  },
  {
    path: "/qos-monitoring",
    name: "qos-monitoring",
    component: PlaceholderPage,
    meta: getAuthRouteMeta("qos-monitoring", {
      shellKey: "qos-monitoring",
    }),
  },
  {
    path: "/complaints",
    name: "complaints",
    component: PlaceholderPage,
    meta: getAuthRouteMeta("complaints", {
      shellKey: "complaints",
    }),
  },
  {
    path: "/reports",
    name: "reports",
    component: PlaceholderPage,
    meta: getAuthRouteMeta("reports", {
      shellKey: "reports",
    }),
  },
  {
    path: "/support",
    name: "support",
    component: PlaceholderPage,
    meta: getAuthRouteMeta("support", {
      shellKey: "support",
    }),
  },
  {
    path: "/settings",
    name: "settings",
    component: PlaceholderPage,
    meta: getAuthRouteMeta("settings", {
      shellKey: "settings",
    }),
  },
  {
    path: "/profile",
    name: "profile",
    component: PlaceholderPage,
    meta: getAuthRouteMeta("profile", {
      shellKey: "profile",
    }),
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  linkActiveClass: "active",
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }

    return { top: 0 };
  },
});

router.beforeEach((to) => {
  if (to.meta?.authShell && !hasAuthSession()) {
    return {
      path: "/login",
      query: {
        redirect: to.fullPath,
      },
    };
  }

  if (to.path === "/login" && hasAuthSession()) {
    return "/dashboard";
  }

  return true;
});

export default router;
