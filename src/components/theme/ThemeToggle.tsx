
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { Button } from '@/components/ui/button';

interface ThemeToggleProps {
  className?: string;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      className={`rounded-full bg-transparent border ${theme === 'dark' ? 'border-draft-yellow/30 hover:bg-draft-yellow/10 hover:text-draft-yellow' : 'border-white/30 hover:bg-white/10 hover:text-white'} ${className}`}
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-[1.2rem] w-[1.2rem] text-draft-yellow" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem] text-white" />
      )}
    </Button>
  );
};

export default ThemeToggle;
