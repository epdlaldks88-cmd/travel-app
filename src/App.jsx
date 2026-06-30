import { useState, useEffect } from "react";

function App() {
  // 여행 목록
  const [trips, setTrips] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 폼 입력값들
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [companions, setCompanions] = useState("");

  // [1] 앱이 처음 켜질 때 localStorage에서 데이터 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("trips");
    if (saved) {
      setTrips(JSON.parse(saved));
    }
    setIsLoaded(true); // ← 추가: 로딩 끝났음 표시
  }, []);

  // [2] trips가 바뀔 때마다 localStorage에 저장
  useEffect(() => {
    if (!isLoaded) return; // ← 추가: 로딩 전엔 저장 안 함
    localStorage.setItem("trips", JSON.stringify(trips));
  }, [trips, isLoaded]); // ← isLoaded도 추가

  // 여행 추가
  const handleAddTrip = () => {
    if (!title.trim()) {
      alert("여행 제목을 입력하세요");
      return;
    }

    const newTrip = {
      id: Date.now(),
      title: title,
      startDate: startDate,
      endDate: endDate,
      companions: companions,
    };

    setTrips([newTrip, ...trips]);

    setTitle("");
    setStartDate("");
    setEndDate("");
    setCompanions("");
  };

  // 여행 삭제
  const handleDeleteTrip = (id) => {
    if (!confirm("이 여행을 삭제하시겠습니까?")) return;
    setTrips(trips.filter((trip) => trip.id !== id));
  };

  // 여행 일수 계산 (보너스)
  const calcDays = (start, end) => {
    if (!start || !end) return null;
    const startD = new Date(start);
    const endD = new Date(end);
    const diff = Math.round((endD - startD) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? `${diff}일` : null;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* 헤더 */}
        <header className="mb-8 pt-4">
          <h1 className="text-3xl font-bold text-slate-800">🧳 여행 관리</h1>
          <p className="text-slate-500 mt-1">나만의 여행 기록</p>
        </header>

        {/* 입력 폼 */}
        <section className="bg-white rounded-2xl shadow-sm p-5 mb-6">
          <h2 className="text-lg font-semibold text-slate-700 mb-4">
            새 여행 추가
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                여행 제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 강릉 1박2일"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  시작일
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  종료일
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-600 mb-1">
                동행자
              </label>
              <input
                type="text"
                value={companions}
                onChange={(e) => setCompanions(e.target.value)}
                placeholder="예: 가족, 친구"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <button
              onClick={handleAddTrip}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2.5 rounded-lg transition"
            >
              + 여행 추가
            </button>
          </div>
        </section>

        {/* 여행 리스트 */}
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
              {trips.map((trip) => {
                const days = calcDays(trip.startDate, trip.endDate);
                return (
                  <div
                    key={trip.id}
                    className="bg-white rounded-2xl shadow-sm p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">
                          {trip.title}
                          {days && (
                            <span className="ml-2 text-xs font-normal text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                              {days}
                            </span>
                          )}
                        </h3>
                        {(trip.startDate || trip.endDate) && (
                          <p className="text-sm text-slate-500 mt-1">
                            📅 {trip.startDate} ~ {trip.endDate}
                          </p>
                        )}
                        {trip.companions && (
                          <p className="text-sm text-slate-500">
                            👥 {trip.companions}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="ml-3 text-slate-300 hover:text-red-500 transition text-xl"
                        title="삭제"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
