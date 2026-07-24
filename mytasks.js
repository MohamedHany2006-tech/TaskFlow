document.addEventListener('DOMContentLoaded', () => {
    // 1. تحميل التاسكات وإعداد Drag & Drop والفلترة والبحث
    loadAndRenderTasks();
    initDragAndDrop();
    initFiltersAndSearch();

    // 2. فحص المهام لقرب الموعد (Deadline Tomorrow)
    checkDeadlines();

    // 3. تفعيل Form إضافة تاسك جديدة (Create Task)
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

            // إرسال إشعار وتوست عند إضافة مهمة جديدة
            addNotification('New Task', `Task "${title}" has been created.`);
            showToast('Task added successfully!', 'success');

            addTaskForm.reset();
            const modalElement = document.getElementById('addTaskModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
        });
    }

    // 4. تفعيل Form تعديل التاسك (Edit Task)
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

            showToast('Task updated successfully!', 'info');

            const modalElement = document.getElementById('editTaskModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
        });
    }
});

// === 1. جلب المهام من LocalStorage (Read) ===
function getTasks() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

// === 2. عرض وتوزيع التاسكات على الأنساق المحددة ===
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

// === 3. إنشاء شكل كارت المهام في الواجهة ===
function createTaskCardElement(task) {
    const card = document.createElement('div');
    card.className = 'card border-0 shadow-sm mb-3 task-card';
    card.id = `task-${task.id}`;
    card.setAttribute('draggable', 'true');

    let priorityBadge = 'bg-secondary';
    if (task.priority === 'High') priorityBadge = 'bg-danger';
    if (task.priority === 'Medium') priorityBadge = 'bg-warning text-dark';
    if (task.priority === 'Low') priorityBadge = 'bg-info text-dark';

    // زر الإنهاء (Check Icon) - يُخفى إذا كانت مكتملة بالفعل
    const completeBtnHtml = task.status !== 'Completed' 
        ? `<button class="btn btn-sm btn-link text-success p-0 me-2" onclick="markTaskAsCompleted('${task.id}')" title="Mark as Completed">
            <i class="bi bi-check-lg fs-5"></i>
           </button>` 
        : '';

    card.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
                <h6 class="fw-bold m-0 text-truncate ${task.status === 'Completed' ? 'text-decoration-line-through text-muted' : ''}" style="max-width: 65%;">${task.title}</h6>
                <div class="d-flex align-items-center">
                    ${completeBtnHtml}
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

// === 4. فتح مودال التعديل وتعبئة بياناته (Edit Task Form Modal) ===
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

// === 5. حفظ المهمة الجديدة (Create Task) ===
function saveTask(task) {
    const tasks = getTasks();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// === 6. تحويل المهمة إلى "مكتملة" (Complete Task) ===
function markTaskAsCompleted(taskId) {
    updateTaskStatusInStorage(taskId, 'Completed');
}

// === 7. تحديث الحالة عبر السحب والإفلات أو الإكمال المباشر ===
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
        showToast('🎉 Task completed successfully!', 'success');
    }
}

// === 8. حذف المهمة (Delete Task) ===
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        let tasks = getTasks();
        tasks = tasks.filter(t => String(t.id) !== String(taskId));
        localStorage.setItem('tasks', JSON.stringify(tasks));
        loadAndRenderTasks();
        showToast('Task deleted successfully!', 'danger');
    }
}

// === 9. إعداد أحداث السحب والإفلات (Drag & Drop) ===
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

// === 10. إعداد الفلترة والبحث ===
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

// === 11. إضافة وتحديث الإشعارات ===
function clearNotifications() {
    const notifBadge = document.getElementById('notifBadge');
    const notifList = document.getElementById('notifList');

    if (notifBadge) {
        notifBadge.textContent = '0';
        notifBadge.classList.add('d-none');
    }

    if (notifList) {
        notifList.innerHTML = `
            <li id="emptyNotifMsg" class="text-center py-4 text-muted small">
                <i class="bi bi-inbox fs-3 d-block mb-1 text-black-50"></i>
                No new notifications
            </li>
        `;
    }
}

function addNotification(type, message) {
    const notifList = document.getElementById('notifList');
    const notifBadge = document.getElementById('notifBadge');

    if (!notifList) return;

    const emptyMsg = document.getElementById('emptyNotifMsg');
    if (emptyMsg) emptyMsg.remove();

    if (notifBadge) {
        let currentCount = parseInt(notifBadge.textContent) || 0;
        currentCount++;
        notifBadge.textContent = currentCount;
        notifBadge.classList.remove('d-none');
    }

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

    notifList.prepend(notifItem);
}

// === 12. فحص المواعيد لإطلاق التنبيهات القريبة ===
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

// === 13. إظهار التنبيهات السريعة (Toast) ===
function showToast(message, type = 'success') {
    const toastEl = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');
    const toastIcon = document.getElementById('toastIcon');

    if (!toastEl || !toastMessage || !toastIcon) return;

    toastMessage.textContent = message;
    toastEl.className = `toast align-items-center text-white border-0 shadow-lg bg-${type}`;

    if (type === 'success') {
        toastIcon.className = 'bi bi-check-circle-fill fs-5';
    } else if (type === 'danger') {
        toastIcon.className = 'bi bi-x-circle-fill fs-5';
    } else if (type === 'warning') {
        toastIcon.className = 'bi bi-exclamation-triangle-fill fs-5';
    } else {
        toastIcon.className = 'bi bi-info-circle-fill fs-5';
    }

    const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
    toast.show();
}
// تفعيل أحداث السحب والإفلات للمناطق
function initDragAndDrop() {
    const dropZones = document.querySelectorAll('.drop-zone');

    dropZones.forEach(zone => {
        // عند مرور الكارت فوق المنطقة
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over'); // إضافة تأثير إضاءة/حدود للمنطقة
        });

        // عند مغادرة الكارت للمنطقة
        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        // عند تفليت/إسقاط الكارت داخل المنطقة
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');

            const taskId = e.dataTransfer.getData('text/plain');
            const draggedCard = document.getElementById(`task-${taskId}`);
            const newStatus = zone.getAttribute('data-status');

            if (draggedCard && newStatus) {
                zone.appendChild(draggedCard); // نقل العنصر في الـ DOM
                updateTaskStatusInStorage(taskId, newStatus); // تحديث الحالة في LocalStorage
            }
        });
    });
}