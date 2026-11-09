const API = "http://localhost:5000/api"; // change if your backend runs elsewhere

// Already logged in? Go straight to the app.
if (localStorage.getItem("token")) location.href = "index.html";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = document.getElementById("msg");
  msg.textContent = "";
  try {
    const res = await fetch(API + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: e.target.username.value, password: e.target.password.value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed.");
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    location.href = "index.html";
  } catch (err) {
    msg.textContent = err.message === "Failed to fetch"
      ? "Cannot reach the server. Is the backend running on port 5000?" : err.message;
  }
});
