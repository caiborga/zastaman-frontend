<template>
  <Menubar :model="menuItems" class="custom-menubar">
    <template #end>
      <button @click="logout" class="p-button p-button-text logout-button">
        <i class="pi pi-sign-out" />
        <span class="ml-2">Logout</span>
      </button>
    </template>
  </Menubar>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useMenuStore } from "../stores/menu";

const router = useRouter();
const menuStore = useMenuStore();

// Logout-Funktion
const logout = () => {
  localStorage.removeItem("token");
  router.push("/auth/login");
};

// Menüeinträge (links)
const menuItems = computed(() => [
  {
    label: "Home",
    icon: "pi pi-chart-bar",
    command: () => router.push("/"),
    disabled: menuStore.buttons.home.disabled,
    visible: menuStore.buttons.home.visible
  },
  {
    label: "Einstellungen",
    icon: "pi pi-cog",
    disabled: menuStore.buttons.settings.disabled,
    visible: menuStore.buttons.settings.visible,
    items: [
      {
        label: "Stammdaten",
        icon: "pi pi-user",
        command: () => router.push("/biller")
      },
      {
        label: "Umsatzsteuersätze",
        icon: "pi pi-percentage",
        command: () => router.push("/vat")
      }
    ]
  },
  {
    label: "Kunden",
    icon: "pi pi-users",
    disabled: menuStore.buttons.customers.disabled,
    visible: menuStore.buttons.customers.visible,
    items: [
      {
        label: "Kunde anlegen",
        icon: "pi pi-plus",
        command: () => router.push("/createCustomer")
      },
      {
        label: "Kunden Übersicht",
        icon: "pi pi-list",
        command: () => router.push("/customers")
      }
    ]
  },
  {
    label: "Rechnungen",
    icon: "pi pi-receipt",
    disabled: menuStore.buttons.invoices.disabled,
    visible: menuStore.buttons.invoices.visible,
    items: [
      {
        label: "Rechnung erstellen",
        icon: "pi pi-plus",
        command: () => router.push("/createInvoice")
      },
      {
        label: "Rechnungsübersicht",
        icon: "pi pi-list",
        command: () => router.push("/invoices")
      }
    ]
  }
]);
</script>

<style scoped>
/* Menüleiste */
.custom-menubar {
  position: sticky;
  top: 0;
  z-index: 500;
  background-color: rgb(255, 255, 255);
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  padding: 0.5rem 1rem;
  font-family: "Segoe UI", Roboto, sans-serif;
  font-size: 1rem;
  transition: box-shadow 0.3s ease;
}

/* Hover-Effekt für Menülinks */
.p-menubar .p-menuitem-link:hover {
  background-color: #f5f5f5;
  border-radius: 4px;
}

/* Aktives Menüelement */
.p-menubar .p-menuitem-link.p-menuitem-active {
  background-color: #e0f3ff;
  color: #007ad9;
  border-radius: 4px;
}

/* Logout-Button rechts */
.logout-button {
  margin-left: auto;
  display: flex;
  align-items: center;
  font-size: 1rem;
  color: #444;
  border-radius: 4px;
  padding: 0.4rem 0.75rem;
}

.logout-button:hover {
  background-color: #fbe9e7;
  color: #d32f2f;
}
</style>
