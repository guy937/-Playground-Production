const store = require("./db");

function nowIso() {
  return new Date().toISOString();
}

function addTask({ title, owner, due_date, notes, created_by }) {
  const s = store.load();
  const task = {
    id: s.nextTaskId,
    title,
    owner: owner || null,
    due_date: due_date || null,
    notes: notes || null,
    status: "open",
    created_by: created_by || null,
    created_at: nowIso(),
    completed_at: null,
  };
  s.nextTaskId += 1;
  s.tasks.push(task);
  store.save(s);
  return task;
}

function getTask(id) {
  const s = store.load();
  return s.tasks.find((t) => t.id === Number(id)) || null;
}

function listOpenTasks() {
  const s = store.load();
  return s.tasks
    .filter((t) => t.status === "open")
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
}

function listAllTasks() {
  const s = store.load();
  return [...s.tasks].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 50);
}

function completeTask(id) {
  const s = store.load();
  const task = s.tasks.find((t) => t.id === Number(id));
  if (!task) return null;
  task.status = "done";
  task.completed_at = nowIso();
  store.save(s);
  return task;
}

// Loose matching by title substring, used when Claude/the user refers to a
// task by name instead of by numeric id ("סמן את המשימה של הצעת המחיר כבוצעה").
function findOpenTaskByTitle(fragment) {
  const s = store.load();
  const needle = fragment.toLowerCase();
  return s.tasks.filter((t) => t.status === "open" && t.title.toLowerCase().includes(needle));
}

module.exports = { addTask, getTask, listOpenTasks, listAllTasks, completeTask, findOpenTaskByTitle };
