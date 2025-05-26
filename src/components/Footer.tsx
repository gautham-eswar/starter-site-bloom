
import React from 'react';
import { Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    // Updated footer background for consistency, text color will be handled by specific elements or inherited
    <footer className="bg-slate-900 dark:bg-background py-16 px-8 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
          {/* H2: text-3xl (from Subtask 3), color updated to text-primary-foreground, font-serif removed */}
          <h2 className="text-3xl mb-6 text-primary-foreground">Draft Zero</h2>
          <div className="flex gap-4">
            {/* Social icon link background: bg-primary */}
            <a href="#" className="bg-primary p-3 rounded-lg hover:opacity-90 transition-opacity">
              {/* Social icon color: text-primary-foreground */}
              <Twitter size={20} className="text-primary-foreground" />
            </a>
            <a href="#" className="bg-primary p-3 rounded-lg hover:opacity-90 transition-opacity">
              <Instagram size={20} className="text-primary-foreground" />
            </a>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {/* H3: text-xl (from Subtask 3), color updated to text-primary-foreground */}
            <h3 className="text-xl font-semibold mb-4 text-primary-foreground">ABOUT US</h3>
            <ul className="space-y-2">
              {/* Links: text-muted-foreground with hover effect */}
              <li><a href="#" className="text-muted-foreground hover:text-primary-foreground dark:hover:text-primary-foreground transition-colors">Privacy policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary-foreground dark:hover:text-primary-foreground transition-colors">Terms of service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary-foreground dark:hover:text-primary-foreground transition-colors">Contact information</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
