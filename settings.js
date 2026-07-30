// مصفوفة الترجمة المدمجة لمنع أي تعارض أو ملفات ناقصة
const translations = {
    en: {
        appName: "TaskFlow",
        dashboard: "Dashboard",
        myTasks: "My Tasks",
        calendar: "Calendar",
        profile: "Profile",
        settings: "Settings",
        logout: "Logout",
        settingsSubtitle: "Preferences and app configurations.",
        appearanceTitle: "Appearance & Language",
        darkMode: "Dark Mode",
        darkModeDesc: "Enable dark theme for the interface.",
        language: "Language",
        languageDesc: "Select your preferred app language.",
        notificationsTitle: "Notifications",
        taskReminders: "Task Reminders",
        taskRemindersDesc: "Receive alerts for upcoming and overdue tasks.",
        soundEffects: "Sound Effects",
        soundEffectsDesc: "Play sound when completing a task.",
        securityTitle: "Password & Security",
        currentPassword: "Current Password",
        newPassword: "New Password",
        confirmPassword: "Confirm New Password",
        updatePasswordBtn: "Update Password",
        phCurrentPassword: "Enter current password",
        phNewPassword: "Enter new password",
        phConfirmPassword: "Confirm new password",
        dangerZoneTitle: "Danger Zone",
        dangerZoneDesc: "Irreversible actions regarding your data and account.",
        clearDataBtn: "Clear All Tasks Data",
        deleteAccountBtn: "Delete Account",
        saveSettingsBtn: "Save Settings",
        alertSaved: "Settings saved successfully!",
        alertPasswordEmpty: "Please fill in all password fields.",
        alertPasswordMismatch: "Passwords do not match!",
        alertPasswordShort: "Password must be at least 6 characters.",
        alertPasswordSuccess: "Password updated successfully!",
        confirmClearData: "Are you sure you want to clear all data?",
        alertDataCleared: "Data cleared!",
        confirmDeleteAccount: "Are you sure you want to delete your account?",
        alertAccountDeleted: "Account deleted."
    },
    ar: {
        appName: "تاسك فلو",
        dashboard: "لوحة التحكم",
        myTasks: "مهامي",
        calendar: "التقويم",
        profile: "الملف الشخصي",
        settings: "الإعدادات",
        logout: "تسجيل الخروج",
        settingsSubtitle: "تفضيلات وإعدادات التطبيق.",
        appearanceTitle: "المظهر واللغة",
        darkMode: "الوضع الداكن",
        darkModeDesc: "تفعيل المظهر الداكن للواجهة.",
        language: "اللغة",
        languageDesc: "اختر لغتك المفضلة للتطبيق.",
        notificationsTitle: "الإشعارات",
        taskReminders: "تذكيرات المهام",
        taskRemindersDesc: "تلقي تنبيهات للمهام القادمة والمتأخرة.",
        soundEffects: "المؤثرات الصوتية",
        soundEffectsDesc: "تشغيل صوت عند إكمال المهمة.",
        securityTitle: "كلمة المرور والأمان",
        currentPassword: "كلمة المرور الحالية",
        newPassword: "كلمة المرور الجديدة",
        confirmPassword: "تأكيد كلمة المرور الجديدة",
        updatePasswordBtn: "تحديث كلمة المرور",
        phCurrentPassword: "أدخل كلمة المرور الحالية",
        phNewPassword: "أدخل كلمة المرور الجديدة",
        phConfirmPassword: "تأكيد كلمة المرور الجديدة",
        dangerZoneTitle: "منطقة الخطر",
        dangerZoneDesc: "إجراءات لا يمكن التراجع عنها بشأن بياناتك وحسابك.",
        clearDataBtn: "مسح جميع بيانات المهام",
        deleteAccountBtn: "حذف الحساب",
        saveSettingsBtn: "حفظ الإعدادات",
        alertSaved: "تم حفظ الإعدادات بنجاح!",
        alertPasswordEmpty: "يرجى ملء جميع حقول كلمة المرور.",
        alertPasswordMismatch: "كلمات المرور غير متطابقة!",
        alertPasswordShort: "يجب أن تكون كلمة المرور 6 أحرف على الأقل.",
        alertPasswordSuccess: "تم تحديث كلمة المرور بنجاح!",
        confirmClearData: "هل أنت تأكد من مسح جميع البيانات؟",
        alertDataCleared: "تم مسح البيانات!",
        confirmDeleteAccount: "هل أنت متأكد من حذف الحساب نهائياً؟",
        alertAccountDeleted: "تم حذف الحساب."
    }
};

