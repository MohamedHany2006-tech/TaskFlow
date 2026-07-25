// === المتغيرات العامة للتحكم بالصفحات (Pagination) ===
let currentPage = 1;
const tasksPerPage = 6; // عدد المهام المعروضة في الصفحة الواحدة

document.addEventListener('DOMContentLoaded', () => {
    // 1. تحميل التاسكات والإشعارات وإعداد الـ Drag & Drop والبحث
    loadAndRenderTasks();
    renderNotifications();
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
            addNotification('New Task', `Task "${title}" has been created.`, newTask.id);
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
                addNotification('Task Completed', `Task "${title}" marked as completed.`, id);
            }

            showToast('Task updated successfully!', 'info');

            const modalElement = document.getElementById('editTaskModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
        });
    }
});

// === 1. جلب وحفظ المهام من LocalStorage ===
function getTasks() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

function saveTask(task) {
    const tasks = getTasks();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// === 2. دالة التصفح والتنقل بين الصفحات ===
function changePage(direction) {
    currentPage += direction;
    loadAndRenderTasks();
}

// === 3. عرض وتوزيع التاسكات مع دعم التصفية والـ Pagination ===
function loadAndRenderTasks() {
    const tasks = getTasks();

    const searchInputValue = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const priorityFilter = document.getElementById('priorityFilter')?.value || 'all';
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';

    const pendingZone = document.getElementById('Pending');
    const inProgressZone = document.getElementById('InProgress');
    const completedZone = document.getElementById('Completed');

    if (pendingZone) pendingZone.innerHTML = '';
    if (inProgressZone) inProgressZone.innerHTML = '';
    if (completedZone) completedZone.innerHTML = '';

    // تصفية المهام أولاً بناءً على البحث والفلترة
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchInputValue) || 
                              (task.description && task.description.toLowerCase().includes(searchInputValue));
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });

    // حساب حدود الصفحات (Pagination)
    const totalFiltered = filteredTasks.length;
    const totalPages = Math.ceil(totalFiltered / tasksPerPage) || 1;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

    // عرض المهام للصفحة الحالية فقط
    let pendingCount = 0;
    let inProgressCount = 0;
    let completedCount = 0;

    paginatedTasks.forEach(task => {
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
    });

    // تحديث العدادات في رأس كل عمود
    if (document.getElementById('countPending')) document.getElementById('countPending').textContent = pendingCount;
    if (document.getElementById('countInProgress')) document.getElementById('countInProgress').textContent = inProgressCount;
    if (document.getElementById('countCompleted')) document.getElementById('countCompleted').textContent = completedCount;

    // تحديث واجهة أزرار الـ Pagination
    updatePaginationUI(totalFiltered, startIndex, Math.min(endIndex, totalFiltered), totalPages);
}

// === 4. تحديث واجهة عناصر الـ Pagination ===
function updatePaginationUI(totalItems, start, end, totalPages) {
    if (document.getElementById('pageStart')) document.getElementById('pageStart').textContent = totalItems === 0 ? 0 : start + 1;
    if (document.getElementById('pageEnd')) document.getElementById('pageEnd').textContent = end;
    if (document.getElementById('totalItems')) document.getElementById('totalItems').textContent = totalItems;
    if (document.getElementById('currentPageNumber')) document.getElementById('currentPageNumber').textContent = `Page ${currentPage} of ${totalPages}`;

    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');

    if (prevBtn) {
        if (currentPage <= 1) {
            prevBtn.classList.add('disabled');
        } else {
            prevBtn.classList.remove('disabled');
        }
    }

    if (nextBtn) {
        if (currentPage >= totalPages || totalItems === 0) {
            nextBtn.classList.add('disabled');
        } else {
            nextBtn.classList.remove('disabled');
        }
    }
}

// === 5. إنشاء عنصر كارت المهمة في DOM ===
function createTaskCardElement(task) {
    const card = document.createElement('div');
    card.className = 'card border-0 shadow-sm mb-3 task-card';
    card.id = `task-${task.id}`;
    card.setAttribute('draggable', 'true');

    let priorityBadge = 'bg-secondary';
    if (task.priority === 'High') priorityBadge = 'bg-danger';
    if (task.priority === 'Medium') priorityBadge = 'bg-warning text-dark';
    if (task.priority === 'Low') priorityBadge = 'bg-info text-dark';

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

// === 6. فتح مودال التعديل ===
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

// === 7. تحويل المهمة إلى مكتملة ===
function markTaskAsCompleted(taskId) {
    updateTaskStatusInStorage(taskId, 'Completed');
}

// === 8. تحديث حالة المهمة ===
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
        addNotification('Task Completed', `Task "${taskTitle}" marked as completed.`, taskId);
        showToast('🎉 Task completed successfully!', 'success');
    }
}

// === 9. حذف المهمة ===
function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        let tasks = getTasks();
        tasks = tasks.filter(t => String(t.id) !== String(taskId));
        localStorage.setItem('tasks', JSON.stringify(tasks));
        loadAndRenderTasks();
        showToast('Task deleted successfully!', 'danger');
    }
}

// === 10. إعداد السحب والإفلات (Drag & Drop) ===
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

