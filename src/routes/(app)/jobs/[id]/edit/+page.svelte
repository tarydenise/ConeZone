<script>
  import JobForm from '#lib/components/JobForm.svelte';

  let { data, form } = $props();
  const values = $derived(form?.values ?? data.values);
</script>

<h1>Edit job</h1>
<JobForm {values} errors={form?.errors ?? {}} submitLabel="Save changes" cancelHref={`/jobs/${data.jobId}`} />