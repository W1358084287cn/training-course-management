<template>
  <div class="page">
    <div class="page-header">
      <h2 class="page-title">排课管理</h2>
      <div class="page-actions">
        <button class="btn btn-primary" @click="openAddSchedule">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          添加排课
        </button>
        <button class="btn btn-outline" @click="exportScheduleExcel">
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
          <input class="hidden" type="file" accept=".xlsx" @change="importScheduleExcel" />
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
      <div class="input-wrapper" style="max-width: 280px;">
        <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          class="input"
          style="padding-left: 36px;"
          placeholder="搜索排课（时间/班级）"
          v-model.trim="scheduleSearchText"
          @keyup.enter="applyScheduleSearch"
        />
      </div>
      <button class="btn btn-primary" @click="applyScheduleSearch">搜索</button>
      <button v-if="scheduleIsSearching" class="btn btn-outline" @click="clearScheduleSearch">
        退出搜索
      </button>
    </div>

    <div class="card overflow-hidden mb-6">
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>时间</th>
              <th v-for="d in days" :key="d.key">{{ d.label }}</th>
              <th style="width: 100px;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, idx) in filteredSchedule" :key="idx">
              <td class="font-medium">{{ row.time }}</td>
              <td
                v-for="d in days"
                :key="d.key"
                class="align-top"
              >
                <div v-if="row[d.key]">
                  <div class="font-medium">{{ row[d.key] }}</div>
                  <div class="text-xs text-muted mt-1" v-if="getStudentsText(row[d.key])">
                    {{ getStudentsText(row[d.key]) }}
                  </div>
                  <button
                    v-if="getClassName(row[d.key])"
                    class="btn btn-ghost btn-sm text-primary mt-1"
                    @click="openClassStudents(getClassName(row[d.key]))"
                  >
                    编辑学生
                  </button>
                </div>
                <div v-else class="text-muted">-</div>
              </td>
              <td>
                <div class="flex items-center gap-1">
                  <button
                    class="btn btn-ghost btn-sm"
                    @click="openEditSchedule(idx)"
                    title="编辑"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    class="btn btn-ghost btn-sm text-danger"
                    @click="removeSchedule(idx)"
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
            <tr v-if="filteredSchedule.length === 0">
              <td colspan="9" class="text-center py-8 text-muted">
                <div class="empty-state-icon">📅</div>
                <div class="empty-state-text">暂无数据</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="page-header mb-4">
      <h3 class="text-xl font-semibold">不确定情况</h3>
      <div class="page-actions">
        <div class="input-wrapper" style="max-width: 240px;">
          <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            class="input"
            style="padding-left: 36px;"
            placeholder="搜索（日期/姓名/课程）"
            v-model.trim="uncertainSearchText"
            @keyup.enter="applyUncertainSearch"
          />
        </div>
        <button class="btn btn-primary" @click="applyUncertainSearch">搜索</button>
        <button v-if="uncertainIsSearching" class="btn btn-outline" @click="clearUncertainSearch">
          退出搜索
        </button>
        <button class="btn btn-accent" @click="openAddUncertain">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          添加
        </button>
      </div>
    </div>
    <div class="card overflow-hidden mb-6">
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>日期</th>
              <th>时间</th>
              <th>姓名</th>
              <th>课程</th>
              <th>备注</th>
              <th style="width: 100px;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(u, idx) in filteredUncertain" :key="idx">
              <td>{{ u.date }}</td>
              <td>{{ u.time }}</td>
              <td>{{ u.name || "-" }}</td>
              <td class="font-medium">{{ u.course }}</td>
              <td class="text-secondary">{{ u.remark || "-" }}</td>
              <td>
                <div class="flex items-center gap-1">
                  <button
                    class="btn btn-ghost btn-sm"
                    @click="openEditUncertain(idx)"
                    title="编辑"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    class="btn btn-ghost btn-sm text-danger"
                    @click="removeUncertain(idx)"
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
            <tr v-if="filteredUncertain.length === 0">
              <td colspan="6" class="text-center py-8 text-muted">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">暂无数据</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="page-header mb-4">
      <h3 class="text-xl font-semibold">不定时上课</h3>
      <div class="page-actions">
        <div class="input-wrapper" style="max-width: 240px;">
          <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            class="input"
            style="padding-left: 36px;"
            placeholder="搜索（日期/姓名/课程）"
            v-model.trim="irregularSearchText"
            @keyup.enter="applyIrregularSearch"
          />
        </div>
        <button class="btn btn-primary" @click="applyIrregularSearch">搜索</button>
        <button v-if="irregularIsSearching" class="btn btn-outline" @click="clearIrregularSearch">
          退出搜索
        </button>
        <button class="btn btn-accent" @click="openAddIrregular">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          添加
        </button>
      </div>
    </div>
    <div class="card overflow-hidden">
      <div class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>日期</th>
              <th>时间</th>
              <th>姓名</th>
              <th>课程</th>
              <th>备注</th>
              <th style="width: 100px;">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(u, idx) in filteredIrregular" :key="idx">
              <td>{{ u.date }}</td>
              <td>{{ u.time }}</td>
              <td>{{ u.name || "-" }}</td>
              <td class="font-medium">{{ u.course }}</td>
              <td class="text-secondary">{{ u.remark || "-" }}</td>
              <td>
                <div class="flex items-center gap-1">
                  <button
                    class="btn btn-ghost btn-sm"
                    @click="openEditIrregular(idx)"
                    title="编辑"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    class="btn btn-ghost btn-sm text-danger"
                    @click="removeIrregular(idx)"
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
            <tr v-if="filteredIrregular.length === 0">
              <td colspan="6" class="text-center py-8 text-muted">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">暂无数据</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="showScheduleModal" class="modal-overlay" @click.self="closeScheduleModal">
      <div class="modal" style="max-width: 800px;">
        <div class="modal-header">
          <h3>{{ scheduleModalMode === "add" ? "添加排课" : "编辑排课" }}</h3>
          <button class="btn btn-ghost btn-sm" @click="closeScheduleModal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form class="modal-body" @submit.prevent="submitSchedule">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">时间</label>
              <input class="input" v-model.trim="scheduleForm.time" required />
            </div>
            <div v-for="d in days" :key="d.key">
              <label class="form-label">{{ d.label }}</label>
              <input class="input" v-model.trim="scheduleForm[d.key]" />
            </div>
          </div>
        </form>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" @click="closeScheduleModal">取消</button>
          <button type="submit" class="btn btn-primary" @click="submitSchedule">保存</button>
        </div>
      </div>
    </div>

    <div v-if="showStudentsModal" class="modal-overlay" @click.self="closeStudentsModal">
      <div class="modal">
        <div class="modal-header">
          <h3>编辑学生：{{ editingClassName }}</h3>
          <button class="btn btn-ghost btn-sm" @click="closeStudentsModal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="text-sm text-secondary mb-3">每行一个学生姓名</div>
          <textarea class="input" rows="10" v-model="studentsText" />
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" @click="closeStudentsModal">取消</button>
          <button class="btn btn-primary" @click="saveStudents">保存</button>
        </div>
      </div>
    </div>

    <div v-if="showUncertainModal" class="modal-overlay" @click.self="closeUncertainModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ uncertainModalMode === "add" ? "添加不确定情况" : "编辑不确定情况" }}</h3>
          <button class="btn btn-ghost btn-sm" @click="closeUncertainModal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form class="modal-body" @submit.prevent="submitUncertain">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">日期</label>
              <input class="input" type="date" v-model="uncertainForm.date" required />
            </div>
            <div>
              <label class="form-label">时间</label>
              <input class="input" v-model.trim="uncertainForm.time" required />
            </div>
          </div>
          <div>
            <label class="form-label">姓名</label>
            <input class="input" v-model.trim="uncertainForm.name" />
          </div>
          <div>
            <label class="form-label">课程</label>
            <input class="input" v-model.trim="uncertainForm.course" required />
          </div>
          <div>
            <label class="form-label">备注</label>
            <textarea class="input" rows="3" v-model.trim="uncertainForm.remark" />
          </div>
        </form>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" @click="closeUncertainModal">取消</button>
          <button type="submit" class="btn btn-primary" @click="submitUncertain">保存</button>
        </div>
      </div>
    </div>

    <div v-if="showIrregularModal" class="modal-overlay" @click.self="closeIrregularModal">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ irregularModalMode === "add" ? "添加不定时上课" : "编辑不定时上课" }}</h3>
          <button class="btn btn-ghost btn-sm" @click="closeIrregularModal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form class="modal-body" @submit.prevent="submitIrregular">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="form-label">日期</label>
              <input class="input" type="date" v-model="irregularForm.date" required />
            </div>
            <div>
              <label class="form-label">时间</label>
              <input class="input" v-model.trim="irregularForm.time" required />
            </div>
          </div>
          <div>
            <label class="form-label">姓名</label>
            <input class="input" v-model.trim="irregularForm.name" />
          </div>
          <div>
            <label class="form-label">课程</label>
            <input class="input" v-model.trim="irregularForm.course" required />
          </div>
          <div>
            <label class="form-label">备注</label>
            <textarea class="input" rows="3" v-model.trim="irregularForm.remark" />
          </div>
        </form>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" @click="closeIrregularModal">取消</button>
          <button type="submit" class="btn btn-primary" @click="submitIrregular">保存</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAppState } from "../stores/appState";

