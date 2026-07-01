import { useState, useEffect } from "react";
import TripForm from "../components/TripForm";
import TripList from "../components/TripList";

function HomePage() {
  const [trips, setTrips] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("trips");
    if (saved) {
      setTrips(JSON.parse(saved));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("trips", JSON.stringify(trips));
  }, [trips, isLoaded]);

  const handleAddTrip = (newTrip) => {
    setTrips([newTrip, ...trips]);
  };

  const handleDeleteTrip = (id) => {
    if (!confirm("이 여행을 삭제하시겠습니까?")) return;
    setTrips(trips.filter((trip) => trip.id !== id));
  };

  return (
    <div>
      <header className="mb-8 pt-4">
        <h1 className="text-3xl font-bold text-slate-800">🧳 여행 관리</h1>
        <p className="text-slate-500 mt-1">나만의 여행 기록</p>
      </header>

      <TripForm onAdd={handleAddTrip} />
      <TripList trips={trips} onDelete={handleDeleteTrip} />
    </div>
  );
}

export default HomePage;
