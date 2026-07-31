// 1. القاموس للترجمات
const translations = {
    en: {
        appName: "TaskFlow",
        dashboard: "Dashboard",
        myTasks: "My Tasks",
        calendar: "Calendar",
        profile: "Profile",
        settings: "Settings",
        logout: "Logout",
        profileSettings: "Profile Settings",
        profileSubtitle: "Manage your profile information and account details.",
        editProfileTitle: "Edit Profile Information",
        profilePicture: "Profile Picture",
        username: "Username",
        emailAddress: "Email Address",
        occupation: "Occupation",
        country: "Country",
        phone: "Phone Number",
        bio: "Bio",
        saveChanges: "Save Changes",
        total: "Total",
        pending: "Pending",
        done: "Done",
        completionRate: "Completion Rate",
        successSave: "Profile updated successfully!",
        bioPlaceholder: "Tell us about yourself...",
        defaultBio: "No bio added yet.",
        defaultOccupation: "User",
        defaultName: "New User",
        noData: "-"
    },
    ar: {
        appName: "تاسك فلو",
        dashboard: "لوحة التحكم",
        myTasks: "مهامي",
        calendar: "التقويم",
        profile: "الملف الشخصي",
        settings: "الإعدادات",
        logout: "تسجيل الخروج",
        profileSettings: "إعدادات الملف الشخصي",
        profileSubtitle: "إدارة معلومات ملفك الشخصي وتفاصيل حسابك.",
        editProfileTitle: "تعديل معلومات الملف الشخصي",
        profilePicture: "الصورة الشخصية",
        username: "اسم المستخدم",
        emailAddress: "البريد الإلكتروني",
        occupation: "المهنة / الوظيفة",
        country: "الدولة",
        phone: "رقم الهاتف",
        bio: "النبذة الشخصية (Bio)",
        saveChanges: "حفظ التغييرات",
        total: "الإجمالي",
        pending: "معلقة",
        done: "مكتملة",
        completionRate: "نسبة الإنجاز",
        successSave: "تم تحديث الملف الشخصي بنجاح!",
        bioPlaceholder: "اكتب نبذة قصيرة عن نفسك...",
        defaultBio: "لا توجد نبذة شخصية بعد.",
        defaultOccupation: "مستخدم",
        defaultName: "مستخدم جديد",
        noData: "-"
    }
};

const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%236c757d' class='bi bi-person-circle' viewBox='0 0 16 16'><path d='M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z'/><path fill-rule='evenodd' d='M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z'/></svg>";

let currentUser = JSON.parse(localStorage.getItem('currentUser')) || {
    username: '',
    email: '',
    occupation: '',
    country: '',
    phone: '',
    bio: '',
    avatar: ''
};

