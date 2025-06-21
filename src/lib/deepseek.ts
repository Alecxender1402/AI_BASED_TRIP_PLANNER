// deepseek.ts
const API_URL = "https://trip-planner-server.onrender.com/api/chat/completions"; // Use your backend route

export interface ItineraryRequest {
  destination: string;
  budget: number;
  duration: number;
  companions: string;
  interests: string[];
}

export interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  cost: number;
}

export interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
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

// ... (DayPlan, Activity, Hotel, GeneratedItinerary interfaces remain same) ...

export async function generateItinerary(
  request: ItineraryRequest
): Promise<GeneratedItinerary> {
  try {
    const response = await fetch("https://trip-planner-server.onrender.com/api/itineraries/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to generate itinerary");
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating itinerary:", error);
    throw error;
  }
}

export async function answerItineraryQuestion(
  question: string,
  itinerary: GeneratedItinerary
): Promise<string> {
  try {
    const response = await fetch("https://trip-planner-server.onrender.com/api/chat/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        message: question,
        itineraryContext: JSON.stringify(itinerary),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get answer");
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Error answering question:", error);
    throw error;
  }
}
