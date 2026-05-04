export interface GeneratedQuestion {
  id: number;
  question: string;
  options: string[];
}

export interface OutingPlan {
  id: number;
  title: string;
  vibe: string;
  estimatedCost: string;
  duration: string;
  energyLevel: string;
  groupFitScore: number;
  bestFor: string;
  notIdealIf: string;
  whyThisWorksForYourGroup: string;
}

export interface ItineraryStop {
  stopNumber: number;
  time: string;
  placeName: string;
  placeType: string;
  area: string;
  whatToDo: string;
  whatToOrder: string;
  estimatedCostHere: string;
  duration: string;
  travelToNext: string;
}

export interface FinalPlan {
  id: number;
  rating: string;
  ratingScore: number;
  title: string;
  tagline: string;
  totalEstimatedCost: string;
  totalDuration: string;
  energyLevel: string;
  bestStartTime: string;
  whyYourGroupWillLoveThis: string;
  groupVotePercentage: string;
  itinerary: ItineraryStop[];
  proTips: string[];
  inCaseItRains: string;

  // Optional old fields to prevent frontend TS errors
  vibe?: string;
  estimatedCost?: string;
  duration?: string;
  recommendedArea?: string;
  whatToExpect?: string;
  bestTimeToGo?: string;
  groupVotesReceived?: number;
}

// --- Helper: call Grok API (Primary) ---
const callGrok = async (prompt: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_GROK_API_KEY;
  if (!apiKey) {
    throw new Error("Grok API key is not configured.");
  }

  const response = await fetch(
    "https://api.x.ai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant. Always respond with valid JSON only. No markdown, no code blocks, no explanation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      }),
    }
  );

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const msg = errorBody?.error?.message || errorBody?.error || response.statusText;
    console.error("Grok API error:", response.status, msg);
    throw new Error(`Grok API error (${response.status}): ${msg}`);
  }

  const data = await response.json();
  const textContent = data.choices?.[0]?.message?.content;

  if (!textContent) {
    throw new Error("No content received from Grok API.");
  }

  return textContent;
};

