// itineraryStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  GeneratedItinerary,
  ItineraryRequest,
  generateItinerary,
} from "./deepseek";

interface ItineraryState {
  currentItinerary: GeneratedItinerary | null;
  isLoading: boolean;
  error: string | null;
  setItinerary: (itinerary: GeneratedItinerary) => void;
  createItinerary: (request: ItineraryRequest) => Promise<GeneratedItinerary>;
  saveItinerary: () => Promise<string>; // Returns itinerary ID
  loadItinerary: (itineraryId: string) => Promise<void>;
}

export const useItineraryStore = create<ItineraryState>()(
  persist(
    (set, get) => ({
      currentItinerary: null,
      isLoading: false,
      error: null,

      setItinerary: (itinerary) => set({ currentItinerary: itinerary }),

      createItinerary: async (request) => {
        set({ isLoading: true, error: null });
        try {
          const itinerary = await generateItinerary(request);
          set({ currentItinerary: itinerary, isLoading: false });
          return itinerary;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to generate itinerary";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      saveItinerary: async () => {
        const { currentItinerary } = get();
        if (!currentItinerary) throw new Error("No itinerary to save");

        try {
          const response = await fetch("https://trip-planner-server.onrender.com/api/itineraries", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(currentItinerary),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to save itinerary");
          }

          const data = await response.json();
          return data._id; // Return MongoDB ID
        } catch (error) {
          console.error("Error saving itinerary:", error);
          throw error;
        }
      },

      loadItinerary: async (itineraryId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`https://trip-planner-server.onrender.com/api/itineraries/${itineraryId}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to load itinerary");
          }

          const itinerary = await response.json();
          set({ currentItinerary: itinerary, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to load itinerary";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
    }),
    {
      name: "itinerary-storage",
    }
  )
);
