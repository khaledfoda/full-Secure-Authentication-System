document.getElementById("verifyForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const urlParams = new URLSearchParams(window.location.search);
  const userIdFromUrl = urlParams.get("userId");
  const isGoogle = urlParams.get("google") === "true";

  const data = {
    userId: localStorage.getItem("userId") || userIdFromUrl,
    token: document.getElementById("token").value
  };

  const res = await fetch("/api/auth/verify-2fa", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (!res.ok) {
    alert(result.message || "Verification failed");
    return;
  }

  localStorage.setItem("token", result.token);
  localStorage.setItem("role", result.role);
  localStorage.setItem("userId", result.userId || localStorage.getItem("userId"));

  const redirectPage = {
    admin: "admin.html",
    manager: "manager.html",
    user: "user.html"
  };

  window.location.href = redirectPage[result.role] || "user.html";
});

const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get("google") === "true") {
  document.getElementById("qrNote").textContent = "Please verify your Google account with 2FA";
}