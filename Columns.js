import { addTask } from "./cards.js";
import { enableColumnDrop, enableColumnDrag } from "./drag.js";

export function addColumn() {
  const board = document.querySelector(".kanban-board");
  const newColumnBtn = document.querySelector(".newColumn");

  const column = document.createElement("div");
  column.classList.add("buildedColumn");

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "×";
  deleteBtn.classList.add("deleteColumnBtn");
  deleteBtn.addEventListener("click", () => column.remove());
  column.appendChild(deleteBtn);

  const titleInput = document.createElement("input");
  titleInput.type = "text";
  titleInput.placeholder = "Column title";
  titleInput.classList.add("columnTitleInput");

  titleInput.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === "Escape") titleInput.blur();
  });

  titleInput.addEventListener("blur", () => {
    const h1 = document.createElement("h1");
    h1.textContent = titleInput.value || "Untitled";
    h1.classList.add("columnTitle");
    column.insertBefore(h1, titleInput);
    titleInput.remove();

    h1.addEventListener("click", () => {
      titleInput.value = h1.textContent;
      column.insertBefore(titleInput, h1);
      h1.remove();
      titleInput.focus();
    });
  });

  const addBtn = document.createElement("button");
  addBtn.textContent = "+ Add card";
  addBtn.classList.add("addTaskButton");
  addBtn.addEventListener("click", () => addTask(addBtn));

  column.appendChild(titleInput);
  column.appendChild(addBtn);

  board.insertBefore(column, newColumnBtn);

  enableColumnDrop(column);
  enableColumnDrag(column);
  titleInput.focus();
}