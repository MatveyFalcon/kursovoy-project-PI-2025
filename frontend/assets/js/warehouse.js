console.log("warehouse.js loaded");

// Запрет доступа к складу для клиента
const currentUserType = localStorage.getItem("userType");
if (!currentUserType || currentUserType === "client") {
    window.location.href = "dashboard.html";
}

// API_BASE уже объявлен в app.js
// const API_BASE = "http://localhost:8000";

/* -----------------------------------------
   ГЛАВНЫЙ ИНИТ
----------------------------------------- */
document.addEventListener("DOMContentLoaded", () => {
    setupTabs();
    initCellSection();
    initZoneSection();
    loadCells();
    loadZones();
});

/* -----------------------------------------
   ТАБЫ (Ячейки / Зоны / Товары)
----------------------------------------- */
function setupTabs() {
    const tabs = document.querySelectorAll(".subnav-btn");
    const sections = document.querySelectorAll(".warehouse-section");

    tabs.forEach((btn) => {
        btn.addEventListener("click", () => {
            tabs.forEach((t) => t.classList.remove("active"));
            btn.classList.add("active");

            const target = btn.dataset.section;
            sections.forEach((sec) => {
                sec.classList.remove("active");
                if (sec.id === `section-${target}`) {
                    sec.classList.add("active");
                }
            });
        });
    });
}

/* =====================================================
   БЛОК: ЯЧЕЙКИ СКЛАДА
===================================================== */
let cellsTableBody;
let addCellBtn;
let modalAddCell;
let modalEditCell;

function initCellSection() {
    cellsTableBody = document.getElementById("cellsTableBody");
    addCellBtn = document.getElementById("addCellBtn");
    modalAddCell = document.getElementById("modalAddCell");
    modalEditCell = document.getElementById("modalEditCell");

    const closeAdd = document.getElementById("closeModalBtn");
    const createCellBtn = document.getElementById("createCellBtn");

    const closeEdit = document.getElementById("closeEditModal");
    const saveEdit = document.getElementById("saveEditCell");

    if (addCellBtn) {
        addCellBtn.addEventListener("click", () => {
            openAddCellModal();
        });
    }

    if (closeAdd) {
        closeAdd.addEventListener("click", () => {
            hideModal(modalAddCell);
        });
    }

    if (createCellBtn) {
        createCellBtn.addEventListener("click", () => {
            createCell();
        });
    }

    if (closeEdit) {
        closeEdit.addEventListener("click", () => {
            hideModal(modalEditCell);
        });
    }

    if (saveEdit) {
        saveEdit.addEventListener("click", () => {
            saveEditCell();
        });
    }
}

/* ---------- Модалки ячеек ---------- */
function openAddCellModal() {
    // очистка полей
    document.getElementById("modalCode").value = "";
    document.getElementById("modalVolume").value = "";
    document.getElementById("modalWeight").value = "";
    document.getElementById("modalDescription").value = "";

    fillZonesSelect(document.getElementById("modalZone")).then(() => {
        showModal(modalAddCell);
    });
}

function openEditCellFromRow(tr) {
    const cellId = tr.dataset.id;
    const zoneId = tr.dataset.zoneId;
    const code = tr.dataset.code;
    const volume = tr.dataset.volume;
    const weight = tr.dataset.weight;
    const desc = tr.dataset.desc || "";

    document.getElementById("editCellId").value = cellId;
    document.getElementById("editCode").value = code;
    document.getElementById("editVolume").value = volume;
    document.getElementById("editWeight").value = weight;
    document.getElementById("editDescription").value = desc;

    fillZonesSelect(document.getElementById("editZone"), zoneId).then(() => {
        showModal(modalEditCell);
    });
}

