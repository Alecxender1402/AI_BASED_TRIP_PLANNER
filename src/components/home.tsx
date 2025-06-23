import {useState,useEffect} from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(Boolean(localStorage.getItem("token")));

    useEffect(() => {
    const onStorage = () => setIsLoggedIn(Boolean(localStorage.getItem("token")));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

   useEffect(() => {
    setIsLoggedIn(Boolean(localStorage.getItem("token")));
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate(0); 
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header with Auth Buttons */}
      <div className="absolute top-0 right-0 p-4 z-20 flex gap-4">
        {isLoggedIn ? (
          <Button
            variant="outline"
            className="bg-white/80 hover:bg-white text-blue-600 font-medium"
            onClick={handleSignOut}
          >
            Sign Out
          </Button>
        ) : (
          <>
            <Link to="/signin">
              <Button
                variant="outline"
                className="bg-white/80 hover:bg-white text-blue-600 font-medium"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                Sign Up
              </Button>
            </Link>
          </>
        )}
      </div>

      {/* Hero Section */}
      <div
        className="relative h-screen flex flex-col items-center justify-center text-center px-4 md:px-8 lg:px-16"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Content */}
        <motion.div
          className="relative z-10 max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            AI Trip Planner
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            Create personalized travel itineraries tailored to your preferences
            in seconds
          </p>
          <Link to="/plan">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-full"
            >
              Start Planning
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-md"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Tell Us Your Preferences
            </h3>
            <p className="text-gray-600">
              Answer a few simple questions about your destination, budget,
              duration, and travel companions.
            </p>
          </motion.div>

          {/* Feature 2 */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-md"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              AI Creates Your Itinerary
            </h3>
            <p className="text-gray-600">
              Our AI generates a personalized day-by-day plan with activities
              and hotel recommendations.
            </p>
          </motion.div>

          {/* Feature 3 */}
          <motion.div
            className="bg-white p-6 rounded-xl shadow-md"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-blue-600 text-xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Refine With Our Chatbot
            </h3>
            <p className="text-gray-600">
              Ask questions and get instant answers to customize your trip
              further.
            </p>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div
        className="py-16 px-4 md:px-8 lg:px-16 relative"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-blue-900/70" />

        {/* Content */}
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Plan Your Dream Trip?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Let our AI create the perfect itinerary based on your preferences.
          </p>
          <Link to="/plan">
            <Button
              size="lg"
              className="bg-white hover:bg-gray-100 text-blue-600 text-lg px-8 py-6 rounded-full"
            >
              Start Planning Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold">AI Trip Planner</h3>
              <p className="text-gray-400 mt-1">
                Your personal travel assistant
              </p>
            </div>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                About
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} AI Trip Planner. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
