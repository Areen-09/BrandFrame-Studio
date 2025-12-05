'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        // Check initial theme
        if (
            localStorage.theme === 'dark' ||
            (!('theme' in localStorage) &&
                window.matchMedia('(prefers-color-scheme: dark)').matches)
        ) {
            setTheme('dark');
            document.documentElement.classList.add('dark');
        } else {
            setTheme('light');
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
            localStorage.theme = 'dark';
            document.documentElement.classList.add('dark');
        } else {
            setTheme('light');
            localStorage.theme = 'light';
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="rounded-full p-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <Moon className="h-5 w-5 text-zinc-900" />
            ) : (
                <Sun className="h-5 w-5 text-zinc-100" />
            )}
        </button>
    );
}
