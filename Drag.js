export let dragged = null;
export let draggedColumn = null;

export function setDragged(val) { dragged = val; }
export function setDraggedColumn(val) { draggedColumn = val; }

export function enableDrag(card) {
  card.draggable = true;

  card.addEventListener("dragstart", () => {
    dragged = card;
    setTimeout(() => card.classList.add("dragging"), 0);
  });

  card.addEventListener("dragend", () => {
    card.classList.remove("dragging");
    dragged = null;
    document.querySelectorAll(".toDo, .inProgress, .done, .buildedColumn")
      .forEach(col => col.classList.remove("drag-over"));
  });
}

export function enableColumnDrop(col) {
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

export function enableColumnDrag(col) {
  col.draggable = true;

  col.addEventListener("dragstart", e => {
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