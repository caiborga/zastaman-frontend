<template>
	<div class="max-w-2xl mx-auto p-6 bg-white rounded shadow mt-2">
		<h2 class="text-xl font-bold mb-4">
			{{ mode === "create" ? "Kunde anlegen" : "Kunde bearbeiten" }}
		</h2>

		<form @submit.prevent="submitCustomer" class="space-y-4">
			<!-- NAME -->
			<div class="flex flex-col sm:flex-row gap-4">
				<div class="flex-1 min-w-0">
					<label class="block mb-1">Vorname *</label>
					<InputText v-model="customer.preName" class="w-full" />
				</div>
				<div class="flex-1 min-w-0">
					<label class="block mb-1">Nachname *</label>
					<InputText v-model="customer.lastName" class="w-full" />
				</div>
			</div>

			<!-- ORGANIZATION -->
			<div>
				<label class="block mb-1">Unternehmen</label>
				<InputText v-model="customer.companyName" class="w-full" />
			</div>

			<!-- STREET / NUMBER -->
			<div class="flex flex-col sm:flex-row gap-4">
				<div class="flex-1 min-w-0">
					<label class="block mb-1">Straße *</label>
					<InputText v-model="customer.street" class="w-full" />
				</div>
				<div class="min-w-0 sm:w-28">
					<label class="block mb-1">Hausnummer *</label>
					<InputNumber
						v-model="customer.streetNumber"
						class="block w-full"
						inputClass="w-full"
					/>
				</div>
			</div>

			<!-- PLZ / TOWN -->
			<div class="flex flex-col sm:flex-row gap-4">
				<div class="min-w-0 sm:w-40">
					<label class="block mb-1">Postleitzahl *</label>
					<InputText
						v-model="customer.postcode"
						class="w-full"
						inputmode="numeric"
					/>
				</div>
				<div class="flex-1 min-w-0">
					<label class="block mb-1">Stadt *</label>
					<InputText v-model="customer.town" class="w-full" />
				</div>
			</div>

			<!-- COUNTRY -->
			<div>
				<label class="block mb-1">Land *</label>
				<InputText v-model="customer.country" class="w-full" />
			</div>

			<!-- TOKEN / PRICE -->
			<div class="flex flex-col sm:flex-row gap-4">
				<div class="min-w-0 sm:w-48">
					<label class="block mb-1">Kürzel *</label>
					<InputText v-model="customer.token" class="w-full" />
				</div>
				<div class="flex-1 min-w-0">
					<label class="block mb-1">Stundensatz (€) *</label>
					<InputNumber
						v-model="customer.hourlyRate"
						class="block w-full"
						inputClass="w-full"
						:min="0"
						mode="currency"
						currency="EUR"
					/>
				</div>
			</div>

			<!-- ERROR -->
			<div
				v-if="errors.length"
				class="bg-red-50 border border-red-400 text-red-700 p-3 rounded space-y-1"
			>
				<div v-for="e in errors" :key="e">• {{ e }}</div>
			</div>
			<div v-if="error" class="text-red-500">{{ error }}</div>

			<Button
				type="submit"
				:label="
					mode === 'create' ? 'Kunde anlegen' : 'Änderungen speichern'
				"
				class="w-full"
			/>
		</form>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import { api } from "../api";
import { useLoadingStore } from "../stores/loading";
import { useMenuStore } from "../stores/menu";
import { useToastStore } from "../stores/toast";
import { router } from "../router";
import { useRoute } from "vue-router";

const menu = useMenuStore();

const customer = ref({
	companyName: "",
	preName: "",
	lastName: "",
	street: "",
	streetNumber: null,
	postcode: "",
	town: "",
	country: "",
	token: "",
	hourlyRate: null
});

const error = ref("");
const errors = ref<string[]>([]);
const loading = useLoadingStore();
const toastStore = useToastStore();
const route = useRoute();

let mode: "create" | "edit" = "create";

onMounted(() => {
	setupForm();
});

watch(
	() => route.query.customerId,
	() => {
		setupForm();
	}
);

