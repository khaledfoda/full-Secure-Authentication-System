const token = localStorage.getItem("token");

const headers = {
  "Authorization": "Bearer " + token
};

async function getProfile() {
  const res = await fetch("http://localhost:3000/api/auth/profile", {
    headers
  });
  const data = await res.json();
  document.getElementById("output").textContent = JSON.stringify(data, null, 2);
}

async function getUser() {
  window.location.href = "user.html";
}

async function getManager() {
  window.location.href = "manager.html";
}

async function getAdmin() {
  window.location.href = "admin.html";
}

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  window.location.href = "login.html";
}