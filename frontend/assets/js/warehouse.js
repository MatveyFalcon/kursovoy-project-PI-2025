console.log("warehouse.js loaded");

// ========================
// КОНСТАНТЫ
// ========================
const API = "http://localhost:8000/warehouse";

// Элементы страницы
const cellsBody = document.getElementById("cellsTableBody");

// Модалки
const addModal = document.getElementById("modalAddCell");
const editModal = document.getElementById("modalEditCell");

// Кнопки
const addCellBtn = document.getElementById("addCellBtn");
const closeAddModalBtn = document.getElementById("closeModalBtn");
const createCellBtn = document.getElementById("createCellBtn");

const closeEditModalBtn = document.getElementById("closeEditModal");
const saveEditBtn = document.getElementById("saveEditCell");

// Поля модалки создания
const modalZone = document.getElementById("modalZone");
const modalCode = document.getElementById("modalCode");
const modalVolume = document.getElementById("modalVolume");
const modalWeight = document.getElementById("modalWeight");
const modalDescription = document.getElementById("modalDescription");

// Поля модалки редактирования
const editCellId = document.getElementById("editCellId");
const editZone = document.getElementById("editZone");
const editCode = document.getElementById("editCode");
const editVolume = document.getElementById("editVolume");
const editWeight = document.getElementById("editWeight");
const editDescription = document.getElementById("editDescription");

// =============================
// ЗАГРУЗКА ВСЕХ ЯЧЕЕК
// =============================
function loadCells() {
    fetch(`${API}/get_cells.php`)
        .then(r => r.json())
        .then(data => {
            cellsBody.innerHTML = "";

            data.cells.forEach(cell => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${cell.cell_id}</td>
                    <td>${cell.cell_code}</td>
                    <td>${cell.zone_name}</td>
                    <td>${cell.max_volume ?? "-"}</td>
                    <td>${cell.max_weight ?? "-"}</td>
                    <td>${cell.description ?? ""}</td>
                    <td>
                        <button class="btn-action edit-btn" data-id="${cell.cell_id}">✏️</button>
                        <button class="btn-action delete-btn" data-id="${cell.cell_id}">🗑</button>
                    </td>
                `;

                tr.querySelector(".edit-btn")
                    .addEventListener("click", () => openEditModal(cell));

                tr.querySelector(".delete-btn")
                    .addEventListener("click", () => deleteCell(cell.cell_id));

                cellsBody.appendChild(tr);
            });
        });
}

// =============================
// ЗАГРУЗКА ЗОН
// =============================
function loadZones(selectElement) {
    fetch(`${API}/get_zones.php`)
        .then(r => r.json())
        .then(data => {
            selectElement.innerHTML = "";

            data.zones.forEach(z => {
                let option = document.createElement("option");
                option.value = z.zone_id;
                option.textContent = z.name;
                selectElement.appendChild(option);
            });
        });
}

// =============================
// ОТКРЫТЬ МОДАЛКУ ДОБАВЛЕНИЯ
// =============================
addCellBtn?.addEventListener("click", () => {
    loadZones(modalZone);
    addModal.classList.add("show");
});

// ЗАКРЫТЬ
closeAddModalBtn?.addEventListener("click", () => {
    addModal.classList.remove("show");
});

// =============================
// ДОБАВЛЕНИЕ ЯЧЕЙКИ
// =============================
createCellBtn?.addEventListener("click", () => {
    const payload = {
        zone_id: modalZone.value,
        cell_code: modalCode.value,
        max_volume: modalVolume.value,
        max_weight: modalWeight.value,
        description: modalDescription.value
    };

    fetch(`${API}/create_cell.php`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
    })
        .then(r => r.json())
        .then(res => {
            if (res.message === "ok") {
                addModal.classList.remove("show");
                loadCells();
            } else {
                alert(res.message);
            }
        });
});

// =============================
// ОТКРЫТЬ МОДАЛКУ РЕДАКТИРОВАНИЯ
// =============================
function openEditModal(cell) {
    editCellId.value = cell.cell_id;
    editCode.value = cell.cell_code;
    editVolume.value = cell.max_volume;
    editWeight.value = cell.max_weight;
    editDescription.value = cell.description ?? "";

    loadZones(editZone);

    // Когда зоны загрузятся — выставим выбранную
    setTimeout(() => {
        editZone.value = cell.zone_id;
    }, 200);

    editModal.classList.add("show");
}

// ЗАКРЫТЬ
closeEditModalBtn?.addEventListener("click", () => {
    editModal.classList.remove("show");
});

// =============================
// СОХРАНЕНИЕ ИЗМЕНЕНИЙ
// =============================
saveEditBtn?.addEventListener("click", () => {
    const payload = {
        cell_id: editCellId.value,
        zone_id: editZone.value,
        cell_code: editCode.value,
        max_volume: editVolume.value,
        max_weight: editWeight.value,
        description: editDescription.value
    };

    fetch(`${API}/update_cell.php`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
    })
        .then(r => r.json())
        .then(res => {
            if (res.message === "ok") {
                editModal.classList.remove("show");
                loadCells();
            } else {
                alert(res.message);
            }
        });
});

// =============================
// УДАЛЕНИЕ
// =============================
function deleteCell(id) {
    if (!confirm("Удалить ячейку?")) return;

    fetch(`${API}/delete_cell.php`, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ cell_id: id })
    })
        .then(r => r.json())
        .then(res => {
            if (res.message === "ok") {
                loadCells();
            } else {
                alert(res.message);
            }
        });
}

// =============================
// АВТОСТАРТ
// =============================
document.addEventListener("DOMContentLoaded", () => {
    loadCells();
});
