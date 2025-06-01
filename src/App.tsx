import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingFallback from './components/LoadingFallback';
import ScrollToTop from './components/ScrollToTop';

// Import all page components
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import LocationDetail from './pages/LocationDetail';
import Bookings from './pages/Bookings';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Host from './pages/Host';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';
import ListSpace from './pages/ListSpace';
import EditSpace from './pages/EditSpace';
import HostDashboard from './pages/HostDashboard';
import ManageListings from './pages/ManageListings';
import HostSettings from './pages/HostSettings';

function AppContent() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback message="Loading application..." />;
  }

  return (
    <Routes>
      <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
      <Route path="/login" element={<ErrorBoundary><Login /></ErrorBoundary>} />
      <Route path="/signup" element={<ErrorBoundary><Signup /></ErrorBoundary>} />
      <Route path="/locations/:id" element={<ErrorBoundary><LocationDetail /></ErrorBoundary>} />
      <Route path="/bookings" element={<ErrorBoundary><Bookings /></ErrorBoundary>} />
      <Route path="/messages" element={<ErrorBoundary><Messages /></ErrorBoundary>} />
      <Route path="/messages/:id" element={<ErrorBoundary><Messages /></ErrorBoundary>} />
      <Route path="/profile" element={<ErrorBoundary><Profile /></ErrorBoundary>} />
      <Route path="/host" element={<ErrorBoundary><Host /></ErrorBoundary>} />
      <Route path="/about" element={<ErrorBoundary><About /></ErrorBoundary>} />
      <Route path="/terms" element={<ErrorBoundary><Terms /></ErrorBoundary>} />
      <Route path="/privacy" element={<ErrorBoundary><Privacy /></ErrorBoundary>} />
      <Route path="/contact" element={<ErrorBoundary><Contact /></ErrorBoundary>} />
      <Route path="/list-space" element={<ErrorBoundary><ListSpace /></ErrorBoundary>} />
      <Route path="/host/dashboard" element={<ErrorBoundary><HostDashboard /></ErrorBoundary>} />
      <Route path="/host/listings" element={<ErrorBoundary><ManageListings /></ErrorBoundary>} />
      <Route path="/host/listings/:id/edit" element={<ErrorBoundary><EditSpace /></ErrorBoundary>} />
      <Route path="/host/settings" element={<ErrorBoundary><HostSettings /></ErrorBoundary>} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <ErrorBoundary>
              <Navbar />
            </ErrorBoundary>
            <main className="flex-grow bg-gray-50">
              <AppContent />
            </main>
            <ErrorBoundary>
              <Footer />
            </ErrorBoundary>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;