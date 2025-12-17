import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AudioProvider } from "../src/context/AudioContext"
import { UserProvider } from "../src/context/UserContext"
import Home from "../src/pages/Home"
import Genres from "../src/pages/Genres"
import Playlists from "../src/pages/Playlists"
import SignUp from "../src/pages/SignUp"
import Profile from "../src/pages/Profile"
import "../src/index.css"

export default function Page() {
  return (
    <UserProvider>
      <AudioProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/genres" element={<Genres />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Router>
      </AudioProvider>
    </UserProvider>
  )
}
