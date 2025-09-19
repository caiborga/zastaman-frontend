<template>
	<div class="max-w-4xl mx-auto p-6">
		<Message
			closable
			v-if="!hasBiller"
			class="absolute top-4 left-[25%] w-[50%] z-50 shadow-lg bg-white border border-gray-200 p-4 rounded-lg"
		>
			Du hast noch keine Stammdaten hinterlegt. Bitte gehe zu
			<router-link to="/biller" class="text-blue-600 underline">
				Einstellungen
			</router-link>
			, um deine Firmendaten anzulegen.
		</Message>
		<h1 class="text-2xl font-bold mb-4">Dashboard</h1>

		<!-- CARDS LINE 1 -->
		<div class="flex gap-4 m-2">
			<Card class="w-3/4 overflow-hidden">
				<template #title>Umsatz (netto)</template>
				<template #content>
					<p class="m-0 text-3xl">
						{{
							new Intl.NumberFormat("de-DE", {
								style: "currency",
								currency: "EUR"
							}).format(dashboardData.totalNet || 0)
						}}
					</p>
				</template>
			</Card>

			<!-- VAT -->
			<Card class="w-3/4 overflow-hidden">
				<template #title>Umsatzsteuer</template>
				<template #content>
					<p class="m-0 text-3xl">
						{{
							new Intl.NumberFormat("de-DE", {
								style: "currency",
								currency: "EUR"
							}).format(dashboardData.vatTotal || 0)
						}}
					</p>
				</template>
			</Card>
			<!-- NET -->
			<Card class="w-3/4 overflow-hidden">
				<template #title>Umsatz (brutto)</template>
				<template #content>
					<p class="m-0 text-3xl">
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
		<!-- CARDS LINE 2 -->
		<div class="flex gap-4 m-2">
			<Card class="w-1/2 overflow-hidden">
				<template #title>Erstellte Rechnungen</template>
				<template #content>
					<p class="m-0 text-3xl">
						{{ dashboardData.count }}
					</p>
				</template>
			</Card>

			<!-- <Card class="w-3/4 overflow-hidden">
				<template #title>Umsatzsteuer</template>
				<template #content>
					<p class="m-0 text-3xl">
						{{
							dashboardData.cu
						}}
					</p>
				</template>
			</Card> -->
			<!-- NET -->
			<!-- <Card class="w-3/4 overflow-hidden">
				<template #title>Umsatz (brutto)</template>
				<template #content>
					<p class="m-0 text-3xl">
						{{
							new Intl.NumberFormat("de-DE", {
								style: "currency",
								currency: "EUR"
							}).format(dashboardData.totalGross || 0)
						}}
					</p>
				</template>
			</Card> -->
		</div>

		<div class="bg-white rounded shadow p-4">
			<h2 class="text-lg font-semibold mb-3">Kundenumsätze</h2>
			<Chart
				type="bar"
				:data="chartData"
				:options="chartOptions"
				class="h-[30rem]"
			/>
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
				data: data.monthsTotals,
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
