export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      itineraries: {
        Row: {
          id: string;
          created_at: string;
          user_id: string;
          destination: string;
          budget: number;
          duration: number;
          companions: string;
          itinerary_data: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          user_id: string;
          destination: string;
          budget: number;
          duration: number;
          companions: string;
          itinerary_data: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          user_id?: string;
          destination?: string;
          budget?: number;
          duration?: number;
          companions?: string;
          itinerary_data?: Json;
        };
      };
      users: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          name: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          email: string;
          name?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          email?: string;
          name?: string | null;
        };
      };
    };
  };
}
