
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    let taskIdCounter = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    let selectedMainTaskId = null; 
    let selectedSubtaskIndex = null;

    function downloadTasksAsExcel() {
  const rows = [];

  tasks.forEach(task => {
    rows.push({
      "Task ID": task.id,
      "Task Name": task.name,
      "Subtask": "",
      "Status": task.status,
      "Start Date": task.startDate,
      "End Date": task.endDate
    });

    if (task.subtasks && task.subtasks.length > 0) {
      task.subtasks.forEach(sub => {
        rows.push({
          "Task ID": `${task.id}.${sub.id}`,
          "Task Name": "",
          "Subtask": sub.name,
          "Status": sub.status,
          "Start Date": sub.startDate,
          "End Date": sub.endDate
        });
      });
    }
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");

  XLSX.writeFile(workbook, "tasks.xlsx");
}



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
      <td class="py-2 px-4 border-b"></td>
      <td class="py-2 px-4 border-b">${task.status}</td>
      <td class="py-2 px-4 border-b">${task.startDate}</td>
      <td class="py-2 px-4 border-b">${task.endDate}</td>
      <td class="py-2 px-4 border-b">
        <button class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-1" onclick="editTask(${task.id})">Update</button>
        <button class="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded mr-1" onclick="openSubtaskModal(${task.id})">Add Subtask</button>
        <button class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded" onclick="deleteTask(${task.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);

  if (task.subtasks && task.subtasks.length > 0) {
  task.subtasks.forEach((sub, subIndex) => {
    const subRow = document.createElement("tr");
    subRow.classList.add("bg-gray-100");
   subRow.innerHTML = `
  <td class="py-2 px-4 border-b text-sm text-gray-600">${task.id}.${sub.id}</td>
  <td class="py-2 px-4 border-b text-sm text-gray-600"></td>
  <td class="py-2 px-4 border-b text-sm text-gray-600">↳ ${sub.name}</td>
  <td class="py-2 px-4 border-b text-sm text-gray-600">${sub.status}</td>
  <td class="py-2 px-4 border-b text-sm text-gray-600">${sub.startDate}</td>
  <td class="py-2 px-4 border-b text-sm text-gray-600">${sub.endDate}</td>
  <td class="py-2 px-4 border-b text-sm text-gray-600">
    <button onclick="editSubtask(${task.id}, ${subIndex})" class="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded mr-1">Update</button>
    <button onclick="deleteSubtask(${task.id}, ${subIndex})" class="bg-red-500 hover:bg-red-400 text-white px-2 py-1 rounded">Delete</button>
  </td>
`;

    tbody.appendChild(subRow);
  });
}
  
  });
}

function openSubtaskModal(taskId) {
  selectedMainTaskId = taskId;
  document.getElementById("subtaskModal").classList.remove("hidden");
}

function closeSubtaskModal() {
  selectedMainTaskId = null;
  document.getElementById("subtaskModal").classList.add("hidden");
  document.getElementById("subtaskName").value = "";
  document.getElementById("subtaskStatus").value = "Pending";
  document.getElementById("subtaskStartDate").value = "";
  document.getElementById("subtaskEndDate").value = "";
  selectedSubtaskIndex = null;
document.getElementById("subtaskSubmitBtn").innerText = "Add Subtask";

}

