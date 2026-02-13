import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API Key not found");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const analyzeJournalEntry = async (text: string): Promise<string> => {
  const ai = getClient();
  if (!ai) return "Kunci API tidak dikonfigurasi. Tidak dapat melakukan analisis.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analisis entri jurnal berikut. Berikan ringkasan singkat (1 kalimat), identifikasi emosi utama, dan berikan satu saran filosofis atau motivasi singkat yang relevan dalam Bahasa Indonesia. Gunakan format markdown bullet points.
      
      Entri Jurnal:
      "${text}"`,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Speed over deep reasoning for this task
      }
    });

    return response.text || "Tidak dapat menghasilkan analisis.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Maaf, terjadi kesalahan saat menghubungkan ke asisten AI.";
  }
};