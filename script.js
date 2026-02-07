const incomeInput = document.getElementById("income");
const budgetInput = document.getElementById("budget");
const addIncomeBtn = document.getElementById("addIncomeBtn");
const applyBudgetBtn = document.getElementById("applyBudgetBtn");


const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amount");
const addBtn = document.getElementById("addBtn");

const spentEl = document.getElementById("spent");
const remainingEl = document.getElementById("remaining");

const listEl = document.getElementById("list");
const emptyMsg = document.getElementById("emptyMsg");
const clearBtn = document.getElementById("clearBtn");

const startInput = document.getElementById("start");

// Current month’s data
let incomeList = [];
let budget = 0;
let expenses = []; // { desc, amount }

// -------- Helper functions --------

function parseMoney(text) {
  const cleaned = String(text).replace(/[^0-9.]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : 0;
}

function money(n) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function totalSpent() {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

function totalIncome() {
  return incomeList.reduce((sum, i) => sum + i, 0);
}


function getPeriodKey() {
  const date = new Date(startInput.value);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}`; // e.g., "2026-02"
}

function loadData() {
  return JSON.parse(localStorage.getItem("budgetData") || "{}");
}

function saveData(data) {
  localStorage.setItem("budgetData", JSON.stringify(data));
}

function loadPeriod() {
  const key = getPeriodKey();
  const data = loadData();
  const period = data[key] || { income: 0, budget: 0, expenses: [] };

  incomeList = period.income || [];
  budget = period.budget || 0;
  expenses = period.expenses || [];

  incomeInput.value = "";
  budgetInput.value = budget || "";


  updateUI();
}

function savePeriod() {
  const key = getPeriodKey();
  const dataStore = loadData();
  dataStore[key] = { income, budget, expenses };
  saveData(dataStore);
}

// -------- Update UI --------

function updateUI() {
  const spent = totalSpent();
  spentEl.textContent = money(spent);

  const base = budget > 0 ? budget : income;
  remainingEl.textContent = money(base - spent);

  // Update expense list
  listEl.innerHTML = "";
  if (expenses.length === 0) {
    emptyMsg.style.display = "block";
  } else {
    emptyMsg.style.display = "none";
    expenses.forEach((e, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${e.desc}</span>
        <strong>${money(e.amount)}</strong>
        <button class="del" data-i="${i}">Delete</button>
      `;
      listEl.appendChild(li);
    });
  }
}

// -------- Event listeners --------

// Change month
startInput.addEventListener("change", loadPeriod);

// Apply income/budget
applyBtn.addEventListener("click", () => {
  income = parseMoney(incomeInput.value);
  budget = parseMoney(budgetInput.value);
  savePeriod();
  updateUI();
});

// Add expense
addBtn.addEventListener("click", () => {
  const desc = descInput.value.trim();
  const amt = parseMoney(amountInput.value);

  if (!desc) return alert("Please enter a description.");
  if (amt <= 0) return alert("Please enter an amount greater than 0.");

  expenses.push({ desc, amount: amt });

  descInput.value = "";
  amountInput.value = "";

  savePeriod();
  updateUI();
});

// Delete expense
listEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button.del");
  if (!btn) return;
  const i = Number(btn.dataset.i);
  expenses.splice(i, 1);
  savePeriod();
  updateUI();
});

// Clear all expenses
clearBtn.addEventListener("click", () => {
  if (!confirm("Are you sure you want to clear all expenses for this month?")) return;
  expenses = [];
  savePeriod();
  updateUI();
});

// -------- Initialize --------
loadPeriod();
