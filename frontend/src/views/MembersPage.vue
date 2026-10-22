<template>
  <div class="page">
    <div class="page-header">
      <div class="flex items-center gap-3">
        <h2 class="page-title">
          {{ activeActivity ? `活动会员：${activeActivity}` : "会员列表" }}
        </h2>
        <button
          v-if="activeActivity"
          class="btn btn-outline btn-sm"
          @click="activeActivity = ''"
        >
          返回全部
        </button>
      </div>
      <div class="page-actions">
        <button class="btn btn-accent" @click="showActivityModal = true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
          </svg>
          活动管理
        </button>
        <button class="btn btn-primary" @click="openAddMember()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          添加会员
        </button>
        <button class="btn btn-outline" @click="exportMembers">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          导出
        </button>
        <label class="btn btn-outline cursor-pointer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          导入
          <input class="hidden" type="file" accept=".xlsx" @change="importMembers" />
        </label>
        <button class="btn btn-outline" @click="location.reload()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/>
            <polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          刷新
        </button>
      </div>
    </div>

    <div class="toolbar">
      <div class="flex items-center gap-2 flex-wrap flex-1">
        <div class="input-wrapper" style="max-width: 240px;">
          <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            class="input"
            style="padding-left: 36px;"
            placeholder="按姓名搜索"
            v-model.trim="searchText"
            @keyup.enter="applySearch"
          />
        </div>
        <button class="btn btn-primary" @click="applySearch">搜索</button>
        <button
          v-if="isSearching"
          class="btn btn-outline"
          @click="clearSearch"
        >
          退出搜索
        </button>
      </div>

      <div class="flex items-center gap-2">
        <select
          class="input"
          style="width: auto; min-width: 140px;"
          v-model="activeActivity"
        >
          <option value="">全部会员</option>
          <option v-for="a in activities" :key="a" :value="a">{{ a }}</option>
        </select>
      </div>
    </div>

    <div
      class="card mb-4 cursor-pointer select-none"
      @click="expiryOpen = !expiryOpen"
    >
      <div class="flex items-center justify-between p-4">
        <div class="flex items-center gap-3">
          <div class="flex items-center justify-center w-8 h-8 rounded-lg" :class="expiringMembers.length > 0 ? 'bg-warning-light' : 'bg-gray-100'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :stroke="expiringMembers.length > 0 ? '#f59e0b' : '#9ca3af'" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <div class="font-medium">
              到期提醒
              <span class="badge" :class="expiringMembers.length > 0 ? 'badge-warning' : 'badge-gray'">{{ expiringMembers.length }}</span>
            </div>
            <div class="text-xs text-muted">
              30天内到期或已到期
            </div>
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'rotate-180': expiryOpen }" style="transition: transform 0.2s;">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>
      <div v-if="expiryOpen" class="px-4 pb-4 space-y-2">
        <div
          v-for="m in expiringMembers"
          :key="m._key"
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 p-3 border border-border rounded-lg"
        >
          <div class="flex items-center gap-3">
            <div class="font-medium">{{ m.name }}</div>
            <span class="badge badge-primary">{{ m.cardType }}</span>
          </div>
          <div class="flex items-center gap-4 text-sm">
            <div class="text-secondary">到期：{{ m.endDate }}</div>
            <div
              class="font-medium"
              :class="m._daysLeft <= 0 ? 'text-danger' : 'text-warning'"
            >
              {{ m._daysLeft <= 0 ? `已到期${Math.abs(m._daysLeft)}天` : `剩余${m._daysLeft}天` }}
            </div>
            <div class="text-secondary">剩余课时：{{ m.remainingClasses }}</div>
          </div>
        </div>
        <div v-if="expiringMembers.length === 0" class="text-sm text-muted text-center py-4">
          暂无到期提醒
        </div>
      </div>
    </div>

    <div class="card overflow-hidden">
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>卡型</th>
              <th>开始</th>
              <th>到期</th>
              <th>总课时</th>
              <th>剩余</th>
              <th>备注</th>
              <th style="width: 120px;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(m, idx) in pagedMembers"
              :key="idx"
            >
              <td class="font-medium">{{ m.name }}</td>
              <td><span class="badge badge-primary">{{ m.cardType }}</span></td>
              <td>{{ m.startDate }}</td>
              <td>{{ m.endDate }}</td>
              <td>{{ m.totalClasses }}</td>
              <td>{{ m.remainingClasses }}</td>
              <td class="text-secondary">{{ m.remark || "-" }}</td>
              <td>
                <div class="flex items-center gap-1">
                  <button
                    class="btn btn-ghost btn-sm"
                    @click="openEditMember(idx)"
                    title="编辑"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    class="btn btn-ghost btn-sm"
                    @click="openRenewMember(idx)"
                    title="续费"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="23 4 23 10 17 10"/>
                      <polyline points="1 20 1 14 7 14"/>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                    </svg>
                  </button>
                  <button
                    class="btn btn-ghost btn-sm text-danger"
                    @click="removeMember(idx)"
                    title="删除"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="pagedMembers.length === 0">
              <td colspan="8" class="text-center py-8 text-muted">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">暂无数据</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="pagination">
      <div class="pagination-info">
        共 {{ filteredMembers.length }} 条
      </div>
      <div class="pagination-controls">
        <button class="btn btn-outline btn-sm" :disabled="page <= 1" @click="page--">
          上一页
        </button>
        <span class="text-sm text-secondary px-3">第 {{ page }} / {{ totalPages }} 页</span>
        <button class="btn btn-outline btn-sm" :disabled="page >= totalPages" @click="page++">
          下一页
        </button>
      </div>
    </div>

    <div v-if="showMemberModal" class="modal-overlay" @click.self="closeMemberModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ memberModalMode === "add" ? "添加会员" : "编辑会员" }}</h3>
          <button class="btn btn-ghost btn-sm" @click="closeMemberModal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form class="modal-body" @submit.prevent="submitMember">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">姓名</label>
              <input class="input" v-model.trim="memberForm.name" required />
            </div>
            <div>
              <label class="form-label">卡型</label>
              <select class="input" v-model="memberForm.cardType" required>
                <option value="课时年卡">课时年卡</option>
                <option value="课时半年">课时半年</option>
                <option value="课时季度">课时季度</option>
                <option value="年卡">年卡</option>
                <option v-for="a in activities" :key="a" :value="a">{{ a }}</option>
              </select>
            </div>
            <div>
              <label class="form-label">年龄</label>
              <input class="input" v-model.trim="memberForm.age" />
            </div>
            <div>
              <label class="form-label">开始日期</label>
              <input class="input" type="date" v-model="memberForm.startDate" required />
            </div>
            <div>
              <label class="form-label">到期日期</label>
              <input class="input" type="date" v-model="memberForm.endDate" required />
            </div>
            <div>
              <label class="form-label">总课时</label>
              <input class="input" type="number" v-model.number="memberForm.totalClasses" required />
            </div>
            <div>
              <label class="form-label">剩余课时</label>
              <input class="input" type="number" v-model.number="memberForm.remainingClasses" required />
            </div>
            <div class="md:col-span-2">
              <label class="form-label">备注</label>
              <textarea class="input" rows="3" v-model.trim="memberForm.remark" />
            </div>
          </div>
        </form>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" @click="closeMemberModal">取消</button>
          <button type="submit" class="btn btn-primary" @click="submitMember">保存</button>
        </div>
      </div>
    </div>

    <div v-if="showRenewModal" class="modal-overlay" @click.self="closeRenewModal">
      <div class="modal" style="max-width: 400px;">
        <div class="modal-header">
          <h3>会员续费</h3>
          <button class="btn btn-ghost btn-sm" @click="closeRenewModal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form class="modal-body" @submit.prevent="submitRenew">
          <div class="mb-4">
            <div class="text-sm font-medium">{{ renewingMember?.name }}</div>
            <div class="text-xs text-muted">{{ renewingMember?.cardType }}</div>
          </div>
          <div class="space-y-4">
            <div>
              <label class="form-label">到期日期</label>
              <input class="input" type="date" v-model="renewForm.endDate" required />
            </div>
            <div>
              <label class="form-label">总课时</label>
              <input class="input" type="number" v-model.number="renewForm.totalClasses" required />
            </div>
            <div>
              <label class="form-label">剩余课时</label>
              <input class="input" type="number" v-model.number="renewForm.remainingClasses" required />
            </div>
          </div>
        </form>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" @click="closeRenewModal">取消</button>
          <button type="submit" class="btn btn-primary" @click="submitRenew">保存</button>
        </div>
      </div>
    </div>

    <div v-if="showActivityModal" class="modal-overlay" @click.self="showActivityModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>活动管理</h3>
          <button class="btn btn-ghost btn-sm" @click="showActivityModal = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="space-y-2 mb-4">
            <div
              v-for="(a, idx) in activities"
              :key="a"
              class="flex items-center justify-between p-2 border border-border rounded-lg"
            >
              <input
                class="input flex-1"
                v-model.trim="activities[idx]"
                @focus="activityRenameOld = activities[idx]"
                @change="renameActivity(idx)"
              />
              <button class="btn btn-ghost btn-sm text-danger ml-2" @click="deleteActivity(idx)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="flex gap-2">
            <input
              class="input flex-1"
              placeholder="输入活动名称"
              v-model.trim="newActivityName"
            />
            <button class="btn btn-primary" @click="addActivity">添加</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAppState } from "../stores/appState";

