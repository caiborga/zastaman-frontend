<template>
	<div class="max-w-2xl mx-auto p-6 bg-white rounded shadow">
		<h2 class="text-xl font-bold mb-4">Rechnung erstellen</h2>

		<form @submit.prevent="submitInvoice" class="space-y-4">
			<div>
				<label class="block mb-1">Kunde (Kürzel) *</label>
				<Dropdown
					v-model="invoice.customer"
					:options="customers"
					optionLabel="label"
					optionValue="id"
					placeholder="Kunden auswählen"
					class="w-full"
					filter
				/>
			</div>

			<div>
				<label class="block mb-1">Rechnungsnummer</label>
				<InputText v-model="invoice.invoiceNumber" class="w-full" disabled="true"/>
			</div>

			<div class="flex gap-4">
				<div class="flex-1">
					<label class="block mb-1">Zeitraum Start *</label>
					<Calendar
						v-model="invoice.periodStart"
						class="w-full"
						dateFormat="dd.mm.yy"
						showIcon
					/>
				</div>
				<div class="flex-1">
					<label class="block mb-1">Zeitraum Ende *</label>
					<Calendar
						v-model="invoice.periodEnd"
						class="w-full"
						dateFormat="dd.mm.yy"
						showIcon
					/>
				</div>
			</div>

			<div class="flex gap-4">
				<div class="flex-1">
					<label class="block mb-1">Rechnungsdatum *</label>
					<Calendar
						v-model="invoice.invDate"
						class="w-full"
						dateFormat="dd.mm.yy"
						showIcon
					/>
				</div>
				<div class="flex-1">
					<label class="block mb-1">Erstellungsdatum</label>
					<Calendar
						:disabled="true"
						v-model="invoice.createDate"
						class="w-full"
						dateFormat="dd.mm.yy"
						showIcon
					/>
				</div>
			</div>

			<div class="flex gap-4">
				<div class="flex-1">
					<label class="block mb-1">Rechnungsbetrag (€) *</label>
					<InputNumber
						v-model="invoice.invAmount"
						class="w-full"
						mode="currency"
						currency="EUR"
						locale="de-DE"
						:min="0"
					/>
				</div>
				<div class="flex-1">
					<label class="block mb-1">Mehrwertsteuer (€) *</label>
					<InputNumber
						v-model="invoice.vatAmount"
						class="w-full"
						mode="currency"
						currency="EUR"
						locale="de-DE"
						:min="0"
					/>
				</div>
			</div>

			<div>
				<label class="block mb-1">USt.-Satz (%) *</label>
				<div>
					<Dropdown
						v-model="invoice.vatKey"
						:options="vatRates"
						optionLabel="label"
						optionValue="id"
						placeholder="Steuerschlüssel auswählen"
						class="w-full"
						filter
					/>
				</div>
			</div>

			<div
				v-if="errors.length"
				class="bg-red-50 border border-red-400 text-red-700 p-3 rounded space-y-1"
			>
				<div v-for="e in errors" :key="e">• {{ e }}</div>
			</div>

			<div v-if="error" class="text-red-500">{{ error }}</div>
			<div v-if="success" class="text-green-600">{{ success }}</div>

			<Button type="submit" label="Rechnung speichern" class="w-full" />
		</form>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import Dropdown from "primevue/dropdown";
import Calendar from "primevue/calendar";
import Button from "primevue/button";
import { api } from "../api";
import { useLoadingStore } from "../stores/loading";
import type { Vat } from "../models/vat";
import type { Invoice } from "../models/invoice";
import { useToastStore } from "../stores/toast";
import type { Biller } from "../models/biller";

const loading = useLoadingStore();
const toastStore = useToastStore();

const customers = ref<{ id: number; label: string }[]>([]);
const vatRates = ref<Vat[]>([]);
const error = ref("");
const errors = ref<string[]>([]);
const success = ref("");

const invoice = ref<Invoice>({
	customer: 0,
	invoiceNumber: '',
	periodStart: new Date(),
	periodEnd: new Date(),
	invDate: new Date(),
	createDate: new Date(),
	invAmount: 0,
	vatAmount: 0,
	vatKey: 0
});

