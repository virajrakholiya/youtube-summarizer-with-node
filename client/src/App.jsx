import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './components/Login'
import Register from './components/Register'
import Summarizer from './components/Summarizer'

function App() {
  const { token } = useAuth()

  return (
    <Routes>
      <Route path="/" element={token ? <Summarizer /> : <Navigate to="/login" />} />
      <Route path="/login" element={!token ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!token ? <Register /> : <Navigate to="/" />} />
    </Routes>
  )
}

export default App
