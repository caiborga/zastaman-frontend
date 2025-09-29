<template>
	<div class="p-6 bg-white rounded shadow mt-2 mx-2">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-xl font-bold">Rechnungen</h2>
		</div>
		<div class="min-w-0">
			<div
				class="overflow-x-auto overflow-y-auto max-h-[70svh] max-w-full rounded-lg bg-white shadow ring-1 ring-gray-200 mt-2"
			>
				<DataTable
					:value="invoices"
					:paginator="true"
					:rows="10"
					stripedRows
					responsiveLayout="stack"
					breakpoint="768px"
					scrollable
					scrollDirection="horizontal"
					:tableStyle="{ width: '100%', tableLayout: 'auto' }"
					class="w-full text-sm"
				>
					<!-- ORGANIZATION -->
					<Column
						field="customer.companyName"
						header="Unternehmen"
						:headerClass="'hidden sm:table-cell'"
						:bodyClass="'hidden sm:table-cell'"
					>
						<template #body="{ data }">
							<div
								class="max-w-[240px] truncate"
								:title="data.customer?.companyName"
							>
								{{ data.customer?.companyName }}
							</div>
						</template>
					</Column>

					<!-- CUSTOMER -->
					<Column header="Kunde">
						<template #body="{ data }">
							<div class="font-medium">
								{{ data.customer?.preName || "" }}
								{{ data.customer?.lastName || "" }}
							</div>
							<div class="text-gray-500 sm:hidden">
								{{ data.customer?.companyName }}
							</div>
						</template>
					</Column>

					<!-- INVOICE NUMBER -->
					<Column
						header="Rechnungsnummer"
						:headerClass="'hidden sm:table-cell'"
						:bodyClass="'hidden sm:table-cell'"
					>
						<template #body="{ data }">
							<div
								class="max-w-[180px] truncate"
								:title="data.invoiceNumber"
							>
								{{ data.invoiceNumber }}
							</div>
						</template>
					</Column>

					<!-- DATE -->
					<Column
						header="Rechnungsdatum"
						:headerClass="'hidden sm:table-cell'"
						:bodyClass="'hidden sm:table-cell'"
					>
						<template #body="{ data }">
							{{
								new Intl.DateTimeFormat("de-DE", {
									day: "2-digit",
									month: "2-digit",
									year: "numeric"
								}).format(new Date(data.invDate))
							}}
						</template>
					</Column>

					<!-- AMOUNT -->
					<Column header="Betrag (€)">
						<template #body="{ data }">
							<div class="font-semibold">
								{{
									new Intl.NumberFormat("de-DE", {
										style: "currency",
										currency: "EUR"
									}).format(data.invAmount || 0)
								}}
							</div>
							<div class="text-gray-500 sm:hidden">
								MwSt:
								{{
									new Intl.NumberFormat("de-DE", {
										style: "currency",
										currency: "EUR"
									}).format(data.vatAmount || 0)
								}}
								({{ data.vatRate?.percentage }}%)
							</div>
						</template>
					</Column>

					<!-- VAT -->
					<Column
						header="MwSt (€)"
						:headerClass="'hidden sm:table-cell'"
						:bodyClass="'hidden sm:table-cell'"
					>
						<template #body="{ data }">
							{{
								new Intl.NumberFormat("de-DE", {
									style: "currency",
									currency: "EUR"
								}).format(data.vatAmount || 0)
							}}
						</template>
					</Column>

					<Column
						field="vatRate.percentage"
						header="USt.-Satz (%)"
						:headerClass="'hidden sm:table-cell'"
						:bodyClass="'hidden sm:table-cell'"
					/>

					<!-- ACTIONS -->
					<Column
						header="Aktionen"
						:headerClass="'hidden sm:table-cell'"
						:bodyClass="'hidden sm:table-cell'"
					>
						<template #body="{ data }">
							<Button
								icon="pi pi-file-pdf"
								severity="secondary"
								rounded
								text
								aria-label="PDF herunterladen"
								@click="() => generatePDF(data)"
							/>
						</template>
					</Column>
				</DataTable>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../api";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import { useLoadingStore } from "../stores/loading";
import type { Invoice } from "../models/invoice";
// import { formatDate } from "../helpers/functions";

const invoices = ref<Invoice[]>([]);
const loading = useLoadingStore();

onMounted(async () => {
	await loadInvoices();
});

async function loadInvoices() {
	loading.isLoading = true;
	try {
		const res = await api.get("/invoice");
		invoices.value = res.data;
	} catch (err) {
		console.error("Fehler beim Laden der Rechnungen:", err);
	} finally {
		loading.isLoading = false;
	}
}

async function generatePDF(invoice: Invoice) {
	loading.isLoading = true;

	try {
		const res = await api.get(`/pdf/${invoice.id}`, {
			responseType: "blob"
		});

		const blob = res.data;
		const url = window.URL.createObjectURL(blob);
		window.open(url);
	} catch (err) {
		console.error("Fehler beim Laden der Rechnung:", err);
	} finally {
		loading.isLoading = false;
	}
}
</script>

<style>
:deep(.p-column-title) {
	font-size: 0.75rem;
	color: #6b7280;
	margin-right: 0.5rem;
}
:deep(.p-datatable) {
	max-width: 100%;
}
:deep(.p-datatable-wrapper) {
	max-width: 100%;
	overflow-x: auto;
}
:deep(.p-datatable .p-datatable-thead th),
:deep(.p-datatable .p-datatable-tbody td) {
	white-space: nowrap;
}
</style>
