import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AlgorithmProvider } from './context/AlgorithmContext';
import { Navbar } from './components/Navbar';
import { SplashScreen } from './pages/SplashScreen';
import { LandingPage } from './pages/LandingPage';
import { EnkripsiPage } from './pages/EnkripsiPage';
import { VisualisasiPage } from './pages/VisualisasiPage';
import { PengembangPage } from './pages/PengembangPage';
import { DekripsiSelectionPage } from './pages/DekripsiSelectionPage';
import { DekripsiDESPage } from './pages/DekripsiDESPage';
import { VisualisasiDekripsiDESPage } from './pages/VisualisasiDekripsiDESPage';

export default function App() {
  return (
    <BrowserRouter>
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
          element={
            <div className="min-h-screen bg-white">
              <Navbar />
              <EnkripsiPage />
            </div>
          }
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

        {/* Redirect unknown routes to splash */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AlgorithmProvider>
    </BrowserRouter>
  );
}
