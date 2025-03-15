<script lang="ts">
  import { theme } from '$lib/stores/theme';
  import { browser } from '$app/environment';
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import '../app.css';

  let { children } = $props();

  // Reactively update the 'dark' class on the HTML element
  $effect(() => {
    if (browser) {
      const root: HTMLElement = document.documentElement;
      if ($theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  });
</script>

<!-- Set initial theme to prevent flash of unthemed content -->
<svelte:head>
  <script>
    (function() {
      if (typeof window !== 'undefined') {
        const storedTheme = localStorage.getItem('theme');
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = storedTheme || (systemDark ? 'dark' : 'light');
        document.documentElement.classList.add(initialTheme);
      }
    })();
  </script>
</svelte:head>

<div class="min-h-screen flex flex-col">
  <!-- Example header with Tailwind dark mode classes -->
  <header class="bg-white dark:bg-gray-800 p-4 text-gray-800 dark:text-gray-200">
    <h1>My App</h1>
    <button onclick={() => theme.toggle()}>Toggle Theme</button>
    <Avatar src="https://i.pravatar.cc/150?img=48" name="skeleton" />
  </header>

  <!-- Main content -->
  <main class="flex-1">{@render children()}</main>

  <!-- Example footer -->
  <footer class="bg-gray-200 dark:bg-gray-700 p-4 text-gray-800 dark:text-gray-200">
    <p>© 2023 My App</p>
  </footer>
</div>
