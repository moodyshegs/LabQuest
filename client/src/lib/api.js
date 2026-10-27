async function request(path, options = {}) {
  try {
    const response = await fetch(path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
    return payload;
  } catch (error) {
    return { ok: false, error: error.message, persisted: false };
  }
}

export const api = {
  bootstrap: () => request('/api/bootstrap'),
  markAlertRead: (id) => request(`/api/alerts/${encodeURIComponent(id)}/read`, { method: 'POST', body: {} }),
  completePractical: (slug) => request(`/api/practicals/${encodeURIComponent(slug)}/complete`, { method: 'POST', body: {} }),
  createAssessment: (assessment) => request('/api/assessments', { method: 'POST', body: assessment }),
  submitAssessment: (id, answers) => request(`/api/assessments/${encodeURIComponent(id)}/submissions`, { method: 'POST', body: { answers } }),
  reviewSubmission: (id, review) => request(`/api/submissions/${encodeURIComponent(id)}/review`, { method: 'POST', body: review }),
  createSchool: (school) => request('/api/schools', { method: 'POST', body: school }),
};
