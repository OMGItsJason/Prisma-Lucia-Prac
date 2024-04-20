<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from './$types';
	import SuperDebug from 'sveltekit-superforms';

	export let data: PageData;
	const { form, errors, enhance } = superForm(data.form);
</script>

<SuperDebug data="$form" />
<h1>Log In</h1>
<form method="post" use:enhance>
	<label for="username">Username</label>
	<input name="username" id="username" bind:value={$form.username} />
	{#if $errors.username}
		<p>{$errors.username}</p>
	{/if}<br />
	<label for="password">Password</label>
	<input type="password" name="password" id="password" bind:value={$form.password} />
	{#if $errors.password}
		<p>{$errors.password}</p>
	{/if}<br />
	<button>Continue</button>
</form>
