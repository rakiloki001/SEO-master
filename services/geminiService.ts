import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisData, FormData, GroundingSource } from "../types";

// Initialize Gemini Client
// Using process.env.API_KEY as strictly required
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes the keyword using Gemini with Google Search Grounding.
 * Uses gemini-2.5-flash for speed and tool support.
 */
export const analyzeKeyword = async (formData: FormData): Promise<AnalysisData> => {
  const client = getClient();
  
  const prompt = `
    Perform a comprehensive SEO analysis for the keyword: "${formData.keyword}" in language: "${formData.language}".
    
    1. Estimate the Keyword Difficulty (Low, Medium, or High) based on the likely competition found in search results. Explain why in one sentence.
    2. List 8-10 semantically related keywords or long-tail variations that should be included in the content.
    3. Identify 3-5 key topics or angles that top-ranking pages are covering.
    4. Create a detailed article outline (H1, H2, H3 structure) that follows E-E-A-T principles.
    
    IMPORTANT: Return the result as a valid JSON object. Do not include any introductory text or explanations outside the JSON.
    
    The JSON structure must be:
    {
      "difficulty": "Low" | "Medium" | "High",
      "difficultyReason": "string explanation",
      "relatedKeywords": ["string", "string"],
      "competitorTopics": ["string", "string"],
      "suggestedOutline": "string containing the markdown formatted outline"
    }
  `;

  try {
    // Note: responseMimeType: 'application/json' is NOT supported when using tools like googleSearch.
    // We must parse the text manually.
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are an expert SEO Strategist. Analyze search results and return pure JSON."
      }
    });

    let jsonText = response.text;
    if (!jsonText) throw new Error("No data returned from analysis.");
    
    // Clean up potential markdown code blocks (e.g. ```json ... ```)
    jsonText = jsonText.replace(/```json\n?|```/g, '').trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(jsonText);
    } catch (e) {
      console.error("JSON Parse Error", e);
      throw new Error("Failed to parse analysis results. The model did not return valid JSON.");
    }

    // Extract grounding chunks if available to get source links
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const groundingSources: GroundingSource[] = groundingChunks
      .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    // Deduplicate sources based on URI
    const uniqueSources = Array.from(new Map(groundingSources.map(s => [s.uri, s])).values()).slice(0, 10);

    return {
      difficulty: parsedData.difficulty || 'Medium',
      difficultyReason: parsedData.difficultyReason || 'Analysis unavailable',
      relatedKeywords: parsedData.relatedKeywords || [],
      competitorTopics: parsedData.competitorTopics || [],
      suggestedOutline: parsedData.suggestedOutline || '',
      groundingSources: uniqueSources
    };

  } catch (error) {
    console.error("Analysis Failed", error);
    throw new Error("Failed to analyze keyword. Please try again.");
  }
};

/**
 * Generates the full article based on the analysis and user input.
 * Uses gemini-3-pro-preview for complex writing tasks.
 */
export const generateArticle = async (formData: FormData, analysisData: AnalysisData): Promise<string> => {
  const client = getClient();

  const prompt = `
    Write a high-quality, SEO-optimized article based on the following plan.
    
    **Target Keyword:** ${formData.keyword}
    **Language:** ${formData.language}
    **Target Word Count:** Approx. ${formData.wordCount} words
    
    **Analysis Data:**
    - Difficulty: ${analysisData.difficulty} (${analysisData.difficultyReason})
    - Keywords to Include: ${analysisData.relatedKeywords.join(', ')}
    - Competitor Angles: ${analysisData.competitorTopics.join(', ')}
    
    **User Provided Context/Materials:**
    ${formData.customContext || "None provided."}
    
    **Research References (Grounding):**
    ${analysisData.groundingSources.map(s => `- ${s.title} (${s.uri})`).join('\n')}
    
    **Approved Outline:**
    ${analysisData.suggestedOutline}
    
    **Instructions:**
    1. Write the full article in Markdown format.
    2. Strictly adhere to Google's E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) guidelines.
    3. Use natural, engaging language appropriate for the target audience.
    4. Properly format headings (H1, H2, H3), lists, and emphasis.
    5. Integrate the "Keywords to Include" naturally.
    6. Ensure the content is original and provides value beyond what is currently ranking.
    7. Do NOT include the outline in the final output, just the article content. Start with the H1 Title.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro for better writing quality
      contents: prompt,
      config: {
        systemInstruction: "You are a professional senior copywriter and SEO expert.",
      }
    });

    return response.text || "Failed to generate article content.";

  } catch (error) {
    console.error("Generation Failed", error);
    throw new Error("Failed to generate article. Please try again.");
  }
};