const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8080";

export async function fetchClasses(authFetch) {
  const res = authFetch ? await authFetch(`${API_URL}/api/classes`) : await fetch(`${API_URL}/api/classes`);
  if (!res.ok) throw new Error(`Failed to fetch classes: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data)
    ? data.map((item) => ({
        id: String(item.id ?? item.gradeLevel),
        label: item.label || item.name || `Class ${item.id ?? item.gradeLevel}`,
        description: item.description || "",
        focus: item.focus || "",
        highlight: item.highlight || "",
        color: item.color || "#8f7ee8",
      }))
    : [];
}

export async function fetchSubjectsByClass(classId, authFetch) {
  const url = `${API_URL}/api/classes/${classId}/subjects`;
  const res = authFetch ? await authFetch(url) : await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch subjects for class ${classId}: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data.map((s) => ({
    id: s.id || String(s.name).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name: s.name || s.label || s.id,
    classLevel: s.classLevel ?? s.gradeLevel ?? classId,
    // Keep other fields if present; components will use defaults when needed
    ...s,
  })) : [];
}

export async function fetchChaptersBySubject(subjectId, authFetch) {
  const url = `${API_URL}/api/subjects/${subjectId}/chapters`;
  const res = authFetch ? await authFetch(url) : await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch chapters for subject ${subjectId}: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data.map((c) => ({
    id: c.id,
    chapterNumber: c.chapterNumber,
    title: c.title,
    description: c.description,
  })) : [];
}

export async function fetchSubject(classId, subjectId, authFetch) {
  const subjects = await fetchSubjectsByClass(classId, authFetch);
  return subjects.find((s) => String(s.id) === String(subjectId)) || null;
}

export async function fetchSubjectById(subjectId, authFetch) {
  const url = `${API_URL}/api/classes/subjects/${subjectId}`;
  const res = authFetch ? await authFetch(url) : await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch subject ${subjectId}: ${res.status}`);
  const data = await res.json();
  return {
    id: data.id,
    name: data.name,
    classLevel: data.classLevel,
    ...data,
  };
}

export async function fetchClassById(classId, authFetch) {
  const classes = await fetchClasses(authFetch);
  return classes.find((c) => String(c.id) === String(classId)) || null;
}

export async function fetchVisualizationsByChapter(chapterId, authFetch) {
  const url = `${API_URL}/api/chapters/${chapterId}/visualizations`;
  const res = authFetch ? await authFetch(url) : await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch visualizations for chapter ${chapterId}: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data.map((v) => ({
    id: v.id,
    title: v.title,
    type: v.type,
    description: v.description,
    data: typeof v.data === 'string' ? JSON.parse(v.data) : v.data,
  })) : [];
}

export async function fetchChapterSections(chapterId, authFetch) {
  const url = `${API_URL}/api/chapters/${chapterId}/sections`;
  const res = authFetch ? await authFetch(url) : await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch chapter sections: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data.map((section) => ({
    id: section.id,
    heading: section.heading,
    content: section.content,
    visualizationId: section.visualizationId ?? null,
  })) : [];
}

export default {
  fetchClasses,
  fetchSubjectsByClass,
  fetchChaptersBySubject,
  fetchSubject,
  fetchSubjectById,
  fetchClassById,
  fetchVisualizationsByChapter,
  fetchChapterSections,
};
