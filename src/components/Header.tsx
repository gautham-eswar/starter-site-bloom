
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import ThemeToggle from './theme/ThemeToggle';
import { useAuth } from './auth/AuthProvider';
import { LogOut, User, DollarSign } from 'lucide-react';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  return (
    <header className="flex justify-between items-center py-5 px-8 md:px-12 lg:px-20">
      <div className="flex items-center">
        <Link to="/" className="logo text-draft-green dark:text-draft-yellow font-serif text-2xl font-medium hover:opacity-90 transition-opacity">
          draft_zero
        </Link>
        <ThemeToggle className="ml-1" />
      </div>
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          className="text-draft-green hover:text-draft-green hover:bg-draft-bg/80 dark:text-draft-yellow dark:hover:text-draft-yellow dark:hover:bg-draft-footer/50"
          onClick={() => navigate('/pricing')}
        >
          <DollarSign size={18} className="mr-1" />
          Pricing
        </Button>
        
        {user ? (
          <div className="flex items-center gap-2">
            <div className="hidden md:block text-sm text-draft-green dark:text-draft-yellow">
              {user.email}
            </div>
            <Button 
              variant="outline"
              size="icon"
              className="border-draft-green text-draft-green hover:text-draft-green hover:bg-draft-bg/80 dark:border-draft-yellow dark:text-draft-yellow dark:hover:text-draft-yellow dark:hover:bg-draft-footer/50"
              onClick={handleSignOut}
            >
              <LogOut size={18} />
            </Button>
          </div>
        ) : (
          <Button 
            variant="outline" 
            className="border-draft-green text-draft-green hover:text-draft-green hover:bg-draft-bg/80 dark:border-draft-yellow dark:text-draft-yellow dark:hover:text-draft-yellow dark:hover:bg-draft-footer/50"
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