const router = useRouter();
const { state, load, saveDebounced } = useAppState();

const pageSize = 10;
const page = ref(1);
const searchText = ref("");
const appliedSearchText = ref("");
const activeActivity = ref("");

const showMemberModal = ref(false);
const memberModalMode = ref("add");
const editingIndex = ref(-1);
const memberForm = reactive({
  name: "",
  cardType: "课时年卡",
  age: "",
  startDate: "",
  endDate: "",
  totalClasses: 0,
  remainingClasses: 0,
  remark: ""
});

const showRenewModal = ref(false);
const renewingIndex = ref(-1);
const renewForm = reactive({
  endDate: "",
  totalClasses: 0,
  remainingClasses: 0
});

const showActivityModal = ref(false);
const newActivityName = ref("");
const activityRenameOld = ref("");

const activities = computed({
  get: () => state.activities,
  set: (v) => {
    state.activities = v;
    saveDebounced();
  }
});

const currentList = computed(() => {
  if (activeActivity.value) {
    return state.activityMembers[activeActivity.value] || [];
  }
  return state.members;
});

const isSearching = computed(() => Boolean(appliedSearchText.value));

const filteredMembers = computed(() => {
  const list = currentList.value || [];
  if (!appliedSearchText.value) return list;
  const kw = appliedSearchText.value.toLowerCase();
  return list.filter((m) => String(m.name || "").toLowerCase().includes(kw));
});

