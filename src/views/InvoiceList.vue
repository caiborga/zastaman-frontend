<template>
	<div class="p-6">
		<h2 class="text-xl font-bold mb-4">Meine Rechnungen</h2>

		<DataTable
			:value="invoices"
			:paginator="true"
			:rows="10"
			stripedRows
			responsiveLayout="scroll"
		>
			<Column field="customer.companyName" header="Unternehmen" />
			<Column field="customer" header="Kunde">
				<template #body="slotProps">
					{{ slotProps.data.customer?.preName || "" }}
					{{ slotProps.data.customer?.lastName || "" }}
				</template>
			</Column>
			<Column field="invoiceNumber" header="Rechnungsnummer" />
			<Column header="Rechnungsdatum">
				<template #body="slotProps">
					{{
						new Intl.DateTimeFormat("de-DE", {
							day: "2-digit",
							month: "2-digit",
							year: "numeric"
						}).format(new Date(slotProps.data.invDate))
					}}
				</template>
			</Column>
			<Column header="Betrag (€)">
				<template #body="slotProps">
					{{
						new Intl.NumberFormat("de-DE", {
							style: "currency",
							currency: "EUR"
						}).format(slotProps.data.invAmount || 0)
					}}
				</template>
			</Column>
			<Column header="MwSt (€)">
				<template #body="slotProps">
					{{
						new Intl.NumberFormat("de-DE", {
							style: "currency",
							currency: "EUR"
						}).format(slotProps.data.vatAmount || 0)
					}}
				</template>
			</Column>
			<Column field="vatRate.percentage" header="USt.-Satz (%)" />
			<Column header="Aktionen">
				<template #body="slotProps">
					<Button
						icon="pi pi-file-pdf"
						severity="secondary"
						rounded
						text
						aria-label="PDF herunterladen"
						@click="() => generatePDF(slotProps.data)"
					></Button>
				</template>
			</Column>
		</DataTable>
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
