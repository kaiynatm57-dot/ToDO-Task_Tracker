// Load sidebar dynamically
fetch("sidebar.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("sidebar-container").innerHTML = data;
  })
  .catch(error => console.error("Error loading sidebar:", error));
  
// Sidebar Toggle
document.addEventListener("click", function (e) {
    // Check if clicked on menu icon
    if (e.target.closest(".menu-icon")) {
        const menu = document.getElementById("menu");
        menu.classList.toggle("collapsed");
    }
});
function loadUpcomingPage() {
    const content = document.getElementById("contentPanel");

    content.innerHTML = `
        <div class="page-header">
            <h2>Upcoming Tasks</h2>
        </div>

        <div class="task-input-box">
            <input type="text" id="taskText" placeholder="Enter task...">
            <input type="date" id="taskDate">

            <!-- Category -->
            <select id="taskCategory">
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
            </select>

            <!-- List -->
            <select id="taskList">
                <option value="Default">Default</option>
                <option value="Shopping">Shopping</option>
                <option value="Study">Study</option>
            </select>

            <button id="addTaskBtn">Add</button>
        </div>

        <div id="taskContainer"></div>
    `;

    renderUpcomingTasks();
}
//Handle Click (Load Page)
document.addEventListener("click", function(e) {
    if (e.target.closest("#upcomingMenuItem")) {
        loadUpcomingPage();
    }
});
//Store Tasks (with dates)
let upcomingTasks = JSON.parse(localStorage.getItem("upcomingTasks")) || [];
//Add Task with Category + List + Subtasks
document.addEventListener("click", function(e) {
    if (e.target.id === "addTaskBtn") {

        const text = document.getElementById("taskText").value;
        const date = document.getElementById("taskDate").value;
        const category = document.getElementById("taskCategory").value;
        const list = document.getElementById("taskList").value;

        if (!text || !date) {
            alert("Enter task and date");
            return;
        }

       upcomingTasks.push({
        text,
        date,
       category,
        list,
       subtasks: [],
       status: "pending",
       completedAt: null
});

        localStorage.setItem("upcomingTasks", JSON.stringify(upcomingTasks));

        document.getElementById("taskText").value = "";
        renderUpcomingTasks();
    }
});

   //Render Tasks (with category + list + subtasks)
   function renderUpcomingTasks() {
    const container = document.getElementById("taskContainer");
    if (!container) return;

    container.innerHTML = "";

    const grouped = {};

    upcomingTasks.forEach((task, index) => {
        if (!grouped[task.date]) grouped[task.date] = [];
        grouped[task.date].push({ ...task, index });
    });

    for (let date in grouped) {
        container.innerHTML += `
            <div class="date-group">
                <h3>${date}</h3>

                ${grouped[date].map(task => `
                    <div class="task">
                        <div>
                            <strong>${task.text}</strong><br>
                            <small>${task.category} | ${task.list}</small>
                        </div>

                        <div>
                            <button onclick="deleteTask(${task.index})">&#128465;</button>
                        </div>
                    </div>

                    <!-- Subtasks -->
                    <div class="subtask-box">
                        <input type="text" placeholder="Add subtask..." 
                               onkeypress="addSubtask(event, ${task.index})">

                        ${task.subtasks.map((sub, i) => `
                            <div class="subtask">
                                ${sub}
                                <button onclick="deleteSubtask(${task.index}, ${i})">&#128465;</button>
                            </div>
                        `).join("")}
                    </div>
                `).join("")}
            </div>
        `;
    }
}
// Subtask Functions
function addSubtask(e, taskIndex) {
    if (e.key === "Enter") {
        const value = e.target.value;

        if (!value) return;

        upcomingTasks[taskIndex].subtasks.push(value);

        localStorage.setItem("upcomingTasks", JSON.stringify(upcomingTasks));

        e.target.value = "";
        renderUpcomingTasks();
    }
}

function deleteSubtask(taskIndex, subIndex) {
    upcomingTasks[taskIndex].subtasks.splice(subIndex, 1);
    localStorage.setItem("upcomingTasks", JSON.stringify(upcomingTasks));
    renderUpcomingTasks();
}
//Delete Task
function deleteTask(index) {
    upcomingTasks.splice(index, 1);
    localStorage.setItem("upcomingTasks", JSON.stringify(upcomingTasks));
    renderUpcomingTasks();
}
//Load Today Page UI
function loadTodayPage() {
    const content = document.getElementById("contentPanel");

    content.innerHTML = `
        <div class="page-header">
            <h2>Today</h2>
        </div>

        <div class="today-layout">
            <div class="today-main">
                <!-- main area left (can show calendar or other content) -->
            </div>

            <aside class="today-side">
                <div class="today-card">
                    <h3>Today Tasks</h3>
                    <div id="todayTaskContainer"></div>
                </div>
            </aside>
        </div>
    `;

    renderTodayTasks();
}
//Click Event
document.addEventListener("click", function(e) {
    if (e.target.closest("#todayMenuItem")) {
        loadTodayPage();
    }
});
//Render Today Tasks
function renderTodayTasks() {
    const container = document.getElementById("todayTaskContainer");
    if (!container) return;

    const today = new Date().toISOString().split("T")[0];

    const todayTasks = upcomingTasks.filter(task => task.date === today);

    if (todayTasks.length === 0) {
        container.innerHTML = `<p class="empty-message">No tasks for today</p>`;
        return;
    }

    container.innerHTML = "";

    todayTasks.forEach((task, index) => {
        container.innerHTML += `
            <div class="today-task ${task.status === "done" ? "completed" : ""}">
                <div class="task-left">
                    <input type="checkbox" 
                        ${task.status === "done" ? "checked" : ""} 
                        onchange="toggleStatus(${index})">

                    <div>
                        <strong>${task.text}</strong>
                        <div class="task-meta">${task.category} | ${task.list} • Status: ${task.status}</div>
                    </div>
                </div>

                <button onclick="deleteTask(${index})">&#128465;</button>
            </div>
            ${task.subtasks.length ? `<div class="subtask-box">${task.subtasks.map(sub => `<div class="subtask">${sub}</div>`).join("")}</div>` : ""}
        `;
    });
}
//Toggle Status (Done / Pending)
function toggleStatus(index) {
    if (upcomingTasks[index].status === "pending") {
        upcomingTasks[index].status = "done";
        upcomingTasks[index].completedAt = new Date().toLocaleString();
    } else {
        upcomingTasks[index].status = "pending";
        upcomingTasks[index].completedAt = null;
    }

    localStorage.setItem("upcomingTasks", JSON.stringify(upcomingTasks));
    renderTodayTasks();
}
