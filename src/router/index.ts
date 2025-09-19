import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

import MainLayout from "../layouts/MainLayout.vue";
import AuthLayout from "../layouts/AuthLayout.vue";

import Dashboard from "../views/Dashboard.vue";
import Login from "../views/Login.vue";
import Register from "../views/Register.vue";
import CreateInvoice from "../views/CreateInvoice.vue";
import InvoiceList from "../views/InvoiceList.vue";
import CustomerList from "../views/CustomerList.vue";
import CreateCustomer from "../views/CreateCustomer.vue";
import Biller from "../views/Biller.vue";
import Vat from "../views/Vat.vue";

const routes: RouteRecordRaw[] = [
	{
		path: "/",
		component: MainLayout,
		children: [
			{ path: "", name: "Dashboard", component: Dashboard },
			{ path: "biller", name: "Biller", component: Biller },
			{
				path: "createInvoice",
				name: "Create Invoice",
				component: CreateInvoice
			},
			{
				path: "invoices",
				name: "Invoice Overview",
				component: InvoiceList
			},
			{
				path: "createCustomer",
				name: "Create Customer",
				component: CreateCustomer
			},
            {
				path: "editCustomer",
				name: "Edit Customer",
				component: CreateCustomer
			},
			{
				path: "customers",
				name: "Customer Overview",
				component: CustomerList
			},
			{ path: "vat", name: "Vat Rates", component: Vat },

		],
		meta: { requiresAuth: true, requiresBiller: true }
	},
	{
		path: "/auth",
		component: AuthLayout,
		children: [
			{ path: "login", name: "Login", component: Login },
			{ path: "register", name: "Register", component: Register }
		]
	},
	{
		path: "/:pathMatch(.*)*",
		redirect: "/"
	}
];

export const router = createRouter({
	history: createWebHistory(),
	routes
});
