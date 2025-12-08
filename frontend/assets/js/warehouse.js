console.log("warehouse.js loaded");


/* ============================
   LOAD CELLS
============================ */
function loadCells() {
    fetch(`${API_BASE}/warehouse/get_cells.php`)
        .then(res => res.json())
        .then(data => {
            const body = document.getElementById("cellsTableBody");
            body.innerHTML = "";

            data.cells.forEach(c => {
                body.innerHTML += `
                    <tr>
                        <td>${c.cell_id}</td>
                        <td>${c.cell_code}</td>
                        <td>${c.zone_name}</td>
                        <td>${c.max_volume}</td>
                        <td>${c.max_weight}</td>
                    </tr>
                `;
            });
        })
        .catch(err => console.error("Load cells error:", err));
}

/* ============================
   MODAL ADD CELL
============================ */
const modal = document.getElementById("modalAddCell");
const addCellBtn = document.getElementById("addCellBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

if (addCellBtn) {
    addCellBtn.onclick = () => {
        fillZonesSelect();
        modal.classList.add("show");
        modal.classList.remove("hidden");
    };
}

if (closeModalBtn) {
    closeModalBtn.onclick = () => {
        modal.classList.add("hidden");
        modal.classList.remove("show");
    };
}

/* LOAD ZONES INTO SELECT */
function fillZonesSelect() {
    fetch(`${API_BASE}/warehouse/get_zones.php`)
        .then(r => r.json())
        .then(data => {
            const select = document.getElementById("modalZone");
            select.innerHTML = "";
            data.zones.forEach(z => {
                select.innerHTML += `<option value="${z.zone_id}">${z.name}</option>`;
            });
        });
}

/* ============================
   INIT
============================ */
document.addEventListener("DOMContentLoaded", () => {
    loadCells();
});
