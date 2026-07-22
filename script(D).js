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
                <td colspan="5" class="text-center text-muted py-4">No tasks found. Add some tasks from the My Tasks page!</td>
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