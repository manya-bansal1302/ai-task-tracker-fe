import { apiRequest } from "./api.js";

export function generateTaskReport() {
  return apiRequest("/ai/task-report", { method: "POST" }, true);
}

export function parseTaskFromSpeech(transcript) {
  return apiRequest(
    "/ai/parse-task",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcript }),
    },
    true,
  );
}

async function blobToBase64(audioBlob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      resolve(dataUrl.slice(dataUrl.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Could not read the audio recording."));
    reader.readAsDataURL(audioBlob);
  });
}

export async function parseTaskFromAudio(audioBlob, mimeType) {
  const audioBase64 = await blobToBase64(audioBlob);

  return apiRequest(
    "/ai/parse-audio-task",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audioBase64, mimeType }),
    },
    true,
  );
}
