import { defineStore } from "pinia";
import { reactive } from "vue";

export type Button = "home" | "invoices" | "customers" | "settings" | "logout";

export interface ButtonObject {
	disabled: boolean;
	visible: boolean;
}

export const useMenuStore = defineStore("menu", () => {
	const buttons = reactive<Record<Button, ButtonObject>>({
		home: { disabled: false, visible: true },
		invoices: { disabled: true, visible: true },
		customers: { disabled: true, visible: true },
		settings: { disabled: false, visible: true },
		logout: { disabled: false, visible: true }
	});

	function show(button: Button, show: boolean) {
		buttons[button].visible = show;
	}

	function disable(button: Button, disabled: boolean) {
		buttons[button].disabled = disabled;
	}

	return { buttons, show, disable };
});
