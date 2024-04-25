<script lang="ts">
	import { superForm } from 'sveltekit-superforms/client';
	import type { PageData } from './$types';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { validateSchema } from '$lib/config/zodschema';
	import toast, { Toaster } from 'svelte-french-toast';
	import SuperDebug from 'sveltekit-superforms';

	export let data: PageData;

	const form = superForm(data.form, {
		validators: zodClient(validateSchema),
		async onResult({ result }) {
			if (result.status === 400 || result.status === 500) {
				toast.error('Invalid Sign Up');
			} else {
				toast('Sign Up Successfully Redirecting To Log In Page For Confirmation', {
					duration: 5000
				});
			}
		}
	});
	const { form: formData, enhance } = form;
</script>

<Toaster />
<SuperDebug data={$formData} />
<h1>Sign up</h1>
<form method="POST" use:enhance>
	<label for="username">Username</label>
	<input name="username" id="username" bind:value={$formData.username} />
	<br />
	<label for="password">Password</label>
	<input type="password" name="password" id="password" bind:value={$formData.password} /><br />
	<button>Continue</button>
</form>
