'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from './ui/button';

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  return (
    <Button variant="ghost" size="sm" onClick={() => setTheme(isDark ? 'light' : 'dark')}>
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="ml-2">{isDark ? 'Light' : 'Dark'}</span>
    </Button>
  );
}
