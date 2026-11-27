import { apiDelete, apiGet, apiPost, apiPut } from "./client";
import { MOCK } from "./config";

// Plan shape (the contract we sent Team B):
// {
//   plan_id, student_id, name,
//   terms: [{ term_id, course_ids: [course_id, ...] }],
//   created_at, updated_at
// }

const STORE = "course-planner.mock-plans";

function readStore() {
  try {
    return JSON.parse(localStorage.getItem(STORE)) ?? [];
  } catch {
    return [];
  }
}

function writeStore(plans) {
  localStorage.setItem(STORE, JSON.stringify(plans));
}

function notFound(planId) {
  const error = new Error(`Plan ${planId} does not exist.`);
  error.status = 404;
  return error;
}

function cleanBody({ student_id, name, terms }) {
  return {
    student_id,
    name: name.trim(),
    terms: terms.map(({ term_id, course_ids }) => ({
      term_id,
      course_ids: [...course_ids],
    })),
  };
}

// GET /plans?student_id=
export async function listPlans(studentId) {
  if (!MOCK.plans) return apiGet("/plans", { student_id: studentId });
  return readStore()
    .filter((plan) => plan.student_id === studentId)
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

// GET /plans/{plan_id}
export async function getPlan(planId) {
  if (!MOCK.plans) {
    try {
      return await apiGet(`/plans/${encodeURIComponent(planId)}`);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  }
  return readStore().find((plan) => plan.plan_id === Number(planId)) ?? null;
}

// POST /plans
export async function createPlan(plan) {
  const body = cleanBody(plan);
  if (!MOCK.plans) return apiPost("/plans", body);

  const plans = readStore();
  const now = new Date().toISOString();
  const created = {
    plan_id: Math.max(0, ...plans.map((p) => p.plan_id)) + 1,
    ...body,
    created_at: now,
    updated_at: now,
  };
  writeStore([...plans, created]);
  return created;
}

// PUT /plans/{plan_id}
export async function updatePlan(planId, plan) {
  const body = cleanBody(plan);
  if (!MOCK.plans) return apiPut(`/plans/${encodeURIComponent(planId)}`, body);

  const plans = readStore();
  const index = plans.findIndex((p) => p.plan_id === Number(planId));
  if (index === -1) throw notFound(planId);

  const updated = {
    ...plans[index],
    ...body,
    updated_at: new Date().toISOString(),
  };
  plans[index] = updated;
  writeStore(plans);
  return updated;
}

// DELETE /plans/{plan_id}
export async function deletePlan(planId) {
  if (!MOCK.plans) return apiDelete(`/plans/${encodeURIComponent(planId)}`);

  const plans = readStore();
  if (!plans.some((p) => p.plan_id === Number(planId))) throw notFound(planId);
  writeStore(plans.filter((p) => p.plan_id !== Number(planId)));
}
