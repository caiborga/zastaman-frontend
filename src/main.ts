import { createApp } from 'vue'
import { router } from './router'
import { createPinia } from 'pinia'
import App from './App.vue'
import ToastService from 'primevue/toastservice';

import './style.css'

import Aura from '@primeuix/themes/aura'
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import Menubar from 'primevue/menubar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Chart from 'primevue/chart'
import ProgressSpinner from 'primevue/progressspinner'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'

import 'primeicons/primeicons.css'
import { Card, Checkbox, InputNumber, Message, Toast } from 'primevue'

// 1. App erstellen
const app = createApp(App)
const pinia = createPinia()


// 2. PrimeVue einbinden
app.use(PrimeVue, {
    theme: {
        preset: Aura
    },
})
app.use(router)
app.use(pinia)
app.use(ToastService)

// 3. Komponenten registrieren
app.component('Button', Button)
app.component('Card', Card)
app.component('Chart', Chart)
app.component('Checkbox', Checkbox)
app.component('Column', Column)
app.component('DataTable', DataTable)
app.component('Dialog', Dialog)
app.component('InputNumber', InputNumber)
app.component('InputText', InputText)
app.component('Menubar', Menubar)
app.component('Message', Message)
app.component('ProgressSpinner', ProgressSpinner)
app.component('Toast', Toast)

// 4. Mounten
app.mount('#app')