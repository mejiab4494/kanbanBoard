// main.js
import { addTask }   from "./cards.js";
import { addColumn } from "./columns.js";
import { enableColumnDrop, enableColumnDrag, draggedColumn } from "./drag.js";
import { saveBoard, loadBoard } from "./storage.js";
import { signIn, signOutUser, onUserChange } from "./auth.js";

function getColumns() {
  return document.querySelectorAll(".toDo, .inProgress, .done, .buildedColumn");
}

const board          = document.querySelector(".kanban-board");
const newColumnBtn   = document.querySelector(".newColumn");
const observerConfig = { childList: true, subtree: true, characterData: true };

// ─── MutationObserver (auto-save) ────────────────────────────────────────────
let saveTimer;
const debouncedSave = () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveBoard, 500);
};
export const observer = new MutationObserver(debouncedSave);

// ─── Static buttons ───────────────────────────────────────────────────────────
document.querySelectorAll(".addTaskButton").forEach(btn => {
  btn.addEventListener("click", () => addTask(btn));
});
newColumnBtn.addEventListener("click", addColumn);

getColumns().forEach(col => {
  enableColumnDrop(col);
  enableColumnDrag(col);
});

// ─── Board-level column reordering ───────────────────────────────────────────
board.addEventListener("dragover", e => {
  e.preventDefault();
  const dc = draggedColumn;
  if (!dc) return;

  const siblings = [...board.querySelectorAll(
    ".toDo, .inProgress, .done, .buildedColumn"
  )].filter(col => col !== dc);

  const nearest = siblings.reduce((closest, col) => {
    const box    = col.getBoundingClientRect();
    const offset = e.clientX - (box.left + box.width / 2);
    if (offset < 0 && offset > closest.offset) return { offset, element: col };
    return closest;
  }, { offset: -Infinity, element: null });

  board.insertBefore(dc, nearest.element ?? newColumnBtn);
});

// ─── Reset ────────────────────────────────────────────────────────────────────
document.querySelector(".resetBtn").addEventListener("click", () => {
  if (!confirm("Reset the board? This will delete everything.")) return;

  localStorage.removeItem("kanban");
  observer.disconnect();
  getColumns().forEach(col => col.remove());

  const defaults = [
    { cls: "toDo",       label: "TO DO" },
    { cls: "inProgress", label: "IN PROGRESS" },
    { cls: "done",       label: "DONE" },
  ];

  defaults.forEach(({ cls, label }) => {
    const col = document.createElement("div");
    col.classList.add(cls);

    const h1 = document.createElement("h1");
    h1.textContent = label;
    col.appendChild(h1);

    const addBtn = document.createElement("button");
    addBtn.textContent = "+ Add card";
    addBtn.classList.add("addTaskButton");
    addBtn.addEventListener("click", () => addTask(addBtn));
    col.appendChild(addBtn);

    board.insertBefore(col, newColumnBtn);
    enableColumnDrop(col);
    enableColumnDrag(col);
  });

  observer.observe(board, observerConfig);
});

// ─── Auth UI ──────────────────────────────────────────────────────────────────
const loginBtn  = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const userLabel = document.getElementById("userLabel");

loginBtn.addEventListener("click", async () => {
  try { await signIn(); }
  catch (err) { console.error("Sign-in failed", err); }
});

logoutBtn.addEventListener("click", () => signOutUser());

// ─── Boot: react to auth state ────────────────────────────────────────────────
onUserChange(async user => {
  if (user) {
    userLabel.textContent = user.displayName || user.email;
    loginBtn.hidden       = true;
    logoutBtn.hidden      = false;
    userLabel.hidden      = false;
  } else {
    userLabel.textContent = "";
    loginBtn.hidden       = false;
    logoutBtn.hidden      = true;
    userLabel.hidden      = true;
  }

  // Reload board on every auth change (sign-in loads cloud, sign-out loads local)
  observer.disconnect();
  await loadBoard();
  observer.observe(board, observerConfig);
});