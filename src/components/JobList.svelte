<script>
    import { onMount } from "svelte";
    import { supabase } from "../lib/supabase";
    import { requireAction } from "../lib/auth";
    import { STATUS_LABELS } from "../lib/jobStatus";
    import { formatDate, formatTime, isOvernight } from "../lib/time";
    import Loading from "./Loading.svelte";
    import Empty from "./Empty.svelte";
    import ErrorMessage from "./ErrorMessage.svelte";
    import AccessDenied from "./AccessDenied.svelte";

    let state = $state("loading"); // 'loading' | 'denied' | 'error' | 'empty' | 'loaded'
    let jobs = $state([]);

    async function loadJobs() {
        state = "loading";

        try {
            const access = await requireAction("job.view_any");
            if (!access) return; // requireAction is sending them to Login
            if (!access.allowed) {
                state = "denied";
                return;
            }

            const { data, error } = await supabase
                .from("jobs")
                .select(
                    "id, title, client_name, address, date, start_time, end_time, workers_needed, status",
                )
                .order("date", { ascending: true })
                .order("start_time", { ascending: true });

            if (error) throw error;

            jobs = data;
            state = jobs.length ? "loaded" : "empty";
        } catch (error) {
            console.error("Could not load jobs:", error);
            state = 'error';
        }
    }

    onMount(() => {
        loadJobs();
    });
</script>

{#if state === "loading"}
    <Loading />
{:else if state === "denied"}
    <AccessDenied />
{:else if state === "error"}
    <ErrorMessage message="Could not load jobs." onretry={loadJobs} />
{:else}
    <div class="top">
        <h1>Jobs</h1>
        <a class="btn" href="/jobs/new">+ New Job</a>
    </div>

    {#if state === "empty"}
        <Empty message="No jobs yet">
            <a class="btn" href="/jobs/new">New Job</a>
        </Empty>
    {:else}
        <div class="scroll">
            <table>
                <thead>
                    <tr
                        ><th>Date</th><th>Time</th><th>Job</th><th>Address</th
                        ><th>Workers</th><th>Status</th></tr
                    >
                </thead>
                <tbody>
                    {#each jobs as job (job.id)}
                        <tr>
                            <td>{formatDate(job.date)}</td>
                            <td>
                                {formatTime(job.start_time)} to {formatTime(
                                    job.end_time,
                                )}
                                {#if isOvernight(job.start_time, job.end_time)}<small
                                        >Overnight</small
                                    >{/if}
                            </td>
                            <td>
                                <a
                                    href={` /jobs/view?id=${encodeURIComponent(job.id)}`}
                                    >{job.title}</a
                                >
                                {#if job.client_name}<small
                                        >{job.client_name}</small
                                    >{/if}
                            </td>
                            <td>{job.address}</td>
                            <td>{job.workers_needed}</td>
                            <td
                                ><span class="badge {job.status}"
                                    >{STATUS_LABELS[job.status]}</span
                                ></td
                            >
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
{/if}

<style>
    .top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
    }
    h1 {
        margin: 8px 0;
    }
    .scroll {
        max-width: 100%;
        overflow-x: auto;
        background: #fff;
        border: 1.5px solid var(--line);
        border-radius: 6px;
    }
    table {
        width: 100%;
        min-width: 38rem;
        border-collapse: collapse;
        font-size: 14px;
    }
    th,
    td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #e3e3e0;
        vertical-align: top;
    }
    th {
        background: #f7f7f5;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
    }
    small {
        display: block;
        color: #666;
    }
</style>
