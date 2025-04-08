<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import { theme } from '$lib/stores/theme';
  import { userProfile } from '$lib/stores/authStore';
  import { logout } from '$lib/services/authService';
  import IconSun from '@lucide/svelte/icons/sun';
  import IconMoon from '@lucide/svelte/icons/moon';
  import IconLogOut from '@lucide/svelte/icons/log-out';

  export let projectName = 'Project Name';
  export let workflowName = 'Workflow Name';
  export let badges = ['Badge 1', 'Badge 2', 'Badge 3', '+5'];
  export let description = 'Automate content creation, approval, and publishing workflows for marketing teams.';

  let userAvatar = $userProfile?.attributes?.['avatar'] || 'https://i.pravatar.cc/150?img=24';

  function handleLogout() {
    logout();
  }
</script>

<header class="flex items-center justify-between p-2 top-0" >
  <!-- Left Section: Project Info -->
  <div class="flex flex-col gap-2 max-w-[70%]">
    <div class="flex items-baseline gap-2 flex-wrap">
      <span class="text-xl font-medium text-surface-400">{projectName}</span>
      <span class="text-xl font-medium text-surface-800 dark:text-surface-100">/ {workflowName}</span>
    </div>
    <div class="flex gap-1 flex-wrap">
      {#each badges as badge}
        <span class="badge preset-filled-primary-500 text-xs font-medium">{badge}</span>
      {/each}
    </div>
    <p class="text-sm text-surface-600 dark:text-surface-400 line-clamp-2">{description}</p>
  </div>

  <!-- Right Section: Actions -->
  <div class="flex items-center gap-3">
    <!-- Theme Toggle Button -->
    <button
      on:click={() => theme.toggle()}
      class="btn-icon preset-tonal hover:preset-filled focus:ring-2 focus:ring-primary-500 transition-all duration-200"
      aria-label="Toggle theme between light and dark mode"
      title="Toggle Theme"
    >
      {#if $theme === 'dark'}
        <IconSun size={20} />
      {:else}
        <IconMoon size={20} />
      {/if}
    </button>

    <!-- Logout Button -->
    <button
      on:click={handleLogout}
      class="btn preset-tonal hover:preset-filled focus:ring-2 focus:ring-primary-500 transition-all duration-200 gap-2"
      aria-label="Log out of the application"
    >
      <IconLogOut size={20} />
      <span class="hidden sm:inline text-sm">Logout</span>
    </button>

    <Avatar
      src={userAvatar}
      name="User"
      size="size-8"
      rounded="rounded-full"
      background="bg-surface-200-800"
      classes="ring-2 ring-surface-300 dark:ring-surface-700 hover:ring-primary-500 transition-all duration-200" />
  </div>
</header>
