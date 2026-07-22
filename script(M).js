const tasksContainer = document.getElementById('tasksContainer');
    const addTaskForm = document.getElementById('addTaskForm');
    const editTaskForm = document.getElementById('editTaskForm');

    // عناصر البحث والتصفية
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const categoryFilter = document.getElementById('categoryFilter');

    // 1. استرجاع التاسكات عند فتح الصفحة
    document.addEventListener('DOMContentLoaded', () => {
        loadTasksFromLocalStorage();
        setupFilterListeners();
    });

    // 2. إعداد مستمعي الأحداث للفلترة والبحث
    function setupFilterListeners() {
        searchInput.addEventListener('input', filterAndRenderTasks);
        statusFilter.addEventListener('change', filterAndRenderTasks);
        priorityFilter.addEventListener('change', filterAndRenderTasks);
        categoryFilter.addEventListener('change', filterAndRenderTasks);
    }

    // 3. دالة الفلترة والتصفية الرئيسية
    function filterAndRenderTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        const searchValue = searchInput.value.toLowerCase().trim();
        const selectedStatus = statusFilter.value;
        const selectedPriority = priorityFilter.value;
        const selectedCategory = categoryFilter.value;

        const filteredTasks = tasks.filter(task => {
            // البحث في العنوان أو الوصف
            const matchesSearch = task.title.toLowerCase().includes(searchValue) || 
                                  (task.desc && task.desc.toLowerCase().includes(searchValue));

            // الفلترة حسب الحالة والأولوية والتصنيف
            const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
            const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority;
            const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;

            return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
        });

        // إعادة عرض التاسكات المفلترة
        renderTasksList(filteredTasks);
    }

    // 4. عرض قائمة المهام المفلترة
    function renderTasksList(tasks) {
        tasksContainer.innerHTML = '';

        if (tasks.length === 0) {
            tasksContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search fs-1 text-muted"></i>
                    <p class="text-muted mt-2 fs-5">No tasks match your filter/search criteria.</p>
                </div>
            `;
            return;
        }

        tasks.forEach(task => renderTaskCard(task));
    }

    // 5. إضافة مهمة جديدة
    addTaskForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const taskData = {
            id: Date.now(),
            title: document.getElementById('taskTitle').value,
            desc: document.getElementById('taskDesc').value,
            priority: document.getElementById('taskPriority').value,
            category: document.getElementById('taskCategory').value,
            date: document.getElementById('taskDate').value,
            status: 'Pending'
        };

        saveTaskToLocalStorage(taskData);
        filterAndRenderTasks(); // تحديث القائمة بعد الإضافة

        addTaskForm.reset();
        const modalElement = document.getElementById('addTaskModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
    });

    // 6. حفظ التعديلات عند تقديم نموذج التعديل
    editTaskForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const id = Number(document.getElementById('editTaskId').value);
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

        const index = tasks.findIndex(task => task.id === id);
        if (index !== -1) {
            tasks[index].title = document.getElementById('editTaskTitle').value;
            tasks[index].desc = document.getElementById('editTaskDesc').value;
            tasks[index].priority = document.getElementById('editTaskPriority').value;
            tasks[index].category = document.getElementById('editTaskCategory').value;
            tasks[index].status = document.getElementById('editTaskStatus').value;
            tasks[index].date = document.getElementById('editTaskDate').value;

            localStorage.setItem('tasks', JSON.stringify(tasks));
            filterAndRenderTasks(); // إعادة عرض المهام المعدلة
        }

        const modalElement = document.getElementById('editTaskModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
    });

    // فتح الـ Modal وتعبئة البيانات للتعديل
    function openEditModal(id) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const task = tasks.find(t => t.id === id);

        if (task) {
            document.getElementById('editTaskId').value = task.id;
            document.getElementById('editTaskTitle').value = task.title;
            document.getElementById('editTaskDesc').value = task.desc;
            document.getElementById('editTaskPriority').value = task.priority;
            document.getElementById('editTaskCategory').value = task.category;
            document.getElementById('editTaskStatus').value = task.status;
            document.getElementById('editTaskDate').value = task.date;

            const editModal = new bootstrap.Modal(document.getElementById('editTaskModal'));
            editModal.show();
        }
    }

    // حفظ التاسك في LocalStorage
    function saveTaskToLocalStorage(task) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // تحميل كل التاسكات
   function loadTasksFromLocalStorage() {
    filterAndRenderTasks();
    }


    // بناء كارت المهمة
    function renderTaskCard(task) {
        const dateObj = new Date(task.date);
        const formattedDate = isNaN(dateObj) ? task.date : dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

        let badgeColor = 'bg-secondary';
        if (task.priority === 'High') badgeColor = 'bg-danger';
        if (task.priority === 'Medium') badgeColor = 'bg-warning text-dark';
        if (task.priority === 'Low') badgeColor = 'bg-info text-dark';

        const cardHTML = `
            <div class="col-lg-4 col-md-6" id="task-${task.id}">
                <div class="card task-card h-100 shadow-sm">
                    <div class="card-body d-flex flex-column justify-content-between">
                        <div>
                            <div class="d-flex justify-content-between align-items-center">
                                <h5 class="card-title mb-0">${task.title}</h5>
                                <span class="badge ${badgeColor}">${task.priority}</span>
                            </div>
                            <p class="text-muted mt-3">${task.desc || ''}</p>
                        </div>
                        <div>
                            <hr>
                            <div class="d-flex justify-content-between small text-muted mb-2">
                                <span><i class="bi bi-folder me-1"></i> ${task.category}</span>
                                <span><i class="bi bi-calendar me-1"></i> ${formattedDate}</span>
                            </div>
                            <div>
                                <span class="badge bg-secondary">${task.status}</span>
                            </div>
                            <div class="mt-3 d-flex gap-2">
                                <button class="btn btn-outline-primary btn-sm flex-fill" aria-label="Edit Task" onclick="openEditModal(${task.id})">
                                    <i class="bi bi-pencil"></i>
                                </button>
                                <button class="btn btn-outline-success btn-sm flex-fill" aria-label="Complete Task" onclick="toggleComplete(${task.id})">
                                    <i class="bi bi-check2"></i>
                                </button>
                                <button class="btn btn-outline-danger btn-sm flex-fill" aria-label="Delete Task" onclick="deleteTask(${task.id})">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        tasksContainer.insertAdjacentHTML('beforeend', cardHTML);
    }

    // مسح التاسك
    function deleteTask(id) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter(task => task.id !== id);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        filterAndRenderTasks();
    }

    // تبديل حالة الإنجاز
    function toggleComplete(id) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.status = task.status === 'Completed' ? 'Pending' : 'Completed';
            localStorage.setItem('tasks', JSON.stringify(tasks));
            filterAndRenderTasks();
        }
    }