const router = useRouter();
const { state, load, saveDebounced } = useAppState();

const days = [
  { key: "monday", label: "周一" },
  { key: "tuesday", label: "周二" },
  { key: "wednesday", label: "周三" },
  { key: "thursday", label: "周四" },
  { key: "friday", label: "周五" },
  { key: "saturday", label: "周六" },
  { key: "sunday", label: "周日" }
];

const scheduleSearchText = ref("");
const appliedScheduleSearchText = ref("");
const scheduleIsSearching = computed(() => Boolean(appliedScheduleSearchText.value));

const uncertainSearchText = ref("");
const appliedUncertainSearchText = ref("");
const uncertainIsSearching = computed(() => Boolean(appliedUncertainSearchText.value));

const irregularSearchText = ref("");
const appliedIrregularSearchText = ref("");
const irregularIsSearching = computed(() => Boolean(appliedIrregularSearchText.value));

const filteredSchedule = computed(() => {
  const list = state.schedule || [];
  if (!appliedScheduleSearchText.value) return list;
  const kw = appliedScheduleSearchText.value.toLowerCase();
  return list.filter((row) => {
    if (String(row.time || "").toLowerCase().includes(kw)) return true;
    return days.some((d) => String(row[d.key] || "").toLowerCase().includes(kw));
  });
});

