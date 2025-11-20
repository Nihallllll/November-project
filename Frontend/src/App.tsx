import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from './pages/DashboardPage';
import CanvasPage from './pages/CanvasPage';
import MultisigSigningPage from './pages/sign/MultisigSigningPage';
import VotingPage from './pages/sign/VotingPage';
import EscrowPage from './pages/sign/EscrowPage';
import { ThemeProvider } from './components/ThemeProvider';
import { SolanaWalletProvider } from './components/SolanaWalletProvider';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <SolanaWalletProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/canvas/:id?" element={
              <ProtectedRoute>
                <CanvasPage />
              </ProtectedRoute>
            } />
            
            {/* Signing Portal Routes */}
            <Route path="/sign/multisig/:id" element={<MultisigSigningPage />} />
            <Route path="/vote/:id" element={<VotingPage />} />
            <Route path="/escrow/:id" element={<EscrowPage />} />
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </SolanaWalletProvider>
    </ThemeProvider>
  );
}

export default App;
