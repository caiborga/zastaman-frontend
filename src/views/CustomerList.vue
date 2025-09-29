<template>
	<div class="p-6 bg-white rounded shadow mt-2 mx-2">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-xl font-bold">Kundenliste</h2>
		</div>
		<div class="min-w-0 mt-2">
			<div
				class="overflow-x-auto max-w-full rounded-lg bg-white shadow ring-1 ring-gray-200"
			>
				<DataTable
					:value="customers"
					:paginator="true"
					:rows="10"
					stripedRows
					responsiveLayout="stack"
					breakpoint="768px"
					scrollable
					scrollDirection="horizontal"
					:tableStyle="{ width: '100%', tableLayout: 'auto' }"
					class="w-full text-sm"
					@row-click="goToCustomer"
					:rowClass="() => 'cursor-pointer'"
				>
					<!-- NAME -->
					<Column header="Name">
						<template #body="{ data }">
							<div class="font-medium">{{ name(data) }}</div>
							<div class="text-gray-500 sm:hidden">
								{{ data.companyName }}
								<span v-if="data.token">
									• {{ data.token }}</span
								>
							</div>
						</template>
					</Column>

					<!-- ORGANIZATION -->
					<Column
						field="companyName"
						header="Unternehmen"
						:headerClass="'hidden sm:table-cell'"
						:bodyClass="'hidden sm:table-cell'"
					>
						<template #body="{ data }">
							<div
								class="max-w-[240px] truncate"
								:title="data.companyName"
							>
								{{ data.companyName }}
							</div>
						</template>
					</Column>

					<!-- ADRESS -->
					<Column
						header="Adresse"
						:headerClass="'hidden sm:table-cell'"
						:bodyClass="'hidden sm:table-cell'"
					>
						<template #body="{ data }">
							{{ adress(data) }}
						</template>
					</Column>

					<!-- TOKEN -->
					<Column
						field="token"
						header="Kürzel"
						:headerClass="'hidden sm:table-cell'"
						:bodyClass="'hidden sm:table-cell'"
					/>

					<!-- PRICE -->
					<Column
						field="hourlyRate"
						header="Stundensatz"
						:body="formatAmount"
						:headerClass="'hidden sm:table-cell'"
						:bodyClass="'hidden sm:table-cell'"
					>
						<template #body="{ data }">
							{{ formatAmount(data) }}
						</template>
					</Column>
				</DataTable>
			</div>
		</div>
	</div>
</template>

<style scoped>
/* hübschere Labels im Stack-Layout + sichere Breiten */
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
</style>

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
	return row.biller ? `${row.lastName}, ${row.preName}` : "-";
}

function adress(row: any) {
	return `${row.street} ${row.streetNumber}, ${row.postcode} ${row.town} (${row.country})`;
}

function formatAmount(row: any) {
  const v = typeof row.hourlyRate === 'string'
    ? parseFloat(row.hourlyRate.replace(',', '.'))
    : row.hourlyRate;

  if (!Number.isFinite(v)) return '';

  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(v); // z.B. 108,12 €
}

function goToCustomer(event: any) {
	const customerId = event.data.id;
	router.push({ name: "Edit Customer", query: { customerId } });
}
</script>
