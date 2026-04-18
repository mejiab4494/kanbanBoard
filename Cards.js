import { enableDrag } from "./drag.js";

export function addTask(btn) {
  const column = btn.closest(".toDo, .inProgress, .done, .buildedColumn");

  const card = document.createElement("div");
  card.classList.add("card");

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "×";
  deleteBtn.classList.add("deleteCardBtn");
  deleteBtn.addEventListener("click", () => card.remove());
  card.appendChild(deleteBtn);

  const input = document.createElement("textarea");
  input.placeholder = "Enter a task";
  input.rows = 2;
  card.appendChild(input);

  enableDrag(card);
  column.insertBefore(card, btn);
  input.focus();

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      input.blur();
      addTask(btn);
    }
    if (e.key === "Escape") card.remove();
  });
}