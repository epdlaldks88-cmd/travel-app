import TripCard from "./TripCard";

function TripList({ trips, onDelete }) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-700 mb-3">
        내 여행 목록 ({trips.length})
      </h2>

      {trips.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-400">
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