// === 11. إعداد الفلترة والبحث ===
function initFiltersAndSearch() {
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const priorityFilter = document.getElementById('priorityFilter');
    const categoryFilter = document.getElementById('categoryFilter');

    const handleFilterChange = () => {
        currentPage = 1;
        loadAndRenderTasks();
    };

    if (searchInput) searchInput.addEventListener('input', handleFilterChange);
    if (statusFilter) statusFilter.addEventListener('change', handleFilterChange);
    if (priorityFilter) priorityFilter.addEventListener('change', handleFilterChange);
    if (categoryFilter) categoryFilter.addEventListener('change', handleFilterChange);
}

// ==========================================================
// === 12. نظام الإشعارات التفاعلي الحقيقي (Interactive Notifications) ===
// ==========================================================

function getNotifications() {
    return JSON.parse(localStorage.getItem('app_notifications')) || [];
}

function saveNotifications(notifications) {
    localStorage.setItem('app_notifications', JSON.stringify(notifications));
}

// عرض رسم الإشعارات
function renderNotifications() {
    const notifications = getNotifications();
    const notifList = document.getElementById('notifList');
    const notifBadge = document.getElementById('notifBadge');

    if (!notifList) return;

    notifList.innerHTML = '';
    const unreadCount = notifications.filter(n => !n.read).length;

    if (notifBadge) {
        if (unreadCount > 0) {
            notifBadge.textContent = unreadCount;
            notifBadge.classList.remove('d-none');
        } else {
            notifBadge.classList.add('d-none');
        }
    }

    if (notifications.length === 0) {
        notifList.innerHTML = `
            <li id="emptyNotifMsg" class="text-center py-4 text-muted small">
                <i class="bi bi-inbox fs-3 d-block mb-1 text-black-50"></i>
                No new notifications
            </li>
        `;
        return;
    }

    notifications.forEach(notif => {
        let iconClass = 'bi-bell';
        let bgClass = 'bg-primary';

        if (notif.type === 'New Task') {
            iconClass = 'bi-plus-lg';
            bgClass = 'bg-primary';
        } else if (notif.type === 'Task Completed') {
            iconClass = 'bi-check-lg';
            bgClass = 'bg-success';
        } else if (notif.type === 'Deadline Tomorrow') {
            iconClass = 'bi-exclamation-triangle';
            bgClass = 'bg-warning text-dark';
        }

        const notifItem = document.createElement('li');
        notifItem.className = 'notif-wrapper border-bottom border-light';
        notifItem.innerHTML = `
            <div class="dropdown-item p-2 d-flex align-items-center justify-content-between notif-item ${notif.read ? 'opacity-50' : ''}">
                <div class="d-flex align-items-start gap-2 flex-grow-1" style="cursor: pointer;" onclick="markNotificationAsRead('${notif.id}')">
                    <div class="${bgClass} text-white rounded-circle p-2 d-flex align-items-center justify-content-center flex-shrink-0" style="width: 32px; height: 32px;">
                        <i class="bi ${iconClass}"></i>
                    </div>
                    <div>
                        <div class="fw-bold small">${notif.type} ${!notif.read ? '<span class="badge bg-danger ms-1" style="font-size:0.5rem">NEW</span>' : ''}</div>
                        <div class="text-muted extra-small" style="font-size: 0.75rem;">${notif.message}</div>
                    </div>
                </div>
                <button class="btn btn-sm btn-link text-muted p-0 ms-2" onclick="deleteNotification('${notif.id}', event)" title="Remove">
                    <i class="bi bi-x-lg"></i>
                </button>
            </div>
        `;
        notifList.appendChild(notifItem);
    });
}

// إضافة إشعار جديد
function addNotification(type, message, taskId = null) {
    const notifications = getNotifications();

    const newNotif = {
        id: Date.now().toString(),
        taskId: taskId,
        type: type,
        message: message,
        read: false,
        timestamp: new Date().toISOString()
    };

    notifications.unshift(newNotif);
    saveNotifications(notifications);
    renderNotifications();
}

// جعل الإشعار مقروءاً عند الضغط عليه
function markNotificationAsRead(notifId) {
    let notifications = getNotifications();
    notifications = notifications.map(n => {
        if (n.id === notifId) n.read = true;
        return n;
    });
    saveNotifications(notifications);
    renderNotifications();
}

// حذف إشعار فردي
function deleteNotification(notifId, event) {
    if (event) event.stopPropagation();
    let notifications = getNotifications();
    notifications = notifications.filter(n => n.id !== notifId);
    saveNotifications(notifications);
    renderNotifications();
}

// حذف كل الإشعارات
function clearNotifications() {
    saveNotifications([]);
    renderNotifications();
}

// === 13. فحص المواعيد (بدون تكرار الإشعار) ===
function checkDeadlines() {
    const tasks = getTasks();
    const notifications = getNotifications();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    tasks.forEach(task => {
        if (task.status !== 'Completed' && task.date) {
            const taskDate = new Date(task.date);
            taskDate.setHours(0, 0, 0, 0);

            const diffTime = taskDate - today;
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // التأكد من عدم إرسال نفس إشعار Deadline لـ نفس التاسك سابقاً
                const alreadyNotified = notifications.some(n => n.taskId === task.id && n.type === 'Deadline Tomorrow');
                if (!alreadyNotified) {
                    addNotification('Deadline Tomorrow', `Task "${task.title}" is due tomorrow!`, task.id);
                }
            }
        }
    });
}

// === 14. التنبيهات السريعة (Toast) ===
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