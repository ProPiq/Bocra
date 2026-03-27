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
      title: "Login | BOCRA Public Portal",
    },
  },
  {
    path: "/clientDash",
    name: "clientDash",
    component: ClientDashboardPage,
    meta: {
      title: "Dashboard | BOCRA",
    },
  },
  {
    path: "/licensing",
    name: "licensing",
    component: LicensingPage,
    meta: {
      title: "Licensing | BOCRA",
    },
  },
  {
    path: "/compliance",
    name: "compliance",
    component: CompliancePage,
    meta: {
      title: "Compliance | BOCRA",
    },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

export default createRouter({
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
