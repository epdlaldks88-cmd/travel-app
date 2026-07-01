import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TripDetailPage from "./pages/TripDetailPage";
import MapPage from "./pages/MapPage";
import StatsPage from "./pages/StatsPage";
import ProfilePage from "./pages/ProfilePage";
import BottomTabBar from "./components/BottomTabBar";

function App() {
  return (
    <BrowserRouter>
      <div
        className="min-h-screen"
        style={{
          background: "#FAF9F5",
          paddingBottom: "calc(56px + env(safe-area-inset-bottom))",
        }}
      >
        <div className="max-w-2xl mx-auto p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/trips/:id" element={<TripDetailPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </div>
        <BottomTabBar />
      </div>
    </BrowserRouter>
  );
}

export default App;
