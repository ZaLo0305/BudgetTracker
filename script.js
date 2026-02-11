// --- Screen references ---
const monthScreen = document.getElementById("monthScreen");
const budgetScreen = document.getElementById("budgetScreen");

const newMonthPicker = document.getElementById("newMonthPicker");
const createMonthBtn = document.getElementById("createMonthBtn");
const monthListEl = document.getElementById("monthList");

// --- Budget inputs ---
const incomeSourceInput = document.getElementById("incomeSource");
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

// --- Data ---
let incomeList = [];
let budget = 0;
let expenses = [];

// --- Helpers ---
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
  return incomeList.reduce((sum, i) => sum + (i.amount || 0), 0);
}

function getPeriodKey() {
  return startInput.value;
}

function loadData() {
  return JSON.parse(localStorage.getItem("budgetData") || "{}");
}

function saveData(data) {
  localStorage.setItem("budgetData", JSON.stringify(data));
}

// --- Load Month ---
function loadPeriod() {
  const key = getPeriodKey();
  const data = loadData();
  const period = data[key] || { income: [], budget: 0, expenses: [] };

  incomeList = period.income || [];
  budget = period.budget || 0;
  expenses = period.expenses || [];

  updateUI();
}

// --- Save Month ---
function savePeriod() {
  const key = getPeriodKey();
  const data = loadData();
  data[key] = { income: incomeList, budget, expenses };
  saveData(data);
}

// --- Dashboard ---
function renderMonthDashboard() {
  const data = loadData();
  monthListEl.innerHTML = "";

  Object.keys(data).sort().forEach(key => {
    const monthData = data[key];

    const totalIncome = (monthData.income || []).reduce((s, i) => s + (i.amount || 0), 0);
    const totalSpent = (monthData.expenses || []).reduce((s, e) => s + e.amount, 0);

    const li = document.createElement("li");
    li.innerHTML = `
      <button class="month-btn" data-key="${key}">
        <div class="month-title">${key}</div>
        <div class="month-stats">
          Income: ${money(totalIncome)} • Spent: ${money(totalSpent)}
        </div>
      </button>
      <button class="delete-month" data-delete="${key}">Delete</button>
    `;

    monthListEl.appendChild(li);
  });
}

// --- Create Month ---
createMonthBtn.addEventListener("click", () => {
  const value = newMonthPicker.value;
  if (!value) return alert("Select a month first.");

  const data = loadData();
  if (!data[value]) {
    data[value] = { income: [], budget: 0, expenses: [] };
    saveData(data);
  }

  renderMonthDashboard();
});

// --- Open Month ---
monthListEl.addEventListener("click", (e) => {

  if (e.target.matches("[data-delete]")) {
    const key = e.target.dataset.delete;
    if (!confirm("Delete this month?")) return;

    const data = loadData();
    delete data[key];
    saveData(data);
    renderMonthDashboard();
    return;
  }

  const btn = e.target.closest(".month-btn");
  if (!btn) return;

  const key = btn.dataset.key;
  startInput.value = key;

  monthScreen.style.display = "none";
  budgetScreen.style.display = "block";

  loadPeriod();
});

// --- UI ---
function updateUI() {
  incomeTotalEl.textContent = money(totalIncome());
  spentEl.textContent = money(totalSpent());

  const base = budget > 0 ? budget : totalIncome();
  const remaining = base - totalSpent();

  remainingEl.textContent = money(remaining);
  remainingEl.classList.toggle("negative", remaining < 0);

  // income list
  incomeListEl.innerHTML = "";
  if (incomeList.length === 0) {
    incomeEmptyMsg.style.display = "block";
  } else {
    incomeEmptyMsg.style.display = "none";
    incomeList.forEach((inc, i) => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${inc.source}</span>
        <strong>${money(inc.amount)}</strong>
        <button class="del-income" data-i="${i}">Delete</button>
      `;
      incomeListEl.appendChild(li);
    });
  }

  // expense list
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

// --- Events ---
startInput.addEventListener("change", loadPeriod);

addIncomeBtn.addEventListener("click", () => {
  const amt = parseMoney(incomeInput.value);
  if (amt <= 0) return;

  incomeList.push({
    source: incomeSourceInput.value || "Income",
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

addBtn.addEventListener("click", () => {
  const desc = descInput.value.trim();
  const amt = parseMoney(amountInput.value);
  if (!desc || amt <= 0) return;

  expenses.push({ desc, amount: amt });

  descInput.value = "";
  amountInput.value = "";

  savePeriod();
  updateUI();
});

listEl.addEventListener("click", e => {
  const btn = e.target.closest(".del");
  if (!btn) return;
  expenses.splice(btn.dataset.i, 1);
  savePeriod();
  updateUI();
});

incomeListEl.addEventListener("click", e => {
  const btn = e.target.closest(".del-income");
  if (!btn) return;
  incomeList.splice(btn.dataset.i, 1);
  savePeriod();
  updateUI();
});

clearBtn.addEventListener("click", () => {
  if (!confirm("Clear all expenses?")) return;
  expenses = [];
  savePeriod();
  updateUI();
});

// --- Init ---
renderMonthDashboard();
