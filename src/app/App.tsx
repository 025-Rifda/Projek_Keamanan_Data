import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AlgorithmProvider } from './context/AlgorithmContext';
import { Navbar } from './components/Navbar';
import { SplashScreen } from './pages/SplashScreen';
import { LandingPage } from './pages/LandingPage';
import { EnkripsiPage } from './pages/EnkripsiPage';
import { VisualisasiPage } from './pages/VisualisasiPage';
import { PengembangPage } from './pages/PengembangPage';
import { DekripsiSelectionPage } from './pages/DekripsiSelectionPage';

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
        <Route path="/dekripsi/des" element={<Navigate to="/uji-coba" replace state={{ mode: 'decrypt', algorithm: 'DES' }} />} />
        <Route path="/dekripsi/chacha20" element={<Navigate to="/uji-coba" replace state={{ mode: 'decrypt', algorithm: 'ChaCha20' }} />} />

        {/* Redirect unknown routes to splash */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AlgorithmProvider>
    </HashRouter>
  );
}
