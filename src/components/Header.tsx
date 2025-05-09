
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ThemeToggle from './theme/ThemeToggle';
import { useAuth } from './auth/AuthProvider';
import { LogOut, User, DollarSign, Database, HelpCircle } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  // Helper to determine if a route is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="flex justify-between items-center py-5 px-8 md:px-12 lg:px-20">
      <div className="flex items-center">
        <Link to="/" className="logo text-draft-green dark:text-draft-yellow font-serif text-xl font-medium hover:opacity-90 transition-opacity">
          draft_zero
        </Link>
        <ThemeToggle className="ml-1" />
      </div>
      
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center space-x-4 mr-4 font-serif text-sm">
          <Link 
            to="/technology" 
            className={`text-draft-green dark:text-draft-yellow hover:opacity-80 transition-opacity ${isActive('/technology') ? 'font-medium' : ''}`}
          >
            Technology
          </Link>
          <Link 
            to="/pricing" 
            className={`text-draft-green dark:text-draft-yellow hover:opacity-80 transition-opacity ${isActive('/pricing') ? 'font-medium' : ''}`}
          >
            Pricing
          </Link>
          <Link 
            to="/faq" 
            className={`text-draft-green dark:text-draft-yellow hover:opacity-80 transition-opacity ${isActive('/faq') ? 'font-medium' : ''}`}
          >
            FAQ
          </Link>
        </div>
        
        {user ? (
          <div className="flex items-center gap-2">
            <div className="hidden md:block text-xs text-draft-green dark:text-draft-yellow font-serif lowercase">
              {user.email}
            </div>
            <Button 
              variant="outline"
              size="icon"
              className="border-draft-green text-draft-green hover:text-draft-green hover:bg-draft-bg/80 dark:border-draft-yellow dark:text-draft-yellow dark:hover:text-draft-yellow dark:hover:bg-draft-footer/50 font-serif text-sm"
              onClick={handleSignOut}
            >
              <LogOut size={16} />
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            className="border-draft-green text-draft-green hover:text-draft-green hover:bg-draft-bg/80 dark:border-draft-yellow dark:text-draft-yellow dark:hover:text-draft-yellow dark:hover:bg-draft-footer/50 font-serif text-sm"
            onClick={handleSignIn}
          >
            Sign in
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
