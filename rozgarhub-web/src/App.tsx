import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import JobDetail from './pages/JobDetail';
import JobsByCategory from './pages/JobsByCategory';
import Scholarships from './pages/Scholarships';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import Disclaimer from './pages/Disclaimer';
import DataSources from './pages/DataSources';
import Faq from './pages/Faq';
import NotFound from './pages/NotFound';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/job/:slug" element={<JobDetail />} />
              <Route path="/category/:category" element={<JobsByCategory />} />
              <Route path="/scholarships" element={<Scholarships />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              <Route path="/data-sources" element={<DataSources />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster position="top-right" />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;