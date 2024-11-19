import { createRouter, createMemoryHistory } from 'vue-router';
import Lfile from "@/components/Lfile.vue";
import Lstar from "@/components/Lstar.vue";
import Lgallery from "@/components/Lgallery.vue";
import Lshare from "@/components/Lshare.vue";
import Lrubbish from "@/components/Lrubbish.vue";

const routes = [
    {
        path: '/',
        name: 'Lfile',
        component: Lfile
    },
    {
        path: '/star',
        name: 'Lstar',
        component: Lstar
    },
    {
        path: '/gallery',
        name: 'Lgallery',
        component: Lgallery
    },
    {
        path: '/share',
        name: 'Lshare',
        component: Lshare
    },
    {
        path: '/rubbish',
        name: 'Lrubbish',
        component: Lrubbish
    }
];

const router = createRouter({
    history: createMemoryHistory(),
    routes,
});

export default router;