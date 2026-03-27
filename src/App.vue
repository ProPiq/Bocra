<template>
  <RouterView />
</template>

<script setup>
import { nextTick, watch } from "vue";
import { RouterView, useRoute } from "vue-router";
import { ensureMarketingScripts, initMarketingPage } from "./lib/marketingScripts";

const route = useRoute();

function resetLegacyMobileNav() {
  if (!window.jQuery) {
    return;
  }

  window.jQuery("#mobile-nav, #mobile-nav-toggle, #mobile-body-overly").remove();
  window.jQuery("body").removeClass("mobile-nav-active");
}

async function syncRouteUi() {
  document.title = route.meta?.documentTitle || route.meta?.title || "BOCRA";
  document.body.classList.toggle("platform-auth-body", Boolean(route.meta?.authShell));

  await nextTick();

  if (route.meta?.marketing) {
    await ensureMarketingScripts();
    initMarketingPage();

    const section =
      route.name === "home" && typeof route.query.section === "string"
        ? document.getElementById(route.query.section)
        : null;

    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
  } else {
    resetLegacyMobileNav();
  }

  window.scrollTo({ top: 0, behavior: "auto" });
}

watch(() => route.fullPath, syncRouteUi, { immediate: true });
</script>
