import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";

// Pages
import HomePage from "./pages/HomePage";
import ServicesPage from "./pages/ServicesPage";
import FAQPage from "./pages/FAQPage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboard from "./pages/AdminDashboard";
import CheckoutPage from "./pages/CheckoutPage";
import AuthCallback from "./pages/AuthCallback";

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/services" element={<Layout><ServicesPage /></Layout>} />
            <Route path="/faq" element={<Layout><FAQPage /></Layout>} />
            <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
            <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
            <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
            <Route path="/auth/callback" element={<AuthCallback />} />
          </Routes>
        </BrowserRouter>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#121212',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
      </div>
    </AuthProvider>
  );
}

export default App;
