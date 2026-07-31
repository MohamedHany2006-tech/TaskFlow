// 1. ترجمات عناصر واجهة التقويم والمودال بالكامل
const translations = {
    en: {
        appName: "TaskFlow",
        dashboard: "Dashboard",
        myTasks: "My Tasks",
        calendar: "Calendar",
        profile: "Profile",
        settings: "Settings",
        logout: "Logout",
        calendarOverview: "Calendar Overview",
        calendarSubtitle: "Manage your task deadlines and schedule visually.",
        notifications: "Notifications",
        noNotifications: "No new notifications",
        
        // Modal Translations
        eventsForDate: "Events for:",
        dailySchedule: "Daily Schedule & Tasks:",
        addNewEvent: "Add New Event for This Day:",
        eventTitle: "Title",
        titlePlaceholder: "e.g., Final Exam / Team Meeting",
        eventType: "Event Type",
        typeMeeting: "💼 Meeting",
        typeExam: "📝 Exam",
        typeAssignment: "📚 Assignment / Project",
        typeGeneral: "📋 General Task",
        close: "Close",
        saveEvent: "Save Event",
        noEventsFound: "No events or deadlines for this day.",
        untitledTask: "Untitled Task",
        
        // Statuses
        statusToDo: "To Do",
        statusInProgress: "In Progress",
        statusCompleted: "Completed"
    },
    ar: {
        appName: "تاسك فلو",
        dashboard: "لوحة التحكم",
        myTasks: "مهامي",
        calendar: "التقويم",
        profile: "الملف الشخصي",
        settings: "الإعدادات",
        logout: "تسجيل الخروج",
        calendarOverview: "نظرة عامة على التقويم",
        calendarSubtitle: "إدارة المواعيد النهائية للمهام والجدول الزمني بوضوح.",
        notifications: "الإشعارات",
        noNotifications: "لا توجد إشعارات جديدة",
        
        // Modal Translations
        eventsForDate: "أحداث يوم:",
        dailySchedule: "الجدول والمهام اليومية:",
        addNewEvent: "إضافة حدث جديد لهذا اليوم:",
        eventTitle: "العنوان",
        titlePlaceholder: "مثال: امتحان فاينل / اجتماع تيم",
        eventType: "نوع الحدث",
        typeMeeting: "💼 اجتماع",
        typeExam: "📝 امتحان",
        typeAssignment: "📚 واجب / مشروع",
        typeGeneral: "📋 مهمة عامة",
        close: "إغلاق",
        saveEvent: "حفظ الحدث",
        noEventsFound: "لا توجد مواعيد أو امتحانات في هذا اليوم.",
        untitledTask: "مهمة بدون عنوان",
        
        // Statuses
        statusToDo: "قيد الانتظار",
        statusInProgress: "قيد التنفيذ",
        statusCompleted: "مكتملة"
    }
};

let calendar;

// 2. دالة إرجاع تنسيق وألوان الحدث ورسائل الترجمة الخاصة به
function getEventTypeStyle(type, status, lang = 'en') {
    const t = translations[lang] || translations.en;
    
    switch (type) {
        case 'Exam':
            return { color: '#ef4444', icon: 'bi-journal-check', label: t.typeExam };
        case 'Meeting':
            return { color: '#3b82f6', icon: 'bi-people-fill', label: t.typeMeeting };
        case 'Assignment':
            return { color: '#8b5cf6', icon: 'bi-file-earmark-code', label: t.typeAssignment };
        default:
            if (status === 'Completed' || status === 'مكتملة') return { color: '#10b981', icon: 'bi-check-circle', label: t.statusCompleted };
            if (status === 'In Progress' || status === 'قيد التنفيذ') return { color: '#3b82f6', icon: 'bi-clock-history', label: t.statusInProgress };
            return { color: '#f59e0b', icon: 'bi-list-task', label: t.typeGeneral };
    }
}

// 3. دالة تطبيق اللغة والاتجاه والترجمة
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

    // ترجمة العناصر العادية
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    // ترجمة الـ Placeholders
    const taskTitleInput = document.getElementById('taskTitle');
    if (taskTitleInput && translations[lang]) {
        taskTitleInput.placeholder = translations[lang].titlePlaceholder;
    }

    localStorage.setItem('language', lang);

    // تحديث التقويم نفسه
    if (calendar) {
        calendar.setOption('locale', lang === 'ar' ? 'ar' : 'en');
        calendar.setOption('direction', lang === 'ar' ? 'rtl' : 'ltr');
        calendar.setOption('buttonText', lang === 'ar' ? {
            today: 'اليوم',
            month: 'شهر',
            week: 'أسبوع',
            list: 'قائمة'
        } : {
            today: 'Today',
            month: 'Month',
            week: 'Week',
            list: 'List'
        });
        
        // إعادة تحميل أحداث التقويم باللغة الجديدة
        calendar.removeAllEvents();
        calendar.addEventSource(loadCalendarEvents());
    }
}

