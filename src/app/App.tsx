import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AlgorithmProvider } from './context/AlgorithmContext';
import { Navbar } from './components/Navbar';
import { SplashScreen } from './pages/SplashScreen';
import { LandingPage } from './pages/LandingPage';
import { EnkripsiPage } from './pages/EnkripsiPage';
import { VisualisasiPage } from './pages/VisualisasiPage';
import { PengembangPage } from './pages/PengembangPage';
import { DekripsiSelectionPage } from './pages/DekripsiSelectionPage';
import { DekripsiDESPage } from './pages/DekripsiDESPage';
import { DekripsiChaCha20Page } from './pages/DekripsiChaCha20Page';
import { VisualisasiDekripsiDESPage } from './pages/VisualisasiDekripsiDESPage';
import { VisualisasiDekripsiChaCha20Page } from './pages/VisualisasiDekripsiChaCha20Page';

export default function App() {
  return (
    <HashRouter>
      <AlgorithmProvider>
      <Routes>
        {/* Splash screen */}
        <Route path="/" element={<SplashScreen />} />

        {/* Main app routes with navbar */}
        <Route
          path="/beranda"
          element={
            <div className="min-h-screen bg-white">
              <Navbar />
              <LandingPage />
            </div>
          }
        />
        <Route
          path="/enkripsi"
          element={<Navigate to="/uji-coba" replace />}
        />
        <Route
          path="/uji-coba"
          element={
            <div className="min-h-screen bg-white">
              <Navbar />
              <EnkripsiPage />
            </div>
          }
        />
        <Route
          path="/visualisasi"
          element={
            <div className="min-h-screen bg-white">
              <Navbar />
              <VisualisasiPage />
            </div>
          }
        />
        <Route
          path="/pengembang"
          element={
            <div className="min-h-screen bg-white">
              <Navbar />
              <PengembangPage />
            </div>
          }
        />
        <Route
          path="/dekripsi"
          element={
            <div className="min-h-screen bg-white">
              <Navbar />
              <DekripsiSelectionPage />
            </div>
          }
        />
        <Route
          path="/dekripsi/des"
          element={
            <div className="min-h-screen bg-white">
              <Navbar />
              <DekripsiDESPage />
            </div>
          }
        />
        <Route
          path="/visualisasi-dekripsi/des"
          element={
            <div className="min-h-screen bg-white">
              <Navbar />
              <VisualisasiDekripsiDESPage />
            </div>
          }
        />
        <Route
          path="/dekripsi/chacha20"
          element={
            <div className="min-h-screen bg-white">
              <Navbar />
              <DekripsiChaCha20Page />
            </div>
          }
        />
        <Route
          path="/visualisasi-dekripsi/chacha20"
          element={
            <div className="min-h-screen bg-white">
              <Navbar />
              <VisualisasiDekripsiChaCha20Page />
            </div>
          }
        />

        {/* Redirect unknown routes to splash */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AlgorithmProvider>
    </HashRouter>
  );
}
