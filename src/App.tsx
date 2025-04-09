import { Suspense } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import Home from "./components/home";
import TripQuestionnaire from "./components/TripQuestionnaire";
import ItineraryDisplay from "./components/ItineraryDisplay";
import routes from "tempo-routes";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plan" element={<TripQuestionnaire />} />
          <Route path="/itinerary" element={<ItineraryDisplay />} />
        </Routes>
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;
