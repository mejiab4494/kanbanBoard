import { addTask }   from "./cards.js";
import { enableDrag, enableColumnDrop, enableColumnDrag } from "./drag.js";
import { getApp, getCurrentUser } from "./auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

function db() { return getFirestore(getApp()); }

function getColumns() {
  return document.querySelectorAll(".toDo, .inProgress, .done, .buildedColumn");
}

// ─── Serialise the current board to a plain JS array ─────────────────────────

function serialiseBoard() {
  const data = [];
  getColumns().forEach(col => {
    const isBuilt = col.classList.contains("buildedColumn");
    const title =
      col.querySelector("h1")?.textContent ||
      col.querySelector(".columnTitleInput")?.value ||
      (col.classList.contains("toDo")        ? "TO DO"
       : col.classList.contains("inProgress") ? "IN PROGRESS"
       : "DONE");

    const cards = [...col.querySelectorAll(".card")].map(
      card => card.querySelector("textarea")?.value || ""
    );

    data.push({ title, cards, isBuilt });
  });
  return data;
}

// ─── Save ─────────────────────────────────────────────────────────────────────

export async function saveBoard() {
  const data = serialiseBoard();

  // Always write to localStorage
  localStorage.setItem("kanban", JSON.stringify(data));

  // If signed in, also push to Firestore
  const user = getCurrentUser();
  if (user) {
    try {
      await setDoc(
        doc(db(), "boards", user.uid),
        { data: JSON.stringify(data), updatedAt: Date.now() }
      );
    } catch (err) {
      console.warn("Firestore save failed, local copy is still up to date.", err);
    }
  }
}

// ─── Load ─────────────────────────────────────────────────────────────────────

export async function loadBoard() {
  let parsed = null;

  const user = getCurrentUser();
  if (user) {
    try {
      const snap = await getDoc(doc(db(), "boards", user.uid));
      if (snap.exists()) {
        parsed = JSON.parse(snap.data().data);
        localStorage.setItem("kanban", JSON.stringify(parsed));
      }
    } catch (err) {
      console.warn("Firestore load failed, falling back to localStorage.", err);
    }
  }

  if (!parsed) {
    const saved = localStorage.getItem("kanban");
    if (!saved) return;
    parsed = JSON.parse(saved);
  }

  renderBoard(parsed);
}

// ─── Render a parsed board array into the DOM ─────────────────────────────────

function renderBoard(parsed) {
  const board        = document.querySelector(".kanban-board");
  const newColumnBtn = document.querySelector(".newColumn");

  getColumns().forEach(col => col.remove());

  parsed.forEach(({ title, cards, isBuilt }) => {
    let column;

    if (isBuilt) {
      column = document.createElement("div");
      column.classList.add("buildedColumn");

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "×";
      deleteBtn.classList.add("deleteColumnBtn");
      deleteBtn.addEventListener("click", () => column.remove());
      column.appendChild(deleteBtn);

      const h1 = document.createElement("h1");
      h1.textContent = title;
      h1.classList.add("columnTitle");
      column.appendChild(h1);

      attachTitleEdit(h1, column);

      const addBtn = document.createElement("button");
      addBtn.textContent = "+ Add card";
      addBtn.classList.add("addTaskButton");
      addBtn.addEventListener("click", () => addTask(addBtn));
      column.appendChild(addBtn);

    } else {
      column = document.createElement("div");
      column.classList.add(
        title === "TO DO"         ? "toDo"
        : title === "IN PROGRESS" ? "inProgress"
        : "done"
      );

      const h1 = document.createElement("h1");
      h1.textContent = title;
      column.appendChild(h1);

      const addBtn = document.createElement("button");
      addBtn.textContent = "+ Add card";
      addBtn.classList.add("addTaskButton");
      addBtn.addEventListener("click", () => addTask(addBtn));
      column.appendChild(addBtn);
    }

    board.insertBefore(column, newColumnBtn);
    enableColumnDrop(column);
    enableColumnDrag(column);

    const addBtn = column.querySelector(".addTaskButton");
    cards.forEach(text => {
      const card = document.createElement("div");
      card.classList.add("card");

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "×";
      deleteBtn.classList.add("deleteCardBtn");
      deleteBtn.addEventListener("click", () => card.remove());
      card.appendChild(deleteBtn);

      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.rows  = 2;
      card.appendChild(textarea);

      enableDrag(card);
      column.insertBefore(card, addBtn);
    });
  });
}

function attachTitleEdit(h1, column) {
  h1.addEventListener("click", () => {
    const input = document.createElement("input");
    input.type  = "text";
    input.value = h1.textContent;
    input.classList.add("columnTitleInput");

    input.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === "Escape") input.blur();
    });

    input.addEventListener("blur", () => {
      h1.textContent = input.value || "Untitled";
      input.replaceWith(h1);
    });

    h1.replaceWith(input);
    input.focus();
  });
}