document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  const res = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (!res.ok) {
    alert(result.message || "Login failed");
    return;
  }

  localStorage.setItem("userId", result.userId);
  window.location.href = "verify-2fa.html";
});