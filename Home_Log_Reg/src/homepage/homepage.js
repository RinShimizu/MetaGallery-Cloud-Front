import { createApp } from 'vue'
import router from './router'
import Homepage from "@/homepage/homepage.vue";

createApp(Homepage).use(router).mount('#app')
