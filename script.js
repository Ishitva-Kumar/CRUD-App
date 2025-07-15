let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let taskIdCounter = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

    function saveTasks() {
      localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function openModal() {
      document.getElementById("taskModal").classList.remove("hidden");
    }

    function closeModal() {
      document.getElementById("taskModal").classList.add("hidden");
      document.getElementById("modalTaskName").value = "";
      document.getElementById("modalSubtask").value = "";
      document.getElementById("modalStatus").value = "Pending";
      document.getElementById("modalStartDate").value = "";
      document.getElementById("modalEndDate").value = "";
    }

    function renderTasks() {
      const tbody = document.getElementById("taskTableBody");
      const search = document.getElementById("searchBox").value.toLowerCase();
      const field = document.getElementById("searchField").value;
      tbody.innerHTML = "";

      tasks.filter(task => String(task[field]).toLowerCase().includes(search)).forEach(task => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td class="py-2 px-4 border-b">${task.id}</td>
          <td class="py-2 px-4 border-b">${task.name}</td>
          <td class="py-2 px-4 border-b">${task.subtask}</td>
          <td class="py-2 px-4 border-b">${task.status}</td>
          <td class="py-2 px-4 border-b">${task.startDate}</td>
          <td class="py-2 px-4 border-b">${task.endDate}</td>
          <td class="py-2 px-4 border-b">
            <button class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-2" onclick="editTask(${task.id})">Update</button>
            <button class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded" onclick="deleteTask(${task.id})">Delete</button>
          </td>
        `;
        tbody.appendChild(row);
      });
    }

    function submitModalTask() {
      const name = document.getElementById("modalTaskName").value.trim();
      const subtask = document.getElementById("modalSubtask").value.trim();
      const status = document.getElementById("modalStatus").value;
      const startDate = document.getElementById("modalStartDate").value;
      const endDate = document.getElementById("modalEndDate").value;

      if (!name || !startDate || !endDate) {
        alert("Task Name, Start Date, and End Date are required.");
        return;
      }
      if (new Date(endDate) < new Date(startDate)) {
        alert("Invalid date: End Date cannot be before Start Date.");
        return;
      }
    

      const task = {
        id: taskIdCounter++,
        name,
        subtask,
        status,
        startDate,
        endDate
      };

      tasks.push(task);
      saveTasks();
      closeModal();
      renderTasks();
    }

    function editTask(id) {
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      document.getElementById("editTaskId").value = task.id;
      document.getElementById("editTaskName").value = task.name;
      document.getElementById("editSubtask").value = task.subtask;
      document.getElementById("editStatus").value = task.status;
      document.getElementById("editStartDate").value = task.startDate;
      document.getElementById("editEndDate").value = task.endDate;

      openEditModal();
    }

    function submitEditTask() {
      const id = parseInt(document.getElementById("editTaskId").value);
      const task = tasks.find(t => t.id === id);
      if (!task) return;

      const startDate = document.getElementById("editStartDate").value;
  const endDate = document.getElementById("editEndDate").value;

  if (new Date(endDate) < new Date(startDate)) {
    alert("Invalid date: End Date cannot be before Start Date.");
    return;
  }

      task.name = document.getElementById("editTaskName").value.trim();
      task.subtask = document.getElementById("editSubtask").value.trim();
      task.status = document.getElementById("editStatus").value;
      task.startDate = startDate;
      task.endDate = endDate;
      saveTasks();
      closeEditModal();
      renderTasks();
    }
    let deleteTaskId = null;

function deleteTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  deleteTaskId = id;
  document.getElementById("deleteMessage").innerText = `Are you sure you want to delete the task "${task.name}"?`;
  openDeleteModal();
}

function confirmDelete() {
  tasks = tasks.filter(t => t.id !== deleteTaskId);
  saveTasks();
  renderTasks();
  closeDeleteModal();
  deleteTaskId = null;
}

function openDeleteModal() {
  document.getElementById("deleteModal").classList.remove("hidden");
}

function closeDeleteModal() {
  document.getElementById("deleteModal").classList.add("hidden");
  deleteTaskId = null;
}


    function openEditModal() {
      document.getElementById("editModal").classList.remove("hidden");
    }

    function closeEditModal() {
      document.getElementById("editModal").classList.add("hidden");
    }

    function downloadTasksAsJSON() {
      const data = JSON.stringify(tasks, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "tasks.json";
      a.click();
      URL.revokeObjectURL(url);
    }

    renderTasks();