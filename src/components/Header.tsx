
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center py-5 px-8 md:px-12 lg:px-20">
      <Link to="/" className="logo text-draft-green font-serif text-2xl font-medium hover:opacity-90 transition-opacity">
        draft_zero
      </Link>
      <Button variant="outline" className="border-draft-green text-draft-green hover:text-draft-green hover:bg-draft-bg/80">
        Sign in
      </Button>
    </header>
  );
};

export default Header;
