import TripCard from "./TripCard";

function TripList({ trips, onDelete }) {
  return (
    <section>
      <h2 className="text-base font-medium mb-3" style={{ color: "#1E2A38" }}>
        내 여행 목록 ({trips.length})
      </h2>

      {trips.length === 0 ? (
        <div
          className="rounded-xl p-8 text-center"
          style={{
            background: "#FFFFFF",
            border: "0.5px solid #E8E4D8",
            color: "#A8B4C4",
          }}
        >
          아직 등록된 여행이 없습니다
        </div>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}

export default TripList;
