<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton-svelte';
  import { theme } from '$lib/stores/theme';
  import { userProfile } from '$lib/stores/authStore';
  import { logout } from '$lib/services/authService';

  export let projectName = 'Project Name';
  export let workflowName = 'Workflow Name';
  export let badges = ['Badge 1', 'Badge 2', 'Badge 3', '+5'];
  export let description = 'Automate content creation, approval, and publishing workflows for marketing teams.';

  // Get user avatar from authStore (fallback to placeholder)
  let userAvatar = $userProfile?.avatar || 'https://i.pravatar.cc/150?img=24';

  function handleLogout() {
    logout(); // Explicitly call logout function
  }
</script>

<header class="flex items-center justify-between p-2">
  <div class="flex flex-col pl-2">
    <div class="text-lg font-semibold">
      <span class="text-gray-400">{projectName} / </span>
      <span class="text-gray-800 dark:text-white">{workflowName}</span>
    </div>
    <div class="flex gap-2 mt-1">
      {#each badges as badge}
        <p>{badge}</p>
      {/each}
    </div>
    <p class="text-gray-400 text-sm mt-1">{description}</p>
  </div>

  <div class="flex items-center gap-4">
    <!-- Theme Toggle Button -->
    <button on:click={() => theme.toggle()} class="p-2 rounded-full">
      🌙 / ☀️
    </button>

    <!-- Logout Button -->
    <button on:click={handleLogout} class="rounded-lg">
      Logout
    </button>

    <!-- User Avatar -->
    <Avatar src={userAvatar} name="User" />
  </div>
</header>

<style>
  button {
    transition: background-color 0.2s ease-in-out;
  }
</style>
