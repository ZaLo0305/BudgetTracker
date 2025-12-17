const incomeInput = document.getElementById("income");
const budgetInput = document.getElementById("budget");
const applyBtn = document.getElementById("applyBtn");

const descInput = document.getElementById("desc");
const amountInput = document.getElementById("amount");
const addBtn = document.getElementById("addBtn");

const spentEl = document.getElementById("spent");
const remainingEl = document.getElementById("remaining");

const listEl = document.getElementById("list");
const emptyMsg = document.getElementById("emptyMsg");
const clearBtn = document.getElementById("clearBtn");

let income = 0;
let budget = 0;
let expenses = []; // { desc, amount }

function parseMoney(text) {
  // allows "$500", "500", "500.25", " $  500 "
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

function updateUI() {
  const spent = totalSpent();

  spentEl.textContent = money(spent);

  // Remaining is based on BUDGET first. If budget is 0, use income.
  const base = budget > 0 ? budget : income;
  const remaining = base - spent;

  remainingEl.textContent = money(remaining);

  // list
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

applyBtn.addEventListener("click", () => {
  income = parseMoney(incomeInput.value);
  budget = parseMoney(budgetInput.value);
  updateUI();
});

addBtn.addEventListener("click", () => {
  const desc = descInput.value.trim();
  const amt = parseMoney(amountInput.value);

  if (!desc) return alert("Please enter a description.");
  if (amt <= 0) return alert("Please enter an amount greater than 0.");

  expenses.push({ desc, amount: amt });

  descInput.value = "";
  amountInput.value = "";
  updateUI();
});

listEl.addEventListener("click", (e) => {
  const btn = e.target.closest("button.del");
  if (!btn) return;
  const i = Number(btn.dataset.i);
  expenses.splice(i, 1);
  updateUI();
});

clearBtn.addEventListener("click", () => {
  expenses = [];
  updateUI();
});

// start
updateUI();
