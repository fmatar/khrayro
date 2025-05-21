<script lang="ts">
  import { theme } from '$lib/stores/theme';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { initAuthorization } from '$lib/services/authService';
  import Header from '$lib/components/Header.svelte';
  import '../app.css';

  let { children } = $props();

  const appVersion = '1.0.0';
  const currentYear = new Date().getFullYear();

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

  onMount(() => {
    initAuthorization();
  });

  let headerProps = {
    projectName: 'Chat with Khrayro',
    workflowName: 'Workflow Name',
    badges: ['Badge 1', 'Badge 2', 'Badge 3', '+5'],
    description: 'Automate content creation, approval, and publishing workflows for marketing teams.',
    userAvatar: 'https://i.pravatar.cc/150?img=48'
  };
</script>

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

<!-- Layout: pinned header and footer, only chat scrolls -->
<div class="flex flex-col h-screen overflow-hidden">
  <!-- Header -->
  <header class="shrink-0 border-b border-surface-200-800 bg-surface-50-950 p-2">
    <Header {...headerProps} />
  </header>

  <!-- Main (scroll owner) -->
  <main class="flex-1 overflow-hidden">
    <div class="flex flex-col h-full">
      {@render children()}
    </div>
  </main>

  <!-- Footer -->
  <footer class="shrink-0 border-t border-surface-200-800 p-4 bg-surface-50-950 text-xs">
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <p class="opacity-70">© {currentYear} My App. All rights reserved.</p>
        <span class="text-surface-400">v{appVersion}</span>
      </div>
      <div class="flex gap-4">
        <a href="/terms" class="text-primary-500 hover:text-primary-600 transition-colors duration-200">Terms of Service</a>
        <a href="/privacy" class="text-primary-500 hover:text-primary-600 transition-colors duration-200">Privacy Policy</a>
        <a href="/contact" class="text-primary-500 hover:text-primary-600 transition-colors duration-200">Contact Us</a>
      </div>
    </div>
  </footer>
</div>
