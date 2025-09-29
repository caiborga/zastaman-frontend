<template>
	<div class="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-2">
		<div class="flex items-center justify-between mb-4">
			<h2 class="text-xl font-bold">Umsatzsteuersätze</h2>
			<Button
				icon="pi pi-plus"
				rounded
				size="small"
				aria-label="Neuer Steuersatz"
				@click="openNewDialog"
			/>
		</div>

		<div class="min-w-0">
			<div
				class="overflow-x-auto max-w-full rounded-lg bg-white shadow ring-1 ring-gray-200"
			>
				<DataTable
					:value="vatRates"
					:paginator="true"
					:rows="10"
					stripedRows
					responsiveLayout="stack"
					breakpoint="768px"
					scrollable
					scrollDirection="horizontal"
					:tableStyle="{ width: '100%', tableLayout: 'auto' }"
					class="w-full text-sm"
					@row-click="editData($event)"
					:rowClass="() => 'cursor-pointer'"
				>
					<template #empty>
						Bisher wurden keine Steuersätze
						<span
							@click="openNewDialog"
							class="text-blue-600 underline cursor-pointer"
							>erstellt</span
						>.
					</template>

					<!-- Steuersatz: Hauptspalte, zeigt auf XS auch Beschreibung + Standard-Badge -->
					<Column header="Steuersatz">
						<template #body="{ data }">
							<span class="p-column-title sm:hidden"
								>Steuersatz</span
							>
							<div class="font-medium">
								{{
									new Intl.NumberFormat("de-DE", {
										maximumFractionDigits: 2
									}).format(data.percentage)
								}}
								%
							</div>

							<!-- Beschreibung & Standard-Badge nur auf XS als Subtext -->
							<div class="text-gray-500 sm:hidden">
								{{ data.description }}
							</div>
							<div
								v-if="data.isDefault"
								class="sm:hidden mt-1 inline-flex items-center gap-1 text-emerald-700 text-xs font-medium bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded"
							>
								<i class="pi pi-check"></i> Standard
							</div>
						</template>
					</Column>

					<!-- Beschreibung: nur ≥ sm -->
					<Column
						field="description"
						header="Beschreibung"
						:headerClass="'hidden sm:table-cell'"
						:bodyClass="'hidden sm:table-cell'"
					>
						<template #body="{ data }">
							<div
								class="max-w-[360px] truncate"
								:title="data.description"
							>
								{{ data.description }}
							</div>
						</template>
					</Column>

					<!-- Standard: nur ≥ sm -->
					<Column
						field="isDefault"
						header="Standard"
						:headerClass="'hidden sm:table-cell'"
						:bodyClass="'hidden sm:table-cell'"
					>
						<template #body="{ data }">
							<i
								v-if="data.isDefault"
								class="pi pi-check text-green-600"
								aria-label="Standard"
							></i>
						</template>
					</Column>
				</DataTable>
			</div>
		</div>

		<Dialog
			v-model:visible="visible"
			modal
			header="Umsatzsteuersatz"
			:style="{ width: '25rem' }"
		>
			<span class="text-surface-500 dark:text-surface-400 block mb-8">{{
				label
			}}</span>
			<div class="flex items-center gap-4 mb-4">
				<label for="percentage" class="font-semibold w-24"
					>Steuersatz</label
				>
				<InputNumber
					id="percentage"
					class="flex-auto"
					:useGrouping="false"
					v-model="vat.percentage"
				/>
			</div>
			<div class="flex items-center gap-4 mb-8">
				<label for="description" class="font-semibold w-24"
					>Beschreibung</label
				>
				<InputText
					id="description"
					class="flex-auto"
					autocomplete="off"
					v-model="vat.description"
				/>
			</div>
			<div class="flex items-center gap-2">
				<Checkbox v-model="vat.isDefault" inputId="isDefault" binary />
				<label for="isDefault"> Standard Steuersatz </label>
			</div>
			<div class="flex justify-end gap-2">
				<Button
					type="button"
					label="Abbrechen"
					severity="secondary"
					@click="visible = false"
				></Button>
				<Button
					type="button"
					:label="action"
					@click="handleVatAction"
				></Button>
			</div>
		</Dialog>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "../api";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import type { Vat } from "../models/vat";
import { useLoadingStore } from "../stores/loading";

const vatRates = ref<Vat[]>([]);
const visible = ref(false);
const loading = useLoadingStore();
const label = ref("");
const action = ref("");

const error = ref("");
const success = ref("");

const emptyVat = {
	id: 0,
	percentage: 0,
	description: "",
	isDefault: false
};

const vat = ref({ ...emptyVat });

onMounted(loadData);

function editData(event: any) {
	action.value = "Bearbeiten";
	label.value = "Steuersatz bearbeiten";
	vat.value = { ...event.data };
	visible.value = true;
}

function openNewDialog() {
	action.value = "Erstellen";
	label.value = "Neuen Steuersatz anlegen";
	vat.value = { ...emptyVat };
	visible.value = true;
}

function handleVatAction() {
	if (action.value === "Erstellen") {
		submitVat();
	} else {
		editVat();
	}
}

async function loadData() {
	loading.show();
	try {
		const res = await api.get("/vat");
		vatRates.value = res.data;
	} catch (err) {
		console.error("Fehler beim Laden der Steuersätze:", err);
	} finally {
		loading.hide();
	}
}

async function submitVat() {
	error.value = "";
	success.value = "";
	loading.show();

	try {
		await api.post("/vat", {
			...vat.value
		});
		success.value = "Steuersatz erfolgreich angelegt.";
		loadData();
		visible.value = false;
	} catch (err: any) {
		error.value =
			err.response?.data?.message ||
			"Fehler beim Erstellen des Steuersatzes.";
	} finally {
		loading.hide();
	}
}

async function editVat() {
	error.value = "";
	success.value = "";
	loading.show();

	try {
		await api.patch("/vat/" + vat.value.id, {
			...vat.value
		});
		success.value = "Steuersatz erfolgreich bearbeitet.";
		loadData();
		visible.value = false;
	} catch (err: any) {
		error.value =
			err.response?.data?.message ||
			"Fehler beim Bearbeiten des Steuersatzes.";
	} finally {
		loading.hide();
	}
}
</script>
