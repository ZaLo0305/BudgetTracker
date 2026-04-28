// ── SCREEN ELEMENTS ──
const monthScreen   = document.getElementById("monthScreen");
const budgetScreen  = document.getElementById("budgetScreen");

// Dashboard
const newMonthPicker   = document.getElementById("newMonthPicker");
const createMonthBtn   = document.getElementById("createMonthBtn");
const monthListEl      = document.getElementById("monthList");
const noMonthsMsg      = document.getElementById("noMonthsMsg");
const backBtn          = document.getElementById("backBtn");
const screenMonthTitle = document.getElementById("screenMonthTitle");

// Income
const incomeSourceInput = document.getElementById("incomeSource");
const incomeAmountInput = document.getElementById("incomeAmount");
const addIncomeBtn      = document.getElementById("addIncomeBtn");
const incomeListEl      = document.getElementById("incomeList");
const incomeEmptyMsg    = document.getElementById("incomeEmptyMsg");
const incomeTotalEl     = document.getElementById("incomeTotal");

// Budget
const budgetInput    = document.getElementById("budgetInput");
const applyBudgetBtn = document.getElementById("applyBudgetBtn");
const budgetDisplay  = document.getElementById("budgetDisplay");

// Expenses
const descInput  = document.getElementById("desc");
const amountInput = document.getElementById("amount");
const addBtn     = document.getElementById("addBtn");
const listEl     = document.getElementById("list");
const emptyMsg   = document.getElementById("emptyMsg");
const clearBtn   = document.getElementById("clearBtn");

// Summary
const spentEl       = document.getElementById("spent");
const remainingEl   = document.getElementById("remaining");
const progressFill  = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");

// Hidden month key
const currentMonthKey = document.getElementById("currentMonthKey");

// ── STATE ──
let incomeList = [];
let budget     = 0;
let expenses   = [];

// ── HELPERS ──
function parseMoney(text) {
  const cleaned = String(text).replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isFinite(num) && num > 0 ? num : 0;
}

function money(n) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function totalIncome() {
  return incomeList.reduce((sum, i) => sum + (i.amount || 0), 0);
}

