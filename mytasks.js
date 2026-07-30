let currentPage = 1;
const tasksPerPage = 6;

const translations = {
    en: {
        appName: "TaskFlow",
        dashboard: "Dashboard",
        myTasks: "My Tasks",
        calendar: "Calendar",
        profile: "Profile",
        settings: "Settings",
        logout: "Logout",
        notifications: "Notifications",
        clearAll: "Clear All",
        noNotifications: "No new notifications",
        addTask: "Add Task",
        searchPlaceholder: "Search tasks...",
        allStatuses: "All Statuses",
        statusPending: "Pending",
        statusInProgress: "In Progress",
        statusCompleted: "Completed",
        allPriorities: "All Priorities",
        priorityHigh: "High",
        priorityMedium: "Medium",
        priorityLow: "Low",
        allCategories: "All Categories",
        categoryWork: "Work",
        categoryStudy: "Study",
        categoryPersonal: "Personal",
        showing: "Showing",
        of: "of",
        tasks: "tasks",
        previous: "Previous",
        next: "Next",
        page: "Page",
        addNewTask: "Add New Task",
        editTask: "Edit Task",
        taskTitle: "Task Title",
        titlePlaceholder: "Enter task title",
        description: "Description",
        descPlaceholder: "Enter task details",
        priority: "Priority",
        category: "Category",
        status: "Status",
        dueDate: "Due Date",
        cancel: "Cancel",
        saveTask: "Save Task",
        updateTask: "Update Task",
        noDesc: "No description provided.",
        confirmDelete: "Are you sure you want to delete this task?",
        msgTaskAdded: "Task added successfully!",
        msgTaskUpdated: "Task updated successfully!",
        msgTaskCompleted: "🎉 Task completed successfully!",
        msgTaskDeleted: "Task deleted successfully!"
    },
    ar: {
        appName: "تاسك فلو",
        dashboard: "لوحة التحكم",
        myTasks: "مهامي",
        calendar: "التقويم",
        profile: "الملف الشخصي",
        settings: "الإعدادات",
        logout: "تسجيل الخروج",
        notifications: "الإشعارات",
        clearAll: "مسح الكل",
        noNotifications: "لا توجد إشعارات جديدة",
        addTask: "إضافة مهمة",
        searchPlaceholder: "البحث في المهام...",
        allStatuses: "جميع الحالات",
        statusPending: "قيد الانتظار",
        statusInProgress: "قيد التنفيذ",
        statusCompleted: "مكتملة",
        allPriorities: "جميع الأولويات",
        priorityHigh: "عالية",
        priorityMedium: "متوسطة",
        priorityLow: "منخفضة",
        allCategories: "جميع التصنيفات",
        categoryWork: "عمل",
        categoryStudy: "دراسة",
        categoryPersonal: "شخصي",
        showing: "عرض",
        of: "من",
        tasks: "مهام",
        previous: "السابق",
        next: "التالي",
        page: "صفحة",
        addNewTask: "إضافة مهمة جديدة",
        editTask: "تعديل المهمة",
        taskTitle: "عنوان المهمة",
        titlePlaceholder: "أدخل عنوان المهمة",
        description: "الوصف",
        descPlaceholder: "أدخل تفاصيل المهمة",
        priority: "الأولوية",
        category: "التصنيف",
        status: "الحالة",
        dueDate: "تاريخ الاستحقاق",
        cancel: "إلغاء",
        saveTask: "حفظ المهمة",
        updateTask: "تحديث المهمة",
        noDesc: "لا يوجد وصف مدخل.",
        confirmDelete: "هل أنت ألكيد من رغبتك في حذف هذه المهمة؟",
        msgTaskAdded: "تمت إضافة المهمة بنجاح!",
        msgTaskUpdated: "تم تحديث المهمة بنجاح!",
        msgTaskCompleted: "🎉 تم إكمال المهمة بنجاح!",
        msgTaskDeleted: "تم حذف المهمة بنجاح!"
    }
};

function setLanguage(lang) {
    const htmlTag = document.documentElement;
    const bootstrapCss = document.getElementById('bootstrapCss');
    
    if (lang === 'ar') {
        htmlTag.setAttribute('lang', 'ar');
        htmlTag.setAttribute('dir', 'rtl');
        if (bootstrapCss) {
            bootstrapCss.setAttribute('href', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css');
        }
    } else {
        htmlTag.setAttribute('lang', 'en');
        htmlTag.setAttribute('dir', 'ltr');
        if (bootstrapCss) {
            bootstrapCss.setAttribute('href', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
        }
    }

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        if (translations[lang] && translations[lang][key]) {
            element.setAttribute('placeholder', translations[lang][key]);
        }
    });

    localStorage.setItem('language', lang);
}

document.addEventListener('DOMContentLoaded', () => {
    const currentLang = localStorage.getItem('language') || 'en';
    setLanguage(currentLang);

    loadAndRenderTasks();
    renderNotifications();
    initDragAndDrop();
    initFiltersAndSearch();
    checkDeadlines();

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

            addNotification('New Task', `Task "${title}" has been created.`, newTask.id);
            showToast(translations[currentLang]?.msgTaskAdded || 'Task added successfully!', 'success');

            addTaskForm.reset();
            const modalElement = document.getElementById('addTaskModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
        });
    }

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

            if (oldStatus !== 'Completed' && status === 'Completed') {
                addNotification('Task Completed', `Task "${title}" marked as completed.`, id);
            }

            showToast(translations[currentLang]?.msgTaskUpdated || 'Task updated successfully!', 'info');

            const modalElement = document.getElementById('editTaskModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
        });
    }
});

