const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");

const app = express();
app.use(express.static("public"));

app.get("/search", (req, res) => {
    const query = req.query.query.toLowerCase();
    const results = [];

    fs.createReadStream("winedb2.csv")
        .pipe(csv())
        .on("data", row => {
            if (row.name.toLowerCase().includes(query)) {
                results.push({
                    name: row.name,
                    country: row.country,
                    sub_region: row.sub_region,
                    colour: row.colour,
                    type: row.type
                });
            }
        })
        .on("end", () => res.json(results));
});

app.listen(3000, () => console.log("Server running on port 3000"));

function updateInventoryDisplay() {
    const inventory = JSON.parse(localStorage.getItem("inventory") || "[]");
    const groupedInventory = {};

    // Group inventory by type
    inventory.forEach(item => {
        if (!groupedInventory[item.type]) {
            groupedInventory[item.type] = [];
        }
        groupedInventory[item.type].push(item);
    });

    const container = document.getElementById("inventoryContainer");
    container.innerHTML = "";

    Object.entries(groupedInventory).forEach(([type, items]) => {
        const section = document.createElement("details");
        const summary = document.createElement("summary");
        summary.textContent = `${type} (${items.length})`;

        const list = document.createElement("ul");
        items.forEach((item, index) => {
            const li = document.createElement("li");
            li.textContent = item.name;

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "Remove";
            removeBtn.onclick = () => removeFromInventory(item, index);

            li.appendChild(removeBtn);
            list.appendChild(li);
        });

        section.appendChild(summary);
        section.appendChild(list);
        container.appendChild(section);
    });
}

function removeFromInventory(itemToRemove, index) {
    let inventory = JSON.parse(localStorage.getItem("inventory") || "[]");
    inventory.splice(index, 1);
    localStorage.setItem("inventory", JSON.stringify(inventory));
    updateInventoryDisplay();
}

// Ensure the inventory updates when a new item is added
document.getElementById("addToInventory").addEventListener("click", () => {
    updateInventoryDisplay();
});

updateInventoryDisplay();