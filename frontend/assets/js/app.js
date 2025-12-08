console.log("JS ЗАГРУЖЕН");

const API_BASE = "http://localhost:8000";

/* ============================
      LOGIN FORM
===============================*/
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const login = document.getElementById("login").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_BASE}/login.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ login, password })
        });

        const result = await response.json();
        console.log("Ответ login.php:", result);

        if (result.message === "ok") {
            localStorage.setItem("userToken", result.token);
            localStorage.setItem("userId", result.user_id);
            localStorage.setItem("userLogin", login);

            window.location.href = "index.html";
        } else {
            alert(result.message);
        }

    } catch (error) {
        alert("Ошибка соединения с сервером.");
    }
});


/* ============================
      REGISTER FORM
===============================*/
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value;
    const phone = document.getElementById("phone").value;
    const email = document.getElementById("email").value;
    const login = document.getElementById("login").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_BASE}/register.php`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fullName, phone, email, login, password })
        });

        const result = await response.json();

        if (result.message === "ok") {
            alert("Аккаунт создан!");
            window.location.href = "login.html";
        } else {
            alert(result.message);
        }

    } catch (error) {
        alert("Ошибка соединения с сервером.");
    }
});


/* ============================
      LOGOUT
===============================*/
function logout() {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userLogin");

    window.location.href = "index.html";
}


/* ============================
     UPDATE HEADER UI
===============================*/
function updateAuthUI() {
    console.log("updateAuthUI вызван");

    const token = localStorage.getItem("userToken");

    const userPanel = document.getElementById("userPanel");
    const userLabel = document.getElementById("userLabel");
    const navLogin = document.getElementById("nav-login");
    const navRegister = document.getElementById("nav-register");
    const logoutBtn = document.getElementById("logoutBtn");

    if (!userPanel) return;

    if (token) {
        userPanel.style.display = "flex";
        if (navLogin) navLogin.style.display = "none";
        if (navRegister) navRegister.style.display = "none";

        const login = localStorage.getItem("userLogin");
        userLabel.textContent = `Вы вошли как ${login}`;

        logoutBtn.onclick = logout;
    } else {
        userPanel.style.display = "none";
        if (navLogin) navLogin.style.display = "inline-block";
        if (navRegister) navRegister.style.display = "inline-block";
    }
}

document.addEventListener("DOMContentLoaded", updateAuthUI);
