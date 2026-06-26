const API_URL = "https://analyzer-resume1.netlify.app/api";

// DOM Elements
const authSection = document.getElementById("auth-section");
const loginTab = document.getElementById("login-tab");
const signupTab = document.getElementById("signup-tab");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

// Password toggle elements
const toggleLoginPwd = document.getElementById("toggle-login-pwd");
const toggleSignupPwd = document.getElementById("toggle-signup-pwd");
const toggleSignupConfirmPwd = document.getElementById(
  "toggle-signup-confirm-pwd",
);
const loginPasswordInput = document.getElementById("login-password");
const signupPasswordInput = document.getElementById("signup-password");
const signupConfirmPasswordInput = document.getElementById(
  "signup-confirm-password",
);

// Forgot Password
const forgotPwdBtn = document.getElementById("forgot-pwd-btn");

// Password visibility toggle
toggleLoginPwd.addEventListener("click", () => {
  if (loginPasswordInput.type === "password") {
    loginPasswordInput.type = "text";
    toggleLoginPwd.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    loginPasswordInput.type = "password";
    toggleLoginPwd.innerHTML = '<i class="fas fa-eye"></i>';
  }
});

toggleSignupPwd.addEventListener("click", () => {
  if (signupPasswordInput.type === "password") {
    signupPasswordInput.type = "text";
    toggleSignupPwd.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    signupPasswordInput.type = "password";
    toggleSignupPwd.innerHTML = '<i class="fas fa-eye"></i>';
  }
});

toggleSignupConfirmPwd.addEventListener("click", () => {
  if (signupConfirmPasswordInput.type === "password") {
    signupConfirmPasswordInput.type = "text";
    toggleSignupConfirmPwd.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    signupConfirmPasswordInput.type = "password";
    toggleSignupConfirmPwd.innerHTML = '<i class="fas fa-eye"></i>';
  }
});

// Tab switching for Login/Signup
loginTab.addEventListener("click", () => {
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
  loginTab.classList.add("border-b-4", "border-indigo-600", "text-indigo-600");
  loginTab.classList.remove("text-gray-600");
  signupTab.classList.remove(
    "border-b-4",
    "border-indigo-600",
    "text-indigo-600",
  );
  signupTab.classList.add("text-gray-600");
});

signupTab.addEventListener("click", () => {
  signupForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
  signupTab.classList.add("border-b-4", "border-indigo-600", "text-indigo-600");
  signupTab.classList.remove("text-gray-600");
  loginTab.classList.remove(
    "border-b-4",
    "border-indigo-600",
    "text-indigo-600",
  );
  loginTab.classList.add("text-gray-600");
});

// Login Form Submission
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);
      console.log("✓ Login successful! Redirecting to dashboard...");
      window.location.href = "dashboard.html";
    } else {
      alert("Login failed: " + (data.message || "Unknown error"));
    }
  } catch (error) {
    alert("Error logging in: " + error.message);
    console.error(error);
  }
});

// Signup Form Submission
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("signup-username").value;
  const email = document.getElementById("signup-gmail").value;
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById(
    "signup-confirm-password",
  ).value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", username);
      console.log("✓ Signup successful! Redirecting to dashboard...");
      window.location.href = "dashboard.html";
    } else {
      alert("Signup failed: " + (data.message || "Unknown error"));
    }
  } catch (error) {
    alert("Error signing up: " + error.message);
    console.error(error);
  }
});

// DOM Elements for Reset Form
const resetForm = document.getElementById("reset-form");
const resetPasswordForm = document.getElementById("reset-form");
const toggleResetPwd = document.getElementById("toggle-reset-pwd");
const toggleResetConfirmPwd = document.getElementById(
  "toggle-reset-confirm-pwd",
);
const resetPasswordInput = document.getElementById("reset-new-password");
const resetConfirmPasswordInput = document.getElementById(
  "reset-confirm-password",
);
const backToLoginBtn = document.getElementById("back-to-login-btn");

// Password visibility toggles for reset form
toggleResetPwd.addEventListener("click", () => {
  if (resetPasswordInput.type === "password") {
    resetPasswordInput.type = "text";
    toggleResetPwd.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    resetPasswordInput.type = "password";
    toggleResetPwd.innerHTML = '<i class="fas fa-eye"></i>';
  }
});

toggleResetConfirmPwd.addEventListener("click", () => {
  if (resetConfirmPasswordInput.type === "password") {
    resetConfirmPasswordInput.type = "text";
    toggleResetConfirmPwd.innerHTML = '<i class="fas fa-eye-slash"></i>';
  } else {
    resetConfirmPasswordInput.type = "password";
    toggleResetConfirmPwd.innerHTML = '<i class="fas fa-eye"></i>';
  }
});

// Forgot Password - Show reset form
forgotPwdBtn.addEventListener("click", (e) => {
  e.preventDefault();
  loginForm.classList.add("hidden");
  signupForm.classList.add("hidden");
  resetForm.classList.remove("hidden");
});

// Back to login from reset form
backToLoginBtn.addEventListener("click", (e) => {
  e.preventDefault();
  resetForm.classList.add("hidden");
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
  // Clear reset form
  resetPasswordForm.reset();
});

// Reset Password Form Submission
resetPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("reset-email").value;
  const newPassword = document.getElementById("reset-new-password").value;
  const confirmPassword = document.getElementById(
    "reset-confirm-password",
  ).value;

  // Validate passwords match
  if (newPassword !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  // Validate password length
  if (newPassword.length < 6) {
    alert("Password must be at least 6 characters long!");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, newPassword }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(
        "✓ Password updated successfully! Please login with your new password.",
      );
      // Store token and username
      localStorage.setItem("token", data.token);
      localStorage.setItem("username", data.username);
      // Redirect to dashboard
      window.location.href = "dashboard.html";
    } else {
      alert("Error: " + data.message);
    }
  } catch (error) {
    alert("Error resetting password: " + error.message);
  }
});

// Check if user is already logged in
window.addEventListener("load", () => {
  const token = localStorage.getItem("token");
  if (token) {
    console.log("User already logged in, redirecting to dashboard...");
    window.location.href = "dashboard.html";
  }
});