/* ---------- Загрузка ячеек ---------- */
function loadCells() {
    fetch(`${API_BASE}/warehouse/get_cells.php`)
        .then((r) => r.json())
        .then((data) => {
            if (!cellsTableBody) return;

            cellsTableBody.innerHTML = "";

            data.cells.forEach((c) => {
                const tr = document.createElement("tr");

                tr.dataset.id = c.cell_id;
                tr.dataset.zoneId = c.zone_id || "";
                tr.dataset.code = c.cell_code || "";
                tr.dataset.volume = c.max_volume || "";
                tr.dataset.weight = c.max_weight || "";
                tr.dataset.desc = c.description || "";

                tr.innerHTML = `
                    <td>${c.cell_id}</td>
                    <td>${c.cell_code}</td>
                    <td>${c.zone_name}</td>
                    <td>${c.max_volume ?? "—"}</td>
                    <td>${c.max_weight ?? "—"}</td>
                    <td>${c.description || "—"}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm cell-edit-btn">Редактировать</button>
                        <button class="btn btn-danger btn-sm cell-delete-btn">Удалить</button>
                    </td>
                `;

                cellsTableBody.appendChild(tr);
            });

            // KPI по ячейкам
            const kpiCells = document.getElementById("kpi-cells");
            if (kpiCells) {
                kpiCells.textContent = data.cells.length;
            }

            // навешиваем действия
            cellsTableBody.querySelectorAll(".cell-edit-btn").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const tr = btn.closest("tr");
                    if (tr) openEditCellFromRow(tr);
                });
            });

            cellsTableBody.querySelectorAll(".cell-delete-btn").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const tr = btn.closest("tr");
                    if (tr) deleteCell(tr.dataset.id);
                });
            });
        });
}

/* ---------- Создание ячейки ---------- */
function createCell() {
    const payload = {
        zone_id: document.getElementById("modalZone").value,
        cell_code: document.getElementById("modalCode").value,
        max_volume: document.getElementById("modalVolume").value,
        max_weight: document.getElementById("modalWeight").value,
        description: document.getElementById("modalDescription").value
    };

    fetch(`${API_BASE}/warehouse/create_cell.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
        .then((r) => r.json())
        .then((res) => {
            if (res.message !== "ok") {
                alert(res.message);
                return;
            }
            hideModal(modalAddCell);
            loadCells();
        });
}

/* ---------- Сохранение изменений ячейки ---------- */
function saveEditCell() {
    const payload = {
        cell_id: document.getElementById("editCellId").value,
        zone_id: document.getElementById("editZone").value,
        cell_code: document.getElementById("editCode").value,
        max_volume: document.getElementById("editVolume").value,
        max_weight: document.getElementById("editWeight").value,
        description: document.getElementById("editDescription").value
    };

    fetch(`${API_BASE}/warehouse/update_cell.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
        .then((r) => r.json())
        .then((res) => {
            if (res.message !== "ok") {
                alert(res.message);
                return;
            }
            hideModal(modalEditCell);
            loadCells();
        });
}

/* ---------- Удаление ячейки ---------- */
function deleteCell(cellId) {
    if (!confirm("Удалить ячейку?")) return;

    fetch(`${API_BASE}/warehouse/delete_cell.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cell_id: cellId })
    })
        .then((r) => r.json())
        .then((res) => {
            if (res.message !== "ok") {
                alert(res.message);
                return;
            }
            loadCells();
        });
}

/* =====================================================
   БЛОК: ЗОНЫ
===================================================== */
let zonesTableBody;
let addZoneBtn;
let modalAddZone;
let modalEditZone;

function initZoneSection() {
    zonesTableBody = document.getElementById("zonesTableBody");
    addZoneBtn = document.getElementById("addZoneBtn");
    modalAddZone = document.getElementById("modalAddZone");
    modalEditZone = document.getElementById("modalEditZone");

    const closeAddZoneBtn = document.getElementById("closeAddZone");
    const saveAddZoneBtn = document.getElementById("saveAddZone");

    const closeEditZoneBtn = document.getElementById("closeEditZone");
    const saveEditZoneBtn = document.getElementById("saveEditZone");

    if (addZoneBtn) {
        addZoneBtn.addEventListener("click", () => {
            openAddZoneModal();
        });
    }

    if (closeAddZoneBtn) {
        closeAddZoneBtn.addEventListener("click", () => {
            hideModal(modalAddZone);
        });
    }

    if (saveAddZoneBtn) {
        saveAddZoneBtn.addEventListener("click", () => {
            saveNewZone();
        });
    }

    if (closeEditZoneBtn) {
        closeEditZoneBtn.addEventListener("click", () => {
            hideModal(modalEditZone);
        });
    }

    if (saveEditZoneBtn) {
        saveEditZoneBtn.addEventListener("click", () => {
            saveEditedZone();
        });
    }
}

/* ---------- Загрузка зон ---------- */
function loadZones() {
    fetch(`${API_BASE}/warehouse/get_zones.php`)
        .then((r) => r.json())
        .then((data) => {
            if (!zonesTableBody) return;

            zonesTableBody.innerHTML = "";

            data.zones.forEach((z) => {
                const tr = document.createElement("tr");
                tr.dataset.id = z.zone_id;
                tr.dataset.name = z.name || "";
                tr.dataset.desc = z.description || "";

                tr.innerHTML = `
                    <td>${z.zone_id}</td>
                    <td>${z.name}</td>
                    <td>${z.description || "—"}</td>
                    <td>${formatDate(z.created_at)}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm zone-edit-btn">Редактировать</button>
                        <button class="btn btn-danger btn-sm zone-delete-btn">Удалить</button>
                    </td>
                `;
                zonesTableBody.appendChild(tr);
            });

            // KPI
            const kpiZones = document.getElementById("kpi-zones");
            if (kpiZones) {
                kpiZones.textContent = data.zones.length;
            }

            // События
            zonesTableBody.querySelectorAll(".zone-edit-btn").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const tr = btn.closest("tr");
                    if (tr) openEditZoneFromRow(tr);
                });
            });

            zonesTableBody.querySelectorAll(".zone-delete-btn").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const tr = btn.closest("tr");
                    if (tr) deleteZone(tr.dataset.id);
                });
            });
        });
}

function formatDate(dateStr) {
    if (!dateStr) return "—";
    const d = new Date(dateStr.replace(" ", "T"));
    return d.toLocaleString("ru-RU");
}



/* ---------- Модалки зон ---------- */
function openAddZoneModal() {
    document.getElementById("zoneName").value = "";
    document.getElementById("zoneDesc").value = "";
    showModal(modalAddZone);
}

function openEditZoneFromRow(tr) {
    const id = tr.dataset.id;
    const name = tr.dataset.name;
    const desc = tr.dataset.desc;

    document.getElementById("editZoneId").value = id;
    document.getElementById("editZoneName").value = name;
    document.getElementById("editZoneDesc").value = desc;

    showModal(modalEditZone);
}

function saveNewZone() {
    const name = document.getElementById("zoneName").value.trim();
    const description = document.getElementById("zoneDesc").value.trim();

    if (!name) {
        alert("Введите название зоны");
        return;
    }

    fetch(`${API_BASE}/warehouse/create_zone.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description })
    })
        .then((r) => r.json())
        .then((res) => {
            if (res.message !== "ok") {
                alert(res.message);
                return;
            }
            hideModal(modalAddZone);
            loadZones();
        });
}

