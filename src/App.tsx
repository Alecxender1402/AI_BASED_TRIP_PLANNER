import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import TripQuestionnaire from "./components/TripQuestionnaire";
import ItineraryDisplay from "./components/ItineraryDisplay";
import SignIn from "./components/auth/SignIn";
import SignUp from "./components/auth/SignUp";
import { Toaster } from 'sonner';
import "react-toastify/dist/ReactToastify.css";
import routes from "tempo-routes";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plan" element={<TripQuestionnaire />} />
          <Route path="/itinerary/:itineraryId" element={<ItineraryDisplay />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
         <Toaster position="bottom-right" richColors />
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
