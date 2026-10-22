import { reactive } from "vue";
import { apiFetch } from "../services/api";
import { clearAuth } from "../services/auth";

const state = reactive({
  loaded: false,
  loading: false,
  saving: false,
  members: [],
  activityMembers: {},
  activities: [],
  schedule: [],
  uncertain: [],
  irregular: [],
  classStudents: {}
});

function normalizeState(input) {
  const s = input || {};
  return {
    members: Array.isArray(s.members) ? s.members : [],
    activityMembers:
      s.activityMembers && typeof s.activityMembers === "object" ? s.activityMembers : {},
    activities: Array.isArray(s.activities) ? s.activities : [],
    schedule: Array.isArray(s.schedule) ? s.schedule : [],
    uncertain: Array.isArray(s.uncertain) ? s.uncertain : [],
    irregular: Array.isArray(s.irregular) ? s.irregular : [],
    classStudents:
      s.classStudents && typeof s.classStudents === "object" ? s.classStudents : {}
  };
}

function applyState(next) {
  const n = normalizeState(next);
  state.members = n.members;
  state.activityMembers = n.activityMembers;
  state.activities = n.activities;
  state.schedule = n.schedule;
  state.uncertain = n.uncertain;
  state.irregular = n.irregular;
  state.classStudents = n.classStudents;
}

let saveTimer = null;

async function load() {
  if (state.loaded) return;
  if (state.loading) return;
  state.loading = true;
  try {
    const data = await apiFetch("/api/state");
    applyState(data.state);
    state.loaded = true;
  } catch (e) {
    if (String(e && e.message).includes("401")) {
      clearAuth();
    }
    throw e;
  } finally {
    state.loading = false;
  }
}

async function saveNow() {
  if (state.saving) return;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  state.saving = true;
  try {
    const payload = normalizeState(state);
    const data = await apiFetch("/api/state", {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    applyState(data.state);
    state.loaded = true;
  } catch (e) {
    if (String(e && e.message).includes("401")) {
      clearAuth();
    }
    throw e;
  } finally {
    state.saving = false;
  }
}

function saveDebounced() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveNow().catch(() => {});
  }, 400);
}

export function useAppState() {
  return { state, load, saveDebounced, saveNow };
}
