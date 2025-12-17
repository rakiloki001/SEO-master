import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisData, FormData, GroundingSource, GeneratedImage } from "../types";

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
    
    Article Style/Tone Preference: "${formData.articleStyle}". Ensure the outline reflects this style (e.g., if 'First Person', the outline should include 'My Experience' sections; if 'Comprehensive', it should be exhaustive).
    
    1. Estimate the Keyword Difficulty (Low, Medium, or High) based on the likely competition found in search results. Explain why in one sentence.
    2. List 8-10 semantically related keywords or long-tail variations that should be included in the content.
    3. Identify 3-5 key topics or angles that top-ranking pages are covering.
    4. Create a detailed article outline (H1, H2, H3 structure) that follows E-E-A-T principles and matches the requested "${formData.articleStyle}" style.
    
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
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are an expert SEO Strategist. Analyze search results and return pure JSON."
      }
    });

    let jsonText = response.text || "";
    if (!jsonText) throw new Error("No data returned from analysis.");
    
    // Improved JSON extraction: find the first '{' and the last '}'
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    } else {
      // Fallback cleanup if braces aren't clear, though this implies bad format
      jsonText = jsonText.replace(/```json\n?|```/g, '').trim();
    }
    
    let parsedData;
    try {
      parsedData = JSON.parse(jsonText);
    } catch (e) {
      console.error("JSON Parse Error", e, "Raw Text:", response.text);
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
    **Article Style/Tone:** ${formData.articleStyle} (Strictly adhere to this tone).
    
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
    3. Adopt the requested style: "${formData.articleStyle}".
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

/**
 * Generates 2 relevant images for the article context.
 * 1. Analyzes the context to create prompts.
 * 2. Generates images using gemini-2.5-flash-image.
 */
export const generateArticleImages = async (keyword: string, outline: string): Promise<GeneratedImage[]> => {
  const client = getClient();

  try {
    // Step 1: Generate prompts
    // We can use JSON mode here because we are NOT using Search tools for this specific call.
    const promptGenResponse = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Based on the keyword "${keyword}" and the outline below, suggest 2 distinct, highly descriptive prompts for generating professional, photorealistic or high-quality illustration images to accompany this article.
        
        Outline: ${outline.substring(0, 500)}...
        
        Return ONLY a JSON array of strings, e.g., ["prompt 1", "prompt 2"].
      `,
      config: {
        responseMimeType: 'application/json',
      }
    });
    
    let prompts: string[] = [];
    try {
       prompts = JSON.parse(promptGenResponse.text || '[]');
    } catch (e) {
       console.warn("Failed to parse prompt JSON, using defaults", e);
    }
    
    if (!prompts || prompts.length === 0) {
      prompts = [
        `A professional photo representing ${keyword}`,
        `An illustration showing the concept of ${keyword}`
      ];
    }

    // Step 2: Generate Images concurrently
    const imagePromises = prompts.slice(0, 2).map(async (imgPrompt) => {
      try {
        const response = await client.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: imgPrompt }]
          },
          config: {
            imageConfig: {
              aspectRatio: '16:9',
            }
          }
        });

        // Extract image
        for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData) {
            return {
              url: `data:image/png;base64,${part.inlineData.data}`,
              prompt: imgPrompt
            };
          }
        }
        return null;
      } catch (e) {
        console.error("Single image gen failed", e);
        return null;
      }
    });

    const results = await Promise.all(imagePromises);
    return results.filter((img): img is GeneratedImage => img !== null);

  } catch (error) {
    console.error("Image Strategy Failed", error);
    throw new Error("Failed to generate images.");
  }
};