import { useEffect } from 'react';
import { HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import Browse from './pages/Browse';
import ExecutiveProfile from './pages/ExecutiveProfile';
import Booking from './pages/Booking';
import Confirmed from './pages/Confirmed';
import MyBookings from './pages/MyBookings';
import ForExecutives from './pages/ForExecutives';
import NotFound from './pages/NotFound';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/executives" element={<Browse />} />
          <Route path="/executives/:id" element={<ExecutiveProfile />} />
          <Route path="/book/:id" element={<Booking />} />
          <Route path="/confirmed/:bookingId" element={<Confirmed />} />
          <Route path="/my-bookings" element={<MyBookings />} />
          <Route path="/for-executives" element={<ForExecutives />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
