<script>
  import { theme } from '$lib/stores/theme';
  import { browser } from '$app/environment';

  let menuOpen = false; // State for mobile menu

  if (browser) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme.set(prefersDark ? 'dark' : 'light');
  }

  $: if (browser) {
    const root = document.documentElement;
    if ($theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }
</script>

<div class="min-h-screen flex flex-col">
  <header class="bg-white dark:bg-gray-800 p-4">
    <div class="container mx-auto flex justify-between items-center">
      <div class="text-2xl font-bold text-gray-800 dark:text-white">My App</div>
      <nav class="hidden md:flex space-x-4">
        <a href="/" class="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Home</a>
        <a href="/about" class="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">About</a>
        <a href="/contact"
           class="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Contact</a>
      </nav>
      <button
        on:click={() => theme.set($theme === 'dark' ? 'light' : 'dark')}
        class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
      >
        {#if $theme === 'dark'}
          <span>Sun</span>
        {:else}
          <span>Moon</span>
        {/if}
      </button>
      <button class="md:hidden p-2 text-gray-800 dark:text-gray-200" on:click={() => menuOpen = !menuOpen}>
        {#if menuOpen}X{:else}Menu{/if}
      </button>
    </div>
    {#if menuOpen}
      <nav class="md:hidden bg-white dark:bg-gray-800 p-4">
        <ul class="flex flex-col space-y-2">
          <li><a href="/" class="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Home</a>
          </li>
          <li><a href="/about" class="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">About</a>
          </li>
          <li><a href="/contact" class="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">Contact</a>
          </li>
        </ul>
      </nav>
    {/if}
  </header>
  <main class="flex-1">
    <slot />
  </main>
</div>