// --- Helper: call Gemini API (Fallback) ---
const callGemini = async (prompt: string): Promise<string> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (attempt > 0) {
      const waitMs = Math.min(8000 * Math.pow(2, attempt), 40000);
      console.log(`Gemini API retry ${attempt}/${maxRetries}, waiting ${waitMs/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (response.status === 429) {
      const errorBody = await response.json().catch(() => ({}));
      const msg = errorBody?.error?.message || "Rate limited";
      console.warn(`Gemini rate limited (attempt ${attempt + 1}/${maxRetries}):`, msg);
      lastError = new Error(msg);
      continue;
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const msg = errorBody?.error?.message || response.statusText;
      console.error("Gemini API error:", response.status, msg);
      throw new Error(`Gemini API error (${response.status}): ${msg}`);
    }

    const data = await response.json();
    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      throw new Error("No content received from Gemini API.");
    }

    return textContent;
  }

  throw lastError || new Error("Gemini API failed after retries.");
};

// --- Orchestrator: Grok first → Gemini fallback ---
const callAI = async (prompt: string): Promise<string> => {
  const grokKey = import.meta.env.VITE_GROK_API_KEY;
  
  // Try Grok first if key is available
  if (grokKey) {
    try {
      console.log("🟢 Attempting Grok API (primary)...");
      const result = await callGrok(prompt);
      console.log("✅ Grok API succeeded.");
      return result;
    } catch (grokError: any) {
      console.warn("⚠️ Grok API failed, falling back to Gemini:", grokError.message);
    }
  } else {
    console.log("⏭️ No Grok key configured, using Gemini directly.");
  }

  // Fallback to Gemini
  console.log("🔵 Attempting Gemini API (fallback)...");
  const result = await callGemini(prompt);
  console.log("✅ Gemini API succeeded.");
  return result;
};


// --- Helper: parse cleaned JSON ---
const parseCleanJson = (text: string) => {
  let cleaned = text.trim();
  // Remove starting ```json or ```
  cleaned = cleaned.replace(/^```(?:json)?/i, '');
  // Remove ending ```
  cleaned = cleaned.replace(/```$/, '');
  return JSON.parse(cleaned.trim());
};

// --- 1. Generate Questions ---
export const generateQuestions = async (
  brief: string,
  location: string,
  totalMembers: number
): Promise<GeneratedQuestion[]> => {
  const prompt = `You are PackVote's AI assistant.
A group of friends is planning an outing together.

Host has provided this context:
- Outing Description: ${brief}
- Location/City: ${location}
- Number of People: ${totalMembers}

Your job is to generate 5 personalized, conversational, anonymous questions for ALL members to answer privately.

These questions will help understand each person's:
- Budget comfort
- Mood and energy level today
- Vibe preference
- Travel distance comfort
- Any hard vetoes or things they don't want

Rules:
- Questions must feel casual and friendly — like a friend asking, not a form
- Must be relevant to the host's description context
- Each question must have exactly 4 multiple choice options
- Options must be mutually exclusive and cover the full range
- Never ask for personal information like name or age
- Make the budget question judgment-free and comfortable
- Assume Indian college student context
- Keep option text short — max 5 words each

Return ONLY a JSON array. No explanation. No extra text. No markdown. No code blocks. Just raw JSON.

Format:
[
  {
    "id": 1,
    "question": "Full question text here?",
    "options": [
      "Option 1",
      "Option 2", 
      "Option 3",
      "Option 4"
    ]
  }
]`;

  const text = await callAI(prompt);
  try {
    return parseCleanJson(text) as GeneratedQuestion[];
  } catch (error) {
    console.error("Failed to parse Gemini response", text, error);
    throw new Error("Invalid JSON returned by Gemini API");
  }
};

// --- 2. Generate Outing Plans ---
export const generateOutingPlans = async (
  brief: string,
  location: string,
  totalMembers: number,
  allResponses: string
): Promise<OutingPlan[]> => {
  const prompt = `You are PackVote's outing planner AI.
A group of friends has answered questions about their outing preferences anonymously.

Host context:
- Outing Description: ${brief}
- Location/City: ${location}
- Number of People: ${totalMembers}

Individual responses from all members (names are only for tracking — never reveal them):
${allResponses}

Step 1 — Silently analyze responses:
- Find the LOWEST budget mentioned by anyone — the plan must work for that person
- Find the most common vibe/mood
- Find the SHORTEST travel distance anyone mentioned — nobody should be uncomfortable
- Collect EVERY veto from every person — if even ONE person vetoed something, eliminate it completely from all plans
- Find the dominant preference/interest

Step 2 — Generate 10 outing plans that:
- Work within the lowest budget
- Match the dominant vibe
- Stay within the shortest travel distance
- Respect every single veto without exception
- Are realistic for Indian college students
- Use INR for all costs
- Are genuinely different from each other
- Do NOT name specific places yet — describe vibes and experiences only

Return ONLY a JSON array. No explanation. No extra text. No markdown. No code blocks. Just raw JSON.

Format:
[
  {
    "id": 1,
    "title": "Short catchy 3-4 word title",
    "vibe": "One line experience description",
    "estimatedCost": "₹X - ₹Y per person",
    "duration": "X - Y hours",
    "energyLevel": "Low / Medium / High",
    "groupFitScore": 85,
    "bestFor": "One line — what mood this suits",
    "notIdealIf": "One line — who should skip this",
    "whyThisWorksForYourGroup": "One specific line referencing the group's actual responses without revealing individual answers"
  }
]

Generate exactly 10 options.
Rank them by how well they fit the group's collective responses — best fit first.`;

  const text = await callAI(prompt);
  try {
    return parseCleanJson(text) as OutingPlan[];
  } catch (error) {
    console.error("Failed to parse Gemini response", text, error);
    throw new Error("Invalid JSON returned by Gemini API");
  }
};

// --- 3. Generate Final Refined Plans ---
export const generateFinalPlans = async (
  brief: string,
  location: string,
  totalMembers: number,
  votedPlansWithCounts: string
): Promise<FinalPlan[]> => {
  const prompt = `You are ConFricto expert outing planner AI.
You know ${location} extremely well — its neighbourhoods, cafes, parks, activities, food spots, hangout zones, and hidden gems.

A group of friends has voted on their outing preferences. Your job is to generate 2-3 complete, ready-to-execute outing plans with real places, real timings, and real costs.

Host context:
- Outing Description: ${brief}
- Location/City: ${location}
- Number of People: ${totalMembers}

Voting results — plans with vote counts:
${votedPlansWithCounts}

Step 1 — Read the voting pattern:
- Identify what the group truly wants based on which plans got most votes
- Find the common thread connecting top voted plans
- Understand the dominant mood, budget range, energy level, and vibe the group is going for

Step 2 — Generate 2-3 complete outing plans.

Each plan must be:
- A full itinerary with a start time, multiple stops, and an end time
- Using REAL, CURRENTLY EXISTING places in ${location}
- Specific — not "a café" but an actual café name that exists there
- Realistic travel between stops (walking or auto/cab distance)
- Complete — covers food, activity, hangout, and wind-down
- Fully within the group's budget
- Executable TODAY if the group wants

Step 3 — Rate each plan:
- "Perfect Match" → best fits voting pattern
- "Great Choice" → second best fit
- "Good Option" → third option if applicable

Return ONLY a JSON array. No explanation. No extra text. No markdown. No code blocks. Just raw JSON.

Format:
[
  {
    "id": 1,
    "rating": "Perfect Match",
    "ratingScore": 94,
    "title": "Catchy plan title",
    "tagline": "One exciting line describing the whole vibe",
    "totalEstimatedCost": "₹X - ₹Y per person for the full plan",
    "totalDuration": "X hours",
    "energyLevel": "Low / Medium / High",
    "bestStartTime": "4:00 PM",
    "whyYourGroupWillLoveThis": "2 specific lines referencing this group's voting pattern",
    "groupVotePercentage": "60%",
    "itinerary": [
      {
        "stopNumber": 1,
        "time": "4:00 PM",
        "placeName": "Exact real place name",
        "placeType": "Café / Park / Restaurant / Activity spot / etc",
        "area": "Which area/neighbourhood it is in",
        "whatToDo": "2-3 lines — exactly what the group does here",
        "whatToOrder": "Specific recommendations if food/drink stop — leave empty if not applicable",
        "estimatedCostHere": "₹X - ₹Y per person",
        "duration": "X - Y mins",
        "travelToNext": "X min walk / X min auto from here — leave empty for last stop"
      }
    ],
    "proTips": [
      "One practical tip about this plan",
      "One more insider tip"
    ],
    "inCaseItRains": "One backup suggestion if weather is bad"
  }
]

Generate 2 plans minimum, 3 plans maximum.
Each plan must have 3-5 stops in the itinerary.
Order by rating — Perfect Match first.
Make the plans feel like they were planned by a local friend who knows the city well — not a generic tourist guide.`;

  const text = await callAI(prompt);
  try {
    return parseCleanJson(text) as FinalPlan[];
  } catch (error) {
    console.error("Failed to parse Gemini response", text, error);
    throw new Error("Invalid JSON returned by Gemini API");
  }
};
