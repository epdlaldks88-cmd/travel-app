import { useSearchParams } from "react-router-dom";
import TripForm from "../components/TripForm";
import TripList from "../components/TripList";
import { useTrips, useCreateTrip, useDeleteTrip } from "../data/hooks";
import { useBackButtonExit } from "../lib/useBackButtonExit";

function HomePage() {
  useBackButtonExit();

  const trips = useTrips();
  const createTrip = useCreateTrip();
  const deleteTrip = useDeleteTrip();

  const [searchParams, setSearchParams] = useSearchParams();
  const showForm = searchParams.get("new") === "1";

  const handleAddTrip = async (data) => {
    await createTrip(data);
    setSearchParams({});
  };

  const handleCancel = () => {
    setSearchParams({});
  };

  const handleDeleteTrip = async (id) => {
    if (!confirm("이 여행을 삭제하시겠습니까?")) return;
    await deleteTrip(id);
  };

  return (
    <div>
      <header className="mb-6 pt-4">
        <h1 className="font-heading text-xl font-medium text-text tracking-tight">
          여행
        </h1>
        <p className="text-xs text-text-muted mt-1 tracking-wide">
          {trips.length > 0 ? `${trips.length} MEMORIES` : "나만의 여행 기록"}
        </p>
      </header>

      {showForm && <TripForm onAdd={handleAddTrip} onCancel={handleCancel} />}

      <TripList trips={trips} onDelete={handleDeleteTrip} />
    </div>
  );
}

export default HomePage;
