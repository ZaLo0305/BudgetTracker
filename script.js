const monthScreen = document.getElementById("monthScreen");
const budgetScreen = document.getElementById("budgetScreen");

const incomeSourceInput = document.getElementById("incomeSource");


const newMonthPicker = document.getElementById("newMonthPicker");
const createMonthBtn = document.getElementById("createMonthBtn");
const monthListEl = document.getElementById("monthList");


const incomeInput = document.getElementById("income");
const budgetInput = document.getElementById("budget");
const addIncomeBtn = document.getElementById("addIncomeBtn");
const applyBudgetBtn = document.getElementById("applyBudgetBtn");

const incomeTotalEl = document.getElementById("incomeTotal");

const incomeListEl = document.getElementById("incomeList");
const incomeEmptyMsg = document.getElementById("incomeEmptyMsg");


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
  return incomeList.reduce((sum, i) => sum + i.amount, 0);
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

if (Array.isArray(period.income)) {
  incomeList = period.income;
} else if (typeof period.income === "number") {
  incomeList = [period.income]; // convert old data
} else {
  incomeList = [];
}

  budget = period.budget || 0;
  expenses = period.expenses || [];

  incomeInput.value = "";
  budgetInput.value = budget || "";


  updateUI();
}

function savePeriod() {
  const key = getPeriodKey();
  const dataStore = loadData();
  dataStore[key] = { income: incomeList, budget, expenses };

  saveData(dataStore);
}

function renderMonthDashboard() {
  const data = loadData();
  monthListEl.innerHTML = "";

  Object.keys(data).sort().forEach(key => {
    const li = document.createElement("li");

    li.innerHTML = `
      <button class="month-btn" data-key="${key}">
        ${key}
      </button>
    `;

    monthListEl.appendChild(li);
  });
}

createMonthBtn.addEventListener("click", () => {
  const value = newMonthPicker.value;
  if (!value) return alert("Select a month first.");

  const data = loadData();

  if (!data[value]) {
    data[value] = { income: [], budget: 0, expenses: [] };
    saveData(data);
    renderMonthDashboard();
  }


  // just refresh dashboard list
renderMonthDashboard();

});


monthListEl.addEventListener("click", (e) => {
  const btn = e.target.closest(".month-btn");
  if (!btn) return;

  const key = btn.dataset.key;

  startInput.value = key;

  monthScreen.style.display = "none";
  budgetScreen.style.display = "block";

  loadPeriod();
});


// -------- Update UI --------

function updateUI() {
  incomeTotalEl.textContent = money(totalIncome());

  const spent = totalSpent();
  spentEl.textContent = money(spent);

const base = budget > 0 ? budget : totalIncome();
const remaining = base - spent;

remainingEl.textContent = money(remaining);
remainingEl.classList.toggle("negative", remaining < 0);


// Update income list
incomeListEl.innerHTML = "";

if (incomeList.length === 0) {
  incomeEmptyMsg.style.display = "block";
} else {
  incomeEmptyMsg.style.display = "none";
  incomeList.forEach((amt, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>Income</span>
      <strong>${money(amt)}</strong>
      <button class="del-income" data-i="${i}">Delete</button>
    `;
    incomeListEl.appendChild(li);
  });
}



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
addIncomeBtn.addEventListener("click", () => {
  const amt = parseMoney(incomeInput.value);

  if (amt <= 0) return alert("Enter a valid income amount.");

  const source = incomeSourceInput.value.trim() || "Income";

  incomeList.push({
    source: source,
    amount: amt
});

  incomeInput.value = "";
  incomeSourceInput.value = "";


  savePeriod();
  updateUI();
});


applyBudgetBtn.addEventListener("click", () => {
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

incomeListEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button.del-income");
  if (!btn) return;

  const i = Number(btn.dataset.i);
  incomeList.splice(i, 1);

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
renderMonthDashboard();