const filteredUncertain = computed(() => {
  const list = state.uncertain || [];
  if (!appliedUncertainSearchText.value) return list;
  const kw = appliedUncertainSearchText.value.toLowerCase();
  return list.filter((u) => {
    return (
      String(u.date || "").toLowerCase().includes(kw) ||
      String(u.time || "").toLowerCase().includes(kw) ||
      String(u.name || "").toLowerCase().includes(kw) ||
      String(u.course || "").toLowerCase().includes(kw)
    );
  });
});

const filteredIrregular = computed(() => {
  const list = state.irregular || [];
  if (!appliedIrregularSearchText.value) return list;
  const kw = appliedIrregularSearchText.value.toLowerCase();
  return list.filter((u) => {
    return (
      String(u.date || "").toLowerCase().includes(kw) ||
      String(u.time || "").toLowerCase().includes(kw) ||
      String(u.name || "").toLowerCase().includes(kw) ||
      String(u.course || "").toLowerCase().includes(kw)
    );
  });
});

function applyScheduleSearch() {
  appliedScheduleSearchText.value = scheduleSearchText.value;
}
function clearScheduleSearch() {
  scheduleSearchText.value = "";
  appliedScheduleSearchText.value = "";
}
function applyUncertainSearch() {
  appliedUncertainSearchText.value = uncertainSearchText.value;
}
function clearUncertainSearch() {
  uncertainSearchText.value = "";
  appliedUncertainSearchText.value = "";
}
function applyIrregularSearch() {
  appliedIrregularSearchText.value = irregularSearchText.value;
}
function clearIrregularSearch() {
  irregularSearchText.value = "";
  appliedIrregularSearchText.value = "";
}

function getClassName(classInfo) {
  if (!classInfo) return "";
  return String(classInfo).replace(/\s+\d+:\d+/, "").trim();
}

function getStudentsText(classInfo) {
  const className = getClassName(classInfo);
  if (!className) return "";
  const students = state.classStudents[className] || [];
  return students.length > 0 ? students.join("、") : "";
}

