// 1. ترجمات الصفحة
const translations = {
    en: {
        appName: "TaskFlow",
        dashboard: "Dashboard",
        myTasks: "My Tasks",
        calendar: "Calendar",
        profile: "Profile",
        settings: "Settings",
        logout: "Logout",
        dashboardOverview: "Dashboard Overview",
        welcomeMessage: "Welcome back! Here is a summary of your task progress.",
        notifications: "Notifications",
        clearAll: "Clear All",
        noNotifications: "No new notifications",
        manageTasks: "Manage Tasks",
        statTotalTasks: "TOTAL TASKS",
        statCompleted: "COMPLETED",
        statInProgress: "IN PROGRESS",
        statPending: "PENDING",
        overallCompletion: "Overall Completion Rate",
        tasksOverview: "Tasks Overview",
        recentTasks: "Recent Tasks",
        viewAll: "View All",
        thTask: "Task",
        thCategory: "Category",
        thPriority: "Priority",
        thDueDate: "Due Date",
        thStatus: "Status",
        noTasksFound: "No tasks found. Add some tasks in the My Tasks page!",
        chartCompleted: "Completed",
        chartPending: "Pending",
        chartOverdue: "Overdue",
        chartTasksLabel: "Tasks"
    },
    ar: {
        appName: "تاسك فلو",
        dashboard: "لوحة التحكم",
        myTasks: "مهامي",
        calendar: "التقويم",
        profile: "الملف الشخصي",
        settings: "الإعدادات",
        logout: "تسجيل الخروج",
        dashboardOverview: "لوحة التحكم العامة",
        welcomeMessage: "أهلاً بك مجدداً! إليك ملخص تقدم مهامك.",
        notifications: "الإشعارات",
        clearAll: "مسح الكل",
        noNotifications: "لا توجد إشعارات جديدة",
        manageTasks: "إدارة المهام",
        statTotalTasks: "إجمالي المهام",
        statCompleted: "المكتملة",
        statInProgress: "قيد التنفيذ",
        statPending: "قيد الانتظار",
        overallCompletion: "نسبة الإنجاز الكلية",
        tasksOverview: "نظرة عامة على المهام",
        recentTasks: "أحدث المهام",
        viewAll: "عرض الكل",
        thTask: "المهمة",
        thCategory: "التصنيف",
        thPriority: "الأولوية",
        thDueDate: "تاريخ الاستحقاق",
        thStatus: "الحالة",
        noTasksFound: "لم يتم العثور على مهام. قم بإضافة بعض المهام في صفحة مهامي!",
        chartCompleted: "مكتملة",
        chartPending: "قيد الانتظار",
        chartOverdue: "متأخرة",
        chartTasksLabel: "مهام"
    }
};

// 2. تطبيق اللغة
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

    localStorage.setItem('language', lang);
}

document.addEventListener('DOMContentLoaded', () => {
    const currentLang = localStorage.getItem('language') || 'en';
    setLanguage(currentLang);

    loadDashboardData();
    renderTasksChart();
    renderNotifications();
    checkDeadlines();
});

// === 1. جلب البيانات وحساب الإحصائيات ===
function loadDashboardData() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const currentLang = localStorage.getItem('language') || 'en';

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const pending = tasks.filter(t => t.status === 'Pending').length;

    if (document.getElementById('statTotal')) document.getElementById('statTotal').innerText = total;
    if (document.getElementById('statCompleted')) document.getElementById('statCompleted').innerText = completed;
    if (document.getElementById('statInProgress')) document.getElementById('statInProgress').innerText = inProgress;
    if (document.getElementById('statPending')) document.getElementById('statPending').innerText = pending;

    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    if (document.getElementById('progressPercentage')) document.getElementById('progressPercentage').innerText = `${completionPercentage}%`;
    if (document.getElementById('progressBar')) document.getElementById('progressBar').style.width = `${completionPercentage}%`;

    const recentTasksContainer = document.getElementById('recentTasksTable');
    if (!recentTasksContainer) return;

    recentTasksContainer.innerHTML = '';

    if (tasks.length === 0) {
        const msg = translations[currentLang]?.noTasksFound || 'No tasks found.';
        recentTasksContainer.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">${msg}</td>
            </tr>
        `;
        return;
    }

    const recentTasks = [...tasks].reverse().slice(0, 5);

    recentTasks.forEach(task => {
        let priorityBadge = 'bg-secondary';
        if (task.priority === 'High') priorityBadge = 'bg-danger';
        if (task.priority === 'Medium') priorityBadge = 'bg-warning text-dark';
        if (task.priority === 'Low') priorityBadge = 'bg-info text-dark';

        let statusBadge = 'bg-secondary';
        if (task.status === 'Completed') statusBadge = 'bg-success';
        if (task.status === 'In Progress') statusBadge = 'bg-info text-dark';
        if (task.status === 'Pending') statusBadge = 'bg-warning text-dark';

        const rowHTML = `
            <tr>
                <td class="fw-bold">${task.title}</td>
                <td><span class="badge bg-light text-dark border">${task.category || 'General'}</span></td>
                <td><span class="badge ${priorityBadge}">${task.priority}</span></td>
                <td>${task.date || 'N/A'}</td>
                <td><span class="badge ${statusBadge}">${task.status}</span></td>
            </tr>
        `;
        recentTasksContainer.insertAdjacentHTML('beforeend', rowHTML);
    });
}

// === 2. رسم Chart الخاصة بالأداء مع الترجمة ===
let myChartInstance = null;

function renderTasksChart() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const currentLang = localStorage.getItem('language') || 'en';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let completedCount = 0;
    let pendingCount = 0;
    let overdueCount = 0;

    tasks.forEach(task => {
        if (task.status === 'Completed') {
            completedCount++;
        } else {
            const taskDate = task.date ? new Date(task.date) : null;
            if (taskDate) taskDate.setHours(0, 0, 0, 0);

            if (taskDate && taskDate < today) {
                overdueCount++;
            } else {
                pendingCount++;
            }
        }
    });

    const ctx = document.getElementById('tasksChart');
    if (!ctx) return;

    if (myChartInstance) {
        myChartInstance.destroy();
    }

    const labels = [
        translations[currentLang]?.chartCompleted || 'Completed',
        translations[currentLang]?.chartPending || 'Pending',
        translations[currentLang]?.chartOverdue || 'Overdue'
    ];

    myChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: [completedCount, pendingCount, overdueCount],
                backgroundColor: ['#198754', '#ffc107', '#dc3545'],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 15,
                        padding: 15,
                        font: { family: 'system-ui', size: 13 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const taskUnit = translations[currentLang]?.chartTasksLabel || 'Tasks';
                            return ` ${label}: ${value} ${taskUnit}`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// === 3. إدارة الإشعارات ===
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

// === 4. فحص المواعيد ===
function checkDeadlines() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
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

// === 5. تسجيل الخروج ===
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}