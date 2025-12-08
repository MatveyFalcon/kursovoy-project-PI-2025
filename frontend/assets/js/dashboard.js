console.log("dashboard.js loaded");

document.addEventListener("DOMContentLoaded", () => {
    const fullName = localStorage.getItem("userFullName");
    const login = localStorage.getItem("userLogin");

    const welcome = document.getElementById("dashWelcome");

    if (welcome) {
        welcome.textContent = `Добро пожаловать, ${fullName || login || "Пользователь"}`;
    }
});
