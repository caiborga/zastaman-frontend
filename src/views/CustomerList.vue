<template>
	<div class="p-6">
		<h2 class="text-xl font-bold mb-4">Meine Kunden</h2>

		<DataTable
			:value="customers"
			:paginator="true"
			:rows="10"
			stripedRows
			responsiveLayout="scroll"
            @row-click="goToCustomer"
            :rowClass="() => 'cursor-pointer'"
		>
			<Column header="Name">
				<template #body="slotProps">
					{{ name(slotProps.data) }}
				</template>
			</Column>
			<Column field="companyName" header="Unternehmen" />
			<Column header="Adresse">
				<template #body="slotProps">
					{{ adress(slotProps.data) }}
				</template>
			</Column>
			<Column field="token" header="Kürzel" />
			<Column
				field="hourlyRate"
				header="Stundensatz"
				:body="formatAmount"
			/>
		</DataTable>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../api";
import { useRouter } from "vue-router";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import type { Customer } from "../models/customer";
import { useLoadingStore } from "../stores/loading";

const customers = ref<Customer[]>([]);
const loading = useLoadingStore();
const router = useRouter();

onMounted(async () => {
	loading.isLoading = true;
	try {
		const res = await api.get("/customer");
		customers.value = res.data;
	} catch (err) {
		console.error("Fehler beim Laden der Kunden:", err);
	} finally {
		loading.isLoading = false;
	}
});

function name(row: any) {
	return row.biller ? `${row.preName} ${row.lastName}` : "-";
}

function adress(row: any) {
	return `${row.street} ${row.streetNumber}, ${row.postcode} ${row.town} (${row.country})`;
}

function formatAmount(row: any) {
	return row.invAmount?.toFixed(2) + " €";
}

function goToCustomer(event: any) {
  const customerId = event.data.id;
  router.push({ name: 'Edit Customer', query: { customerId } });
}
</script>