function saveEditedZone() {
    const zone_id = document.getElementById("editZoneId").value;
    const name = document.getElementById("editZoneName").value.trim();
    const description = document.getElementById("editZoneDesc").value.trim();

    if (!name) {
        alert("Введите название зоны");
        return;
    }

    fetch(`${API_BASE}/warehouse/update_zone.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zone_id, name, description })
    })
        .then((r) => r.json())
        .then((res) => {
            if (res.message !== "ok") {
                alert(res.message);
                return;
            }
            hideModal(modalEditZone);
            loadZones();
        });
}

function deleteZone(zoneId) {
    if (!confirm("Удалить зону?")) return;

    fetch(`${API_BASE}/warehouse/delete_zone.php?zone_id=${zoneId}`)
        .then((r) => r.json())
        .then((res) => {
            if (res.message !== "ok") {
                alert(res.message);
                return;
            }
            loadZones();
        });
}

/* =====================================================
   ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
===================================================== */
function showModal(modal) {
    if (!modal) return;
    modal.style.display = "flex";
}

function hideModal(modal) {
    if (!modal) return;
    modal.style.display = "none";
}

// Заполнить select зонами
function fillZonesSelect(selectElement, selectedId = null) {
    return fetch(`${API_BASE}/warehouse/get_zones.php`)
        .then((r) => r.json())
        .then((data) => {
            if (!selectElement) return;

            selectElement.innerHTML = "";
            data.zones.forEach((z) => {
                const opt = document.createElement("option");
                opt.value = z.zone_id;
                opt.textContent = z.name;
                selectElement.appendChild(opt);
            });

            if (selectedId) {
                selectElement.value = String(selectedId);
            }
        });
}