function validate() {
	errors.value = [];

	if (!invoice.value.customer) {
		errors.value.push("Bitte einen Kunden auswählen.");
	}
	if (!invoice.value.periodStart) {
		errors.value.push("Zeitraum Start ist erforderlich.");
	}
	if (!invoice.value.periodEnd) {
		errors.value.push("Zeitraum Ende ist erforderlich.");
	}
	if (!invoice.value.invDate) {
		errors.value.push("Rechnungsdatum ist erforderlich.");
	}
	if (!invoice.value.createDate) {
		errors.value.push("Erstellungsdatum ist erforderlich.");
	}
	if (invoice.value.invAmount == null || invoice.value.invAmount <= 0) {
		errors.value.push("Rechnungsbetrag muss größer als 0 sein.");
	}
	if (invoice.value.vatAmount == null || invoice.value.vatAmount < 0) {
		errors.value.push("Mehrwertsteuer darf nicht negativ sein.");
	}
	if (invoice.value.vatKey == null || invoice.value.vatKey <= 0) {
		errors.value.push("USt.-Satz muss größer als 0 sein.");
	}

	return errors.value.length === 0;
}

async function submitInvoice() {
	error.value = "";
	success.value = "";
	errors.value = [];

	if (!validate()) {
		error.value = "Bitte fülle alle Pflichtfelder korrekt aus.";
		return;
	}

	loading.show();

	const data = {
		...invoice.value,
		periodStart: invoice.value.periodStart.toISOString(),
		periodEnd: invoice.value.periodEnd.toISOString(),
		invDate: invoice.value.invDate.toISOString(),
		createDate: invoice.value.createDate.toISOString(),
	};

	try {
		await api.post("/invoice", data);
		success.value = "Rechnung wurde erfolgreich erstellt.";

		// Optional: Formular zurücksetzen
		invoice.value = {
			customer: null,
			invoiceNumber: "",
			periodStart: null,
			periodEnd: null,
			invDate: new Date(),
			createDate: new Date(),
			invAmount: null,
			vatAmount: null,
			vatKey: null
		};
		toastStore.showToast(
			"Rechnung erfolgreich erstellt",
			"success",
			"Erfolgreich"
		);
	} catch (err: any) {
		toastStore.showToast(
			"Es ist ein Fehler aufgetreten",
			"error",
			"Fehler"
		);
	} finally {
		loading.hide();
	}
}

async function loadCustomers() {
	loading.show();
	try {
		const res = await api.get("/customer");
		customers.value = res.data.map((c: any) => ({
			id: c.id,
			label: `${c.companyName} - ${c?.preName || ""} ${c?.lastName || ""}`
		}));
	} catch (err) {
		console.error("Fehler beim Laden der Kunden:", err);
	} finally {
		loading.hide();
	}
}

async function loadVatRates() {
	loading.show();
	try {
		const res = await api.get("/vat");
		vatRates.value = res.data.map((v: any) => ({
			id: v.id,
			label: `${v.percentage} % ${
				v.description ? " - " + v.description : ""
			}`,
			percentage: v.percentage,
			default: v.isDefault
		}));
		for (const rate of res.data) {
			if (rate.isDefault) {
				invoice.value.vatKey = rate.id;
			}
		}
	} catch (err) {
		console.error("Fehler beim Laden der Kunden:", err);
	} finally {
		loading.hide();
	}
}

async function loadBiller() {
	loading.show();
	try {
		const res = await api.get("/biller");
		invoice.value.invoiceNumber = String(res.data.invoiceNumber);
	} catch (err) {
		console.error("Fehler beim Laden des billers:", err);
	} finally {
		loading.hide();
	}
}

onMounted(() => {
	loadCustomers();
	loadVatRates();
    loadBiller();
});

watch(
	() => [invoice.value.invAmount, invoice.value.vatKey],
	([amount, vatKey]) => {
		const vatRate = vatRates.value.find((element) => element.id === vatKey);
		const vat = vatRate?.percentage;
		const net = Number(amount);

		if (vat && !isNaN(net)) {
			invoice.value.vatAmount = +(net * (vat / 100)).toFixed(2);
		} else {
			invoice.value.vatAmount = 0;
		}
	}
);
</script>
