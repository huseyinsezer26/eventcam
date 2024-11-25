import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { EventProvider } from './contexts/EventContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Auth from './pages/Auth';
import CreateEvent from './pages/CreateEvent';
import EventView from './pages/EventView';
import Upload from './pages/Upload';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <EventProvider>
        <Router>
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-pink-50">
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/create-event" element={
                  <PrivateRoute>
                    <CreateEvent />
                  </PrivateRoute>
                } />
                <Route path="/event/:id" element={
                  <PrivateRoute>
                    <EventView />
                  </PrivateRoute>
                } />
                <Route path="/upload/:id" element={<Upload />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster position="top-right" />
        </Router>
      </EventProvider>
    </AuthProvider>
  );
}

export default App;