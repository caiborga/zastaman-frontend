import { defineStore } from "pinia";
import { ref } from "vue";
import { api } from "../api";

export const useCustomerStore = defineStore("customer", () => {
	const customers = ref<any[]>([]);

	async function fetchCustomers() {
		try {
			const res = await api.get("/customer");
			customers.value = res.data;
		} catch (err) {
			customers.value = [];
		}
	}

	function hasCustomers() {
		return customers.value.length > 0;
	}

	return { customers, fetchCustomers, hasCustomers };
});
