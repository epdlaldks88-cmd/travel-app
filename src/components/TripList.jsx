import TripCard from "./TripCard";
import { Card, Section } from "./ui";

function TripList({ trips, onDelete }) {
  return (
    <Section title={`내 여행 목록 (${trips.length})`}>
      {trips.length === 0 ? (
        <Card padding="lg" className="text-center text-text-subtle">
          아직 등록된 여행이 없습니다
        </Card>
      ) : (
        <div className="space-y-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} onDelete={onDelete} />
          ))}
        </div>
      )}
    </Section>
  );
}

export default TripList;