function totalSpent() {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

function getMonthKey() {
  return currentMonthKey.value;
}

function formatMonthLabel(key) {
  if (!key) return "";
  const [year, month] = key.split("-");
  const date = new Date(+year, +month - 1, 1);
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

// ── STORAGE ──
function loadData() {
  try {
    return JSON.parse(localStorage.getItem("budgetData") || "{}");
  } catch {
    return {};
  }
}

function saveData(data) {
  localStorage.setItem("budgetData", JSON.stringify(data));
}

// ── LOAD / SAVE PERIOD ──
function loadPeriod() {
  const key = getMonthKey();
  const data = loadData();
  const period = data[key] || { income: [], budget: 0, expenses: [] };

  // Normalize income entries (support old plain-number format)
  incomeList = (period.income || []).map(i =>
    typeof i === "number" ? { source: "Income", amount: i } : i
  );
  budget   = period.budget || 0;
  expenses = period.expenses || [];

  updateUI();
}

function savePeriod() {
  const key = getMonthKey();
  if (!key) return;
  const data = loadData();
  data[key] = { income: incomeList, budget, expenses };
  saveData(data);
}

// ── DASHBOARD ──
function showScreen(name) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(name + "Screen").classList.add("active");
  window.scrollTo(0, 0);
}

function renderDashboard() {
  const data = loadData();
  const keys = Object.keys(data).sort();

  monthListEl.innerHTML = "";
  noMonthsMsg.style.display = keys.length === 0 ? "block" : "none";

  keys.forEach(key => {
    const d = data[key];
    const inc   = (d.income || []).reduce((s, i) => s + (typeof i === "number" ? i : i.amount || 0), 0);
    const spent = (d.expenses || []).reduce((s, e) => s + e.amount, 0);

    const li = document.createElement("li");
    li.innerHTML = `
      <button class="month-card-btn" data-key="${key}">
        <span class="month-card-title">${formatMonthLabel(key)}</span>
        <span class="month-card-stats">Income: ${money(inc)} &nbsp;•&nbsp; Spent: ${money(spent)}</span>
      </button>
      <button class="month-delete-btn" data-delete="${key}" title="Delete month">✕</button>
    `;
    monthListEl.appendChild(li);
  });
}

// ── UPDATE UI ──
function updateUI() {
  const inc     = totalIncome();
  const spent   = totalSpent();
  const base    = budget > 0 ? budget : inc;
  const remaining = base - spent;
  const pct     = base > 0 ? Math.min((spent / base) * 100, 100) : 0;

  incomeTotalEl.textContent = money(inc);
  budgetDisplay.textContent = budget > 0 ? money(budget) : money(inc);
  spentEl.textContent       = money(spent);
  remainingEl.textContent   = money(remaining);
  remainingEl.className     = "summary-value " + (remaining < 0 ? "negative" : remaining === 0 ? "" : "positive");

  // Progress bar
  progressFill.style.width = pct + "%";
  progressFill.classList.toggle("danger", remaining < 0);
  progressLabel.textContent = Math.round(pct) + "% used";

  // Income list
  incomeListEl.innerHTML = "";
  incomeEmptyMsg.style.display = incomeList.length === 0 ? "block" : "none";
  incomeList.forEach((inc, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="item-desc">${escHtml(inc.source)}</span>
      <strong class="item-amount">${money(inc.amount)}</strong>
      <button class="item-delete" data-type="income" data-i="${i}">Delete</button>
    `;
    incomeListEl.appendChild(li);
  });

  // Expense list
  listEl.innerHTML = "";
  emptyMsg.style.display = expenses.length === 0 ? "block" : "none";
  expenses.forEach((e, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span class="item-desc">${escHtml(e.desc)}</span>
      <strong class="item-amount">${money(e.amount)}</strong>
      <button class="item-delete" data-type="expense" data-i="${i}">Delete</button>
    `;
    listEl.appendChild(li);
  });
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── EVENTS: DASHBOARD ──

createMonthBtn.addEventListener("click", () => {
  const value = newMonthPicker.value;
  if (!value) return alert("Please select a month first.");

  const data = loadData();
  if (!data[value]) {
    data[value] = { income: [], budget: 0, expenses: [] };
    saveData(data);
  }

  renderDashboard();
  newMonthPicker.value = "";
});

monthListEl.addEventListener("click", e => {
  // Delete month
  const delBtn = e.target.closest("[data-delete]");
  if (delBtn) {
    const key = delBtn.dataset.delete;
    if (!confirm(`Delete ${formatMonthLabel(key)}? This cannot be undone.`)) return;
    const data = loadData();
    delete data[key];
    saveData(data);
    renderDashboard();
    return;
  }

  // Open month
  const openBtn = e.target.closest("[data-key]");
  if (!openBtn) return;

  const key = openBtn.dataset.key;
  currentMonthKey.value = key;
  screenMonthTitle.textContent = formatMonthLabel(key);

  loadPeriod();
  showScreen("budget");
});

backBtn.addEventListener("click", () => {
  renderDashboard();
  showScreen("month");
});

// ── EVENTS: INCOME ──

addIncomeBtn.addEventListener("click", () => {
  const amt = parseMoney(incomeAmountInput.value);
  if (amt <= 0) return alert("Please enter a valid income amount.");

  incomeList.push({
    source: incomeSourceInput.value.trim() || "Income",
    amount: amt
  });

  incomeSourceInput.value = "";
  incomeAmountInput.value = "";
  incomeSourceInput.focus();

  savePeriod();
  updateUI();
});

// ── EVENTS: BUDGET ──

applyBudgetBtn.addEventListener("click", () => {
  const val = parseMoney(budgetInput.value);
  budget = val;
  budgetInput.value = val > 0 ? val.toFixed(2) : "";
  savePeriod();
  updateUI();
});

// ── EVENTS: EXPENSES ──

addBtn.addEventListener("click", () => {
  const desc = descInput.value.trim();
  const amt  = parseMoney(amountInput.value);
  if (!desc) return alert("Please enter a description.");
  if (amt <= 0) return alert("Please enter a valid amount.");

  expenses.push({ desc, amount: amt });
  descInput.value  = "";
  amountInput.value = "";
  descInput.focus();

  savePeriod();
  updateUI();
});

// Support Enter key on expense form
[descInput, amountInput].forEach(input => {
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") addBtn.click();
  });
});

// Support Enter key on income form
[incomeSourceInput, incomeAmountInput].forEach(input => {
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") addIncomeBtn.click();
  });
});

// ── EVENTS: DELETE / CLEAR ──

// Delegated delete for both income and expense lists
[incomeListEl, listEl].forEach(el => {
  el.addEventListener("click", e => {
    const btn = e.target.closest(".item-delete");
    if (!btn) return;
    const type = btn.dataset.type;
    const i    = parseInt(btn.dataset.i, 10);
    if (type === "income")  incomeList.splice(i, 1);
    if (type === "expense") expenses.splice(i, 1);
    savePeriod();
    updateUI();
  });
});

clearBtn.addEventListener("click", () => {
  if (!confirm("Clear all expenses for this month?")) return;
  expenses = [];
  savePeriod();
  updateUI();
});

// ── INIT ──
renderDashboard();
