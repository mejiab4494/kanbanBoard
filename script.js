const columns = document.querySelectorAll(".toDo, .inProgress, .done")


// Select ALL three buttons, not just the first
document.querySelectorAll(".addTaskButton").forEach(btn => {
  btn.addEventListener("click", () => addTask(btn));
});


let dragged = null;

function addTask(btn) {
  // Walk up from the clicked button to its parent column
  const column = btn.closest(".toDo, .inProgress, .done");

  const card = document.createElement("div");
  card.classList.add("card");

  // Use a textarea so the user can type the task
  const input = document.createElement("textarea");
  input.placeholder = "Enter a task";
  card.appendChild(input);

  enableDrag(card);

  // Insert before the button, not after it
  column.insertBefore(card, btn);
  input.focus();

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        e.preventDefault();
        input.blur();        // save current card
        addTask(btn);        // immediately open a new one
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
    columns.forEach(col => col.classList.remove("drag-over"));
  });
}

columns.forEach(col => {
  col.addEventListener("dragover", e => {
    e.preventDefault();           // required to allow dropping
    col.classList.add("drag-over");
  });

  col.addEventListener("dragleave", e => {
    if (!col.contains(e.relatedTarget)) col.classList.remove("drag-over");
  });

  col.addEventListener("drop", e => {
    e.preventDefault();
    col.classList.remove("drag-over");
    const btn = col.querySelector(".addTaskButton");
    if (dragged) col.insertBefore(dragged, btn); // keep button at the bottom
  });
});