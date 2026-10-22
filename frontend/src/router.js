import { createRouter, createWebHistory } from "vue-router";
import LoginPage from "./views/LoginPage.vue";
import LegacyPage from "./views/LegacyPage.vue";
import MembersPage from "./views/MembersPage.vue";
import SchedulePage from "./views/SchedulePage.vue";
import UsersPage from "./views/UsersPage.vue";
import { getAuthUser } from "./services/auth";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/legacy" },
    { path: "/login", component: LoginPage },
    { path: "/legacy", component: LegacyPage },
    { path: "/members", component: MembersPage },
    { path: "/schedule", component: SchedulePage },
    { path: "/users", component: UsersPage }
  ]
});

router.beforeEach((to) => {
  if (to.path === "/login") return true;
  const user = getAuthUser();
  if (!user) return "/login";
  return true;
});

export default router;
