import { createClient } from "https://esm.sh/@supabase/supabase-js";

const supabaseUrl = "https://jhhflplquexstabuapnn.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpoaGZscGxxdWV4c3RhYnVhcG5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NDU3ODcsImV4cCI6MjA2MDUyMTc4N30.0Jpss3RVOFlccG-Y2ISdQ3-38FT9IGVg_DYbjdCJo0w"; // ganti dengan anon key kamu
const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById("register-form");
const messageDiv = document.getElementById("message");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nama = document.getElementById("nama").value;
  const email = document.getElementById("email").value;
  const no_hp = document.getElementById("no_hp").value;
  const alamat = document.getElementById("alamat").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (password !== confirmPassword) {
    messageDiv.textContent = "Password tidak cocok!";
    return;
  }

  // Register ke Auth Supabase
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    messageDiv.textContent = `Registrasi gagal: ${error.message}`;
    return;
  }

  // Masukkan data profil ke tabel users
  const user = data.user;

  const { error: insertError } = await supabase.from("users").insert([
    {
      id: user.id,
      nama,
      email,
      no_hp,
      alamat,
      is_member: false,
      created_at: new Date().toISOString(),
    },
  ]);

  if (insertError) {
    messageDiv.textContent = `Registrasi berhasil, tapi gagal menyimpan data: ${insertError.message}`;
  } else {
    messageDiv.style.color = "green";
    messageDiv.textContent = "Registrasi berhasil! Silakan cek email untuk konfirmasi.";
  }
});