async function setupForm() {
	if (route.query.customerId) {
		mode = "edit";
		loading.isLoading = true;
		try {
			const res = await api.get("/customer/" + route.query.customerId);
			customer.value = res.data;
		} catch (err) {
			console.error("Fehler beim Laden der Kunden:", err);
		} finally {
			loading.isLoading = false;
		}
	} else {
		mode = "create";
		customer.value = {
			companyName: "",
			preName: "",
			lastName: "",
			street: "",
			streetNumber: null,
			postcode: "",
			town: "",
			country: "",
			token: "",
			hourlyRate: null
		};
	}
}

function validate() {
	errors.value = [];

	if (!customer.value.preName?.trim()) {
		errors.value.push("Vorname ist erforderlich.");
	}
	if (!customer.value.lastName?.trim()) {
		errors.value.push("Nachname ist erforderlich.");
	}
	if (!customer.value.street?.trim()) {
		errors.value.push("Straße ist erforderlich.");
	}
	if (
		customer.value.streetNumber == null ||
		customer.value.streetNumber <= 0
	) {
		errors.value.push("Hausnummer ist erforderlich und muss positiv sein.");
	}
	if (!customer.value.postcode) {
		errors.value.push("Postleitzahl ist erforderlich.");
	} else if (!/^\d{5}$/.test(customer.value.postcode)) {
		errors.value.push("Postleitzahl muss 5 Ziffern enthalten.");
	}
	if (!customer.value.town?.trim()) {
		errors.value.push("Stadt ist erforderlich.");
	}
	if (!customer.value.country?.trim()) {
		errors.value.push("Land ist erforderlich.");
	}
	if (!customer.value.token?.trim()) {
		errors.value.push("Kürzel ist erforderlich.");
	} else if (customer.value.token.length > 10) {
		errors.value.push("Kürzel darf maximal 10 Zeichen haben.");
	}
	if (customer.value.hourlyRate == null || customer.value.hourlyRate <= 0) {
		errors.value.push("Stundensatz muss größer als 0 sein.");
	}

	return errors.value.length === 0;
}

async function submitCustomer() {
	error.value = "";
	errors.value = [];

	if (!validate()) {
		error.value = "Bitte fülle alle Pflichtfelder korrekt aus.";
		return;
	}

	loading.show();

	if (mode === "create") {
		try {
			debugger;
			await api.post("/customer", {
				...customer.value,
				postcode: convertToNumber(customer.value.postcode)
			});

			// Reset
			customer.value = {
				companyName: "",
				preName: "",
				lastName: "",
				street: "",
				streetNumber: null,
				postcode: "",
				town: "",
				country: "",
				token: "",
				hourlyRate: null
			};
			menu.disable("invoices", false);
			toastStore.showToast(
				"Kunde erfolgreich angelegt",
				"success",
				"Erfolgreich"
			);
			router.push("/customers");
		} catch (err: any) {
			toastStore.showToast(
				"Es ist ein Fehler aufgetreten",
				"error",
				"Fehler "
			);
		} finally {
			loading.hide();
		}
	} else {
		try {
			await api.patch("/customer/" + route.query.customerId, {
				...customer.value,
				postcode: convertToNumber(customer.value.postcode),
				hourlyRate: convertToNumber(
					customer.value.hourlyRate ? customer.value.hourlyRate : "0"
				)
			});

			// Reset
			customer.value = {
				companyName: "",
				preName: "",
				lastName: "",
				street: "",
				streetNumber: null,
				postcode: "",
				town: "",
				country: "",
				token: "",
				hourlyRate: null
			};
			menu.disable("invoices", false);
			toastStore.showToast(
				"Kunde erfolgreich angelegt",
				"success",
				"Erfolgreich"
			);
			router.push("/customers");
		} catch (err: any) {
			toastStore.showToast(
				"Es ist ein Fehler aufgetreten",
				"error",
				"Fehler "
			);
		} finally {
			loading.hide();
		}
	}
}

function convertToNumber(value: string): number {
	console.log(value ? Number(value) : 0);
	return value ? Number(value) : 0;
}
</script>
