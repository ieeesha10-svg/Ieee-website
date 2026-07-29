const TYPE_COLOR_MAP = {
  general: "blue",
  event: "teal",
  workshop: "amber",
  webinar: "indigo",
};

function getTypeColor(type) {
  return TYPE_COLOR_MAP[type] || "blue";
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isHtmlContentEmpty(html) {
  if (!html) return true;
  return html.replace(/<[^>]*>/g, "").trim().length === 0;
}

export function formatEventDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function mapActivity(activity, form) {
  const start = form?.startDate;
  const end = form?.endDate;
  const startFmt = formatEventDate(start);
  const endFmt = formatEventDate(end);
  const dateRange =
    startFmt && endFmt
      ? startFmt === endFmt
        ? startFmt
        : `${startFmt} – ${endFmt}`
      : startFmt || endFmt || formatDate(activity.createdAt);

  return {
    id: activity._id,
    title: activity.title,
    type: activity.type,
    typeColor: getTypeColor(activity.type),
    content: activity.content,
    description: activity.description,
    location: activity.location,
    speakers: activity.speakers || [],
    date: dateRange,
    status: (() => {
      if (activity.registrationEnabled === false) return "Completed";
      if (end && new Date(end) < new Date()) return "Completed";
      return "Active";
    })(),
    registrationEnabled: activity.registrationEnabled ?? true,
    coverImage: activity.coverImage || "",
    attendees: 0,
    maxAttendees: form?.maxSubmissions || 0,
    formId: form?._id || null,
    form: form || null,
  };
}

export function buildPayload(payload) {
  const speakers = (payload.speakers || []).map((s) => ({
    name: s.name || "",
    title: s.title || "",
    bio: s.bio || "",
    image: s.image || "",
  }));

  const body = {
    title: payload.title || "",
    content: payload.content || "",
    description: payload.description || "",
    type: payload.type || "event",
    location: payload.location || "",
    registrationEnabled: payload.registrationEnabled ?? true,
    speakers,
  };

  if (payload.startDate) body.startDate = new Date(payload.startDate).toISOString();
  if (payload.endDate) body.endDate = new Date(payload.endDate + (payload.endDate.includes("T") ? "" : "T23:59:59.999Z")).toISOString();
  if (payload.maxSubmissions !== "" && payload.maxSubmissions != null) {
    body.maxSubmissions = Number(payload.maxSubmissions);
  }
  if (payload.fields) body.fields = payload.fields;
  if (payload.formStatus) body.formStatus = payload.formStatus;

  return body;
}
