const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const API_URL = "https://api.deepseek.com/v1/chat/completions";

export interface ItineraryRequest {
  destination: string;
  budget: number;
  duration: number;
  companions: string;
  interests: string[];
}

export interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  cost: number;
}

export interface Hotel {
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  location: string;
}

export interface GeneratedItinerary {
  destination: string;
  budget: number;
  duration: number;
  companions: string;
  dayPlans: DayPlan[];
  hotels: Hotel[];
  totalCost: number;
}

export async function generateItinerary(
  request: ItineraryRequest,
): Promise<GeneratedItinerary> {
  try {
    const prompt = `
      Create a detailed travel itinerary for a ${request.duration}-day trip to ${request.destination} with a budget of ${request.budget}.
      The traveler is going with ${request.companions} and is interested in ${request.interests.join(", ")}.
      
      Please provide:
      1. A day-by-day plan with specific activities, times, locations, descriptions, and costs
      2. Hotel recommendations that fit within the budget
      3. Make sure the total cost stays within the budget of ${request.budget}
      
      Format the response as a JSON object with the following structure:
      {
        "dayPlans": [
          {
            "day": 1,
            "date": "June 15, 2023",
            "activities": [
              {
                "time": "09:00 AM",
                "title": "Activity Name",
                "description": "Description of the activity",
                "location": "Location Name",
                "cost": 50
              }
            ]
          }
        ],
        "hotels": [
          {
            "name": "Hotel Name",
            "description": "Hotel description",
            "price": 150,
            "rating": 4.5,
            "image": "https://images.unsplash.com/photo-id",
            "location": "Hotel Location"
          }
        ],
        "totalCost": 2500
      }
      
      IMPORTANT: Respond ONLY with the JSON object, no additional text.
    `;

    // Set a timeout for the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.5, // Lower temperature for more consistent responses
        max_tokens: 4000,
        stream: false, // Ensure we're not using streaming which can be slower
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `DeepSeek API error: ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extract JSON from the response
    let itineraryData;
    try {
      // First try to parse the entire content as JSON
      itineraryData = JSON.parse(content);
    } catch (e) {
      // If that fails, try to extract JSON from the text
      const jsonMatch = content.match(/\{[\s\S]*\}/m);
      if (!jsonMatch) {
        throw new Error("Failed to parse JSON from DeepSeek response");
      }
      try {
        itineraryData = JSON.parse(jsonMatch[0]);
      } catch (e) {
        throw new Error("Invalid JSON format in response");
      }
    }

    // Add the original request data
    return {
      destination: request.destination,
      budget: request.budget,
      duration: request.duration,
      companions: request.companions,
      ...itineraryData,
    };
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw error;
  }
}

export async function answerItineraryQuestion(
  question: string,
  itinerary: GeneratedItinerary,
): Promise<string> {
  try {
    const itineraryContext = JSON.stringify(itinerary);

    const prompt = `
      You are a helpful travel assistant. The user has the following travel itinerary:
      ${itineraryContext}
      
      The user is asking: "${question}"
      
      Please provide a helpful, accurate, and concise answer based on the itinerary information.
    `;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `DeepSeek API error: ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error answering question:", error);
    throw error;
  }
}