function submitSubtask() {
  const name = document.getElementById("subtaskName").value.trim();
  const status = document.getElementById("subtaskStatus").value;
  const startDate = document.getElementById("subtaskStartDate").value;
  const endDate = document.getElementById("subtaskEndDate").value;

  if (!name || !startDate || !endDate) {
    alert("All fields are required for the subtask.");
    return;
  }

  if (new Date(endDate) < new Date(startDate)) {
    alert("Subtask end date cannot be before start date.");
    return;
  }

  const mainTask = tasks.find(t => t.id === selectedMainTaskId);
  if (!mainTask.subtasks) mainTask.subtasks = [];

  const subtaskData = {
    id: selectedSubtaskIndex !== null ? mainTask.subtasks[selectedSubtaskIndex].id : 
         (mainTask.subtasks.length ? Math.max(...mainTask.subtasks.map(s => s.id)) + 1 : 1),
    name,
    status,
    startDate,
    endDate
  };

  if (selectedSubtaskIndex !== null) {
    // Update existing
    mainTask.subtasks[selectedSubtaskIndex] = subtaskData;
  } else {
    // Add new
    mainTask.subtasks.push(subtaskData);
  }

  saveTasks();
  renderTasks();
  closeSubtaskModal();
  
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
    status,
    startDate,
    endDate,
    subtasks: [] // ✅ Always initialize
  };

  // ✅ Add subtask if provided
  if (subtask) {
    task.subtasks.push({
      id: 1,
      name: subtask,
      status,
      startDate,
      endDate
    });
  }

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
  // document.getElementById("editSubtask").value = task.subtasks && task.subtasks.length > 0 ? task.subtasks[0].name : '';
  document.getElementById("editStatus").value = task.status;
  document.getElementById("editStartDate").value = task.startDate;
  document.getElementById("editEndDate").value = task.endDate;

  openEditModal();
}

   function editSubtask(taskId, subIndex) {
  const task = tasks.find(t => t.id === taskId);
  if (!task || !task.subtasks || !task.subtasks[subIndex]) return;

  const subtask = task.subtasks[subIndex];

  document.getElementById("editSubtaskTaskId").value = taskId;
  document.getElementById("editSubtaskIndex").value = subIndex;
  document.getElementById("editSubtaskName").value = subtask.name;
  document.getElementById("editSubtaskStatus").value = subtask.status;
  document.getElementById("editSubtaskStartDate").value = subtask.startDate;
  document.getElementById("editSubtaskEndDate").value = subtask.endDate;

  document.getElementById("editSubtaskModal").classList.remove("hidden");
}

 function submitEditTask() {
  const id = parseInt(document.getElementById("editTaskId").value);
  const name = document.getElementById("editTaskName").value.trim();
  const status = document.getElementById("editStatus").value;
  const startDate = document.getElementById("editStartDate").value;
  const endDate = document.getElementById("editEndDate").value;

  if (!name || !startDate || !endDate) {
    alert("Task Name, Start Date, and End Date are required.");
    return;
  }

  if (new Date(endDate) < new Date(startDate)) {
    alert("End Date cannot be before Start Date.");
    return;
  }

  const task = tasks.find(t => t.id === id);
  if (!task) return;

  task.name = name;
  task.status = status;
  task.startDate = startDate;
  task.endDate = endDate;

  saveTasks();
  closeEditModal();
  renderTasks();
}

function submitEditSubtask() {
  const taskId = parseInt(document.getElementById("editSubtaskTaskId").value);
  const subIndex = parseInt(document.getElementById("editSubtaskIndex").value);
  const name = document.getElementById("editSubtaskName").value.trim();
  const status = document.getElementById("editSubtaskStatus").value;
  const startDate = document.getElementById("editSubtaskStartDate").value;
  const endDate = document.getElementById("editSubtaskEndDate").value;

  if (!name || !startDate || !endDate) {
    alert("All fields are required for the subtask.");
    return;
  }

  if (new Date(endDate) < new Date(startDate)) {
    alert("Subtask end date cannot be before start date.");
    return;
  }

  const task = tasks.find(t => t.id === taskId);
  if (!task || !task.subtasks || !task.subtasks[subIndex]) return;

  task.subtasks[subIndex] = {
    ...task.subtasks[subIndex],
    name,
    status,
    startDate,
    endDate
  };

  saveTasks();
  closeEditSubtaskModal();
  renderTasks();
}
function closeEditSubtaskModal() {
  document.getElementById("editSubtaskModal").classList.add("hidden");
  document.getElementById("editSubtaskTaskId").value = "";
  document.getElementById("editSubtaskIndex").value = "";
  document.getElementById("editSubtaskName").value = "";
  document.getElementById("editSubtaskStatus").value = "Pending";
  document.getElementById("editSubtaskStartDate").value = "";
  document.getElementById("editSubtaskEndDate").value = "";
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
function deleteSubtask(taskId, subtaskIndex) {
  const task = tasks.find(t => t.id === taskId);
  if (!task || !task.subtasks) return;

  task.subtasks.splice(subtaskIndex, 1);
  saveTasks();
  renderTasks();
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
