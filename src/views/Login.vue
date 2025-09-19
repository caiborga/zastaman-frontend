<template>
	<div
		class="max-w-4xl mx-auto p-6 bg-white rounded shadow flex flex-col md:flex-row"
	>
		<!-- Image -->
		<div class="flex-1 p-6 hidden md:block">
			<img
				src="/src/assets/zasta-man.png"
				alt="Login Illustration"
				class="w-54 h-96 object-cover rounded"
			/>
		</div>
		<!-- Login Form -->
		<div class="flex-1 p-6">
			<h2 class="text-xl font-bold mb-4">Login</h2>

			<form @submit.prevent="login">
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

				<Button label="Anmelden" type="submit" class="w-full" />
			</form>

			<RouterLink
				to="/auth/register"
				class="block mt-4 text-blue-600 hover:underline"
				>Schon registriert?</RouterLink
			>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import Button from "primevue/button";
import { useRouter } from "vue-router";
import { useLoadingStore } from "../stores/loading";

const router = useRouter();
const loading = useLoadingStore();

const form = ref({
	username: "",
	password: ""
});

const error = ref("");

async function login() {
	error.value = "";
	try {
		loading.show();
		const res = await axios.post("/api/auth/login", form.value);

		// Token speichern
		localStorage.setItem("token", res.data.access_token);

		// Weiterleitung nach erfolgreichem Login
		router.push("/");
	} catch (err: any) {
		error.value = err.response?.data?.message || "Login fehlgeschlagen.";
	} finally {
		loading.hide();
	}
}
</script>
