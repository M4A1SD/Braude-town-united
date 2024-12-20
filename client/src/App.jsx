import { useState } from 'react'
import MainPage from './components/mainPage'
import LoginPage from './components/loginPage'
import ProfilePage from './components/profilePage'
import { UserProvider } from './components/globalUser'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './Chat/Main'



function App() {


  return (
    <div className="min-h-screen bg-gray-100">
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </Router>
      </UserProvider>
    </div>
  )
}

export default App