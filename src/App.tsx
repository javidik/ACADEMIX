import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import ArticleView from "./pages/ArticleView"
import Testimonials from "./pages/Testimonials"
import Subscriptions from "./pages/Subscriptions"
import SettingsPage from "./pages/SettingsPage"
import About from "./pages/About"
import NotFound from "./pages/NotFound"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/article/:id" element={<ArticleView />} />
      <Route path="/testimonials" element={<Testimonials />} />
      <Route path="/subscriptions" element={<Subscriptions />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
