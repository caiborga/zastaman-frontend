<template>
	<div class="auth-layout">
		<LoadingOverlay v-if="loadingStore.isLoading" />
		<RouterView />
	</div>
</template>

<script setup lang="ts">
import { useLoadingStore } from "../stores/loading";
import LoadingOverlay from "../components/LoadingOverlay.vue";

const loadingStore = useLoadingStore();
</script>

<style scoped>
.auth-layout {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 100vh;
	padding: 2rem;
	background-color: #f8f8f8;
}
</style>