function getTasks() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

function saveTask(task) {
    const tasks = getTasks();
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function changePage(direction) {
    currentPage += direction;
    loadAndRenderTasks();
}

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

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchInputValue) || 
                              (task.description && task.description.toLowerCase().includes(searchInputValue));
        const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
        const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });

    const totalFiltered = filteredTasks.length;
    const totalPages = Math.ceil(totalFiltered / tasksPerPage) || 1;

    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = startIndex + tasksPerPage;
    const paginatedTasks = filteredTasks.slice(startIndex, endIndex);

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

    if (document.getElementById('countPending')) document.getElementById('countPending').textContent = pendingCount;
    if (document.getElementById('countInProgress')) document.getElementById('countInProgress').textContent = inProgressCount;
    if (document.getElementById('countCompleted')) document.getElementById('countCompleted').textContent = completedCount;

    updatePaginationUI(totalFiltered, startIndex, Math.min(endIndex, totalFiltered), totalPages);
}

function updatePaginationUI(totalItems, start, end, totalPages) {
    const currentLang = localStorage.getItem('language') || 'en';
    const pageText = translations[currentLang]?.page || 'Page';
    const ofText = translations[currentLang]?.of || 'of';

    if (document.getElementById('pageStart')) document.getElementById('pageStart').textContent = totalItems === 0 ? 0 : start + 1;
    if (document.getElementById('pageEnd')) document.getElementById('pageEnd').textContent = end;
    if (document.getElementById('totalItems')) document.getElementById('totalItems').textContent = totalItems;
    if (document.getElementById('currentPageNumber')) document.getElementById('currentPageNumber').textContent = `${pageText} ${currentPage} ${ofText} ${totalPages}`;

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

function createTaskCardElement(task) {
    const currentLang = localStorage.getItem('language') || 'en';
    const card = document.createElement('div');
    card.className = 'card border-0 shadow-sm mb-3 task-card';
    card.id = `task-${task.id}`;
    card.setAttribute('draggable', 'true');

    let priorityBadge = 'bg-secondary';
    if (task.priority === 'High') priorityBadge = 'bg-danger';
    if (task.priority === 'Medium') priorityBadge = 'bg-warning text-dark';
    if (task.priority === 'Low') priorityBadge = 'bg-info text-dark';

    const priorityLabel = translations[currentLang]?.[`priority${task.priority}`] || task.priority;

    const completeBtnHtml = task.status !== 'Completed' 
        ? `<button class="btn btn-sm btn-link text-success p-0 me-2" onclick="markTaskAsCompleted('${task.id}')" title="Mark as Completed">
            <i class="bi bi-check-lg fs-5"></i>
           </button>` 
        : '';

    const noDescText = translations[currentLang]?.noDesc || 'No description provided.';

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
            <p class="text-muted small mb-2 text-break">${task.description || noDescText}</p>
            <div class="d-flex justify-content-between align-items-center">
                <span class="badge ${priorityBadge}">${priorityLabel}</span>
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

function markTaskAsCompleted(taskId) {
    updateTaskStatusInStorage(taskId, 'Completed');
}

function updateTaskStatusInStorage(taskId, newStatus) {
    const currentLang = localStorage.getItem('language') || 'en';
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
        showToast(translations[currentLang]?.msgTaskCompleted || '🎉 Task completed successfully!', 'success');
    }
}

function deleteTask(taskId) {
    const currentLang = localStorage.getItem('language') || 'en';
    const confirmMsg = translations[currentLang]?.confirmDelete || 'Are you sure you want to delete this task?';
    
    if (confirm(confirmMsg)) {
        let tasks = getTasks();
        tasks = tasks.filter(t => String(t.id) !== String(taskId));
        localStorage.setItem('tasks', JSON.stringify(tasks));
        loadAndRenderTasks();
        showToast(translations[currentLang]?.msgTaskDeleted || 'Task deleted successfully!', 'danger');
    }
}

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

function getNotifications() {
    return JSON.parse(localStorage.getItem('app_notifications')) || [];
}

function saveNotifications(notifications) {
    localStorage.setItem('app_notifications', JSON.stringify(notifications));
}

function renderNotifications() {
    const notifications = getNotifications();
    const notifList = document.getElementById('notifList');
    const notifBadge = document.getElementById('notifBadge');
    const currentLang = localStorage.getItem('language') || 'en';

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
        const noNotifText = translations[currentLang]?.noNotifications || 'No new notifications';
        notifList.innerHTML = `
            <li id="emptyNotifMsg" class="text-center py-4 text-muted small">
                <i class="bi bi-inbox fs-3 d-block mb-1 text-black-50"></i>
                ${noNotifText}
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

function markNotificationAsRead(notifId) {
    let notifications = getNotifications();
    notifications = notifications.map(n => {
        if (n.id === notifId) n.read = true;
        return n;
    });
    saveNotifications(notifications);
    renderNotifications();
}

function deleteNotification(notifId, event) {
    if (event) event.stopPropagation();
    let notifications = getNotifications();
    notifications = notifications.filter(n => n.id !== notifId);
    saveNotifications(notifications);
    renderNotifications();
}

function clearNotifications() {
    saveNotifications([]);
    renderNotifications();
}

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
                const alreadyNotified = notifications.some(n => n.taskId === task.id && n.type === 'Deadline Tomorrow');
                if (!alreadyNotified) {
                    addNotification('Deadline Tomorrow', `Task "${task.title}" is due tomorrow!`, task.id);
                }
            }
        }
    });
}

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

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}