const expiryOpen = ref(false);

function getDaysDiff(endDateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let endDate;
  const value = String(endDateStr || "");
  if (value.includes("-")) {
    if (value.split("-").length === 2) {
      const parts = value.split("-");
      endDate = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
    } else {
      endDate = new Date(value);
    }
  } else if (value.includes("/")) {
    const parts = value.split("/");
    endDate = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  } else if (value.includes("、")) {
    const parts = value.split("、");
    endDate = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);
  } else {
    endDate = new Date(value);
  }

  if (isNaN(endDate.getTime())) return 9999;
  endDate.setHours(0, 0, 0, 0);
  const diffTime = endDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

const expiringMembers = computed(() => {
  const list = currentList.value || [];
  return list
    .map((m, idx) => ({
      ...m,
      _daysLeft: getDaysDiff(m.endDate),
      _key: `${activeActivity.value || "all"}_${idx}_${m.name || ""}`
    }))
    .filter((m) => m._daysLeft <= 30)
    .sort((a, b) => a._daysLeft - b._daysLeft);
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredMembers.value.length / pageSize)));

const pagedMembers = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredMembers.value.slice(start, start + pageSize);
});

watch([filteredMembers, activeActivity], () => {
  page.value = 1;
});

function applySearch() {
  appliedSearchText.value = searchText.value;
  page.value = 1;
}

function clearSearch() {
  searchText.value = "";
  appliedSearchText.value = "";
  page.value = 1;
}

