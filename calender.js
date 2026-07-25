document.addEventListener('DOMContentLoaded', function() {
            var calendarEl = document.getElementById('calendar');

            // جلب التاسكات المحفوظة في localStorage لإظهارها على التقويم
            var savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
            var calendarEvents = savedTasks.map(function(task) {
                return {
                    title: task.title,
                    start: task.dueDate || new Date().toISOString().split('T')[0], // التاريخ
                    backgroundColor: task.status === 'Completed' ? '#10b981' : (task.status === 'In Progress' ? '#3b82f6' : '#f59e0b'),
                    borderColor: 'transparent'
                };
            });

            var calendar = new FullCalendar.Calendar(calendarEl, {
                initialView: 'dayGridMonth',
                headerToolbar: {
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,listMonth'
                },
                events: calendarEvents,
                height: 'auto'
            });

            calendar.render();
        });
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        const themeIcon = document.getElementById('themeIcon');
        const htmlTag = document.documentElement;

        // Load saved theme from localStorage
        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme);

        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlTag.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });

        function setTheme(theme) {
            htmlTag.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);

            if (theme === 'dark') {
                themeIcon.classList.replace('bi-moon-stars', 'bi-sun');
                themeIcon.classList.replace('text-secondary', 'text-warning');
            } else {
                themeIcon.classList.replace('bi-sun', 'bi-moon-stars');
                themeIcon.classList.replace('text-warning', 'text-secondary');
            }
        }
        window.addEventListener('resize', function() {
    if (calendar) {
        calendar.updateSize();
    }
});