document.addEventListener('DOMContentLoaded', loadSettings);

function loadSettings() {
    const isDarkMode = localStorage.getItem('theme') === 'dark';
    const isReminders = localStorage.getItem('taskReminders') !== 'false';
    const isSound = localStorage.getItem('soundEffects') === 'true';
    const currentLang = localStorage.getItem('language') || 'en';

    const darkModeToggle = document.getElementById('darkModeToggle');
    const taskRemindersToggle = document.getElementById('taskRemindersToggle');
    const soundToggle = document.getElementById('soundToggle');
    const languageSelect = document.getElementById('languageSelect');

    if (darkModeToggle) darkModeToggle.checked = isDarkMode;
    if (taskRemindersToggle) taskRemindersToggle.checked = isReminders;
    if (soundToggle) soundToggle.checked = isSound;
    if (languageSelect) languageSelect.value = currentLang;

    // تطبيق الثيم والاتجاه فور التحميل
    applyTheme(isDarkMode);
    setLanguage(currentLang);

    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            applyTheme(e.target.checked);
        });
    }

    if (languageSelect) {
        languageSelect.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }
}

function setLanguage(lang) {
    const htmlTag = document.documentElement;
    const bootstrapCss = document.getElementById('bootstrapCss');
    
    // 1. تحويل الاتجاه وBootstrap RTL
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

    // 2. ترجمة جميع عناصر الصفحة فوراً
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    // 3. ترجمة الـ Placeholders داخل الـ Inputs
    document.querySelectorAll('[data-i18n-ph]').forEach(element => {
        const key = element.getAttribute('data-i18n-ph');
        if (translations[lang] && translations[lang][key]) {
            element.setAttribute('placeholder', translations[lang][key]);
        }
    });

    localStorage.setItem('language', lang);
}

function saveSettings() {
    const isDarkMode = document.getElementById('darkModeToggle').checked;
    const isReminders = document.getElementById('taskRemindersToggle').checked;
    const isSound = document.getElementById('soundToggle').checked;
    const selectedLang = document.getElementById('languageSelect').value;

    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('taskReminders', isReminders);
    localStorage.setItem('soundEffects', isSound);
    
    setLanguage(selectedLang);
    applyTheme(isDarkMode);

    showAlert(translations[selectedLang].alertSaved, 'success');
}

function updatePassword() {
    const lang = localStorage.getItem('language') || 'en';
    const currentPassword = document.getElementById('currentPassword').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
        showAlert(translations[lang].alertPasswordEmpty, 'danger');
        return;
    }

    if (newPassword !== confirmPassword) {
        showAlert(translations[lang].alertPasswordMismatch, 'danger');
        return;
    }

    if (newPassword.length < 6) {
        showAlert(translations[lang].alertPasswordShort, 'danger');
        return;
    }

    showAlert(translations[lang].alertPasswordSuccess, 'success');
    document.getElementById('passwordForm').reset();
}

function applyTheme(isDark) {
    if (isDark) {
        document.body.classList.add('bg-dark', 'text-light');
        document.documentElement.classList.add('dark-mode');
    } else {
        document.body.classList.remove('bg-dark', 'text-light');
        document.documentElement.classList.remove('dark-mode');
    }
}

function clearAllData() {
    const lang = localStorage.getItem('language') || 'en';
    if (confirm(translations[lang].confirmClearData)) {
        localStorage.removeItem('tasks');
        showAlert(translations[lang].alertDataCleared, 'warning');
    }
}

function deleteAccount() {
    const lang = localStorage.getItem('language') || 'en';
    if (confirm(translations[lang].confirmDeleteAccount)) {
        localStorage.clear();
        alert(translations[lang].alertAccountDeleted);
        window.location.href = 'index.html';
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function showAlert(message, type = 'success', duration = 3000) {
    const alertBox = document.getElementById('settingsAlert');
    if (!alertBox) return;

    alertBox.className = `alert alert-${type}`;
    alertBox.innerText = message;
    alertBox.classList.remove('d-none');

    setTimeout(() => {
        alertBox.classList.add('d-none');
    }, duration);
}