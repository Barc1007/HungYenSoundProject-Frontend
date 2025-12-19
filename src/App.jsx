import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AudioProvider } from "./context/AudioContext"
import { UserProvider } from "./context/UserContext"
import { PlaylistProvider } from "./context/PlaylistContext"
import { NotificationProvider } from "./context/NotificationContext"
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
import TrackDetail from "./pages/TrackDetail"
import LikedSongs from "./pages/LikedSongs"
import AllTracks from "./pages/AllTracks"

function App() {
  return (
    <ErrorBoundary>
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
                </Routes>
              </Router>
            </AudioProvider>
          </PlaylistProvider>
        </UserProvider>
      </NotificationProvider>
    </ErrorBoundary>
  )
}

export default App
