import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import axios from "axios";
import AutoSuggestInput from "@/components/AutoSuggestInput";

export interface TripFormData {
  destination: string;
  budget: number;
  duration: number;
  companions: string;
  interests: string[];
}

const TripQuestionnaire: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<TripFormData>({
    destination: "",
    budget: 1000,
    duration: 7,
    companions: "solo",
    interests: [],
  });

  const interestOptions = [
    { id: "adventure", label: "Adventure & Outdoors" },
    { id: "culture", label: "Culture & History" },
    { id: "food", label: "Food & Cuisine" },
    { id: "relaxation", label: "Relaxation & Wellness" },
    { id: "nightlife", label: "Nightlife & Entertainment" },
    { id: "shopping", label: "Shopping" },
    { id: "family", label: "Family-friendly Activities" },
  ];

  const nextStep = () => {
    if (step < 5) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const [generationError, setGenerationError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const missing: string[] = [];
    if (!formData.destination.trim()) missing.push("destination");
    if (!formData.budget) missing.push("budget");
    if (!formData.duration) missing.push("duration");
    if (!formData.companions.trim()) missing.push("companions");
    if (!formData.interests.length) missing.push("interests");
    return missing;
  };

  const handleSubmit = async () => {
    setGenerationError(null);

    // Progress indicator
    const missingFields = validateForm();
    if (missingFields.length > 0) {
      setFormErrors(missingFields);
      toast.error(`Missing field(s): ${missingFields.join(", ")}`);
      return; // Do not proceed
    } else {
      setFormErrors([]);
    }

    setIsLoading(true);

    const progressInterval = setInterval(() => {
      setGenerationProgress((prev) => (prev < 99 ? prev + 5 : prev));
    }, 5000);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        clearInterval(progressInterval);
        setIsLoading(false);
        toast.error("You must be signed in to create an itinerary.");
        navigate("/signin");
        return;
      }
      const response = await axios.post(
        "https://trip-planner-server.onrender.com/api/itineraries/generate",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      clearInterval(progressInterval);
      setGenerationProgress(100);

      // Assuming backend returns the new itinerary's ID
      const { _id } = response.data;
      navigate(`/itinerary/${_id}`);
    } catch (error) {
      clearInterval(progressInterval);
      setGenerationError("Failed to create itinerary. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInterestChange = (id: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        interests: [...formData.interests, id],
      });
    } else {
      setFormData({
        ...formData,
        interests: formData.interests.filter((interest) => interest !== id),
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <Card className="w-full max-w-4xl bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Plan Your Dream Trip
          </CardTitle>
          <CardDescription className="text-center">
            Answer a few questions and we'll create your personalized itinerary
          </CardDescription>
          <div className="flex justify-between mt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={`w-12 sm:w-16 h-1 rounded-full ${
                  step >= i ? "bg-primary" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="px-6 py-4">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Where would you like to go?
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="destination">Destination place</Label>
                  <AutoSuggestInput
                    type="city"
                    value={formData.destination}
                    onChange={(val) =>
                      setFormData({ ...formData, destination: val })
                    }
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">What's your budget?</h3>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="budget">Budget (USD)</Label>
                    <div className="pt-5">
                      <Slider
                        id="budget"
                        min={500}
                        max={10000}
                        step={100}
                        value={[formData.budget]}
                        onValueChange={(value) =>
                          setFormData({ ...formData, budget: value[0] })
                        }
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-gray-500">$500</span>
                      <span className="text-sm font-medium">
                        ${formData.budget}
                      </span>
                      <span className="text-sm text-gray-500">$10,000</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">How long will you stay?</h3>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="duration">Duration (Days)</Label>
                    <div className="pt-5">
                      <Slider
                        id="duration"
                        min={1}
                        max={30}
                        step={1}
                        value={[formData.duration]}
                        onValueChange={(value) =>
                          setFormData({ ...formData, duration: value[0] })
                        }
                      />
                    </div>
                    <div className="flex justify-between mt-2">
                      <span className="text-sm text-gray-500">1 day</span>
                      <span className="text-sm font-medium">
                        {formData.duration} days
                      </span>
                      <span className="text-sm text-gray-500">30 days</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  Who are you traveling with?
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="companions">Travel Companions</Label>
                  <Select
                    value={formData.companions}
                    onValueChange={(value) =>
                      setFormData({ ...formData, companions: value })
                    }
                  >
                    <SelectTrigger id="companions">
                      <SelectValue placeholder="Select who you're traveling with" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="solo">Solo Travel</SelectItem>
                      <SelectItem value="couple">Couple</SelectItem>
                      <SelectItem value="family">Family with Kids</SelectItem>
                      <SelectItem value="friends">Friends Group</SelectItem>
                      <SelectItem value="business">Business Trip</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  What are your interests?
                </h3>
                <p className="text-sm text-gray-500">Select all that apply</p>
                <div className="space-y-3">
                  {interestOptions.map((interest) => (
                    <div
                      key={interest.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={interest.id}
                        checked={formData.interests.includes(interest.id)}
                        onCheckedChange={(checked) =>
                          handleInterestChange(interest.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={interest.id}>{interest.label}</Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </CardContent>

        <CardFooter className="flex justify-between px-6 py-4 border-t">
          {step > 1 ? (
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          ) : (
            <div></div>
          )}

          {step < 5 ? (
            <Button onClick={nextStep}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <div className="flex flex-col w-full items-end gap-2">
              {generationError && (
                <p className="text-sm text-destructive w-full text-right">
                  {generationError}
                </p>
              )}
              {formErrors.length > 0 && (
                <div className="text-red-600 text-sm mb-2 text-right">
                  Missing field(s): {formErrors.join(", ")}
                </div>
              )}
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="min-w-[180px]"
              >
                {isLoading ? (
                  <>
                    <span className="mr-2">
                      Generating... {generationProgress}%
                    </span>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  </>
                ) : (
                  <>
                    Create Itinerary <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
              {isLoading && (
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default TripQuestionnaire;
