document.addEventListener('DOMContentLoaded', () => {
    // 1. تحميل التاسكات وإعداد Drag & Drop والفلترة والبحث
    loadAndRenderTasks();
    initDragAndDrop();
    initFiltersAndSearch();

    // 2. فحص المهام لقرب الموعد (Deadline Tomorrow)
    checkDeadlines();

    // 3. تفعيل Form إضافة تاسك جديدة
    const addTaskForm = document.getElementById('addTaskForm');
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('taskTitle').value.trim();
            const description = document.getElementById('taskDesc').value.trim();
            const priority = document.getElementById('taskPriority').value;
            const category = document.getElementById('taskCategory').value;
            const date = document.getElementById('taskDate').value;

            if (!title || !date) return;

            const newTask = {
                id: Date.now().toString(),
                title: title,
                description: description,
                priority: priority,
                category: category,
                date: date,
                status: 'Pending'
            };

            saveTask(newTask);
            loadAndRenderTasks();

            // إرسال إشعار عند إضافة مهمة جديدة
            addNotification('New Task', `Task "${title}" has been created.`);

            addTaskForm.reset();
            const modalElement = document.getElementById('addTaskModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
        });
    }

    // 4. تفعيل Form تعديل التاسك
    const editTaskForm = document.getElementById('editTaskForm');
    if (editTaskForm) {
        editTaskForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const id = document.getElementById('editTaskId').value;
            const title = document.getElementById('editTaskTitle').value.trim();
            const description = document.getElementById('editTaskDesc').value.trim();
            const priority = document.getElementById('editTaskPriority').value;
            const category = document.getElementById('editTaskCategory').value;
            const status = document.getElementById('editTaskStatus').value;
            const date = document.getElementById('editTaskDate').value;

            let tasks = getTasks();
            let oldStatus = '';

            tasks = tasks.map(t => {
                if (String(t.id) === String(id)) {
                    oldStatus = t.status;
                    return { ...t, title, description, priority, category, status, date };
                }
                return t;
            });

            localStorage.setItem('tasks', JSON.stringify(tasks));
            loadAndRenderTasks();

            // إرسال إشعار إذا تم تحويل المهمة إلى Completed عبر شاشة التعديل
            if (oldStatus !== 'Completed' && status === 'Completed') {
                addNotification('Task Completed', `Task "${title}" marked as completed.`);
            }

            const modalElement = document.getElementById('editTaskModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
        });
    }
});

// === دالة جلب المهام من LocalStorage ===
function getTasks() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

// === دالة جلب وتوزيع التاسكات مع الفلترة والبحث ===
function loadAndRenderTasks() {
    const tasks = getTasks();

    const searchInputValue = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const statusFilterValue = document.getElementById('statusFilter')?.value || 'all';
    const priorityFilterValue = document.getElementById('priorityFilter')?.value || 'all';
    const categoryFilterValue = document.getElementById('categoryFilter')?.value || 'all';

    const pendingZone = document.getElementById('Pending');
    const inProgressZone = document.getElementById('InProgress');
    const completedZone = document.getElementById('Completed');

    if (pendingZone) pendingZone.innerHTML = '';
    if (inProgressZone) inProgressZone.innerHTML = '';
    if (completedZone) completedZone.innerHTML = '';

    let pendingCount = 0;
    let inProgressCount = 0;
    let completedCount = 0;

    tasks.forEach(task => {
        // تطبيق شروط التصفية والبحث
        const matchesSearch = task.title.toLowerCase().includes(searchInputValue) || 
                              (task.description && task.description.toLowerCase().includes(searchInputValue));
        const matchesStatus = statusFilterValue === 'all' || task.status === statusFilterValue;
        const matchesPriority = priorityFilterValue === 'all' || task.priority === priorityFilterValue;
        const matchesCategory = categoryFilterValue === 'all' || task.category === categoryFilterValue;

        if (matchesSearch && matchesStatus && matchesPriority && matchesCategory) {
            const cardElement = createTaskCardElement(task);

            if (task.status === 'Pending' && pendingZone) {
                pendingZone.appendChild(cardElement);
                pendingCount++;
            } else if (task.status === 'In Progress' && inProgressZone) {
                inProgressZone.appendChild(cardElement);
                inProgressCount++;
            } else if (task.status === 'Completed' && completedZone) {
                completedZone.appendChild(cardElement);
                completedCount++;
            }
        }
    });

    if (document.getElementById('countPending')) document.getElementById('countPending').textContent = pendingCount;
    if (document.getElementById('countInProgress')) document.getElementById('countInProgress').textContent = inProgressCount;
    if (document.getElementById('countCompleted')) document.getElementById('countCompleted').textContent = completedCount;
}

