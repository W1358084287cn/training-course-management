<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">用户管理</h1>
        <div class="text-sm text-muted">仅管理员可见</div>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger mb-4">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {{ error }}
    </div>

    <form class="card mb-6" @submit.prevent="createUser">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="form-label">用户名</label>
          <input class="input" v-model.trim="newUsername" />
        </div>
        <div>
          <label class="form-label">密码</label>
          <input class="input" v-model="newPassword" type="password" />
        </div>
        <div>
          <label class="form-label">角色</label>
          <select class="input" v-model="newRole">
            <option value="coach">coach</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <div class="flex items-end">
          <button class="btn btn-primary w-full" type="submit" :disabled="loading">
            {{ loading ? "创建中..." : "创建用户" }}
          </button>
        </div>
      </div>
    </form>

    <div class="card overflow-hidden">
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>角色</th>
              <th>更新时间</th>
              <th style="width: 100px;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>{{ u.id }}</td>
              <td class="font-medium">{{ u.username }}</td>
              <td>
                <span class="badge" :class="u.role === 'admin' ? 'badge-primary' : 'badge-success'">
                  {{ u.role }}
                </span>
              </td>
              <td class="text-secondary">{{ u.updatedAt }}</td>
              <td>
                <button
                  class="btn btn-ghost btn-sm text-danger"
                  @click="removeUser(u)"
                  :disabled="loading"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td colspan="5" class="text-center py-8 text-muted">
                <div class="empty-state-icon">👤</div>
                <div class="empty-state-text">暂无用户</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { apiFetch } from "../services/api";
import { getAuthUser } from "../services/auth";

const users = ref([]);
const error = ref("");
const loading = ref(false);

const newUsername = ref("");
const newPassword = ref("");
const newRole = ref("coach");

async function loadUsers() {
  error.value = "";
  const user = getAuthUser();
  if (!user || user.role !== "admin") {
    error.value = "当前账号不是管理员";
    return;
  }
  try {
    const data = await apiFetch("/api/users");
    users.value = data.users || [];
  } catch (e) {
    error.value = String(e && e.message ? e.message : e);
  }
}

async function createUser() {
  if (!newUsername.value || !newPassword.value) {
    error.value = "用户名和密码不能为空";
    return;
  }
  loading.value = true;
  try {
    await apiFetch("/api/users", {
      method: "POST",
      body: JSON.stringify({
        username: newUsername.value,
        password: ***,
        role: newRole.value
      })
    });
    newUsername.value = "";
    newPassword.value = "";
    newRole.value = "coach";
    await loadUsers();
  } catch (e) {
    error.value = String(e && e.message ? e.message : e);
  } finally {
    loading.value = false;
  }
}

async function removeUser(u) {
  if (!confirm(`确定删除用户：${u.username}？`)) return;
  loading.value = true;
  try {
    await apiFetch(`/api/users/${u.id}`, { method: "DELETE" });
    await loadUsers();
  } catch (e) {
    error.value = String(e && e.message ? e.message : e);
  } finally {
    loading.value = false;
  }
}

onMounted(loadUsers);
</script>

