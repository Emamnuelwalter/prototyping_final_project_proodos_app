<script>
  import ProfileForm from "$lib/components/profile/ProfileForm.svelte";
  let { form } = $props();
</script>

<div class="pt-4 pb-4">
  <ProfileForm {form} />
</div>
