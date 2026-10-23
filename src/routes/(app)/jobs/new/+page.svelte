<script>
  import JobForm from '#lib/components/JobForm.svelte';

  let { data, form } = $props();

  const values = $derived(
    form?.values ?? {
      title: '', clientName: '', address: '', date: data.today,
      startTime: '', endTime: '', workersNeeded: '1', notes: ''
    }
  );
</script>

<h1>New job</h1>
<JobForm {values} errors={form?.errors ?? {}} submitLabel="Create job" />