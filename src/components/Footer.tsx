
import React from 'react';
import { Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-draft-footer text-white py-16 px-8 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl font-serif mb-6 text-[#E9FA93]">Draft Zero</h2>
          <div className="flex gap-4">
            <a href="#" className="bg-[#0E3C26] p-3 rounded-lg hover:opacity-90 transition-opacity">
              <Twitter size={20} className="text-white" />
            </a>
            <a href="#" className="bg-[#0E3C26] p-3 rounded-lg hover:opacity-90 transition-opacity">
              <Instagram size={20} className="text-white" />
            </a>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-4">ABOUT US</h3>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-gray-300">Privacy policy</a></li>
              <li><a href="#" className="hover:text-gray-300">Terms of service</a></li>
              <li><a href="#" className="hover:text-gray-300">Contact information</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
