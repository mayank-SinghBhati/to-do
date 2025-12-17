document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let tasks = JSON.parse(localStorage.getItem('cleanTasks')) || [];
    let isEditMode = true; // Start in edit mode to add tasks

    // --- DOM Elements ---
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const generateBtn = document.getElementById('generateBtn');
    const editModeBtn = document.getElementById('editModeBtn');
    const themeToggle = document.getElementById('themeToggle');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const inputSection = document.getElementById('inputSection');
    const todoList = document.getElementById('todoList');
    const emptyState = document.getElementById('emptyState');
    const appTitle = document.getElementById('appTitle');

    // --- Init ---
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.replace('light-theme', 'dark-theme');
        themeToggle.textContent = '☀️';
    }
    renderList();
    checkModeUI();

    // --- Event Listeners ---
    addTaskBtn.addEventListener('click', addTask);
    
    // Enter key support
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    generateBtn.addEventListener('click', () => {
        isEditMode = false;
        checkModeUI();
        renderList();
    });

    editModeBtn.addEventListener('click', () => {
        isEditMode = true;
        checkModeUI();
        renderList();
    });

    themeToggle.addEventListener('click', () => {
        const isDark = document.body.classList.toggle('dark-theme');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });

    downloadPdfBtn.addEventListener('click', downloadPDF);

    // --- Core Functions ---

    function addTask() {
        const text = taskInput.value.trim();
        if (text) {
            tasks.push({ id: Date.now(), text: text, completed: false });
            taskInput.value = '';
            taskInput.focus();
            saveAndRender();
        }
    }

    function checkModeUI() {
        if (isEditMode) {
            inputSection.classList.remove('hidden');
            editModeBtn.style.display = 'none';
            appTitle.textContent = "Edit Tasks";
            generateBtn.style.display = 'block';
        } else {
            inputSection.classList.add('hidden');
            editModeBtn.style.display = 'block';
            appTitle.textContent = "My List";
        }
    }

    function saveAndRender() {
        localStorage.setItem('cleanTasks', JSON.stringify(tasks));
        renderList();
    }

    function renderList() {
        todoList.innerHTML = '';
        
        // Toggle Empty State
        if (tasks.length === 0) {
            emptyState.style.display = 'block';
            generateBtn.disabled = true;
            downloadPdfBtn.disabled = true;
        } else {
            emptyState.style.display = 'none';
            generateBtn.disabled = false;
            downloadPdfBtn.disabled = false;
        }

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `todo-item ${task.completed ? 'completed' : ''}`;

            // Checkbox
            const checkbox = `<input type="checkbox" 
                                ${task.completed ? 'checked' : ''} 
                                onchange="toggleTask(${task.id})">`;

            // Content Logic
            let content;
            if (isEditMode) {
                // Inline Edit Input
                content = `<input type="text" class="edit-input-inline" 
                             value="${task.text}" 
                             onchange="renameTask(${task.id}, this.value)">`;
            } else {
                // View Text
                content = `<span>${task.text}</span>`;
            }

            // Delete Button (Only in Edit Mode)
            const deleteBtn = isEditMode 
                ? `<button class="delete-btn" onclick="deleteTask(${task.id})" title="Delete">✕</button>` 
                : '';

            li.innerHTML = `${checkbox} ${content} ${deleteBtn}`;
            todoList.appendChild(li);
        });
    }

    // --- Global Helpers ---
    window.toggleTask = (id) => {
        tasks = tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t);
        saveAndRender();
    };

    window.renameTask = (id, newText) => {
        tasks = tasks.map(t => t.id === id ? {...t, text: newText} : t);
        saveAndRender();
    };

    window.deleteTask = (id) => {
        tasks = tasks.filter(t => t.id !== id);
        saveAndRender();
    };

    function downloadPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("To-Do List", 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22);

        const tableData = tasks.map((t, i) => [
            i + 1,
            t.text,
            t.completed ? "Done" : "Pending"
        ]);

        doc.autoTable({
            head: [['#', 'Task', 'Status']],
            body: tableData,
            startY: 25,
            theme: 'grid',
            headStyles: { fillColor: [108, 92, 231] }
        });

        doc.save("todo-list.pdf");
    }
});
