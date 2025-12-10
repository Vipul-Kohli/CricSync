import { GoogleGenAI } from "@google/genai";
import { Match, ExtractionResult, TeamSearchQuery } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to format errors user-friendly
const handleGeminiError = (error: any, context: string): string => {
  console.error(`${context} Error:`, error);
  const errString = error?.toString() || JSON.stringify(error) || '';
  
  if (errString.includes('429') || errString.includes('RESOURCE_EXHAUSTED') || errString.includes('quota')) {
    return "⚠️ AI Quota Exceeded. Please wait 1-2 minutes before trying again.";
  }
  
  if (errString.includes('503') || errString.includes('overloaded')) {
    return "⚠️ AI Service Overloaded. Please try again in a moment.";
  }

  return "An error occurred while processing. Please try again.";
};

const getMapLink = (venue: string, contextLocation?: string): string | undefined => {
  if (!venue || venue.toLowerCase() === 'tbd' || venue.toLowerCase().includes('unknown')) {
    return undefined;
  }

  // Clean venue name of specific directional patterns in parentheses to improve map search accuracy
  // e.g. "Ground Name (Near Landmark)" -> "Ground Name"
  let cleanVenue = venue
    .replace(/\s*\((near|behind|opp|opposite|next to)\s+[^)]+\)/gi, '')
    .trim();
  
  // If we have a context location (e.g. from search) and the venue doesn't seem to include it, append it for better accuracy
  let query = cleanVenue;
  if (contextLocation && !cleanVenue.toLowerCase().includes(contextLocation.toLowerCase())) {
     query = `${cleanVenue}, ${contextLocation}`;
  }
  
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
};

