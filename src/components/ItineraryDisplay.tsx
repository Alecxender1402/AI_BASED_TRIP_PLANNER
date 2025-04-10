import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useItineraryStore } from "@/lib/itineraryStore";
import { useNavigate } from "react-router-dom";
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
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, DollarSign, MapPin, Users } from "lucide-react";
import ChatInterface from "./ChatInterface";

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

interface ItineraryDisplayProps {
  destination: string;
  budget: number;
  duration: number;
  companions: string;
  dayPlans?: DayPlan[];
  hotels?: Hotel[];
  totalCost?: number;
}

const ItineraryDisplay: React.FC<ItineraryDisplayProps> = (props) => {
  const navigate = useNavigate();
  const { currentItinerary } = useItineraryStore();
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Use either the props or the stored itinerary
  const {
    destination = currentItinerary?.destination || "Japan",
    budget = currentItinerary?.budget || 3000,
    duration = currentItinerary?.duration || 7,
    companions = currentItinerary?.companions || "Family",
    dayPlans = currentItinerary?.dayPlans || defaultDayPlans,
    hotels = currentItinerary?.hotels || defaultHotels,
    totalCost = currentItinerary?.totalCost || 2650,
  } = props;

  useEffect(() => {
    // If no itinerary is available, redirect to the planning page
    if (!currentItinerary && !props.destination) {
      navigate("/plan");
    }
  }, [currentItinerary, navigate, props.destination]);
  const remainingBudget = budget - totalCost;
  const budgetStatus = remainingBudget >= 0 ? "Under budget" : "Over budget";

  return (
    <div className="container mx-auto p-4 bg-background">
      {/* Summary Header */}
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
          {/* <Badge variant={remainingBudget >= 0 ? "default" : "destructive"}>
            {budgetStatus}: ${Math.abs(remainingBudget)}
          </Badge> */}
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
                      <h3 className="text-lg font-semibold">
                        Day {day.day}
                      </h3>
                    </div>

                    {day.activities.map((activity, actIndex) => (
                      <Card key={actIndex}>
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
                              <span>${activity.cost}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
                    <Card key={index}>
                      <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">
                          {hotel.name}
                        </CardTitle>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline">${hotel.price}/night</Badge>
                          <div className="flex items-center gap-1">
                            <span>★</span>
                            <span>{hotel.rating}/5</span>
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
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Map Visualization Placeholder */}
          {/* <Card>
            <CardHeader>
              <CardTitle>Trip Map</CardTitle>
              <CardDescription>
                Visual overview of your destinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square w-full bg-muted rounded-md flex items-center justify-center">
                <div className="text-center p-4">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p>Interactive map would display here</p>
                  <p className="text-sm text-muted-foreground">
                    Showing all locations in {destination}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card> */}

          {/* Chat Interface Toggle */}
          <Button className="w-full" onClick={() => setIsChatOpen(!isChatOpen)}>
            {isChatOpen ? "Close Chat Assistant" : "Open Chat Assistant"}
          </Button>

          {/* Chat Interface */}
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

// Default data for preview purposes
const defaultDayPlans: DayPlan[] = [
  {
    day: 1,
    date: "June 15, 2023",
    activities: [
      {
        time: "09:00 AM",
        title: "Arrival at Tokyo Narita Airport",
        description:
          "Check in at the hotel and rest after your flight. Take a short walk around the neighborhood to get familiar with the area.",
        location: "Shinjuku, Tokyo",
        cost: 30,
      },
      {
        time: "12:00 PM",
        title: "Lunch at Local Ramen Shop",
        description: "Try authentic Japanese ramen at a popular local spot.",
        location: "Ichiran Ramen, Shinjuku",
        cost: 15,
      },
      {
        time: "02:00 PM",
        title: "Visit Shinjuku Gyoen National Garden",
        description:
          "Explore one of Tokyo's most beautiful parks with traditional Japanese gardens.",
        location: "Shinjuku Gyoen",
        cost: 5,
      },
      {
        time: "06:00 PM",
        title: "Dinner at Izakaya",
        description:
          "Experience Japanese pub culture with a variety of small dishes.",
        location: "Memory Lane, Shinjuku",
        cost: 30,
      },
    ],
  },
  {
    day: 2,
    date: "June 16, 2023",
    activities: [
      {
        time: "08:00 AM",
        title: "Breakfast at Hotel",
        description: "Start your day with a traditional Japanese breakfast.",
        location: "Hotel Dining",
        cost: 0,
      },
      {
        time: "10:00 AM",
        title: "Visit Senso-ji Temple",
        description:
          "Explore Tokyo's oldest and most significant Buddhist temple.",
        location: "Asakusa",
        cost: 0,
      },
      {
        time: "01:00 PM",
        title: "Lunch at Sushi Restaurant",
        description: "Enjoy fresh sushi at a recommended restaurant.",
        location: "Tsukiji Outer Market",
        cost: 25,
      },
      {
        time: "03:00 PM",
        title: "Tokyo Skytree",
        description:
          "Visit one of the tallest towers in the world for panoramic views of Tokyo.",
        location: "Sumida",
        cost: 25,
      },
      {
        time: "07:00 PM",
        title: "Dinner Cruise on Tokyo Bay",
        description:
          "Enjoy dinner while cruising around Tokyo Bay with night views of the city.",
        location: "Tokyo Bay",
        cost: 80,
      },
    ],
  },
  {
    day: 3,
    date: "June 17, 2023",
    activities: [
      {
        time: "09:00 AM",
        title: "Day Trip to Hakone",
        description:
          "Take a day trip to Hakone to see Mt. Fuji and enjoy hot springs.",
        location: "Hakone",
        cost: 100,
      },
      {
        time: "12:30 PM",
        title: "Lunch with Lake View",
        description:
          "Enjoy lunch with a view of Lake Ashi and possibly Mt. Fuji.",
        location: "Hakone Restaurant",
        cost: 30,
      },
      {
        time: "02:00 PM",
        title: "Hakone Open-Air Museum",
        description:
          "Visit this unique outdoor museum featuring sculptures and art installations.",
        location: "Hakone",
        cost: 15,
      },
      {
        time: "05:00 PM",
        title: "Onsen Experience",
        description: "Relax in a traditional Japanese hot spring bath.",
        location: "Hakone Onsen",
        cost: 20,
      },
      {
        time: "08:00 PM",
        title: "Return to Tokyo",
        description: "Head back to your hotel in Tokyo.",
        location: "Tokyo",
        cost: 30,
      },
    ],
  },
  {
    day: 4,
    date: "June 18, 2023",
    activities: [
      {
        time: "10:00 AM",
        title: "Explore Harajuku",
        description:
          "Visit the trendy district known for youth fashion and culture.",
        location: "Harajuku",
        cost: 0,
      },
      {
        time: "12:00 PM",
        title: "Lunch at Kawaii Monster Cafe",
        description: "Experience the colorful and quirky themed cafe.",
        location: "Harajuku",
        cost: 30,
      },
      {
        time: "02:00 PM",
        title: "Shopping in Omotesando",
        description:
          "Explore the upscale shopping district often called Tokyo's Champs-Élysées.",
        location: "Omotesando",
        cost: 50,
      },
      {
        time: "06:00 PM",
        title: "Dinner at Shibuya",
        description: "Enjoy dinner in the vibrant Shibuya district.",
        location: "Shibuya",
        cost: 35,
      },
      {
        time: "08:00 PM",
        title: "Shibuya Crossing Experience",
        description:
          "Witness the famous scramble crossing, one of the busiest in the world.",
        location: "Shibuya",
        cost: 0,
      },
    ],
  },
  {
    day: 5,
    date: "June 19, 2023",
    activities: [
      {
        time: "09:00 AM",
        title: "Visit Tsukiji Outer Market",
        description:
          "Explore the famous food market with various Japanese delicacies.",
        location: "Tsukiji",
        cost: 0,
      },
      {
        time: "11:00 AM",
        title: "Sushi Making Class",
        description: "Learn how to make sushi from professional chefs.",
        location: "Tsukiji Area",
        cost: 60,
      },
      {
        time: "02:00 PM",
        title: "Imperial Palace Gardens",
        description:
          "Visit the beautiful gardens surrounding the Imperial Palace.",
        location: "Chiyoda",
        cost: 0,
      },
      {
        time: "05:00 PM",
        title: "Akihabara Electric Town",
        description:
          "Explore the center of anime and manga culture and electronics shops.",
        location: "Akihabara",
        cost: 30,
      },
      {
        time: "08:00 PM",
        title: "Dinner at Maid Cafe",
        description: "Experience the unique themed cafe culture of Japan.",
        location: "Akihabara",
        cost: 40,
      },
    ],
  },
  {
    day: 6,
    date: "June 20, 2023",
    activities: [
      {
        time: "10:00 AM",
        title: "Day Trip to Kamakura",
        description:
          "Visit this coastal town known for its temples, shrines, and the Great Buddha.",
        location: "Kamakura",
        cost: 15,
      },
      {
        time: "12:00 PM",
        title: "Lunch at Local Restaurant",
        description:
          "Try Kamakura's local specialty, Shirasu (whitebait) dishes.",
        location: "Kamakura",
        cost: 20,
      },
      {
        time: "02:00 PM",
        title: "Visit Great Buddha (Daibutsu)",
        description: "See the famous bronze statue of Amida Buddha.",
        location: "Kotoku-in Temple",
        cost: 8,
      },
      {
        time: "04:00 PM",
        title: "Hasedera Temple",
        description:
          "Visit this beautiful temple with a great view of Kamakura.",
        location: "Kamakura",
        cost: 4,
      },
      {
        time: "07:00 PM",
        title: "Return to Tokyo for Dinner",
        description: "Head back to Tokyo and enjoy dinner.",
        location: "Tokyo",
        cost: 40,
      },
    ],
  },
  {
    day: 7,
    date: "June 21, 2023",
    activities: [
      {
        time: "09:00 AM",
        title: "Souvenir Shopping",
        description:
          "Pick up souvenirs for friends and family at Asakusa or department stores.",
        location: "Various locations",
        cost: 100,
      },
      {
        time: "12:00 PM",
        title: "Final Lunch in Tokyo",
        description:
          "Enjoy your last meal in Tokyo at a restaurant of your choice.",
        location: "Tokyo",
        cost: 30,
      },
      {
        time: "02:00 PM",
        title: "Relax at Hotel",
        description: "Pack your belongings and prepare for departure.",
        location: "Hotel",
        cost: 0,
      },
      {
        time: "06:00 PM",
        title: "Transfer to Airport",
        description: "Head to Narita Airport for your departure flight.",
        location: "Narita Airport",
        cost: 30,
      },
    ],
  },
];

const defaultHotels: Hotel[] = [
  {
    name: "Shinjuku Granbell Hotel",
    description:
      "Modern hotel located in the heart of Shinjuku with easy access to transportation and attractions.",
    price: 120,
    rating: 4.3,
    image:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    location: "Shinjuku, Tokyo",
  },
  {
    name: "Hotel Gracery Shinjuku",
    description:
      "Famous for the Godzilla head on its terrace, this hotel offers comfortable rooms and great dining options.",
    price: 150,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&q=80",
    location: "Shinjuku, Tokyo",
  },
  {
    name: "Asakusa View Hotel",
    description:
      "Traditional hotel with stunning views of the Tokyo Skytree and convenient location near Senso-ji Temple.",
    price: 135,
    rating: 4.2,
    image:
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80",
    location: "Asakusa, Tokyo",
  },
  {
    name: "Shibuya Stream Excel Hotel Tokyu",
    description:
      "New hotel connected to Shibuya Station with modern amenities and stylish design.",
    price: 180,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    location: "Shibuya, Tokyo",
  },
  {
    name: "Ryokan Sawanoya",
    description:
      "Traditional Japanese inn offering an authentic experience with tatami rooms and communal baths.",
    price: 100,
    rating: 4.4,
    image:
      "https://images.unsplash.com/photo-1553653924-39b70295f8da?w=800&q=80",
    location: "Ueno, Tokyo",
  },
];

export default ItineraryDisplay;
