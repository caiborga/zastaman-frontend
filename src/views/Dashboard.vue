<template>
	<div
		class="mx-auto max-w-screen-lg p-4 sm:p-6 pt-[env(safe-area-inset-top)]"
	>
		<!-- Info-Banner: nicht absolute, gut klickbar, sticky auf Mobile -->
		<Message
			v-if="!hasBiller"
			closable
			class="sticky z-20 mb-4 shadow-lg bg-white border border-gray-200 p-3 sm:p-4 rounded-lg"
			role="status"
			aria-live="polite"
		>
			<div class="text-sm sm:text-base">
				Du hast noch keine Stammdaten hinterlegt. Bitte gehe zu
				<router-link
					to="/biller"
					class="inline-flex items-center text-blue-600 underline underline-offset-2 font-medium ml-1"
				>
					Einstellungen
				</router-link>
				, um deine Firmendaten anzulegen.
			</div>
		</Message>

		<h1 class="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Dashboard</h1>

		<!-- KPIs: responsives Grid -->
		<div
			class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4"
		>
			<!-- NETTO -->
			<Card class="overflow-hidden">
				<template #title>
					<div class="text-sm sm:text-base">Umsatz (netto)</div>
				</template>
				<template #content>
					<p class="m-0 text-2xl sm:text-3xl leading-tight">
						{{
							new Intl.NumberFormat("de-DE", {
								style: "currency",
								currency: "EUR"
							}).format(dashboardData.totalNet || 0)
						}}
					</p>
				</template>
			</Card>

			<!-- UST -->
			<Card class="overflow-hidden">
				<template #title>
					<div class="text-sm sm:text-base">Umsatzsteuer</div>
				</template>
				<template #content>
					<p class="m-0 text-2xl sm:text-3xl leading-tight">
						{{
							new Intl.NumberFormat("de-DE", {
								style: "currency",
								currency: "EUR"
							}).format(dashboardData.vatTotal || 0)
						}}
					</p>
				</template>
			</Card>

			<!-- BRUTTO -->
			<Card
				class="overflow-hidden lg:col-span-1 sm:col-span-2 lg:col-span-1"
			>
				<template #title>
					<div class="text-sm sm:text-base">Umsatz (brutto)</div>
				</template>
				<template #content>
					<p class="m-0 text-2xl sm:text-3xl leading-tight">
						{{
							new Intl.NumberFormat("de-DE", {
								style: "currency",
								currency: "EUR"
							}).format(dashboardData.totalGross || 0)
						}}
					</p>
				</template>
			</Card>
		</div>

		<!-- Zweite Reihe -->
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
			<Card class="overflow-hidden">
				<template #title>
					<div class="text-sm sm:text-base">Erstellte Rechnungen</div>
				</template>
				<template #content>
					<p class="m-0 text-2xl sm:text-3xl leading-tight">
						{{ dashboardData.count }}
					</p>
				</template>
			</Card>
		</div>

		<!-- Chart: auf Mobile horizontales Scrollen statt zu quetschen -->
		<div class="bg-white rounded-lg shadow p-3 sm:p-4 m-0" v-if="chartData">
			<div class="flex items-center justify-between gap-2 mb-2">
				<h2 class="text-base sm:text-lg font-semibold">
					Kundenumsätze
				</h2>
			</div>

			<!-- WICHTIG: kein min-width mehr; Container begrenzt Breite -->
			<div class="relative w-full overflow-hidden">
				<!-- Aspect-ratio Wrapper: 16:9 auf Mobile, 21:9 ab sm -->

				<!-- Chart -->
				<Chart
					type="bar"
					:data="chartData"
					:options="chartOptions"
					class="absolute inset-0 !w-full !h-full block"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Chart from "primevue/chart";
import { useBillerStore } from "../stores/biller";
import { api } from "../api";
import { useLoadingStore } from "../stores/loading";
import type { Biller } from "../models/biller";
import type { DashboardData } from "../models/dashboard";

const billerStore = useBillerStore();
const loading = useLoadingStore();

const hasBiller = computed(() => billerStore.hasBiller);
let biller: Biller = {
	id: -1,
	companyName: "",
	preName: "",
	lastName: "",
	street: "",
	streetNumber: 0,
	postcode: 0,
	town: 0,
	country: 0
};

const chartData = ref();
const chartOptions = ref();

const dashboardData = ref<DashboardData>({
	count: 0,
	totalGross: 0,
	totalNet: 0,
	vatTotal: 0,
	monthsTotals: [],
	monthsVats: []
});

const setChartData = (data: DashboardData) => {
	const documentStyle = getComputedStyle(document.documentElement);

	return {
		labels: [
			"Januar",
			"Februar",
			"März",
			"April",
			"Mai",
			"Juni",
			"Juli",
			"August",
			"September",
			"Oktober",
			"November",
			"Dezember"
		],
		datasets: [
			// {
			// 	type: "line",
			// 	label: "Dataset 1",
			// 	borderColor: documentStyle.getPropertyValue("--p-orange-500"),
			// 	borderWidth: 2,
			// 	fill: false,
			// 	tension: 0.4,
			// 	data: [50, 25, 12, 48, 56, 76, 42, 13, 8, 90]
			// },
			{
				type: "bar",
				label: "Nettobetrag",
				backgroundColor: documentStyle.getPropertyValue("--p-gray-500"),
				data: data.monthsTotals
			},
			{
				type: "bar",
				label: "Umsatzsteuer",
				backgroundColor: documentStyle.getPropertyValue("--p-cyan-500"),
				data: data.monthsVats
			}
		]
	};
};
const setChartOptions = () => {
	const documentStyle = getComputedStyle(document.documentElement);
	const textColor = documentStyle.getPropertyValue("--p-text-color");
	const textColorSecondary = documentStyle.getPropertyValue(
		"--p-text-muted-color"
	);
	const surfaceBorder = documentStyle.getPropertyValue(
		"--p-content-border-color"
	);

	return {
		maintainAspectRatio: false,
		aspectRatio: 0.8,
		plugins: {
			tooltips: {
				mode: "index",
				intersect: false
			},
			legend: {
				labels: {
					color: textColor
				}
			}
		},
		scales: {
			x: {
				stacked: true,
				ticks: {
					color: textColorSecondary
				},
				grid: {
					color: surfaceBorder
				}
			},
			y: {
				stacked: true,
				ticks: {
					color: textColorSecondary
				},
				grid: {
					color: surfaceBorder
				}
			}
		}
	};
};

async function loadDashboardData() {
	loading.show();

	try {
		const response = await api.get("/dashboard/" + biller.id);
		dashboardData.value = response.data.data;
		chartData.value = setChartData(response.data.data);
		chartOptions.value = setChartOptions();
	} catch (err) {
		console.error("Fehler beim Laden der Dashboard-Daten:", err);
	} finally {
		loading.hide();
	}
}

onMounted(async () => {
	loading.show();
	try {
		await billerStore.fetchBiller();
		biller = billerStore.biller;
	} catch (err) {
		console.error("Fehler beim Laden des Biller:", err);
	} finally {
		loading.hide();
	}
	if (biller.id !== -1) loadDashboardData();
});
</script>
