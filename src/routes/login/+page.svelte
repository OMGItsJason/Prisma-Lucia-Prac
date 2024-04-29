<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from './$types';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { validateSchema } from '$lib/config/zodschema';
	import toast, { Toaster } from 'svelte-french-toast';

	export let data: PageData;

	const form = superForm(data.form, {
		validators: zodClient(validateSchema),
		async onResult({ result }) {
			if (result.status === 400 || result.status === 500) {
				toast.error('Invalid Log In');
			}
		}
	});
	const { form: formData, enhance } = form;
</script>

<Toaster />
<h1>Log In</h1>
<form method="post" use:enhance>
	<label for="username">Username</label>
	<input name="username" id="username" required bind:value={$formData.username} />
	<br />
	<label for="password">Password</label>
	<input type="password" name="password" id="password" required bind:value={$formData.password} />
	<br />
	<button>Continue</button>
</form>
<div>
	<a href="/login/google">Google</a>
</div>
