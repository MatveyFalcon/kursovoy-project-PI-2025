console.log("warehouse.js подключён");

// Проверяем роль
document.addEventListener("DOMContentLoaded", () => {
    const userType = localStorage.getItem("userType");

    const accessDenied = document.getElementById("accessDenied");
    const warehouseContainer = document.getElementById("warehouseContainer");

    if (userType !== "employee") {
        accessDenied.classList.remove("hidden");
        warehouseContainer.classList.add("hidden");
        return;
    }

    // Показываем склад
    accessDenied.classList.add("hidden");
    warehouseContainer.classList.remove("hidden");

    loadZones();
    loadCells();
});

function loadZones() {
    fetch("http://localhost:8000/warehouse/get_zones.php")
        .then(r => r.json())
        .then(data => {
            const tbody = document.getElementById("zonesBody");

            if (!data.zones || data.zones.length === 0) {
                tbody.innerHTML = `<tr><td colspan="3">Зон пока нет</td></tr>`;
                return;
            }

            let html = "";
            data.zones.forEach(z => {
                html += `
                    <tr>
                        <td>${z.zone_id}</td>
                        <td>${z.name}</td>
                        <td>${z.description ?? ""}</td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;
        })
        .catch(() => {
            document.getElementById("zonesBody").innerHTML =
                `<tr><td colspan="3">Ошибка загрузки</td></tr>`;
        });
}

function loadCells() {
    fetch("http://localhost:8000/warehouse/get_cells.php")
        .then(r => r.json())
        .then(data => {
            const tbody = document.getElementById("cellsBody");

            if (!data.cells || data.cells.length === 0) {
                tbody.innerHTML = `<tr><td colspan="6">Ячеек пока нет</td></tr>`;
                return;
            }

            let html = "";
            data.cells.forEach(c => {
                html += `
                    <tr>
                        <td>${c.cell_id}</td>
                        <td>${c.cell_code}</td>
                        <td>${c.zone_name}</td>
                        <td>${c.max_volume}</td>
                        <td>${c.max_weight}</td>
                        <td>
                            <button class="primary-btn small-btn">Редактировать</button>
                            <button class="danger-btn small-btn">Удалить</button>
                        </td>
                    </tr>
                `;
            });

            tbody.innerHTML = html;
        })
        .catch(() => {
            document.getElementById("cellsBody").innerHTML =
                `<tr><td colspan="6">Ошибка загрузки</td></tr>`;
        });
}

