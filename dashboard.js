document.addEventListener('DOMContentLoaded', () => {
    // 1. تحميل الإحصائيات وجدول أحدث المهام
    loadDashboardData();

    // 2. رسم الرسم البياني (Doughnut Chart)
    renderTasksChart();

    // 3. عرض وتحديث الإشعارات من LocalStorage
    renderNotifications();

    // 4. فحص مواعيد المهام القريبة
    checkDeadlines();

    // 5. عرض الأنشطة الأخيرة في السجل
    renderRecentActivities();
});

// === 1. جلب البيانات وحساب الإحصائيات وتعبئة جدول Recent Tasks ===
function loadDashboardData() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // حساب الإحصائيات
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const pending = tasks.filter(t => t.status === 'Pending').length;

    // تحديث قيم الكروت
    if (document.getElementById('statTotal')) document.getElementById('statTotal').innerText = total;
    if (document.getElementById('statCompleted')) document.getElementById('statCompleted').innerText = completed;
    if (document.getElementById('statInProgress')) document.getElementById('statInProgress').innerText = inProgress;
    if (document.getElementById('statPending')) document.getElementById('statPending').innerText = pending;

    // نسبة الإنجاز المئوية
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    if (document.getElementById('progressPercentage')) document.getElementById('progressPercentage').innerText = `${completionPercentage}%`;
    if (document.getElementById('progressBar')) document.getElementById('progressBar').style.width = `${completionPercentage}%`;

    // عرض أحدث 5 تاسكات في الجدول
    const recentTasksContainer = document.getElementById('recentTasksTable');
    if (!recentTasksContainer) return;

    recentTasksContainer.innerHTML = '';

    if (tasks.length === 0) {
        recentTasksContainer.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">No tasks found. Add some tasks in the My Tasks page!</td>
            </tr>
        `;
        return;
    }

    // ترتيب أحدث المهام أولاً
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

// === 2. رسم وتحديث Chart الخاصة بأداء المهام ===
let myChartInstance = null;

function renderTasksChart() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
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

    myChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending', 'Overdue'],
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
                            return ` ${label}: ${value} Tasks`;
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });
}

// === 3. عرض ومسح سجل الأنشطة (Recent Activity) ===
function renderRecentActivities() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;

    const activities = JSON.parse(localStorage.getItem('activities')) || [];

    if (activities.length === 0) {
        activityList.innerHTML = `
            <li class="list-group-item text-center py-4 text-muted small border-0" id="emptyActivityMsg">
                <i class="bi bi-clock-history fs-3 d-block mb-1 text-black-50"></i>
                No recent activity logged yet.
            </li>
        `;
        return;
    }

    activityList.innerHTML = activities.map(act => `
        <li class="list-group-item px-0 py-2 d-flex justify-content-between align-items-center border-bottom">
            <div class="d-flex align-items-center gap-2">
                <i class="bi bi-dot fs-3 text-primary"></i>
                <span class="fw-medium small text-dark">${act.text}</span>
            </div>
            <small class="text-muted extra-small" style="font-size: 0.75rem;">${act.time || 'Just now'}</small>
        </li>
    `).join('');
}

function clearActivityLog() {
    localStorage.removeItem('activities');
    renderRecentActivities();
}

function logActivity(text, timeAgo = 'Just now') {
    let activities = JSON.parse(localStorage.getItem('activities')) || [];
    
    activities.unshift({
        id: Date.now(),
        text: text,
        time: timeAgo
    });

    if (activities.length > 10) activities.pop();
    localStorage.setItem('activities', JSON.stringify(activities));
}

// ==========================================================
// === 4. إدارة نظام الإشعارات التفاعلي (Interactive Notifications) ===
// ==========================================================

function getNotifications() {
    return JSON.parse(localStorage.getItem('app_notifications')) || [];
}

function saveNotifications(notifications) {
    localStorage.setItem('app_notifications', JSON.stringify(notifications));
}

// رسم الإشعارات في القائمة المنسدلة
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

// تحديد إشعار كمقروء
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

// مسح جميع الإشعارات
function clearNotifications() {
    saveNotifications([]);
    renderNotifications();
}

// === 5. فحص المواعيد لإشعار "Deadline Tomorrow" (بدون تكرار) ===
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
                // التأكد من عدم تكرار إضافة إشعار الـ Deadline لـ نفس التاسك
                const alreadyNotified = notifications.some(n => n.taskId === task.id && n.type === 'Deadline Tomorrow');
                if (!alreadyNotified) {
                    addNotification('Deadline Tomorrow', `Task "${task.title}" is due tomorrow!`, task.id);
                }
            }
        }
    });
}