// 4. تطبيق وضع الثيم
function applyTheme(theme) {
    const body = document.body;
    const html = document.documentElement;
    const themeIcon = document.getElementById("themeIcon");

    if (theme === "dark") {
        body.classList.add("dark-mode");
        html.setAttribute("data-theme", "dark");
        if (themeIcon) themeIcon.className = "bi bi-sun-fill fs-5 text-warning";
    } else {
        body.classList.remove("dark-mode");
        html.setAttribute("data-theme", "light");
        if (themeIcon) themeIcon.className = "bi bi-moon-stars fs-5 text-secondary";
    }
}

function toggleDarkMode() {
    const currentTheme = localStorage.getItem("theme") === "dark" ? "light" : "dark";
    localStorage.setItem("theme", currentTheme);
    applyTheme(currentTheme);
}

// 5. جلب الأحداث للتقويم
function loadCalendarEvents() {
    const currentLang = localStorage.getItem('language') || 'en';
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const t = translations[currentLang] || translations.en;

    return savedTasks.map(task => {
        const style = getEventTypeStyle(task.type, task.status, currentLang);
        return {
            id: task.id || Math.random().toString(),
            title: task.title || t.untitledTask,
            start: task.dueDate || new Date().toISOString().split('T')[0],
            backgroundColor: style.color,
            borderColor: 'transparent',
            textColor: '#ffffff',
            extendedProps: {
                type: task.type || 'Assignment',
                status: task.status || 'To Do'
            }
        };
    });
}

// 6. فتح المودال مع تصفية وعرض أحداث اليوم المترجمة
function openDayDetailsModal(dateStr) {
    const currentLang = localStorage.getItem('language') || 'en';
    const t = translations[currentLang] || translations.en;

    document.getElementById('selectedDateTitle').textContent = dateStr;
    document.getElementById('taskDueDate').value = dateStr;
    
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const dayEvents = savedTasks.filter(task => task.dueDate === dateStr);
    
    const eventsListContainer = document.getElementById('dayEventsList');
    eventsListContainer.innerHTML = '';

    if (dayEvents.length === 0) {
        eventsListContainer.innerHTML = `<p class="text-muted text-center py-3 m-0">${t.noEventsFound}</p>`;
    } else {
        dayEvents.forEach(event => {
            const style = getEventTypeStyle(event.type, event.status, currentLang);
            eventsListContainer.innerHTML += `
                <div class="d-flex align-items-center justify-content-between p-2 mb-2 rounded border" style="border-left: 4px solid ${style.color} !important;">
                    <div class="d-flex align-items-center gap-2">
                        <i class="bi ${style.icon} fs-5" style="color: ${style.color}"></i>
                        <div>
                            <strong class="d-block">${event.title}</strong>
                            <small class="text-muted">${style.label}</small>
                        </div>
                    </div>
                    <span class="badge" style="background-color: ${style.color}">${event.status || t.statusToDo}</span>
                </div>
            `;
        });
    }

    const modalEl = document.getElementById('dayModal');
    if (modalEl) {
        const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
        modal.show();
    }
}

// 7. التهيئة الأولى للواجهة
document.addEventListener('DOMContentLoaded', function() {
    const currentLang = localStorage.getItem('language') || 'en';
    const savedTheme = localStorage.getItem("theme") || "light";
    const calendarEl = document.getElementById('calendar');

    applyTheme(savedTheme);

    if (calendarEl) {
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            height: 'auto',
            locale: currentLang === 'ar' ? 'ar' : 'en',
            direction: currentLang === 'ar' ? 'rtl' : 'ltr',
            selectable: true,
            handleWindowResize: true,
            
            buttonText: currentLang === 'ar' ? {
                today: 'اليوم',
                month: 'شهر',
                week: 'أسبوع',
                list: 'قائمة'
            } : {
                today: 'Today',
                month: 'Month',
                week: 'Week',
                list: 'List'
            },

            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,listMonth'
            },

            events: loadCalendarEvents(),

            dateClick: function(info) {
                openDayDetailsModal(info.dateStr);
            }
        });

        calendar.render();
    }

    setLanguage(currentLang);

    const themeBtn = document.getElementById("themeToggleBtn");
    if (themeBtn) {
        themeBtn.addEventListener("click", toggleDarkMode);
    }

    // حفظ الحدث الجديد
    const quickAddForm = document.getElementById('quickAddForm');
    if (quickAddForm) {
        quickAddForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const title = document.getElementById('taskTitle').value;
            const type = document.getElementById('eventType').value;
            const dueDate = document.getElementById('taskDueDate').value;

            const newTask = {
                id: Date.now().toString(),
                title: title,
                type: type,
                dueDate: dueDate,
                status: 'To Do'
            };

            const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
            savedTasks.push(newTask);
            localStorage.setItem('tasks', JSON.stringify(savedTasks));

            if (calendar) {
                calendar.removeAllEvents();
                calendar.addEventSource(loadCalendarEvents());
            }

            openDayDetailsModal(dueDate);
            quickAddForm.reset();
        });
    }
});

window.addEventListener('resize', function() {
    if (calendar) {
        calendar.updateSize();
    }
});

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}