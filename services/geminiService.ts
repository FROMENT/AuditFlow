import { GoogleGenAI, Type } from "@google/genai";
import { AuditState, Category, GeminiReport, SiteMetadata } from "../types";

// Initialize Gemini Client
// CRITICAL: process.env.API_KEY is handled externally.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Scans a URL using Google Search Grounding to provide initial context.
 */
export const scanWebsiteUrl = async (url: string): Promise<SiteMetadata> => {
  try {
    const modelId = 'gemini-3-flash-preview'; 
    
    const prompt = `
      Analyse le site web suivant : ${url}.
      Utilise Google Search pour trouver des informations récentes sur ce site.
      
      Renvoie une réponse au format JSON strict avec les champs suivants :
      - summary: Un résumé professionnel de 2 phrases sur ce que fait le site.
      - techStack: Une liste estimée des technologies utilisées (ex: React, WordPress, Shopify, etc.) ou "Inconnu".
      - initialImpressions: 3 points clés notables (positifs ou neutres) sur la réputation ou l'apparence publique du site.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            techStack: { type: Type.ARRAY, items: { type: Type.STRING } },
            initialImpressions: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["summary", "techStack", "initialImpressions"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Aucune réponse de l'IA");
    
    const data = JSON.parse(text);

    // Extract grounding sources if available
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((c: any) => c.web ? { title: c.web.title, uri: c.web.uri } : null)
      .filter((s: any) => s);

    return {
      url,
      ...data,
      sources
    };

  } catch (error) {
    console.error("Erreur lors du scan:", error);
    throw error;
  }
};

/**
 * Generates a full audit report based on the filled form data.
 */
export const generateAuditReport = async (auditData: AuditState): Promise<GeminiReport> => {
  try {
    const modelId = 'gemini-3-flash-preview';

    // Construct a structured prompt with the user's manual evaluation data
    const evaluationContext = auditData.items.map(item => 
      `- ${item.category}: Score ${item.score}/100. Notes: "${item.notes || 'Aucune note'}"`
    ).join('\n');

    const prompt = `
      Agis comme un Expert Senior en Audit Web et Qualité Digitale.
      Rédige un rapport d'audit pour le site : ${auditData.metadata?.url || 'URL non spécifiée'}.
      
      Voici les données brutes de l'évaluation manuelle effectuée par l'auditeur :
      ${evaluationContext}

      Le résumé du site est : ${auditData.metadata?.summary || 'N/A'}.

      Génère un rapport professionnel, constructif et détaillé en JSON.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING, description: "Résumé exécutif du rapport" },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Liste des points forts" },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Liste des points faibles" },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Actions recommandées prioritaires" },
            finalVerdict: { type: Type.STRING, description: "Conclusion finale courte" }
          },
          required: ["executiveSummary", "strengths", "weaknesses", "recommendations", "finalVerdict"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Aucune réponse de rapport");

    return JSON.parse(text);

  } catch (error) {
    console.error("Erreur génération rapport:", error);
    throw error;
  }
};