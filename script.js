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
let draggedColumn = null;

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
  enableColumnDrag(column);
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

// enable entire column to be drag
function enableColumnDrag(col) {
  // Find the handle (the h1 title) or the column itself
  const handle = col.querySelector("h1") || col;
  col.draggable = true;

  col.addEventListener("dragstart", e => {
    // Prevent card dragstart from firing when dragging a column
    e.stopPropagation();
    draggedColumn = col;
    setTimeout(() => col.classList.add("dragging-column"), 0);
  });

  col.addEventListener("dragend", () => {
    col.classList.remove("dragging-column");
    draggedColumn = null;
    document.querySelectorAll(".kanban-board")
      .forEach(b => b.classList.remove("drag-over"));
  });
}

function enableBoardDrop() {
  const board = document.querySelector(".kanban-board");

  board.addEventListener("dragover", e => {
    e.preventDefault();
    if (!draggedColumn) return;

    // Find which column the cursor is closest to
    const siblings = [...board.querySelectorAll(
      ".toDo, .inProgress, .done, .buildedColumn"
    )].filter(col => col !== draggedColumn);

    const nearest = siblings.reduce((closest, col) => {
      const box = col.getBoundingClientRect();
      const offset = e.clientX - (box.left + box.width / 2);
      // Only consider columns to the right of cursor
      if (offset < 0 && offset > closest.offset) {
        return { offset, element: col };
      }
      return closest;
    }, { offset: -Infinity, element: null });

    if (nearest.element) {
      board.insertBefore(draggedColumn, nearest.element);
    } else {
      // No column to the right — move to end (before the + button)
      board.insertBefore(draggedColumn, newColumnBtn);
    }
  });
}

enableBoardDrop(); 



getColumns().forEach(col => {
  enableColumnDrop(col);
  enableColumnDrag(col);  
});

function saveBoard() {
  const data = [];
  getColumns().forEach(col => {
    const isBuilt = col.classList.contains("buildedColumn");
    const title = col.querySelector("h1")?.textContent
      || col.querySelector(".columnTitleInput")?.value
      || (col.classList.contains("toDo") ? "To Do"
        : col.classList.contains("inProgress") ? "In Progress"
        : "Done");

    const cards = [...col.querySelectorAll(".card")].map(card =>
      card.querySelector("textarea")?.value || ""
    );

    data.push({ title, cards, isBuilt });
  });

  localStorage.setItem("kanban", JSON.stringify(data));
}

function loadBoard() {
  const saved = localStorage.getItem("kanban");
  if (!saved) return;

  const board = document.querySelector(".kanban-board");
  const parsed = JSON.parse(saved);

  // Clear existing columns (but keep the + button)
  getColumns().forEach(col => col.remove());

  parsed.forEach(({ title, cards, isBuilt }) => {
    let column;

    if (isBuilt) {
      // Recreate dynamic columns via addColumn logic
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

      // clicking title lets you rename
      h1.addEventListener("click", () => {
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.value = h1.textContent;
        titleInput.classList.add("columnTitleInput");

        titleInput.addEventListener("keydown", e => {
          if (e.key === "Enter" || e.key === "Escape") titleInput.blur();
        });

        titleInput.addEventListener("blur", () => {
          h1.textContent = titleInput.value || "Untitled";
          titleInput.replaceWith(h1);
          h1.addEventListener("click", arguments.callee); // reattach
        });

        h1.replaceWith(titleInput);
        titleInput.focus();
      });

      const addBtn = document.createElement("button");
      addBtn.textContent = "+ Add card";
      addBtn.classList.add("addTaskButton");
      addBtn.addEventListener("click", () => addTask(addBtn));
      column.appendChild(addBtn);

      board.insertBefore(column, newColumnBtn);
      enableColumnDrop(column);
      enableColumnDrag(column);

    }  else {
  // Recreate static columns in the right order
  column = document.createElement("div");
  column.classList.add(
    title === "TO DO" ? "toDo"
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

  board.insertBefore(column, newColumnBtn);
  enableColumnDrop(column);
  enableColumnDrag(column);
}

    // Restore cards into the column
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
      textarea.rows = 2;
      card.appendChild(textarea);

      enableDrag(card);
      column.insertBefore(card, addBtn);
    });
  });
}

// Auto-save on any board change
let saveTimer;
const debouncedSave = () => {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveBoard, 500);
};

const observer = new MutationObserver(debouncedSave);
observer.observe(document.querySelector(".kanban-board"), {
  childList: true,
  subtree: true,
  characterData: true,
});

// Boot
observer.disconnect();   // pause before rebuilding
loadBoard();
observer.observe(document.querySelector(".kanban-board"), {  // resume after
  childList: true,
  subtree: true,
  characterData: true,
});

// reset 
const resetBtn = document.querySelector(".resetBtn");
resetBtn.addEventListener("click", () => {
  const confirmed = confirm("Reset the board? This will delete everything.");
  if (!confirmed) return;

  // Clear storage
  localStorage.removeItem("kanban");

  // Pause observer so it doesn't save mid-reset
  observer.disconnect();

  // Remove all columns
  getColumns().forEach(col => col.remove());

  // Rebuild the 3 default columns
  const board = document.querySelector(".kanban-board");
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

  // Resume observer
  observer.observe(document.querySelector(".kanban-board"), {
    childList: true,
    subtree: true,
    characterData: true,
  });
});