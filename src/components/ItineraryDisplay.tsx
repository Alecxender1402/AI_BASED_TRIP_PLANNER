import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, MapPin, Users } from "lucide-react";
import ChatInterface from "./ChatInterface";
import axios from "axios";
import { toast } from "sonner";

interface Activity {
  time: string;
  title: string;
  description: string;
  location: string;
  cost: number;
}

interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
}

interface Hotel {
  name: string;
  description: string;
  price: number;
  rating: number;
  image: string;
  location: string;
}

interface Itinerary {
  destination: string;
  budget: number;
  duration: number;
  companions: string;
  dayPlans: DayPlan[];
  hotels: Hotel[];
  totalCost: number;
}

const ItineraryDisplay: React.FC = () => {
  const navigate = useNavigate();
  const { itineraryId } = useParams<{ itineraryId: string }>();

  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    async function fetchItinerary() {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("You need to be logged in to view this page.");
          navigate("/signin");
          return;
        }
        const response = await axios.get(
          `https://trip-planner-server.onrender.com/api/itineraries/${itineraryId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setItinerary(response.data);
      } catch (error) {
        navigate("/plan");
      } finally {
        setLoading(false);
      }
    }
    if (itineraryId) {
      fetchItinerary();
    } else {
      navigate("/plan");
    }
  }, [itineraryId, navigate]);

  if (loading) return <div>Loading...</div>;
  if (!itinerary) return null;

  const {
    destination,
    budget,
    duration,
    companions,
    dayPlans,
    hotels,
    totalCost,
  } = itinerary;

  const remainingBudget = budget - totalCost;
  const budgetStatus = remainingBudget >= 0 ? "Under budget" : "Over budget";

  return (
    <div className="container mx-auto p-4 bg-background">
      {/* Summary Header */}
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => navigate("/")}>
          ← Back to Home
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            localStorage.removeItem("token");
            toast.success("Logged out successfully");
            navigate("/");
          }}
        >
          Log Out
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Your {duration}-Day Trip to {destination}
        </h1>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>{duration} days</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Traveling with {companions}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span>Budget: ${budget}</span>
          </div>
        </div>
        <p className="text-muted-foreground">
          We've crafted a personalized itinerary based on your preferences.
          Explore your day-by-day plan, hotel recommendations, and use the chat
          assistant for any questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Day-by-Day Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Day-by-Day Itinerary</CardTitle>
              <CardDescription>
                Your detailed travel plan for each day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={`day-1`} className="w-full">
                <TabsList className="mb-4 flex flex-wrap">
                  {Array.from({ length: duration }).map((_, i) => (
                    <TabsTrigger key={i} value={`day-${i + 1}`}>
                      Day {i + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {dayPlans.map((day, index) => (
                  <TabsContent
                    key={index}
                    value={`day-${day.day}`}
                    className="space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Day {day.day}</h3>
                    </div>
                    {day.activities.map((activity, actIndex) => (
                      <a
                        key={actIndex}
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          activity.location
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between">
                              <CardTitle className="text-base">
                                {activity.title}
                              </CardTitle>
                              <Badge variant="outline">{activity.time}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-2">
                              {activity.description}
                            </p>
                            <div className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                <span>{activity.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                <span>{activity.cost}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </a>
                    ))}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Hotel Recommendations and Chat */}
        <div className="space-y-6">
          {/* Hotel Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Hotel Recommendations</CardTitle>
              <CardDescription>
                Places to stay within your budget
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-4">
                  {hotels.map((hotel, index) => (
                    <a
                      key={index}
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        hotel.name
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Card>
                        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                          <img
                            src="/hotel.jpg"
                            alt={hotel.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">
                            {hotel.name}
                          </CardTitle>
                          <div className="flex justify-between items-center">
                            {/* <Badge variant="outline">${hotel.price}/night</Badge> */}
                            <div className="flex items-center gap-1">
                              <span>★</span>
                              <span>{hotel.rating || "N/A"}/5</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            {hotel.description}
                          </p>
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-4 w-4" />
                            <span>{hotel.location}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Interface Toggle */}
          <Button className="w-full" onClick={() => setIsChatOpen(!isChatOpen)}>
            {isChatOpen ? "Close Chat Assistant" : "Open Chat Assistant"}
          </Button>

          {isChatOpen && (
            <Card>
              <CardHeader>
                <CardTitle>Trip Assistant</CardTitle>
                <CardDescription>
                  Ask questions about your itinerary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChatInterface
                  itineraryContext={{
                    destination,
                    duration,
                    budget,
                    companions,
                  }}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItineraryDisplay;
