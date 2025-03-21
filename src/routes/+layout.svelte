<script lang="ts">
  import { theme } from '$lib/stores/theme'; // Theme store (assumed)
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { initAuthorization } from '$lib/services/authService'; // Authentication service (assumed)
  import Header from '$lib/components/Header.svelte'; // Custom header component (assumed)
  import IconMenu from '@lucide/svelte/icons/menu'; // Lucide icons
  import IconFolder from '@lucide/svelte/icons/folder';
  import IconImage from '@lucide/svelte/icons/image';
  import IconMusic from '@lucide/svelte/icons/music';
  import IconVideo from '@lucide/svelte/icons/video';
  import IconGames from '@lucide/svelte/icons/gamepad';
  import IconSettings from '@lucide/svelte/icons/settings';
  import { Navigation } from '@skeletonlabs/skeleton-svelte';
  import '../app.css'; // Global styles with Tailwind CSS

  // Props for children (main content)
  let { children } = $props();

  // Theme handling: Update 'dark' class on HTML element
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

  // Initialize authentication on mount
  onMount(() => {
    initAuthorization();
  });

  // Header props (customize as needed)
  let headerProps = {
    projectName: 'Project Name',
    workflowName: 'Workflow Name',
    badges: ['Badge 1', 'Badge 2', 'Badge 3', '+5'],
    description: 'Automate content creation, approval, and publishing workflows for marketing teams.',
    userAvatar: 'https://i.pravatar.cc/150?img=48'
  };

  // Navigation rail state
  let isExpanded = $state(true);

  // Toggle navigation rail expansion
  function toggleExpanded() {
    isExpanded = !isExpanded;
  }
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

<!-- Root layout container -->
<div class="flex h-screen bg-white dark:bg-gray-900 text-gray-800 dark:text-white">
  <!-- Sidebar with Navigation.Rail (hidden on small screens) -->
  <aside class="hidden md:flex md:flex-col w-64 h-full shadow-md overflow-hidden">
    <div class="flex flex-col h-full">
      <Navigation.Rail expanded={isExpanded}>
        <!-- Header section -->
        {#snippet header()}
          <div class="flex flex-col space-y-2">
            <Navigation.Tile
              labelExpanded="Menu"
              onclick={toggleExpanded}
              title="Toggle Menu Width">
              <div class=" flex items-center justify-center">
                <IconMenu />
              </div>
            </Navigation.Tile>
          </div>
        {/snippet}

        <!-- Main navigation tiles -->
        {#snippet tiles()}
          <div class="flex flex-col space-y-2">
            <Navigation.Tile labelExpanded="Browse Files" href="#/files">
              <IconFolder />
            </Navigation.Tile>
            <Navigation.Tile labelExpanded="Browse Images" href="#/images">
              <IconImage />
            </Navigation.Tile>
            <Navigation.Tile labelExpanded="Browse Music" href="#/music">
              <IconMusic />
            </Navigation.Tile>
            <Navigation.Tile labelExpanded="Browse Videos" href="#/videos">
              <IconVideo />
            </Navigation.Tile>
            <Navigation.Tile labelExpanded="Browse Games" href="#/games">
              <IconGames />
            </Navigation.Tile>
          </div>
        {/snippet}

        <!-- Footer section -->
        {#snippet footer()}
          <div class="flex flex-col space-y-2 mt-auto">
            <Navigation.Tile
              labelExpanded="Settings"
              href="#/settings"
              title="Settings">
              <div class="w-6 h-6 flex items-center justify-center">
                <IconSettings />
              </div>
            </Navigation.Tile>
          </div>
        {/snippet}
      </Navigation.Rail>
    </div>
  </aside>

  <!-- Main content area -->
  <div class="flex-1 flex flex-col">
    <!-- Sticky header -->
    <header class="sticky top-0 z-10 bg-white dark:bg-gray-900 p-4 shadow-md">
      <Header {...headerProps} />
    </header>

    <!-- Scrollable main content -->
    <main class="flex-1 overflow-y-auto p-4">
      {@render children()}
    </main>
  </div>
</div>

<!-- Footer -->
<footer class="bg-gray-100 dark:bg-gray-800 p-4 text-gray-800 dark:text-gray-200">
  <div class="container mx-auto">
    <p>© 2023 My App. All rights reserved.</p>
  </div>
</footer>