// === دالة بناء عنصر كارت التاسك ===
function createTaskCardElement(task) {
    const card = document.createElement('div');
    card.className = 'card border-0 shadow-sm mb-3 task-card';
    card.id = `task-${task.id}`;
    card.setAttribute('draggable', 'true');

    let priorityBadge = 'bg-secondary';
    if (task.priority === 'High') priorityBadge = 'bg-danger';
    if (task.priority === 'Medium') priorityBadge = 'bg-warning text-dark';
    if (task.priority === 'Low') priorityBadge = 'bg-info text-dark';

    card.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="fw-bold m-0 text-truncate" style="max-width: 75%;">${task.title}</h6>
                <div class="d-flex gap-1">
                    <button class="btn btn-sm btn-link text-primary p-0 me-2" onclick="openEditModal('${task.id}')" title="Edit Task">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button class="btn btn-sm btn-link text-danger p-0" onclick="deleteTask('${task.id}')" title="Delete Task">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
            <p class="text-muted small mb-2 text-break">${task.description || 'No description provided.'}</p>
            <div class="d-flex justify-content-between align-items-center">
                <span class="badge ${priorityBadge}">${task.priority}</span>
                <small class="text-muted" style="font-size: 0.75rem;"><i class="bi bi-calendar3 me-1"></i>${task.date}</small>
            </div>
        </div>
    `;

    card.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', task.id);
        card.classList.add('dragging');
    });

    card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
    });

    return card;
}

// === فتح نافذة التعديل وتعبئة بياناتها ===
function openEditModal(taskId) {
    const tasks = getTasks();
    const task = tasks.find(t => String(t.id) === String(taskId));
    if (!task) return;

    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskDesc').value = task.description || '';
    document.getElementById('editTaskPriority').value = task.priority;
    document.getElementById('editTaskCategory').value = task.category;
    document.getElementById('editTaskStatus').value = task.status;
    document.getElementById('editTaskDate').value = task.date;

    const editModal = new bootstrap.Modal(document.getElementById('editTaskModal'));
    editModal.show();
}

// === تفعيل أحداث السحب والإفلات للمناطق ===
function initDragAndDrop() {
    const dropZones = document.querySelectorAll('.drop-zone');

    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');

            const taskId = e.dataTransfer.getData('text/plain');
            const draggedCard = document.getElementById(`task-${taskId}`);
            const newStatus = zone.getAttribute('data-status');

            if (draggedCard && newStatus) {
                zone.appendChild(draggedCard);
                updateTaskStatusInStorage(taskId, newStatus);
            }
        });
    });
}

// === حفظ تاسك جديدة ===
function saveTask(task) {
    const tasks = getTasks();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// === تحديث الحالة عند السحب والإفلات ===
function updateTaskStatusInStorage(taskId, newStatus) {
    let tasks = getTasks();
    let taskTitle = '';

    tasks = tasks.map(t => {
        if (String(t.id) === String(taskId)) {
            taskTitle = t.title;
            t.status = newStatus;
        }
        return t;
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));
    loadAndRenderTasks();

    if (newStatus === 'Completed') {
        addNotification('Task Completed', `Task "${taskTitle}" marked as completed.`);
    }
}

// === دالة حذف تاسك ===
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        let tasks = getTasks();
        tasks = tasks.filter(t => String(t.id) !== String(taskId));
        localStorage.setItem('tasks', JSON.stringify(tasks));
        loadAndRenderTasks();
    }
}

// === تفعيل محركات البحث والتصفية ===
function initFiltersAndSearch() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const categoryFilter = document.getElementById('categoryFilter');

    if (searchInput) searchInput.addEventListener('input', loadAndRenderTasks);
    if (statusFilter) statusFilter.addEventListener('change', loadAndRenderTasks);
    if (priorityFilter) priorityFilter.addEventListener('change', loadAndRenderTasks);
    if (categoryFilter) categoryFilter.addEventListener('change', loadAndRenderTasks);
}

// === إدارة الإشعارات (Notifications) ===

function clearNotifications() {
    const notifBadge = document.getElementById('notifBadge');
    const notifList = document.getElementById('notifList');

    if (notifBadge) {
        notifBadge.textContent = '0';
        notifBadge.classList.add('d-none');
    }

    if (notifList) {
        const header = notifList.querySelector('.dropdown-header');
        const headerLi = header ? header.closest('li') : null;
        notifList.innerHTML = '';
        if (headerLi) notifList.appendChild(headerLi);

        const emptyMsg = document.createElement('li');
        emptyMsg.id = 'emptyNotifMsg';
        emptyMsg.className = 'text-center py-3 text-muted small';
        emptyMsg.textContent = 'No new notifications';
        notifList.appendChild(emptyMsg);
    }
}

function addNotification(type, message) {
    const notifList = document.getElementById('notifList');
    const notifBadge = document.getElementById('notifBadge');

    if (!notifList) return;

    // حذف رسالة "No new notifications" إن وجدت
    const emptyMsg = document.getElementById('emptyNotifMsg');
    if (emptyMsg) emptyMsg.remove();

    // تحديث العداد
    if (notifBadge) {
        let currentCount = parseInt(notifBadge.textContent) || 0;
        currentCount++;
        notifBadge.textContent = currentCount;
        notifBadge.classList.remove('d-none');
    }

    // إعداد أيقونات وألوان الإشعار
    let iconClass = 'bi-bell';
    let bgClass = 'bg-primary';

    if (type === 'New Task') {
        iconClass = 'bi-plus-lg';
        bgClass = 'bg-primary';
    } else if (type === 'Task Completed') {
        iconClass = 'bi-check-lg';
        bgClass = 'bg-success';
    } else if (type === 'Deadline Tomorrow') {
        iconClass = 'bi-exclamation-triangle';
        bgClass = 'bg-warning text-dark';
    }

    const notifItem = document.createElement('li');
    notifItem.innerHTML = `
        <a class="dropdown-item p-2 rounded my-1 d-flex align-items-start gap-2" href="#">
            <div class="${bgClass} text-white rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0" style="width: 32px; height: 32px;">
                <i class="bi ${iconClass}"></i>
            </div>
            <div>
                <div class="fw-bold small">${type}</div>
                <div class="text-muted extra-small" style="font-size: 0.75rem;">${message}</div>
            </div>
        </a>
    `;

    const header = notifList.querySelector('.dropdown-header');
    if (header && header.closest('li')) {
        header.closest('li').after(notifItem);
    } else {
        notifList.appendChild(notifItem);
    }
}

// === فحص المواعيد لإشعار "Deadline Tomorrow" ===
function checkDeadlines() {
    const tasks = getTasks();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach(task => {
        if (task.status !== 'Completed' && task.date) {
            const taskDate = new Date(task.date);
            taskDate.setHours(0, 0, 0, 0);

            const diffTime = taskDate - today;
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                addNotification('Deadline Tomorrow', `Task "${task.title}" is due tomorrow!`);
            }
        }
    });
}