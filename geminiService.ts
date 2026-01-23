
import { GoogleGenAI } from "@google/genai";
import { User } from "./types";

// Always initialize with named apiKey parameter
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getMemberAnalytics = async (users: User[]) => {
  try {
    const userSummary = users.map(u => `${u.name} (${u.position}, Status: ${u.status})`).join(", ");
    const prompt = `Analisis data anggota berikut dan berikan ringkasan singkat dalam Bahasa Indonesia: ${userSummary}. Berikan 3 poin insight tentang distribusi peran dan kesehatan tim. Gunakan format Markdown.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // Access .text property directly (do not call as a function)
    return response.text || "Gagal mendapatkan analisis AI.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Terjadi kesalahan saat menghubungi asisten AI.";
  }
};

export const suggestJobDescription = async (position: string) => {
  try {
    const prompt = `Buatkan deskripsi pekerjaan (Job Description) singkat dan profesional untuk jabatan "${position}" di sebuah perusahaan teknologi. Gunakan poin-poin dalam Bahasa Indonesia.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    // Access .text property directly
    return response.text || "Gagal membuat deskripsi.";
  } catch (error) {
    return "Gagal mendapatkan saran jabatan dari AI.";
  }
};
