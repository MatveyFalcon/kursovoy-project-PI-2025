console.log("app.js loaded");

const API_BASE = "http://localhost:8000";

/* ============================
      LOGIN
============================ */
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const login = document.getElementById("login").value;
  const password = document.getElementById("password").value;

  const response = await fetch(`${API_BASE}/login.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });

  const result = await response.json();
  if (result.message !== "ok") return alert(result.message);

  localStorage.setItem("userToken", result.token);
  localStorage.setItem("userId", result.user_id);
  localStorage.setItem("userLogin", result.login || login);
  localStorage.setItem("userType", result.user_type);
  localStorage.setItem("userFullName", result.full_name || "");
  localStorage.setItem("employeeId", result.employee_id || "");
  localStorage.setItem("positionName", result.position_name || "");

  window.location.href = "dashboard.html";
});

/* ============================
      REGISTER
============================ */
document
  .getElementById("registerForm")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
    const login = document.getElementById("login").value;
    const password = document.getElementById("password").value;

    const response = await fetch(`${API_BASE}/register.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, phone, email, login, password }),
    });

    const result = await response.json();
    if (result.message !== "ok") return alert(result.message);

    alert("Аккаунт создан! Теперь войдите.");
    window.location.href = "login.html";
  });

/* ============================
      UPDATE UI BASED ON ROLE
============================ */
function updateAuthUI() {
  const token = localStorage.getItem("userToken");
  const login = localStorage.getItem("userLogin");
  const fullName = localStorage.getItem("userFullName");
  const userType = localStorage.getItem("userType"); // client / employee
  const positionName = localStorage.getItem("positionName");

  const userPanel = document.getElementById("userPanel");
  const userLabel = document.getElementById("userLabel");

  const navLogin = document.getElementById("nav-login");
  const navRegister = document.getElementById("nav-register");
  const navWarehouse = document.getElementById("nav-warehouse");
  const analyticsBlock = document.getElementById("analytics-block");

  /* ---------- NOT LOGGED IN ---------- */
  if (!token) {
    if (userPanel) userPanel.style.display = "none";
    if (navWarehouse) navWarehouse.style.display = "none";
    if (analyticsBlock) analyticsBlock.style.display = "none";
    return;
  }

  /* ---------- LOGGED IN ---------- */
  if (userPanel) userPanel.style.display = "flex";

  if (navLogin) navLogin.style.display = "none";
  if (navRegister) navRegister.style.display = "none";

  /* ---------- HIDE WAREHOUSE FOR CLIENT ---------- */
  // Hide warehouse nav + card for client
  const cardWarehouse = document.getElementById("card-warehouse");

  if (userType === "client") {
    if (navWarehouse) navWarehouse.style.display = "none";
    if (cardWarehouse) cardWarehouse.style.display = "none";
  } else {
    if (navWarehouse) navWarehouse.style.display = "inline-flex";
    if (cardWarehouse) cardWarehouse.style.display = "flex";
  }

  /* ---------- HIDE ANALYTICS FOR CLIENT ---------- */
  if (analyticsBlock) {
    analyticsBlock.style.display = userType === "employee" ? "block" : "none";
  }

  /* ---------- USER LABEL ---------- */
  if (userLabel) {
    let text = fullName || login || "Пользователь";
    if (userType === "employee") text += " · " + (positionName || "Сотрудник");
    else text += " · Клиент";

    userLabel.textContent = text;
  }

  /* ---------- LOGOUT ---------- */
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      localStorage.clear();
      window.location.href = "index.html";
    };
  }
}

document.addEventListener("DOMContentLoaded", updateAuthUI);
