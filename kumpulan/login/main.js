const supabase = supabase.createClient(
    'https://jhhflplquexstabuapnn.supabase.co', // Ganti dengan project URL kamu
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoaGZscGxxdWV4c3RhYnVhcG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NDU3ODcsImV4cCI6MjA2MDUyMTc4N30.0Jpss3RVOFlccG-Y2ISdQ3-38FT9IGVg_DYbjdCJo0w' // Ganti dengan anon key kamu
  );
  
  // === LOGIN ===
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
  
      const { error, session } = await supabase.auth.signInWithPassword({ email, password });
  
      if (error) {
        document.getElementById("error-message").textContent = error.message;
      } else {
        window.location.href = "/Home/home.html";
      }
    });
  }
  
  // === CEK SESSION DI HOME ===
  if (window.location.pathname.includes("/Home/home.html")) {
    supabase.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (!session) {
        window.location.href = "/login/login.html"; // redirect kalau belum login
      } else {
        document.getElementById("user-email").textContent = session.user.email;
      }
    });
  }
  
  // === LOGOUT ===
  const logoutBtn = document.getElementById("logout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      await supabase.auth.signOut();
      window.location.href = "/login/login.html";
    });
  }
  