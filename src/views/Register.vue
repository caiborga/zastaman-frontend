<template>
	<div class="max-w-md mx-auto p-6 bg-white rounded shadow">
		<h2 class="text-xl font-bold mb-4">Registrieren</h2>

		<form @submit.prevent="register">
			<div class="mb-4">
				<label class="block mb-1">Benutzername</label>
				<InputText v-model="form.username" class="w-full" />
			</div>

			<div class="mb-4">
				<label class="block mb-1">Passwort</label>
				<Password
					v-model="form.password"
					toggleMask
					:feedback="false"
					class="w-full"
				/>
			</div>

			<div v-if="error" class="text-red-500 mb-4">{{ error }}</div>

			<Button label="Registrieren" type="submit" class="w-full" />
			<RouterLink to="/auth/login">Login?</RouterLink>
		</form>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import { useRouter } from "vue-router";
import { useLoadingStore } from "../stores/loading";
import { api } from "../api";

const router = useRouter();
const loading = useLoadingStore();

const form = ref({
	username: "",
	password: ""
});

const error = ref("");

async function register() {
	error.value = "";
	try {
		loading.show();
		await api.post("/auth/register", form.value);
		router.push("/auth/login");
	} catch (err: any) {
		error.value =
			err.response?.data?.message || "Registrierung fehlgeschlagen.";
	} finally {
		loading.hide();
	}
}
</script>
