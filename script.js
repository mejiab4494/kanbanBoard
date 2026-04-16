// Use a live-updating selector helper instead of a static NodeList
function getColumns() {
  return document.querySelectorAll(".toDo, .inProgress, .done, .buildedColumn");
}

document.querySelectorAll(".addTaskButton").forEach(btn => {
  btn.addEventListener("click", () => addTask(btn));
});

const newColumnBtn = document.querySelector(".newColumn");
newColumnBtn.addEventListener("click", addColumn);

let dragged = null;

function addColumn() {
  const board = document.querySelector(".kanban-board");
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
    if (e.key === "Enter") titleInput.blur();
    if (e.key === "Escape") titleInput.blur();
  });

  titleInput.addEventListener("blur", () => {
    const h1 = document.createElement("h1");
    h1.textContent = titleInput.value || "Untitled";
    h1.classList.add("columnTitle");
    column.insertBefore(h1, titleInput);
    titleInput.remove();

    // ✅ h1 exists here, so the listener can reference it
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
  titleInput.focus();
}

function addTask(btn) {
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

function enableDrag(card) {
  card.draggable = true;

  card.addEventListener("dragstart", () => {
    dragged = card;
    setTimeout(() => card.classList.add("dragging"), 0);
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
    dragged = null;
    getColumns().forEach(col => col.classList.remove("drag-over"));
  });
}

function enableColumnDrop(col) {
  col.addEventListener("dragover", e => {
    e.preventDefault();
    col.classList.add("drag-over");
  });

  col.addEventListener("dragleave", e => {
    if (!col.contains(e.relatedTarget)) col.classList.remove("drag-over");
  });

  col.addEventListener("drop", e => {
    e.preventDefault();
    col.classList.remove("drag-over");
    const btn = col.querySelector(".addTaskButton");
    if (dragged) col.insertBefore(dragged, btn);
  });
}

// Attach drag-drop to the initial 3 columns
getColumns().forEach(enableColumnDrop);