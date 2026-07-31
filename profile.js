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

// SVG افتراضي متناسق مع المظهر الداكن والفاتح بدلاً من الرابط المكسور
const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%236c757d' class='bi bi-person-circle' viewBox='0 0 16 16'><path d='M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0z'/><path fill-rule='evenodd' d='M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1z'/></svg>";

// تهيئة البيانات بدون أي قيم وهمية (John Doe)
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
    
    if (lang === 'ar') {
        htmlTag.setAttribute('lang', 'ar');
        htmlTag.setAttribute('dir', 'rtl');
        if (bootstrapCss) bootstrapCss.setAttribute('href', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.rtl.min.css');
    } else {
        htmlTag.setAttribute('lang', 'en');
        htmlTag.setAttribute('dir', 'ltr');
        if (bootstrapCss) bootstrapCss.setAttribute('href', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css');
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
}

// 3. تحميل واستعراض بيانات البروفايل
function loadProfileData() {
    const currentLang = localStorage.getItem('language') || 'en';
    const t = translations[currentLang] || translations.en;

    // عرض بيانات الكارت الجانبي مع حماية من القيم الفارغة
    document.getElementById('profileDisplayName').textContent = currentUser.username.trim() !== '' ? currentUser.username : t.defaultName;
    document.getElementById('profileDisplayOccupation').textContent = currentUser.occupation.trim() !== '' ? currentUser.occupation : t.defaultOccupation;
    document.getElementById('profileDisplayBio').textContent = currentUser.bio.trim() !== '' ? currentUser.bio : t.defaultBio;
    document.getElementById('profileDisplayCountry').textContent = currentUser.country.trim() !== '' ? currentUser.country : t.noData;
    document.getElementById('profileDisplayPhone').textContent = currentUser.phone.trim() !== '' ? currentUser.phone : t.noData;

    const avatarImg = document.getElementById('profileImage');
    const removeBtn = document.getElementById('removeAvatarBtn');
    
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

    // تعبئة النموذج لتسهيل التعديل
    document.getElementById('editUsername').value = currentUser.username || '';
    document.getElementById('editEmail').value = currentUser.email || '';
    document.getElementById('editOccupation').value = currentUser.occupation || '';
    document.getElementById('editCountry').value = currentUser.country || '';
    document.getElementById('editPhone').value = currentUser.phone || '';
    document.getElementById('editBio').value = currentUser.bio || '';

    // حساب إحصائيات المهام
    calculateTaskStats();
}

// 4. حساب نسبة إنجاز المهام
function calculateTaskStats() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const total = savedTasks.length;
    const done = savedTasks.filter(t => t.status === 'Completed' || t.status === 'مكتملة').length;
    const pending = total - done;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;

    document.getElementById('userTotalTasks').textContent = total;
    document.getElementById('userPendingTasks').textContent = pending;
    document.getElementById('userCompletedTasks').textContent = done;
    document.getElementById('completionRateText').textContent = `${rate}%`;

    const progressBar = document.getElementById('completionProgressBar');
    if (progressBar) {
        progressBar.style.width = `${rate}%`;
        progressBar.setAttribute('aria-valuenow', rate);
    }
}

// 5. عند بدء التحميل
document.addEventListener('DOMContentLoaded', function() {
    const currentLang = localStorage.getItem('language') || 'en';
    setLanguage(currentLang);
    loadProfileData();

    // رفع الصورة الشخصية
    const avatarInput = document.getElementById('editAvatarInput');
    if (avatarInput) {
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    currentUser.avatar = event.target.result;
                    document.getElementById('profileImage').src = event.target.result;
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
            document.getElementById('profileImage').src = DEFAULT_AVATAR;
            removeAvatarBtn.classList.add('d-none');
            removeAvatarBtn.classList.remove('d-flex');
            document.getElementById('editAvatarInput').value = '';
        });
    }

    // حفظ نموذج البيانات
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();

            currentUser.username = document.getElementById('editUsername').value;
            currentUser.email = document.getElementById('editEmail').value;
            currentUser.occupation = document.getElementById('editOccupation').value;
            currentUser.country = document.getElementById('editCountry').value;
            currentUser.phone = document.getElementById('editPhone').value;
            currentUser.bio = document.getElementById('editBio').value;

            // حفظ البيانات بالـ LocalStorage
            localStorage.setItem('currentUser', JSON.stringify(currentUser));

            // إظهار تنبيه النجاح
            const alert = document.getElementById('profileAlert');
            const lang = localStorage.getItem('language') || 'en';
            alert.className = 'alert alert-success d-block';
            alert.textContent = translations[lang].successSave;

            setTimeout(() => {
                alert.className = 'alert d-none';
            }, 3000);

            // تحديث الواجهة
            loadProfileData();
        });
    }
});

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}