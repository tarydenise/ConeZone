<script>
  let { data } = $props();
</script>

<main class="auth-card">
  <h1>Welcome, {data.user.name}</h1>
  <p>Your role: {data.user.role}</p>
  <form method="POST" action="/logout"><button>Log out</button></form>
</main>