const showScheduleModal = ref(false);
const scheduleModalMode = ref("add");
const editingScheduleIndex = ref(-1);
const scheduleForm = reactive({
  time: "",
  monday: "",
  tuesday: "",
  wednesday: "",
  thursday: "",
  friday: "",
  saturday: "",
  sunday: ""
});

function resetScheduleForm() {
  scheduleForm.time = "";
  for (const d of days) scheduleForm[d.key] = "";
}

function openAddSchedule() {
  scheduleModalMode.value = "add";
  editingScheduleIndex.value = -1;
  resetScheduleForm();
  showScheduleModal.value = true;
}

function openEditSchedule(index) {
  const row = filteredSchedule.value[index];
  if (!row) return;
  scheduleModalMode.value = "edit";
  editingScheduleIndex.value = index;
  scheduleForm.time = row.time || "";
  for (const d of days) scheduleForm[d.key] = row[d.key] || "";
  showScheduleModal.value = true;
}

function closeScheduleModal() {
  showScheduleModal.value = false;
}

function submitSchedule() {
  const next = { time: scheduleForm.time };
  for (const d of days) next[d.key] = scheduleForm[d.key] || "";

  if (scheduleModalMode.value === "add") {
    state.schedule.push(next);
  } else {
    const row = filteredSchedule.value[editingScheduleIndex.value];
    const idx = state.schedule.indexOf(row);
    if (idx >= 0) state.schedule[idx] = next;
  }
  saveDebounced();
  closeScheduleModal();
}

function removeSchedule(index) {
  if (!confirm("确定要删除这个排课吗？")) return;
  const row = filteredSchedule.value[index];
  const idx = state.schedule.indexOf(row);
  if (idx >= 0) state.schedule.splice(idx, 1);
  saveDebounced();
}

const showStudentsModal = ref(false);
const editingClassName = ref("");
const studentsText = ref("");

function openClassStudents(className) {
  editingClassName.value = className;
  const students = state.classStudents[className] || [];
  studentsText.value = students.join("\n");
  showStudentsModal.value = true;
}

function closeStudentsModal() {
  showStudentsModal.value = false;
}

function saveStudents() {
  const lines = studentsText.value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  state.classStudents[editingClassName.value] = lines;
  saveDebounced();
  closeStudentsModal();
}

const showUncertainModal = ref(false);
const uncertainModalMode = ref("add");
const editingUncertainIndex = ref(-1);
const uncertainForm = reactive({ date: "", time: "", name: "", course: "", remark: "" });

function resetUncertainForm() {
  uncertainForm.date = "";
  uncertainForm.time = "";
  uncertainForm.name = "";
  uncertainForm.course = "";
  uncertainForm.remark = "";
}

function openAddUncertain() {
  uncertainModalMode.value = "add";
  editingUncertainIndex.value = -1;
  resetUncertainForm();
  uncertainForm.date = new Date().toISOString().split("T")[0];
  showUncertainModal.value = true;
}

function openEditUncertain(index) {
  const row = filteredUncertain.value[index];
  if (!row) return;
  uncertainModalMode.value = "edit";
  editingUncertainIndex.value = index;
  uncertainForm.date = row.date || "";
  uncertainForm.time = row.time || "";
  uncertainForm.name = row.name || "";
  uncertainForm.course = row.course || "";
  uncertainForm.remark = row.remark || "";
  showUncertainModal.value = true;
}

function closeUncertainModal() {
  showUncertainModal.value = false;
}

function submitUncertain() {
  const next = {
    date: uncertainForm.date,
    time: uncertainForm.time,
    name: uncertainForm.name || "",
    course: uncertainForm.course,
    remark: uncertainForm.remark || ""
  };
  if (uncertainModalMode.value === "add") {
    state.uncertain.push(next);
  } else {
    const row = filteredUncertain.value[editingUncertainIndex.value];
    const idx = state.uncertain.indexOf(row);
    if (idx >= 0) state.uncertain[idx] = next;
  }
  saveDebounced();
  closeUncertainModal();
}

function removeUncertain(index) {
  if (!confirm("确定要删除这个不确定情况吗？")) return;
  const row = filteredUncertain.value[index];
  const idx = state.uncertain.indexOf(row);
  if (idx >= 0) state.uncertain.splice(idx, 1);
  saveDebounced();
}

