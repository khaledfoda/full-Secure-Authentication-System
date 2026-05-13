document.getElementById("verifyForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    userId: localStorage.getItem("userId"),
    token: document.getElementById("token").value
  };

  const res = await fetch("http://localhost:3000/api/auth/verify-2fa", {
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
  alert(result.message);

  const redirectPage = {
    user: "user.html",
    manager: "manager.html",
    admin: "admin.html"
  };

  window.location.href = redirectPage[result.role] || "user.html";
});