import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "./supabase";
import {
  generateItinerary,
  GeneratedItinerary,
  ItineraryRequest,
} from "./deepseek";

interface ItineraryState {
  currentItinerary: GeneratedItinerary | null;
  isLoading: boolean;
  error: string | null;
  setItinerary: (itinerary: GeneratedItinerary) => void;
  createItinerary: (request: ItineraryRequest) => Promise<GeneratedItinerary>;
  saveItineraryToSupabase: (userId: string) => Promise<void>;
  loadItineraryFromSupabase: (itineraryId: string) => Promise<void>;
}

export const useItineraryStore = create<ItineraryState>(
  persist(
    (set, get) => ({
      currentItinerary: null,
      isLoading: false,
      error: null,

      setItinerary: (itinerary) => set({ currentItinerary: itinerary }),

      createItinerary: async (request) => {
        set({ isLoading: true, error: null });
        try {
          // Add a fallback mechanism with mock data if API takes too long
          const itineraryPromise = generateItinerary(request);

          // Set a timeout for the entire operation
          // const timeoutPromise = new Promise((_, reject) => {
          //   setTimeout(() => {
          //     reject(new Error("Itinerary generation timed out"));
          //   }, 45000); // 45 second timeout
          // });

          const itinerary = (await Promise.race([
            itineraryPromise,
            // timeoutPromise,
          ])) as GeneratedItinerary;
          set({ currentItinerary: itinerary, isLoading: false });
          return itinerary;
        } catch (error) {
          console.error("Itinerary generation error:", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to generate itinerary";
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      saveItineraryToSupabase: async (userId) => {
        const { currentItinerary } = get();
        if (!currentItinerary) throw new Error("No itinerary to save");

        try {
          const { data, error } = await supabase
            .from("itineraries")
            .insert({
              user_id: userId,
              destination: currentItinerary.destination,
              budget: currentItinerary.budget,
              duration: currentItinerary.duration,
              companions: currentItinerary.companions,
              itinerary_data: currentItinerary,
            })
            .select();

          if (error) throw error;
          return data;
        } catch (error) {
          console.error("Error saving itinerary:", error);
          throw error;
        }
      },

      loadItineraryFromSupabase: async (itineraryId) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("itineraries")
            .select("*")
            .eq("id", itineraryId)
            .single();

          if (error) throw error;
          if (!data) throw new Error("Itinerary not found");

          set({
            currentItinerary: data.itinerary_data as GeneratedItinerary,
            isLoading: false,
          });
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
    },
  ),
);
