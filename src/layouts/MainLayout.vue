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
	min-height: 100svh;
	background: radial-gradient(
			800px 500px at 100% 0%,
			rgba(99, 102, 241, 0.18) 0,
			rgba(99, 102, 241, 0) 55%
		),
		radial-gradient(
			600px 400px at 0% 0%,
			rgba(56, 189, 248, 0.18) 0,
			rgba(56, 189, 248, 0) 60%
		),
		linear-gradient(180deg, #f8fafc 0%, #eef2ff 60%, #ffffff 100%);
}
.page-content {
	flex: 1;
}

@media (prefers-color-scheme: dark) {
	.main-layout {
		background: radial-gradient(
				800px 500px at 100% 0%,
				rgba(99, 102, 241, 0.25) 0,
				rgba(99, 102, 241, 0) 55%
			),
			radial-gradient(
				600px 400px at 0% 0%,
				rgba(56, 189, 248, 0.22) 0,
				rgba(56, 189, 248, 0) 60%
			),
			linear-gradient(180deg, #0f172a 0%, #111827 60%, #0b1220 100%);
	}
}
</style>
