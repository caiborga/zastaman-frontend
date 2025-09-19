<template>
	<div class="main-layout">
		<LoadingOverlay v-if="loadingStore.isLoading" />
		<Toast />
		<main class="page-content">
			<AppMenu />
			<RouterView />
		</main>
	</div>
</template>

<script setup lang="ts">
import { onMounted, watch } from "vue";

import { useLoadingStore } from "../stores/loading";
import { useBillerStore } from "../stores/biller";
import { useCustomerStore } from "../stores/customer";
import { useMenuStore } from "../stores/menu";
import { useToastStore } from "../stores/toast";

import AppMenu from "../components/AppMenu.vue";
import LoadingOverlay from "../components/LoadingOverlay.vue";
import { useToast } from "primevue/usetoast";

const billerStore = useBillerStore();
const customerStore = useCustomerStore();
const menuStore = useMenuStore();
const toastStore = useToastStore();
const toast = useToast();

const loadingStore = useLoadingStore();
async function initializeMenuState() {
	await billerStore.fetchBiller();
	if (billerStore.hasBiller) {
		menuStore.disable("customers", false);

		await customerStore.fetchCustomers();
		if (customerStore.hasCustomers()) {
			menuStore.disable("invoices", false);
		}
	}
}

watch(
	() => toastStore.toastQueue,
	(queue) => {
		while (queue.length > 0) {
			const { severity, summary, detail } = queue.shift()!;
			toast.add({ severity, summary, detail, life: 3000 });
		}
	},
	{ deep: true }
);

onMounted(() => {
	initializeMenuState();
});
</script>

<style scoped>
.main-layout {
	display: flex;
	min-height: 100vh;
}
.page-content {
	flex: 1;
}
</style>