function resetMemberForm() {
  memberForm.name = "";
  memberForm.cardType = "课时年卡";
  memberForm.age = "";
  memberForm.startDate = "";
  memberForm.endDate = "";
  memberForm.totalClasses = 0;
  memberForm.remainingClasses = 0;
  memberForm.remark = "";
}

function openAddMember() {
  memberModalMode.value = "add";
  editingIndex.value = -1;
  resetMemberForm();
  if (activeActivity.value) {
    memberForm.cardType = activeActivity.value;
  }
  const today = new Date();
  memberForm.startDate = today.toISOString().split("T")[0];
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);
  memberForm.endDate = nextYear.toISOString().split("T")[0];
  showMemberModal.value = true;
}

function openEditMember(pageIndex) {
  const baseIndex = (page.value - 1) * pageSize + pageIndex;
  const m = filteredMembers.value[baseIndex];
  if (!m) return;
  memberModalMode.value = "edit";
  editingIndex.value = baseIndex;
  memberForm.name = m.name || "";
  memberForm.cardType = m.cardType || "";
  memberForm.age = m.age || "";
  memberForm.startDate = m.startDate || "";
  memberForm.endDate = m.endDate || "";
  memberForm.totalClasses = Number(m.totalClasses || 0);
  memberForm.remainingClasses = Number(m.remainingClasses || 0);
  memberForm.remark = m.remark || "";
  showMemberModal.value = true;
}

function closeMemberModal() {
  showMemberModal.value = false;
}

function submitMember() {
  const targetList = activeActivity.value
    ? (state.activityMembers[activeActivity.value] || (state.activityMembers[activeActivity.value] = []))
    : state.members;

  const next = {
    name: memberForm.name,
    cardType: memberForm.cardType,
    age: memberForm.age || "",
    startDate: memberForm.startDate,
    endDate: memberForm.endDate,
    totalClasses: Number(memberForm.totalClasses || 0),
    remainingClasses: Number(memberForm.remainingClasses || 0),
    remark: memberForm.remark || ""
  };

  if (memberModalMode.value === "add") {
    targetList.push(next);
  } else {
    const idx = editingIndex.value;
    if (idx >= 0 && idx < filteredMembers.value.length) {
      const original = filteredMembers.value[idx];
      const originalIdx = targetList.indexOf(original);
      if (originalIdx >= 0) targetList[originalIdx] = next;
    }
  }

  saveDebounced();
  closeMemberModal();
}

function removeMember(pageIndex) {
  if (!confirm("确定要删除该会员吗？")) return;
  const baseIndex = (page.value - 1) * pageSize + pageIndex;
  const targetList = activeActivity.value
    ? (state.activityMembers[activeActivity.value] || [])
    : state.members;
  const m = filteredMembers.value[baseIndex];
  if (!m) return;
  const idx = targetList.indexOf(m);
  if (idx >= 0) targetList.splice(idx, 1);
  saveDebounced();
}

const renewingMember = computed(() => {
  const m = filteredMembers.value[renewingIndex.value];
  return m || null;
});

function openRenewMember(pageIndex) {
  const baseIndex = (page.value - 1) * pageSize + pageIndex;
  const m = filteredMembers.value[baseIndex];
  if (!m) return;
  renewingIndex.value = baseIndex;
  renewForm.endDate = m.endDate || "";
  renewForm.totalClasses = Number(m.totalClasses || 0);
  renewForm.remainingClasses = Number(m.remainingClasses || 0);
  showRenewModal.value = true;
}

function closeRenewModal() {
  showRenewModal.value = false;
}

function submitRenew() {
  const idx = renewingIndex.value;
  const m = filteredMembers.value[idx];
  if (!m) return;

  const targetList = activeActivity.value
    ? (state.activityMembers[activeActivity.value] || [])
    : state.members;
  const originalIdx = targetList.indexOf(m);
  if (originalIdx < 0) return;

  targetList[originalIdx] = {
    ...m,
    endDate: renewForm.endDate,
    totalClasses: Number(renewForm.totalClasses || 0),
    remainingClasses: Number(renewForm.remainingClasses || 0)
  };
  saveDebounced();
  closeRenewModal();
}

function addActivity() {
  if (!newActivityName.value.trim()) return;
  const name = newActivityName.value.trim();
  if (!state.activities.includes(name)) {
    state.activities.push(name);
  }
  newActivityName.value = "";
  saveDebounced();
}

