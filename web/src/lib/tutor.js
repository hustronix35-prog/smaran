function clean(text) {
  return String(text || "")
    .replace(/\s*CHECK:\s*[^\n]*/gi, "")
    .replace(/\s*GRASPED:\s*[^\n]*/gi, "")
    .trim();
}

export async function askTutor(topic, turns) {
  const response = await fetch("/api/teach", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ topic, turns }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Sarvam could not teach this just now.");
  return { ...data, say: clean(data.say) || clean(data.raw) };
}
