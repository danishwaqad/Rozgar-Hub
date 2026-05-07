import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-3">RozgarHub.pk</h3>
            <p className="text-sm text-gray-400">Pakistan's trusted portal for Govt Jobs, Dubai opportunities, private roles, and scholarships.</p>
            <p className="text-sm text-gray-400 mt-2">Developer: DanishWaqad</p>
            <p className="text-sm text-gray-400">Email: DanishWaqad@gmail.com</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Main Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/category/govt-pk" className="hover:text-green-400 transition">Govt Jobs</Link></li>
              <li><Link to="/category/international" className="hover:text-green-400 transition">Dubai Jobs</Link></li>
              <li><Link to="/scholarships" className="hover:text-green-400 transition">Scholarships</Link></li>
              <li><Link to="/about-us" className="hover:text-green-400 transition">About Us</Link></li>
              <li><Link to="/contact-us" className="hover:text-green-400 transition">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-green-400 transition">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/privacy-policy" className="hover:text-green-400 transition">Privacy Policy</Link></li>
              <li><Link to="/terms-and-conditions" className="hover:text-green-400 transition">Terms & Conditions</Link></li>
              <li><Link to="/disclaimer" className="hover:text-green-400 transition">Disclaimer</Link></li>
              <li><Link to="/data-sources" className="hover:text-green-400 transition">Data Sources & Editorial Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm">
          <p>© 2026 RozgarHub.pk. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}