function deleteActivity(idx) {
  const name = state.activities[idx];
  if (!confirm(`确定删除活动：${name}？`)) return;
  state.activities.splice(idx, 1);
  if (state.activityMembers[name]) {
    delete state.activityMembers[name];
  }
  if (activeActivity.value === name) activeActivity.value = "";
  saveDebounced();
}

function renameActivity(idx) {
  const oldName = String(activityRenameOld.value || "").trim();
  const newName = String(state.activities[idx] || "").trim();

  if (!newName) {
    if (oldName) state.activities[idx] = oldName;
    return;
  }

  const dup = state.activities.findIndex((a, i) => i !== idx && String(a || "").trim() === newName);
  if (dup >= 0) {
    alert("活动名称重复，请换一个名称。");
    if (oldName) state.activities[idx] = oldName;
    return;
  }

  if (oldName && oldName !== newName) {
    if (state.activityMembers[oldName]) {
      const list = state.activityMembers[oldName] || [];
      delete state.activityMembers[oldName];
      state.activityMembers[newName] = list.map((m) => ({
        ...m,
        cardType: m.cardType === oldName ? newName : m.cardType
      }));
    }
    state.members = state.members.map((m) => ({
      ...m,
      cardType: m.cardType === oldName ? newName : m.cardType
    }));
    if (activeActivity.value === oldName) activeActivity.value = newName;
  }

  saveActivities();
}

function saveActivities() {
  state.activities = state.activities.map((a) => String(a || "").trim()).filter(Boolean);
  saveDebounced();
}

function getXlsx() {
  const xlsx = window.XLSX;
  if (!xlsx) {
    alert("XLSX 未加载，请检查网络或稍后重试。");
    return null;
  }
  return xlsx;
}

function cleanData(data) {
  return (data || []).map((item) => {
    const cleaned = {};
    for (const key in item) {
      const value = item[key];
      if (value === null || value === undefined) cleaned[key] = "";
      else if (typeof value === "number" && (isNaN(value) || !isFinite(value))) cleaned[key] = "无数据";
      else cleaned[key] = value;
    }
    return cleaned;
  });
}

function exportMembers() {
  const XLSX = getXlsx();
  if (!XLSX) return;
  const data = cleanData(filteredMembers.value);
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, activeActivity.value ? `活动_${activeActivity.value}` : "会员表");
  XLSX.writeFile(wb, activeActivity.value ? `活动会员_${activeActivity.value}.xlsx` : "会员表.xlsx");
}

function importMembers(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = "";
  if (!file) return;
  if (!file.name.endsWith(".xlsx")) {
    alert("请选择xlsx后缀的Excel文件！");
    return;
  }
  const XLSX = getXlsx();
  if (!XLSX) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const data = new Uint8Array(ev.target.result);
    const workbook = XLSX.read(data, { type: "array" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const importedData = XLSX.utils.sheet_to_json(worksheet);
    if (!importedData || importedData.length === 0) return;

    const keys = Object.keys(importedData[0]);
    const requiredKeys = ["name", "cardType", "startDate", "endDate", "totalClasses", "remainingClasses"];
    const ok = requiredKeys.every((k) => keys.includes(k));
    if (!ok) {
      alert("导入的Excel文件格式不正确，请确保包含所有必要字段。");
      return;
    }

    const processed = importedData
      .map((item) => ({
        name: item.name || "",
        cardType: item.cardType || "",
        age: item.age || "",
        startDate: item.startDate || "",
        endDate: item.endDate || "",
        totalClasses: item.totalClasses || 0,
        remainingClasses: item.remainingClasses || 0,
        remark: item.remark || ""
      }))
      .filter((m) => m.name);

    if (activeActivity.value) {
      state.activityMembers[activeActivity.value] = processed;
    } else {
      state.members = processed;
    }
    saveDebounced();
    alert("会员数据导入成功！");
  };
  reader.readAsArrayBuffer(file);
}

onMounted(async () => {
  try {
    await load();
  } catch (e) {
    alert(String(e && e.message ? e.message : e));
    router.push("/login");
  }
});
</script>
