<template>
	<div class="max-w-2xl mx-auto p-6 bg-white rounded shadow">
		<h2 class="text-xl font-bold mb-4">Stammdaten</h2>

		<form @submit.prevent="submitBiller" class="space-y-4">
			<div class="flex gap-4">
				<div class="flex-1">
					<label>Vorname</label>
					<InputText v-model="customer.preName" class="w-full" />
				</div>

				<div class="flex-1">
					<label>Nachname</label>
					<InputText v-model="customer.lastName" class="w-full" />
				</div>
			</div>
            <div>
					<label>Unternehmen</label>
					<InputText v-model="customer.companyName" class="w-full" />
				</div>
			<div class="flex gap-4">
				<div class="flex-1">
					<label>Strasse</label>
					<InputText v-model="customer.street" class="w-full" />
				</div>

				<div class="flex-1">
					<label>Hausnummer</label>
					<InputNumber
						v-model="customer.streetNumber"
						class="w-full"
					/>
				</div>
			</div>

			<div class="flex-1">
				<label>Postleitzahl</label>
				<InputNumber v-model="customer.postcode" class="w-full" />
			</div>

			<div>
				<label>Stadt</label>
				<InputText v-model="customer.town" class="w-full" />
			</div>

			<div>
				<label>Land</label>
				<InputText v-model="customer.country" class="w-full" />
			</div>

			<div v-if="error" class="text-red-500">{{ error }}</div>
			<div v-if="success" class="text-green-600">{{ success }}</div>

			<Button type="submit" label="Kunde anlegen" class="w-full" />
		</form>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Button from "primevue/button";
import { api } from "../api";
import { useLoadingStore } from "../stores/loading";
import { useBillerStore } from "../stores/biller";

const billerStore = useBillerStore();
const customer = ref({
	companyName: "",
	preName: "",
	lastName: "",
	street: "",
	streetNumber: null,
	postcode: null,
	town: "",
	country: "",
});

const error = ref("");
const success = ref("");
const loading = useLoadingStore();

async function submitBiller() {
	error.value = "";
	success.value = "";
	loading.show();

	try {
		await api.patch("/biller", {
			...customer.value
		});
		success.value = "Stammdaten erfolgreich angelegt.";
        await billerStore.fetchBiller()
	} catch (err: any) {
		error.value =
			err.response?.data?.message || "Fehler beim Speichern der Stammdaten.";
	} finally {
		loading.hide();
	}
}
</script>
