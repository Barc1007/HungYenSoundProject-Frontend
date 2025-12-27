import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AudioProvider } from "./context/AudioContext"
import { UserProvider } from "./context/UserContext"
import { PlaylistProvider } from "./context/PlaylistContext"
import { NotificationProvider } from "./context/NotificationContext"
import { LanguageProvider } from "./context/LanguageContext"
import ProtectedRoute from "./components/ProtectedRoute"
import ErrorBoundary from "./components/ErrorBoundary"
import Home from "./pages/Home"
import Playlists from "./pages/Playlists"
import Search from "./pages/Search"
import SignUp from "./pages/SignUp"
import Profile from "./pages/Profile"
import MyPlaylists from "./pages/MyPlaylists"
import AdminUploads from "./pages/AdminUploads"
import AdminUsers from "./pages/AdminUsers"
import AdminUsersTest from "./pages/AdminUsersTest"
import TrackDetail from "./pages/TrackDetail"
import LikedSongs from "./pages/LikedSongs"
import Liked from "./pages/Liked"
import History from "./pages/History"
import AllTracks from "./pages/AllTracks"

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <NotificationProvider>
          <UserProvider>
            <PlaylistProvider>
              <AudioProvider>
                <Router>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/tracks" element={<AllTracks />} />
                    <Route path="/playlists" element={<Playlists />} />
                    <Route path="/search" element={<Search />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/track/:id" element={<TrackDetail />} />
                    <Route
                      path="/liked-songs"
                      element={
                        <ProtectedRoute>
                          <LikedSongs />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/liked"
                      element={
                        <ProtectedRoute>
                          <Liked />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/history"
                      element={
                        <ProtectedRoute>
                          <History />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/my-playlists"
                      element={
                        <ProtectedRoute>
                          <MyPlaylists />
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
                      path="/admin/uploads"
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminUploads />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/users"
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminUsers />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin/users/test"
                      element={
                        <ProtectedRoute requiredRole="admin">
                          <AdminUsersTest />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Router>
              </AudioProvider>
            </PlaylistProvider>
          </UserProvider>
        </NotificationProvider>
      </LanguageProvider>
    </ErrorBoundary>
  )
}

export default App
