console.log("JS ЗАГРУЖЕН");

const API_BASE = "http://localhost:8000";

/* ============================
      LOGIN FORM
===============================*/
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("Отправляем запрос login...");

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

            alert("Вход выполнен успешно!");
            window.location.href = "index.html";
        } else {
            alert(result.message);
        }

    } catch (error) {
        console.error("Ошибка при отправке запроса login:", error);
        alert("Ошибка соединения с сервером.");
    }
});


/* ============================
      REGISTER FORM
===============================*/
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    console.log("Отправляем запрос register...");

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
        console.log("Ответ register.php:", result);

        if (result.message === "ok") {
            alert("Аккаунт создан! Теперь войдите.");
            window.location.href = "login.html";
        } else {
            alert(result.message);
        }

    } catch (error) {
        console.error("Ошибка при отправке запроса register:", error);
        alert("Ошибка соединения с сервером.");
    }
});


/* ============================
      LOGOUT helper
===============================*/
function logout() {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");

    alert("Вы вышли из аккаунта.");
    window.location.href = "index.html";
}
