import { writable } from 'svelte/store';

type Theme = 'light' | 'dark';

const createThemeStore = () => {
  // Set initial theme: check localStorage first, then system preference
  let initialTheme: Theme = 'light';
  if (typeof window !== 'undefined') {
    const storedTheme = localStorage.getItem('theme');
    initialTheme = storedTheme
      ? (storedTheme as Theme)
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
  }

  const { subscribe, set, update } = writable<Theme>(initialTheme);

  return {
    subscribe,
    set: (value: Theme) => {
      set(value);
      if (typeof window !== 'undefined') {
        localStorage.setItem('theme', value); // Persist theme
      }
    },
    toggle: () =>
      update((current: Theme) => {
        const newTheme = current === 'dark' ? 'light' : 'dark';
        if (typeof window !== 'undefined') {
          localStorage.setItem('theme', newTheme); // Persist theme
        }
        return newTheme;
      }),
  };
};

export const theme = createThemeStore();
