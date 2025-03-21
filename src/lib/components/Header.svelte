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
  let userAvatar = $userProfile?.avatar || 'https://i.pravatar.cc/150?img=48';

  function handleLogout() {
    logout(); // Explicitly call logout function
  }
</script>

<header class="flex items-center justify-between p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-white" >
  <div class="flex flex-col">
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
    <button on:click={() => theme.toggle()} class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
      🌙 / ☀️
    </button>

    <!-- Logout Button -->
    <button on:click={handleLogout} class="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white">
      Logout
    </button>

    <!-- Settings Icon -->
    <button class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
      ⚙️
    </button>

    <!-- Notification Icon -->
    <button class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 relative">
      🔔
      <span class="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1">!</span>
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
