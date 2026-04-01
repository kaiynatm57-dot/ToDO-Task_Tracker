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

            <!-- List (optional) -->
            <input type="text" id="taskList" placeholder="List (optional)">

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

    // Keep original indexes so actions map back to upcomingTasks correctly
    const todayTasks = upcomingTasks
        .map((task, i) => ({ ...task, originalIndex: i }))
        .filter(task => task.date === today);

    if (todayTasks.length === 0) {
        container.innerHTML = `<p class="empty-message">No tasks for today</p>`;
        return;
    }

    container.innerHTML = "";

    todayTasks.forEach((task) => {
        container.innerHTML += `
            <div class="today-task ${task.status === "done" ? "completed" : ""}">
                <div class="task-left">
                    <input type="checkbox" 
                        ${task.status === "done" ? "checked" : ""} 
                        onchange="toggleStatus(${task.originalIndex})">

                    <div>
                        <strong>${task.text}</strong>
                        <div class="task-meta">${task.category} | ${task.list} • Status: ${task.status}</div>
                    </div>
                </div>

                <button onclick="deleteTask(${task.originalIndex})">&#128465;</button>
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
//calendar page  
document.addEventListener("click", function(e) {
    if (e.target.closest("#calendarMenuItem")) {
        loadCalendarPage();
    }
});
//Create Calendar UI
let currentDate = new Date();

function loadCalendarPage() {
    const content = document.getElementById("contentPanel");

    content.innerHTML = `
        <div class="calendar-header">
            <button id="prevMonth">&#9664;</button>
            <h2 id="monthYear"></h2>
            <button id="nextMonth">&#9654;</button>
        </div>

        <div class="calendar-grid" id="calendarGrid"></div>
    `;

    renderCalendar();
}
//Render Calendar
function renderCalendar() {
    const grid = document.getElementById("calendarGrid");
    const monthYear = document.getElementById("monthYear");

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    monthYear.innerText = currentDate.toLocaleString("default", {
        month: "long",
        year: "numeric"
    });

    grid.innerHTML = "";

    // Empty spaces before first day
    for (let i = 0; i < firstDay; i++) {
        grid.innerHTML += `<div></div>`;
    }

    // Days
    for (let day = 1; day <= totalDays; day++) {
        const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;

        // Check if task exists
        const hasTask = upcomingTasks.some(t => t.date === dateStr);

        grid.innerHTML += `
            <div class="day" onclick="showTasksByDate('${dateStr}')">
                ${day}
                ${hasTask ? '<div class="dot"></div>' : ''}
            </div>
        `;
    }
}
//Month Navigation
document.addEventListener("click", function(e) {
    if (e.target.id === "prevMonth") {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    }

    if (e.target.id === "nextMonth") {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    }
});
//Show Tasks on Date Click
function showTasksByDate(date) {
    const content = document.getElementById("contentPanel");

    const tasks = upcomingTasks.filter(t => t.date === date);

    content.innerHTML = `
        <h2>Tasks on ${date}</h2>
        ${tasks.length === 0 ? "<p>No tasks</p>" : ""}
        ${tasks.map(t => `
            <div class="task">
                <strong>${t.text}</strong><br>
                <small>${t.category} | ${t.list}</small>
            </div>
        `).join("")}
    `;
}
//sticky walls
function loadStickyWall() {
    const content = document.getElementById("contentPanel");

    content.innerHTML = `
        <div class="sticky-header">
            <h2> Sticky Wall</h2>
            <button id="addNoteBtn">+ Add Note</button>
        </div>

        <div id="stickyWall"></div>
    `;
    renderNotes();
    setupStickyDrag();
}
//sticky wall on click
document.addEventListener("click", function(e) {
    if (e.target.closest("#stickyWallMenuItem")) {
        loadStickyWall();
    }
});
//render function for sticky wall
let notes = JSON.parse(localStorage.getItem("notes")) || [];

function renderNotes() {
    const wall = document.getElementById("stickyWall");

    if (!wall) return;

    wall.innerHTML = "";

    notes.forEach((note, index) => {
        wall.innerHTML += `
            <div class="note" draggable="true" data-index="${index}">
                <textarea onchange="updateNote(${index}, this.value)">${note.text || ""}</textarea>

                <div class="note-footer">
                    <span>${note.category}</span>
                    <button onclick="deleteNote(${index})">&#128465;</button>
                </div>
            </div>
        `;
    });
}
// Drag-and-drop reordering for sticky notes
let dragSrcIndex = null;
function setupStickyDrag() {
    const wall = document.getElementById('stickyWall');
    if (!wall) return;

    wall.addEventListener('dragstart', (e) => {
        const note = e.target.closest('.note');
        if (!note) return;
        dragSrcIndex = Number(note.dataset.index);
        e.dataTransfer.setData('text/plain', '');
        e.dataTransfer.effectAllowed = 'move';
    });

    wall.addEventListener('dragover', (e) => {
        e.preventDefault();
        const note = e.target.closest('.note');
        if (!note) return;
        note.classList.add('drag-over');
    });

    wall.addEventListener('dragleave', (e) => {
        const note = e.target.closest('.note');
        if (!note) return;
        note.classList.remove('drag-over');
    });

    wall.addEventListener('drop', (e) => {
        e.preventDefault();
        const note = e.target.closest('.note');
        if (!note) return;
        note.classList.remove('drag-over');

        const destIndex = Number(note.dataset.index);
        if (dragSrcIndex === null || destIndex === dragSrcIndex) return;

        const [moved] = notes.splice(dragSrcIndex, 1);
        notes.splice(destIndex, 0, moved);

        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
        dragSrcIndex = null;
    });
}
//Add new note
document.addEventListener("click", function(e) {
    if (e.target.id === "addNoteBtn") {

        notes.push({
            text: "",
            category: "Personal"
        });

        localStorage.setItem("notes", JSON.stringify(notes));
        renderNotes();
    }
});
//Update & Delete
function updateNote(index, value) {
    notes[index].text = value;
    localStorage.setItem("notes", JSON.stringify(notes));
}

function deleteNote(index) {
    notes.splice(index, 1);
    localStorage.setItem("notes", JSON.stringify(notes));
    renderNotes();
}
// Load List Tasks Page
function loadListTasks(listName) {
    const content = document.getElementById("contentPanel");

    content.innerHTML = `
        <div class="page-header">
            <h2>${listName} Tasks</h2>
        </div>

        <div class="task-input-box">
            <input type="text" id="listTaskText" placeholder="Enter task...">
            <input type="date" id="listTaskDate">

            <!-- Category -->
            <select id="listTaskCategory">
                <option value="Personal">Personal</option>
                <option value="Work">Work</option>
            </select>

            <button id="addListTaskBtn" data-list="${listName}">Add to ${listName}</button>
        </div>

        <div id="listTaskContainer"></div>
    `;

    renderListTasks(listName);
}

// Render Tasks
function renderListTasks(listName) {
    const container = document.getElementById("listTaskContainer");

    const filtered = upcomingTasks
        .map((task, i) => ({ ...task, originalIndex: i }))
        .filter(task => task.list === listName || task.category === listName);

    if (filtered.length === 0) {
        container.innerHTML = `<p class="empty-message">No tasks in ${listName}</p>`;
        return;
    }

    container.innerHTML = "";

    filtered.forEach(task => {
        container.innerHTML += `
            <div class="task">
                <div>
                    <strong>${task.text}</strong><br>
                    <small>${task.category} | ${task.date}</small>
                </div>

                <button onclick="deleteTask(${task.originalIndex})">&#128465;</button>
            </div>
        `;
    });
}

// Sidebar list wiring and Add List behavior
document.addEventListener("click", function(e) {
    if (e.target.closest("#personalList")) {
        loadListTasks('Personal');
    }

    if (e.target.closest("#workList")) {
        loadListTasks('Work');
    }

    if (e.target.closest("#addListBtn")) {
        const addBtn = e.target.closest('#addListBtn');
        const box = document.getElementById('listInputBox');
        const lists = document.getElementById('listsContainer');
        if (!box || !lists || !addBtn) return;

        const isOpen = addBtn.classList.toggle('open');
        box.style.display = isOpen ? 'block' : 'none';
        lists.style.display = isOpen ? 'flex' : 'none';

        // Adjust sidebar layout when lists dropdown is open
        const menuEl = document.getElementById('menu');
        if (menuEl) menuEl.classList.toggle('lists-open', isOpen);

        const input = document.getElementById('newListInput');
        if (isOpen && input) input.focus();
    }
});

// Sidebar search: filter menu items and custom lists
document.addEventListener('input', function(e) {
    if (!e.target || e.target.id !== 'sidebarSearch') return;

    const q = e.target.value.trim().toLowerCase();

    const menuItems = document.querySelectorAll('#menu > .menu-item');
    const customListItems = document.querySelectorAll('#listsContainer .custom-list');
    let matchCount = 0;

    // Show/hide main menu items (Upcoming, Today, Calendar, Sticky wall, Personal, Work, Add List, etc.)
    menuItems.forEach(mi => {
        // For menu-item that contains buttons, use innerText
        const text = (mi.innerText || '').toLowerCase();
        if (!q || text.includes(q)) {
            mi.style.display = 'flex';
            matchCount++;
        } else {
            mi.style.display = 'none';
        }
    });

    // Ensure lists container is visible while searching so list matches show
    const listsContainer = document.getElementById('listsContainer');
    const addListBtn = document.getElementById('addListBtn');
    if (listsContainer) {
        if (q) listsContainer.style.display = 'flex';
        else if (addListBtn && !addListBtn.classList.contains('open')) listsContainer.style.display = 'none';
    }

    // Show/hide custom lists
    customListItems.forEach(li => {
        const btn = li.querySelector('.menu-btn');
        const text = (btn ? btn.innerText : li.innerText).toLowerCase();
        if (!q || text.includes(q)) {
            li.style.display = 'flex';
            matchCount++;
        } else {
            li.style.display = 'none';
        }
    });

    const noEl = document.getElementById('searchNoResults');
    if (noEl) noEl.style.display = (q && matchCount === 0) ? 'block' : 'none';
});

// Custom lists persistence
let customLists = JSON.parse(localStorage.getItem('customLists')) || [];
if (!Array.isArray(customLists)) customLists = [];
// Keep persisted custom lists sorted alphabetically (case-insensitive)
customLists.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

function renderCustomLists() {
    const container = document.getElementById('listsContainer');
    if (!container) return;

    container.innerHTML = '';

    customLists.forEach((name) => {
        const safe = name.replace(/"/g, '&quot;');
        container.innerHTML += `
            <div class="custom-list" data-list="${safe}">
                <span class="list-dot"></span>
                <button class="menu-btn custom-list-view" data-list="${safe}">${name}</button>

                <div class="list-actions">
                    <button class="list-view-btn" data-list="${safe}" title="View">👁</button>
                    <button class="list-delete-btn" data-list="${safe}" title="Delete">🗑</button>
                </div>
            </div>
        `;
    });
}

// Delegate clicks for custom lists: view and delete actions
document.addEventListener('click', function(e) {
    const delBtn = e.target.closest('.list-delete-btn');
    if (delBtn) {
        const name = delBtn.dataset.list;
        if (!name) return;
        const confirmMsg = `Delete list "${name}"? This will not remove existing tasks.`;
        if (!confirm(confirmMsg)) return;

        customLists = customLists.filter(n => n !== name);
        localStorage.setItem('customLists', JSON.stringify(customLists));
        renderCustomLists();
        return;
    }

    const viewBtn = e.target.closest('.list-view-btn') || e.target.closest('.custom-list-view') || e.target.closest('.custom-list .menu-btn');
    if (viewBtn) {
        const name = viewBtn.dataset.list || (viewBtn.closest('.custom-list') && viewBtn.closest('.custom-list').dataset.list);
        if (!name) return;
        loadListTasks(name);
        // close the Add List dropdown if open
        const addBtnEl = document.getElementById('addListBtn');
        const boxEl = document.getElementById('listInputBox');
        const listsEl = document.getElementById('listsContainer');
        if (addBtnEl && addBtnEl.classList.contains('open')) {
            addBtnEl.classList.remove('open');
            if (boxEl) boxEl.style.display = 'none';
            if (listsEl) listsEl.style.display = 'none';
                // remove lists-open class to restore tags spacing
                const menuEl2 = document.getElementById('menu');
                if (menuEl2) menuEl2.classList.remove('lists-open');
        }
    }
});

// Create new list from input (Enter)
document.addEventListener('keypress', function(e) {
    if (e.target && e.target.id === 'newListInput' && e.key === 'Enter') {
        const name = e.target.value.trim();
        if (!name) return;
        if (!customLists.includes(name)) {
            customLists.push(name);
            // dedupe and sort alphabetically
            customLists = Array.from(new Set(customLists));
            customLists.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
            localStorage.setItem('customLists', JSON.stringify(customLists));
            renderCustomLists();
        }
        e.target.value = '';
        const box = document.getElementById('listInputBox');
        const lists = document.getElementById('listsContainer');
        const addBtn = document.getElementById('addListBtn');
        if (box) box.style.display = 'none';
        if (lists) lists.style.display = 'none';
        if (addBtn) addBtn.classList.remove('open');
    }
});

// Add task directly into a custom list (from list page)
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'addListTaskBtn') {
        const listName = e.target.dataset.list;
        const textEl = document.getElementById('listTaskText');
        const dateEl = document.getElementById('listTaskDate');
        const categoryEl = document.getElementById('listTaskCategory');

        if (!textEl || !dateEl) return;

        const text = textEl.value.trim();
        const date = dateEl.value;
        const category = categoryEl ? categoryEl.value : 'Personal';

        if (!text || !date) {
            alert('Enter task and date');
            return;
        }

        upcomingTasks.push({
            text,
            date,
            category,
            list: listName,
            subtasks: [],
            status: 'pending',
            completedAt: null
        });

        localStorage.setItem('upcomingTasks', JSON.stringify(upcomingTasks));

        // clear inputs and re-render
        textEl.value = '';
        dateEl.value = '';
        renderListTasks(listName);
    }
});

// Render persisted custom lists on startup
renderCustomLists();