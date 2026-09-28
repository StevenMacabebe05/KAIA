import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import Login from './pages/Login'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import Discover from './pages/Discover'
import NGODetail from './pages/NGODetail'
import Donate from './pages/Donate'
import CampaignDetail from './pages/CampaignDetail'
import Volunteer from './pages/Volunteer'
import MyKaia from './pages/MyKaia'
import RegisterNGO from './pages/RegisterNGO'
import NGODashboard from './pages/NGODashboard'
import NGOInbox from './pages/NGOInbox'
import Receipt from './pages/Receipt'
import ScanCheckIn from './pages/ScanCheckIn'
import Notifications from './pages/Notifications'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />

              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/ngo/:id" element={<NGODetail />} />
                <Route path="/donate" element={<Donate />} />
                <Route path="/campaign/:id" element={<CampaignDetail />} />
                <Route path="/volunteer" element={<Volunteer />} />
                <Route path="/receipt/:id" element={<Receipt />} />

                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-kaia"
                  element={
                    <ProtectedRoute>
                      <MyKaia />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/register-ngo"
                  element={
                    <ProtectedRoute>
                      <RegisterNGO />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute requireRole="ngo_rep">
                      <NGODashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inbox"
                  element={
                    <ProtectedRoute requireRole="ngo_rep">
                      <NGOInbox />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/scan"
                  element={
                    <ProtectedRoute requireRole="ngo_rep">
                      <ScanCheckIn />
                    </ProtectedRoute>
                  }
                />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}