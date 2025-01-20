import './index.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { BrowserRouter, Route, Routes } from 'react-router'
import Register from './pages/Register.tsx'
import Login from './pages/Login.tsx'
import Home from './pages/Home.tsx'
import AuthLayout from './layout/AuthLayout.tsx'
import MainLayout from './layout/MainLayout.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='auth' element={<AuthLayout/>}>
          <Route path="register" element={<Register />} />
          <Route path="login" element={<Login />} />
        </Route>
        <Route path="/" element={<MainLayout/>}>
          <Route index element={<Home />} />
          <Route path="main" element={<App />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
