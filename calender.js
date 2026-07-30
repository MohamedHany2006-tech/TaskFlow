// 1. ترجمات عناصر واجهة التقويم
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
        noNotifications: "No new notifications"
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
        noNotifications: "لا توجد إشعارات جديدة"
    }
};

let calendar; // متغير عام لتفادي مشاكل النطاق

// 2. دالة تطبيق اللغة والاتجاه والترجمة
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

    // ترجمة العناصر
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    localStorage.setItem('language', lang);
}

// 3. تهيئة التقويم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    const currentLang = localStorage.getItem('language') || 'en';
    setLanguage(currentLang);

    const calendarEl = document.getElementById('calendar');

    // جلب المهام من localStorage
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const calendarEvents = savedTasks.map(function(task) {
        return {
            title: task.title,
            start: task.dueDate || new Date().toISOString().split('T')[0],
            backgroundColor: task.status === 'Completed' ? '#10b981' : (task.status === 'In Progress' ? '#3b82f6' : '#f59e0b'),
            borderColor: 'transparent'
        };
    });

    // تهيئة التقويم مع دعم الترجمة ونصوص الأزرار
    if (calendarEl) {
        calendar = new FullCalendar.Calendar(calendarEl, {
            initialView: 'dayGridMonth',
            locale: currentLang === 'ar' ? 'ar' : 'en',
            direction: currentLang === 'ar' ? 'rtl' : 'ltr',
            
            // 🔹 ترجمة نصوص الأزرار (Today, Month, Week, List)
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
            events: calendarEvents,
            height: 'auto'
        });

        calendar.render();
    }
});

// ضبط تحديث حجم التقويم عند تغيير حجم الشاشة
window.addEventListener('resize', function() {
    if (calendar) {
        calendar.updateSize();
    }
});

// دالة تسجيل الخروج
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}