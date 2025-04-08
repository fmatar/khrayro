<script lang="ts">
  import { theme } from '$lib/stores/theme';
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { initAuthorization } from '$lib/services/authService';
  import Header from '$lib/components/Header.svelte';
  import IconMenu from '@lucide/svelte/icons/menu';
  import IconProject from '@lucide/svelte/icons/folder';
  import IconImage from '@lucide/svelte/icons/image';
  import IconMusic from '@lucide/svelte/icons/music';
  import IconVideo from '@lucide/svelte/icons/video';
  import IconGames from '@lucide/svelte/icons/gamepad';
  import IconSettings from '@lucide/svelte/icons/settings';
  import { Navigation } from '@skeletonlabs/skeleton-svelte';
  import '../app.css';

  let { children } = $props();

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
    projectName: 'Project Name',
    workflowName: 'Workflow Name',
    badges: ['Badge 1', 'Badge 2', 'Badge 3', '+5'],
    description: 'Automate content creation, approval, and publishing workflows for marketing teams.',
    userAvatar: 'https://i.pravatar.cc/150?img=48'
  };

  let isExpanded = $state(true);

  function toggleExpanded() {
    isExpanded = !isExpanded;
  }
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

<div class="flex h-screen">
  <!-- Sidebar with Navigation.Rail -->
<!--  <aside class="hidden md:flex md:flex-col h-full bg-surface-50-950 nav-rail">-->
<!--    <Navigation.Rail-->
<!--      expanded={isExpanded}-->
<!--      background="bg-surface-50-950"-->
<!--      width="w-16"-->
<!--      widthExpanded="w-48"-->
<!--      padding="p-2"-->
<!--      tilesGap="gap-1"-->
<!--      classes="transition-all duration-300 ease-in-out"-->
<!--    >-->
<!--      {#snippet header()}-->
<!--        <Navigation.Tile-->
<!--          labelExpanded="Menu"-->
<!--          onclick={toggleExpanded}-->
<!--          title="Toggle Menu Width"-->
<!--        >-->
<!--          <IconMenu size={24} />-->
<!--        </Navigation.Tile>-->
<!--      {/snippet}-->

<!--      {#snippet tiles()}-->
<!--        <Navigation.Tile-->
<!--          labelExpanded="Projects"-->
<!--          href="#/files"-->
<!--        >-->
<!--          <IconProject size={24} />-->
<!--        </Navigation.Tile>-->
<!--        <Navigation.Tile-->
<!--          labelExpanded="Browse Images"-->
<!--          href="#/images"-->
<!--        >-->
<!--          <IconImage size={24} />-->
<!--        </Navigation.Tile>-->
<!--        <Navigation.Tile-->
<!--          labelExpanded="Browse Music"-->
<!--          href="#/music"-->
<!--        >-->
<!--          <IconMusic size={24} />-->
<!--        </Navigation.Tile>-->
<!--        <Navigation.Tile-->
<!--          labelExpanded="Browse Videos"-->
<!--          href="#/videos"-->
<!--        >-->
<!--          <IconVideo size={24} />-->
<!--        </Navigation.Tile>-->
<!--        <Navigation.Tile-->
<!--          labelExpanded="Browse Games"-->
<!--          href="#/games"-->
<!--        >-->
<!--          <IconGames size={24} />-->
<!--        </Navigation.Tile>-->
<!--      {/snippet}-->

<!--      {#snippet footer()}-->
<!--        <Navigation.Tile-->
<!--          labelExpanded="Settings"-->
<!--          href="#/settings"-->
<!--          title="Settings"-->
<!--        >-->
<!--          <IconSettings size={24} />-->
<!--        </Navigation.Tile>-->
<!--      {/snippet}-->
<!--    </Navigation.Rail>-->
<!--  </aside>-->

  <!-- Main content area -->
  <div class="flex-1 flex flex-col">
    <header class="sticky top-0 border-b border-surface-200-800 p-2 bg-surface-50-950">
      <Header {...headerProps} />
    </header>
    <main class="flex-1 overflow-y-auto p-4">
      {@render children()}
    </main>
    <footer class="border-t border-surface-200-800 p-2 bg-surface-50-950">
      <div class="container mx-auto">
        <p class="text-sm opacity-70">© 2023 My App. All rights reserved.</p>
      </div>
    </footer>
  </div>
</div>

<style>
  .nav-rail {
    border-right: 1px solid var(--color-surface-200-800);
  }
</style>
