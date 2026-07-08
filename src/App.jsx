import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TripDetailPage from "./pages/TripDetailPage";
import FavoritesPage from "./pages/FavoritesPage";
import StatsPage from "./pages/StatsPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import ProtectedLayout from "./components/ProtectedLayout";
import { ToastProvider } from "./components/Toast";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* 공개 라우트 */}
          <Route path="/login" element={<LoginPage />} />

          {/* 로그인 필수 라우트 (컨테이너 + 탭바 포함) */}
          <Route element={<ProtectedLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/trips/:id" element={<TripDetailPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