export const extractMatches = async (
  input: string | TeamSearchQuery, 
  mode: 'search' | 'text' | 'image',
  onStatusUpdate?: (status: string) => void
): Promise<ExtractionResult> => {
  const log = (msg: string) => {
    if (onStatusUpdate) onStatusUpdate(msg);
  };

  // Use the best available model for reading web content (Search Mode), 
  // and the faster model for standard text/image processing.
  const modelName = mode === 'search' ? 'gemini-3-pro-preview' : 'gemini-2.5-flash';

  if (mode === 'search') {
    const query = input as TeamSearchQuery;
    
    log(`[Flow Start] Initiating Match Extraction Protocol using ${modelName}`);
    
    let searchContext = "";
    if (query.searchType === 'link') {
         const link = query.teamLink.trim();
         log(`[Context] Target Link: ${link}`);
         // Unified Logic: Treat the link as the key identifier for the team, similar to a name search
         searchContext = `the cricket team associated with this profile link: "${link}".`;
    } else {
         log(`[Context] Target Team: ${query.teamName} (${query.location})`);
         searchContext = `the team "${query.teamName}" located in "${query.location}" captained by "${query.captainName}".`;
    }

    // Unified Prompt: Removes specific "If URL..." branching to ensure consistent behavior
    const prompt = `
      You can access web pages. Fetch this info: ${searchContext}

      Task: Extract **only the upcoming matches** for the team (do not include past or completed matches). 
      
      Instructions:
      1. Find the list of upcoming matches or fixtures for this team.
      2. IGNORE "Completed", "Results", or "Past" matches.
      3. EXTRACT ALL UPCOMING MATCHES listed on the page. Do not filter them by date yet. I will filter them in the next step.
      4. TIMEZONE: Convert all match times to **Indian Standard Time (IST)**.
      
      For each upcoming match return a JSON array where each item has these fields:
      - "date": string (YYYY-MM-DD, assume current year if missing)
      - "time": string (HH:mm AM/PM). Ensure this is in IST. If strictly not available, use "TBD".
      - "home_team": string (Name of the team being searched for, e.g., "Smashers")
      - "opponent": string (Opponent team name)
      - "venue": string (Venue name and city)
      - "match_url": string (The specific URL for this match/scorecard if available)
      
      OUTPUT FORMAT:
      Return a JSON array of objects inside a markdown code block (e.g., \`\`\`json [...] \`\`\`).
    `;

    try {
      log(`[Step 1] Sending prompt to ${modelName}...`);
      log(`> Instruction: "Search for upcoming fixtures for this team"`);
      log(`> Tool: Google Search (Grounding)`);
      
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      log("[Step 2] Response received from AI Model.");

      // --- LOG GOOGLE SEARCH DEBUG INFO ---
      const metadata = response.candidates?.[0]?.groundingMetadata;
      if (metadata) {
        log("--- GOOGLE SEARCH RESPONSE DATA ---");
        if (metadata.webSearchQueries) {
          log(`> Queries Executed: ${JSON.stringify(metadata.webSearchQueries)}`);
        }
        if (metadata.groundingChunks) {
          log(`> Search Results Found: ${metadata.groundingChunks.length}`);
          metadata.groundingChunks.forEach((chunk: any, i: number) => {
             if (chunk.web) {
                log(`  [${i+1}] ${chunk.web.title}`);
                log(`      ${chunk.web.uri}`);
             }
          });
        } else {
          log("> No grounding chunks returned from search.");
        }
        log("-----------------------------------");
      }

      // Log Raw Response
      const text = response.text || "";
      log("--- RAW AI OUTPUT START ---");
      log(text.substring(0, 500) + (text.length > 500 ? "... (truncated)" : ""));
      log("--- RAW AI OUTPUT END ---");

      // Extract JSON
      log(`[Step 3] Parsing JSON payload...`);
      
      let matchesData: any[] = [];
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        try {
          matchesData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
          log(`> Found ${matchesData.length} total matches in response.`);
          
          // --- JS FILTERING START ---
          // Calculate Today in IST (UTC+5:30) to ensure consistency regardless of user location
          const now = new Date();
          const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
          const istOffset = 5.5 * 60 * 60 * 1000;
          const today = new Date(utc + istOffset);
          today.setHours(0,0,0,0);
          
          // Calculate End Date (Upcoming Sunday) based on IST date
          const day = today.getDay();
          const daysUntilSunday = (7 - day) % 7; 
          const nextSunday = new Date(today);
          nextSunday.setDate(today.getDate() + (day === 0 ? 0 : daysUntilSunday));
          nextSunday.setHours(23, 59, 59, 999);
          
          log(`[Step 4] Applying Date Filter (IST Base)`);
          log(`> Filter Range: ${today.toDateString()} to ${nextSunday.toDateString()}`);
          
          const validMatches = matchesData.filter((m: any) => {
             const mDate = new Date(m.date);
             if (isNaN(mDate.getTime())) {
                log(`> Excluding: Invalid Date (${m.date})`);
                return false;
             }
             // Allow matches from today until next Sunday
             const isValid = mDate >= today && mDate <= nextSunday;
             if (!isValid) {
                 log(`> Excluding: ${m.date} (Outside range)`);
             } else {
                 log(`> Keeping: ${m.date} vs ${m.opponent}`);
             }
             return isValid;
          });
          
          matchesData = validMatches;
          // --- JS FILTERING END ---

        } catch (e) {
          log(`[Error] JSON Parse Failed: ${e}`);
          console.error("Failed to parse JSON", e);
        }
      } else {
        log("[Error] No valid JSON block found in the response.");
      }

      log("[Step 5] Finalizing Data...");
      const matches: Match[] = matchesData.map((m: any, index: number) => ({
        id: Date.now().toString() + index,
        date: m.date,
        time: m.time,
        opponent: m.opponent,
        venue: m.venue,
        matchUrl: m.match_url,
        homeTeam: m.home_team || (query.searchType === 'details' ? query.teamName : undefined),
        mapLink: getMapLink(m.venue, query.location),
        selected: false // Default to false, will set first one after sort
      }));

      // Sort matches by date
      log("> Sorting matches by date...");
      matches.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        
        // Push invalid dates to the end
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        
        return dateA - dateB;
      });

      // Select the first match by default if any exist
      if (matches.length > 0) {
        matches[0].selected = true;
      }

      // Extract sources from grounding metadata
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.map((chunk: any) => ({
            title: chunk.web?.title || 'Source',
            uri: chunk.web?.uri
        }))
        .filter((s: any) => s.uri) || [];
      
      if (sources.length > 0) {
        log(`[Step 6] Verifying Sources:`);
        sources.forEach((s: any) => {
            log(`> Source: ${s.uri}`);
        });
      }
      
      log(`[Flow Complete] Returning ${matches.length} validated matches.`);
      matches.forEach((m) => {
          if (m.mapLink) log(`> Generated Map: ${m.mapLink}`);
          if (m.matchUrl) log(`> Match Link: ${m.matchUrl}`);
      });

      return { matches, sources };

    } catch (error) {
      const friendlyMsg = handleGeminiError(error, "Extraction");
      log(`[Critical Error] ${friendlyMsg}`);
      throw new Error(friendlyMsg);
    }
  } 
  
  if (mode === 'image' || mode === 'text') {
    log(`[Flow Start] Initializing ${mode} mode using ${modelName}...`);
    const prompt = mode === 'image' 
      ? "Extract cricket match details from this image. Return JSON array with date (YYYY-MM-DD), time (IST), home_team, opponent, venue." 
      : `Extract cricket match details from this text: "${input}". Return JSON array with date (YYYY-MM-DD), time (IST), home_team, opponent, venue.`;
    
    const contentPart = mode === 'image' 
      ? { inlineData: { mimeType: 'image/png', data: input as string } }
      : { text: input as string };

    try {
      log(`[Step 1] Sending content to Gemini...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: {
          parts: [
            contentPart,
            { text: prompt + " Output JSON inside ```json``` block." }
          ]
        }
      });
      log("[Step 2] Response received.");

      const text = response.text || "";
      
      let matchesData: any[] = [];
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[[\s\S]*\]/);

      if (jsonMatch) {
         try {
            log("[Step 3] Parsing JSON data...");
            matchesData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
         } catch(e) { console.error(e); }
      }

      log(`[Flow Complete] Found ${matchesData.length} matches.`);
      
      const matches: Match[] = matchesData.map((m: any, index: number) => ({
        id: Date.now().toString() + index,
        date: m.date,
        time: m.time,
        opponent: m.opponent,
        venue: m.venue,
        homeTeam: m.home_team,
        mapLink: getMapLink(m.venue),
        selected: false // Default to false
      }));

      // Sort matches by date
      matches.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (isNaN(dateA)) return 1;
        if (isNaN(dateB)) return -1;
        return dateA - dateB;
      });

      // Select the first match by default if any exist
      if (matches.length > 0) {
        matches[0].selected = true;
      }

      return { matches, sources: [] };
    } catch (error) {
      const friendlyMsg = handleGeminiError(error, "Manual/Image Extraction");
      log(`[Error] ${friendlyMsg}`);
      throw new Error(friendlyMsg);
    }
  }

  return { matches: [], sources: [] };
};

export interface MessageOptions {
  fees?: string;
  payTo?: string;
  ballColor?: string;
  header?: string;
}

export const generateWhatsAppMessage = async (
  matches: Match[], 
  tone: 'casual', 
  notes: string, 
  options: MessageOptions = {}
): Promise<string> => {
  const selectedMatches = matches.filter(m => m.selected);
  if (selectedMatches.length === 0) return "";

  const { fees = '', payTo = '', ballColor = 'White', header = 'Upcoming Match' } = options;

  const prompt = `
    Create a WhatsApp availability message for a cricket team following this EXACT template structure:

    ${header}
    Date - [Date in format: 6th Dec Saturday]
    Reporting Time - [30 mins before match time]
    Ball - ${ballColor}
    Match fees - ${fees || '[Amount]'}
    Pay to - ${payTo || '[Number]'}
    Venue - [Venue Name] [Google Map Link]

    Availability Pool 
    1.
    2.
    3.
    4.
    5.
    6.
    7.
    8.
    9.
    10.
    11.
    
    Instructions:
    - Use the match data provided below to fill in the Date, Time, and Venue.
    - Match Data: ${JSON.stringify(selectedMatches)}
    - Extra Notes: ${notes}
    - IMPORTANT: Date format must be like "6th Dec Saturday" (Day of month + Month Short + Day Name).
    - IMPORTANT: Ensure times are mentioned in IST (Indian Standard Time).
    - If there are multiple matches selected, repeat the match details section (Date/Time/Venue) or summarize them if it's the same day.
    - For the "Venue" line, explicitly include the URL from the 'mapLink' field in the data next to the venue name (separated by space).
    - Leave the numbered list under "Availability Pool" empty (or with placeholder numbering 1-11) for players to fill in.
    - Do NOT include markdown symbols like ** or ##. Keep it clean plain text.
    - If "Match fees" or "Pay to" were not provided in the prompt options, use the placeholders as shown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "Failed to generate message.";
  } catch (error) {
    return handleGeminiError(error, "WA Generation");
  }
};

export interface InstagramOptions {
    vibe: 'hype' | 'serious' | 'fun';
    type: 'caption' | 'story' | 'poster';
}

export const generateInstagramContent = async (
    matches: Match[],
    options: InstagramOptions
): Promise<string> => {
    const selectedMatches = matches.filter(m => m.selected);
    if (selectedMatches.length === 0) return "";

    const prompt = `
        You are a social media manager for a cricket team.
        Generate ${options.type === 'caption' ? 'an Instagram Caption (with 10-15 relevant hashtags)' : 'text for an Instagram Story overlay'} for the upcoming match.

        Match Details: ${JSON.stringify(selectedMatches)}
        Vibe: ${options.vibe}

        Instructions:
        - Ensure times are mentioned in IST (Indian Standard Time).
        - If 'caption': Write a catchy hook, list the match details clearly (Date, Time, Venue, Opponent), and end with a Call to Action (e.g., "Cheer for us!"). Include cricket emojis.
        - If 'story': Keep it very short and punchy. Focus on "Next Match", "vs Opponent", and "Time/Venue". Designed to be placed on a photo.
        - Do not use markdown formatting like **bold** if it makes the text look messy when pasted directly.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Failed to generate content.";
    } catch (error) {
        return handleGeminiError(error, "IG Generation");
    }
};

export const generateMatchPoster = async (matches: Match[]): Promise<string> => {
  const selectedMatch = matches.find(m => m.selected);
  if (!selectedMatch) return "";

  const homeTeam = selectedMatch.homeTeam || 'My Team';
  const opponent = selectedMatch.opponent;
  const date = selectedMatch.date;
  const venue = selectedMatch.venue.split(',')[0]; // Shorten venue

  const prompt = `
    Generate a professional, high-quality 9:16 vertical poster for a cricket match for Instagram Story.
    
    Theme: Cricket, Sports, Energy, Stadium Atmosphere.
    
    Visual Elements:
    - Background: A lit cricket stadium at night or a dynamic cricket ground.
    - Style: Modern sports graphic design, 3D style, vibrant lighting.
    - Focus: A "VERSUS" concept.
    
    Text Integration (Render this text in the image):
    - "${homeTeam}"
    - "VS"
    - "${opponent}"
    - "${date}"
    
    Make it look like an official match day poster. Return only the image.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Nano Banana
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        // @ts-ignore - Valid config for gemini-2.5-flash-image
        imageConfig: {
            aspectRatio: "9:16"
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
        }
    }
    console.error("No image part found in response", response);
    return "";
  } catch (error) {
    console.error("Poster Generation Error", error);
    return "";
  }
};