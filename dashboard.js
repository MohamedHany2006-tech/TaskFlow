document.addEventListener('DOMContentLoaded', loadDashboardData);

function loadDashboardData() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    // 1. حساب الإحصائيات
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const pending = tasks.filter(t => t.status === 'Pending').length;

    // تحديث قيم الكروت
    document.getElementById('statTotal').innerText = total;
    document.getElementById('statCompleted').innerText = completed;
    document.getElementById('statInProgress').innerText = inProgress;
    document.getElementById('statPending').innerText = pending;

    // 2. نسبة الإنجاز المئوية
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    document.getElementById('progressPercentage').innerText = `${completionPercentage}%`;
    document.getElementById('progressBar').style.width = `${completionPercentage}%`;

    // 3. عرض أحدث 5 تاسكات في الجدول
    const recentTasksContainer = document.getElementById('recentTasksTable');
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
                <td><span class="badge bg-light text-dark border">${task.category}</span></td>
                <td><span class="badge ${priorityBadge}">${task.priority}</span></td>
                <td>${task.date}</td>
                <td><span class="badge ${statusBadge}">${task.status}</span></td>
            </tr>
        `;
        recentTasksContainer.insertAdjacentHTML('beforeend', rowHTML);
    });
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
let myChartInstance = null; // للاحتفاظ بالرسم البياني وتحديثه عند الحاجة

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
            // فحص إذا كان موعد المهمة قد انتهى (Overdue)
            const taskDate = task.date ? new Date(task.date) : null;
            if (taskDate) {
                taskDate.setHours(0, 0, 0, 0);
            }

            if (taskDate && taskDate < today) {
                overdueCount++; // متأخرة
            } else {
                pendingCount++; // معلقة/قيد التنفيذ وفي الموعد
            }
        }
    });

    const ctx = document.getElementById('tasksChart');
    if (!ctx) return;

    // إذا كان الرسم البياني مرسومًا سابقاً، ندمّره لتفادي تداخل البيانات عند التحديث
    if (myChartInstance) {
        myChartInstance.destroy();
    }

    // إنشاء الرسم البياني الدائري (Doughnut Chart)
    myChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Pending', 'Overdue'],
            datasets: [{
                data: [completedCount, pendingCount, overdueCount],
                backgroundColor: [
                    '#198754', // أخضر للمكتملة
                    '#ffc107', // أصفر للمعلقة
                    '#dc3545'  // أحمر للمتأخرة
                ],
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
                        font: {
                            family: 'system-ui',
                            size: 13
                        }
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
            cutout: '70%' // تجعل الدائرة مفرغة من المنتصف بشكل أنيق
        }
    });
}

// تشغيل الدالة فور تحميل الصفحة
document.addEventListener('DOMContentLoaded', renderTasksChart);