// 2. تطبيق اللغة
function setLanguage(lang) {
    const htmlTag = document.documentElement;
    const bootstrapCss = document.getElementById('bootstrapCss');
    const langBtnText = document.getElementById('langBtnText');
    
    if (lang === 'ar') {
        htmlTag.setAttribute('lang', 'ar');
        htmlTag.setAttribute('dir', 'rtl');
        if (bootstrapCss) bootstrapCss.setAttribute('href', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css');
        if (langBtnText) langBtnText.textContent = 'English';
    } else {
        htmlTag.setAttribute('lang', 'en');
        htmlTag.setAttribute('dir', 'ltr');
        if (bootstrapCss) bootstrapCss.setAttribute('href', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
        if (langBtnText) langBtnText.textContent = 'العربية';
    }

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    const bioInput = document.getElementById('editBio');
    if (bioInput && translations[lang]) {
        bioInput.placeholder = translations[lang].bioPlaceholder;
    }

    localStorage.setItem('language', lang);
    loadProfileData();
}

// 3. تحميل واستعراض بيانات البروفايل بأمان
function loadProfileData() {
    const currentLang = localStorage.getItem('language') || 'en';
    const t = translations[currentLang] || translations.en;

    const setElText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    setElText('profileDisplayName', (currentUser.username && currentUser.username.trim()) ? currentUser.username : t.defaultName);
    setElText('profileDisplayOccupation', (currentUser.occupation && currentUser.occupation.trim()) ? currentUser.occupation : t.defaultOccupation);
    setElText('profileDisplayBio', (currentUser.bio && currentUser.bio.trim()) ? currentUser.bio : t.defaultBio);
    setElText('profileDisplayCountry', (currentUser.country && currentUser.country.trim()) ? currentUser.country : t.noData);
    setElText('profileDisplayPhone', (currentUser.phone && currentUser.phone.trim()) ? currentUser.phone : t.noData);

    const avatarImg = document.getElementById('profileImage');
    const removeBtn = document.getElementById('removeAvatarBtn');
    
    if (avatarImg) {
        if (currentUser.avatar && currentUser.avatar.trim() !== '' && !currentUser.avatar.includes('via.placeholder.com')) {
            avatarImg.src = currentUser.avatar;
            if (removeBtn) {
                removeBtn.classList.remove('d-none');
                removeBtn.classList.add('d-flex');
            }
        } else {
            avatarImg.src = DEFAULT_AVATAR;
            if (removeBtn) {
                removeBtn.classList.add('d-none');
                removeBtn.classList.remove('d-flex');
            }
        }
    }

    const setInputValue = (id, val) => {
        const input = document.getElementById(id);
        if (input) input.value = val || '';
    };

    setInputValue('editUsername', currentUser.username);
    setInputValue('editEmail', currentUser.email);
    setInputValue('editOccupation', currentUser.occupation);
    setInputValue('editCountry', currentUser.country);
    setInputValue('editPhone', currentUser.phone);
    setInputValue('editBio', currentUser.bio);

    calculateTaskStats();
}

// 4. حساب إحصائيات المهام
function calculateTaskStats() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const total = savedTasks.length;
    const done = savedTasks.filter(t => t.status === 'Completed' || t.status === 'مكتملة').length;
    const pending = total - done;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;

    const setElText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    setElText('userTotalTasks', total);
    setElText('userPendingTasks', pending);
    setElText('userCompletedTasks', done);
    setElText('completionRateText', `${rate}%`);

    const progressBar = document.getElementById('completionProgressBar');
    if (progressBar) {
        progressBar.style.width = `${rate}%`;
        progressBar.setAttribute('aria-valuenow', rate);
    }
}

// 5. إدارة الثيم
function initTheme() {
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;

    let currentTheme = localStorage.getItem('theme') || 'light';
    
    function applyTheme(theme) {
        if (theme === 'dark') {
            html.classList.add('dark-mode');
            if (themeIcon) themeIcon.className = 'bi bi-sun-fill fs-5 text-warning';
        } else {
            html.classList.remove('dark-mode');
            if (themeIcon) themeIcon.className = 'bi bi-moon-stars fs-5 text-secondary';
        }
    }

    applyTheme(currentTheme);

    if (themeToggleBtn) {
        themeToggleBtn.onclick = function() {
            let activeTheme = localStorage.getItem('theme') || 'light';
            let newTheme = activeTheme === 'dark' ? 'light' : 'dark';
            
            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        };
    }
}

// 6. عند تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    const currentLang = localStorage.getItem('language') || 'en';
    
    initTheme();
    setLanguage(currentLang);

    // رفع الصورة الشخصية
    const avatarInput = document.getElementById('editAvatarInput');
    if (avatarInput) {
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    currentUser.avatar = event.target.result;
                    const img = document.getElementById('profileImage');
                    if (img) img.src = event.target.result;
                    
                    const removeBtn = document.getElementById('removeAvatarBtn');
                    if (removeBtn) {
                        removeBtn.classList.remove('d-none');
                        removeBtn.classList.add('d-flex');
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // حذف الصورة الشخصية
    const removeAvatarBtn = document.getElementById('removeAvatarBtn');
    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener('click', function() {
            currentUser.avatar = '';
            const img = document.getElementById('profileImage');
            if (img) img.src = DEFAULT_AVATAR;
            
            removeAvatarBtn.classList.add('d-none');
            removeAvatarBtn.classList.remove('d-flex');
            
            const input = document.getElementById('editAvatarInput');
            if (input) input.value = '';
        });
    }

    // حفظ النموذج
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();

            currentUser.username = document.getElementById('editUsername')?.value || '';
            currentUser.email = document.getElementById('editEmail')?.value || '';
            currentUser.occupation = document.getElementById('editOccupation')?.value || '';
            currentUser.country = document.getElementById('editCountry')?.value || '';
            currentUser.phone = document.getElementById('editPhone')?.value || '';
            currentUser.bio = document.getElementById('editBio')?.value || '';

            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            const alert = document.getElementById('profileAlert');
            if (alert) {
                const lang = localStorage.getItem('language') || 'en';
                alert.className = 'alert alert-success d-block';
                alert.textContent = translations[lang].successSave;

                setTimeout(() => {
                    alert.className = 'alert d-none';
                }, 3000);
            }

            loadProfileData();
        });
    }
});

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}