const showIrregularModal = ref(false);
const irregularModalMode = ref("add");
const editingIrregularIndex = ref(-1);
const irregularForm = reactive({ date: "", time: "", name: "", course: "", remark: "" });

function resetIrregularForm() {
  irregularForm.date = "";
  irregularForm.time = "";
  irregularForm.name = "";
  irregularForm.course = "";
  irregularForm.remark = "";
}

function openAddIrregular() {
  irregularModalMode.value = "add";
  editingIrregularIndex.value = -1;
  resetIrregularForm();
  irregularForm.date = new Date().toISOString().split("T")[0];
  showIrregularModal.value = true;
}

function openEditIrregular(index) {
  const row = filteredIrregular.value[index];
  if (!row) return;
  irregularModalMode.value = "edit";
  editingIrregularIndex.value = index;
  irregularForm.date = row.date || "";
  irregularForm.time = row.time || "";
  irregularForm.name = row.name || "";
  irregularForm.course = row.course || "";
  irregularForm.remark = row.remark || "";
  showIrregularModal.value = true;
}

function closeIrregularModal() {
  showIrregularModal.value = false;
}

function submitIrregular() {
  const next = {
    date: irregularForm.date,
    time: irregularForm.time,
    name: irregularForm.name || "",
    course: irregularForm.course,
    remark: irregularForm.remark || ""
  };
  if (irregularModalMode.value === "add") {
    state.irregular.push(next);
  } else {
    const row = filteredIrregular.value[editingIrregularIndex.value];
    const idx = state.irregular.indexOf(row);
    if (idx >= 0) state.irregular[idx] = next;
  }
  saveDebounced();
  closeIrregularModal();
}

function removeIrregular(index) {
  if (!confirm("确定要删除这个不定时上课吗？")) return;
  const row = filteredIrregular.value[index];
  const idx = state.irregular.indexOf(row);
  if (idx >= 0) state.irregular.splice(idx, 1);
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

function exportScheduleExcel() {
  const XLSX = getXlsx();
  if (!XLSX) return;

  const wb = XLSX.utils.book_new();
  const wsSchedule = XLSX.utils.json_to_sheet(cleanData(state.schedule));
  const wsUncertain = XLSX.utils.json_to_sheet(cleanData(state.uncertain));
  const wsIrregular = XLSX.utils.json_to_sheet(cleanData(state.irregular));

  XLSX.utils.book_append_sheet(wb, wsSchedule, "排课表");
  XLSX.utils.book_append_sheet(wb, wsUncertain, "不确定情况");
  XLSX.utils.book_append_sheet(wb, wsIrregular, "不定时上课");

  XLSX.writeFile(wb, "排课管理.xlsx");
}

function importScheduleExcel(e) {
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
    let importCount = 0;

    workbook.SheetNames.forEach((sheetName) => {
      const worksheet = workbook.Sheets[sheetName];
      const importedData = XLSX.utils.sheet_to_json(worksheet);
      if (!importedData || importedData.length === 0) return;
      const keys = Object.keys(importedData[0]);

      if (sheetName.includes("排课") || (keys.includes("time") && keys.includes("monday"))) {
        state.schedule = importedData.map((item) => {
          const processed = {};
          for (const k in item) processed[k] = item[k] === undefined || item[k] === null ? "" : item[k];
          return processed;
        });
        importCount++;
      } else if (sheetName.includes("不确定") || (keys.includes("date") && keys.includes("course"))) {
        state.uncertain = importedData
          .map((item) => {
            const processed = {};
            for (const k in item) processed[k] = item[k] === undefined || item[k] === null ? "" : item[k];
            return processed;
          })
          .filter((item) => item.date);
        importCount++;
      } else if (
        sheetName.includes("不定时") ||
        (keys.includes("date") && keys.includes("time") && keys.includes("course"))
      ) {
        state.irregular = importedData
          .map((item) => {
            const processed = {};
            for (const k in item) processed[k] = item[k] === undefined || item[k] === null ? "" : item[k];
            return processed;
          })
          .filter((item) => item.date);
        importCount++;
      }
    });

    if (importCount > 0) {
      saveDebounced();
      alert(`成功导入${importCount}个工作表的数据！`);
    } else {
      alert("未找到有效的数据工作表，请检查Excel文件格式。");
    }
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

