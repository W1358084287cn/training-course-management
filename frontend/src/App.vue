<template>
  <div class="app-shell">
    <header class="app-header" v-if="user">
      <div class="header-content">
        <div class="header-left">
          <div class="brand">
            <div class="brand-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span class="brand-text">消课管理系统</span>
          </div>
        </div>

        <nav class="header-nav">
          <RouterLink class="nav-link" to="/legacy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            业务页面
          </RouterLink>
          <RouterLink class="nav-link" to="/members">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            会员管理
          </RouterLink>
          <RouterLink class="nav-link" to="/schedule">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            排课管理
          </RouterLink>
          <RouterLink v-if="user.role === 'admin'" class="nav-link" to="/users">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <polyline points="17 11 19 13 23 9"/>
            </svg>
            用户管理
          </RouterLink>
        </nav>

        <div class="header-right">
          <div class="user-info">
            <div class="user-avatar">
              {{ user.username?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <span class="user-name">{{ user.username }}</span>
            <span class="user-role">{{ user.role === 'admin' ? '管理员' : '用户' }}</span>
          </div>
          <button class="logout-btn" @click="logout" title="退出登录">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
    </header>
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { clearAuth, getAuthUser } from "./services/auth";

const router = useRouter();
const user = computed(() => getAuthUser());

function logout() {
  clearAuth();
  router.push("/login");
}
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg);
}

.app-header {
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: var(--shadow-sm);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-6);
  gap: var(--space-4);
}

.header-left {
  display: flex;
  align-items: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.brand-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%);
  border-radius: var(--radius-md);
  color: white;
}

.brand-text {
  font-size: var(--text-lg);
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.01em;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: all var(--duration-fast) var(--ease-out);
}

.nav-link:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.nav-link.router-link-active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  background: var(--color-surface-hover);
  border-radius: var(--radius-full);
}

.user-avatar {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary) 0%, #7c3aed 100%);
  color: white;
  border-radius: 50%;
  font-size: var(--text-xs);
  font-weight: 600;
}

.user-name {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
}

.user-role {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  padding-left: var(--space-2);
  border-left: 1px solid var(--color-border);
}

.logout-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-out);
}

.logout-btn:hover {
  background: var(--color-danger-light);
  border-color: var(--color-danger);
  color: var(--color-danger);
}

.app-main {
  flex: 1;
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .header-nav {
    order: 3;
    width: 100%;
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: var(--space-2);
  }

  .nav-link span {
    display: none;
  }

  .user-name,
  .user-role {
    display: none;
  }

  .user-info {
    padding: var(--space-1);
  }
}
</style>
