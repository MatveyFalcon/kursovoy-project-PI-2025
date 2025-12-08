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
            // Базовые данные
            localStorage.setItem("userToken", result.token);
            localStorage.setItem("userId", result.user_id);
            localStorage.setItem("userLogin", result.login || login);
            localStorage.setItem("userType", result.user_type || "client");

            // ФИО (если есть)
            if (result.full_name) {
                localStorage.setItem("userFullName", result.full_name);
            } else {
                localStorage.removeItem("userFullName");
            }

            // Сотрудник / должность (могут быть null)
            if (result.employee_id) {
                localStorage.setItem("employeeId", result.employee_id);
            } else {
                localStorage.removeItem("employeeId");
            }

            if (result.position_name) {
                localStorage.setItem("positionName", result.position_name);
            } else {
                localStorage.removeItem("positionName");
            }

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
      LOGOUT
===============================*/
function logout() {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userLogin");
    localStorage.removeItem("userType");
    localStorage.removeItem("userFullName");
    localStorage.removeItem("employeeId");
    localStorage.removeItem("positionName");

    window.location.href = "index.html";
}


/* ============================
     UPDATE HEADER UI
===============================*/
function updateAuthUI() {
    const token = localStorage.getItem("userToken");
    const userType = localStorage.getItem("userType");
    const login = localStorage.getItem("userLogin");
    const fullName = localStorage.getItem("userFullName");
    const positionName = localStorage.getItem("positionName");

    const userPanel = document.getElementById("userPanel");
    const userLabel = document.getElementById("userLabel");
    const navLogin = document.getElementById("nav-login");
    const navRegister = document.getElementById("nav-register");
    const navWarehouse = document.getElementById("nav-warehouse");
    const navOrders = document.getElementById("nav-orders");
    const logoutBtn = document.getElementById("logoutBtn");

    if (!userPanel) return;

    if (token) {
        // Пользователь залогинен
        userPanel.style.display = "flex";
        if (navLogin) navLogin.style.display = "none";
        if (navRegister) navRegister.style.display = "none";

        let nameToShow = fullName || login || "Пользователь";

        // Если это сотрудник и есть должность — показываем её
        if (userType === "employee" && positionName) {
            userLabel.textContent = `${nameToShow} (${positionName})`;
        } else {
            userLabel.textContent = nameToShow;
        }

        if (logoutBtn) {
            logoutBtn.onclick = logout;
        }

        // Ролевая логика по меню
        if (userType === "client") {
            // Клиент не видит "Склад", но видит "Заказы"
            if (navWarehouse) navWarehouse.style.display = "none";
            if (navOrders) navOrders.style.display = "inline-block";
        } else if (userType === "employee") {
            // Сотрудник видит и склад, и заказы
            if (navWarehouse) navWarehouse.style.display = "inline-block";
            if (navOrders) navOrders.style.display = "inline-block";
        } else {
            // system или что-то другое — показываем всё
            if (navWarehouse) navWarehouse.style.display = "inline-block";
            if (navOrders) navOrders.style.display = "inline-block";
        }

    } else {
        // Пользователь не залогинен
        userPanel.style.display = "none";
        if (navLogin) navLogin.style.display = "inline-block";
        if (navRegister) navRegister.style.display = "inline-block";

        // Гостю пока показываем всё (потом можно ограничить)
        if (navWarehouse) navWarehouse.style.display = "inline-block";
        if (navOrders) navOrders.style.display = "inline-block";
    }
}

document.addEventListener("DOMContentLoaded", updateAuthUI);
