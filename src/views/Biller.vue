<template>
	<div class="max-w-2xl mx-auto p-6 bg-white rounded shadow">
		<h2 class="text-xl font-bold mb-4">Stammdaten</h2>

		<form @submit.prevent="editBiller" class="space-y-4">
			<div class="flex gap-4">
				<div class="flex-1">
					<label class="block mb-1">Vorname *</label>
					<InputText v-model="biller.preName" class="w-full" />
				</div>
				<div class="flex-1">
					<label class="block mb-1">Nachname *</label>
					<InputText v-model="biller.lastName" class="w-full" />
				</div>
			</div>

			<div>
				<label class="block mb-1">Unternehmen</label>
				<InputText v-model="biller.companyName" class="w-full" />
			</div>

			<div class="flex gap-4">
				<div class="flex-1">
					<label class="block mb-1">Straße *</label>
					<InputText v-model="biller.street" class="w-full" />
				</div>
				<div class="flex-1">
					<label class="block mb-1">Hausnummer *</label>
					<InputNumber
						v-model="biller.streetNumber"
						class="w-full"
						:min="0"
					/>
				</div>
			</div>

			<div class="flex-1">
				<label class="block mb-1">Postleitzahl *</label>
				<InputText v-model="biller.postcode" class="w-full" />
			</div>

			<div>
				<label class="block mb-1">Stadt *</label>
				<InputText v-model="biller.town" class="w-full" />
			</div>

			<div>
				<label class="block mb-1">Land *</label>
				<InputText v-model="biller.country" class="w-full" />
			</div>

			<div
				v-if="errors.length"
				class="bg-red-50 border border-red-400 text-red-700 p-3 rounded space-y-1"
			>
				<div v-for="e in errors" :key="e">• {{ e }}</div>
			</div>

			<div v-if="error" class="text-red-500">{{ error }}</div>
			<div v-if="success" class="text-green-600">{{ success }}</div>

			<Button type="submit" label="Stammdaten speichern" class="w-full" />
		</form>
	</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import { api } from "../api";
import { useLoadingStore } from "../stores/loading";
import { useMenuStore } from "../stores/menu";
import { useToastStore } from "../stores/toast";

const emptyBiller = {
	companyName: "",
	preName: "",
	lastName: "",
	street: "",
	streetNumber: null,
	postcode: "",
	town: "",
	country: ""
};
const biller = ref({ ...emptyBiller });
const error = ref("");
const errors = ref<string[]>([]);
const success = ref("");
const loading = useLoadingStore();
const menu = useMenuStore();
const toastStore = useToastStore();

function validate() {
	errors.value = [];

	if (!biller.value.preName?.trim()) {
		errors.value.push("Vorname ist erforderlich.");
	}
	if (!biller.value.lastName?.trim()) {
		errors.value.push("Nachname ist erforderlich.");
	}
	if (!biller.value.street?.trim()) {
		errors.value.push("Straße ist erforderlich.");
	}
	if (biller.value.streetNumber == null || biller.value.streetNumber <= 0) {
		errors.value.push("Hausnummer ist erforderlich und muss positiv sein.");
	}
	if (!biller.value.postcode?.trim()) {
		errors.value.push("Postleitzahl ist erforderlich.");
	} else if (!/^\d{5}$/.test(biller.value.postcode.trim())) {
		errors.value.push("Postleitzahl muss 5 Ziffern enthalten.");
	}
	if (!biller.value.town?.trim()) {
		errors.value.push("Stadt ist erforderlich.");
	}
	if (!biller.value.country?.trim()) {
		errors.value.push("Land ist erforderlich.");
	}

	return errors.value.length === 0;
}

async function editBiller() {
	error.value = "";
	success.value = "";
	errors.value = [];

	if (!validate()) {
		error.value = "Bitte fülle alle Pflichtfelder korrekt aus.";
		return;
	}

	loading.show();

	try {
		await api.patch("/biller", {
			...biller.value,
			postcode: convertToNumber(biller.value.postcode),
		});
		success.value = "Stammdaten erfolgreich gespeichert.";
        toastStore.showToast("Stammdaten erfolgreich gespeichert", "success", "Erfolgreich");
		menu.disable("customers", false);
	} catch (err: any) {
        toastStore.showToast("Es ist ein Fehler aufgetreten", "error", "Fehler");
	} finally {
		loading.hide();
	}
}

async function loadBiller() {
	loading.show();
	try {
		const res = await api.get("/biller");
		if (
			res.data &&
			typeof res.data === "object" &&
			!Array.isArray(res.data)
		) {
			biller.value = {...res.data, postcode: String(res.data.postcode)};
		} else {
			biller.value = { ...emptyBiller };
		}
	} catch (err) {
		console.error("Fehler beim Laden der Stammdaten", err);
		biller.value = { ...emptyBiller };
	} finally {
		loading.hide();
	}
}

function convertToNumber(value: string): number {
    console.log(value ? Number(value) : 0)
  return value ? Number(value) : 0;
}

onMounted(() => {
	loadBiller();
});
</script>
