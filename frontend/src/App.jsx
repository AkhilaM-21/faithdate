import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Discover from "./pages/Discover";
import Matches from "./pages/Matches";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Community from "./pages/Community";
import Chat from "./pages/Chat";
import ProfileSetup from "./pages/ProfileSetup";
import AccountSettings from "./pages/AccountSettings";
import Notifications from "./pages/Notifications";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

import { ToastProvider } from "./context/ToastContext";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/setup"
            element={
              <ProtectedRoute>
                <ProfileSetup />
              </ProtectedRoute>
            }
          />

          <Route element={<Layout />}>
            <Route
              path="/discover"
              element={
                <ProtectedRoute>
                  <Discover />
                </ProtectedRoute>
              }
            />

            <Route
              path="/matches"
              element={
                <ProtectedRoute>
                  <Matches />
                </ProtectedRoute>
              }
            />

            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />

            <Route
              path="/community"
              element={
                <ProtectedRoute>
                  <Community />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat/:matchId"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AccountSettings />
                </ProtectedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
          </Route>

        </Routes>
      </BrowserRouter>
    </ToastProvider >
  );
}

export default App;
