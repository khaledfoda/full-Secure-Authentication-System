document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const password = document.getElementById("password").value;
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSpecial = /[*\/@]/.test(password);
  const hasMinLength = password.length >= 8;

  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecial || !hasMinLength) {
    let errors = [];
    if (!hasMinLength) errors.push("• At least 8 characters");
    if (!hasUpperCase) errors.push("• At least one capital letter (A-Z)");
    if (!hasLowerCase) errors.push("• At least one small letter (a-z)");
    if (!hasNumbers) errors.push("• At least one number (0-9)");
    if (!hasSpecial) errors.push("• At least one special character (* / @)");
    
    alert("Password must contain:\n" + errors.join("\n"));
    return;
  }

  const data = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    password: password,
    role: document.getElementById("role").value
  };

  const res = await fetch("http://localhost:3000/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (!res.ok) {
    alert(result.message || "Registration failed");
    return;
  }

  alert(result.message);
  document.getElementById("qr").src = result.qrCode;
});

document.getElementById("password").addEventListener("input", function() {
  const password = this.value;
  
  document.getElementById("req-length").className = "requirement " + (password.length >= 8 ? "met" : "");
  document.getElementById("req-upper").className = "requirement " + (/[A-Z]/.test(password) ? "met" : "");
  document.getElementById("req-lower").className = "requirement " + (/[a-z]/.test(password) ? "met" : "");
  document.getElementById("req-number").className = "requirement " + (/[0-9]/.test(password) ? "met" : "");
  document.getElementById("req-special").className = "requirement " + (/[*\/@]/.test(password) ? "met" : "");
});