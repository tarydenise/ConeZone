<script>
    import { onMount } from "svelte";
    import { supabase } from "../lib/supabase.js";
    import { normalizeEmail, safeRedirectPath } from "../lib/validation.js";

    let email = $state("");
    let password = $state("");
    let error = $state("");
    let submitting = $state(false);

    // Already logged in? Go home.
    onMount(async () => {
        const { data } = await supabase.auth.getSession();
        if (data.session) location.replace("/");
    });

    async function handleSubmit(event) {
        event.preventDefault();
        error = "";
        const cleanEmail = normalizeEmail(email);
        if (!cleanEmail || !password) {
            error = "Enter your email and password.";
            return;
        }

        submitting = true;
        const { data, error: signInError } =
            await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password,
            });

        if (signInError) {
            submitting = false;
            // Same message whether the email or the password is wrong
            error = "Email or password is incorrect.";
            return;
        }

        // Refuse deactivated accounts
        const { data: profile } = await supabase
            .from("profiles")
            .select("is_active")
            .eq("id", data.user.id)
            .single();

        if (!profile || !profile.is_active) {
            await supabase.auth.signOut();
            submitting = false;
            error = profile
                ? "This account is inactive. Contact an administrator."
                : "Could not load your account. Try again.";
            return;
        }

        const redirectTo = new URLSearchParams(location.search).get(
            "redirectTo",
        );
        location.href = safeRedirectPath(redirectTo);
    }
</script>

<main class="auth-card">
    <h1>ConeZone</h1>
    <p>Log in to see your jobs</p>

    <form onsubmit={handleSubmit} novalidate>
        {#if error}<p class="error" role="alert">{error}</p>{/if}

        <label
            >Email
            <input
                name="email"
                type="email"
                autocomplete="email"
                bind:value={email}
            />
        </label>

        <label
            >Password
            <input
                name="password"
                type="password"
                autocomplete="current-password"
                bind:value={password}
            />
        </label>

        <button class="btn" disabled={submitting}
            >{submitting ? "Logging in..." : "Log in"}</button
        >
    </form>

    <p>No account? <a href="/signup">Sign up</a></p>
</main>

<style>
    form {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }
</style>
