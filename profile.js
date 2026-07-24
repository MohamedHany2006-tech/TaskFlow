document.addEventListener('DOMContentLoaded', () => {
    // 1. تحميل البيانات أول ما الصفحة تفتح
    loadUserProfile();
    calculateTaskStats();

    // 2. التعامل مع رفع صورة جديدة
    const editAvatarInput = document.getElementById('editAvatarInput');
    if (editAvatarInput) {
        editAvatarInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    const base64Image = event.target.result;
                    const profileImage = document.getElementById('profileImage');
                    if (profileImage) profileImage.src = base64Image;

                    localStorage.setItem('userAvatar', base64Image);
                    toggleRemoveAvatarBtn(true);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 3. التعامل مع حذف الصورة وإعادتها للافتراضية
    const removeAvatarBtn = document.getElementById('removeAvatarBtn');
    const removeAvatarBtnInput = document.getElementById('removeAvatarBtnInput');

    if (removeAvatarBtn) removeAvatarBtn.addEventListener('click', handleRemoveAvatar);
    if (removeAvatarBtnInput) removeAvatarBtnInput.addEventListener('click', handleRemoveAvatar);

    // 4. حفظ بيانات البروفايل عند حفظ التعديلات
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const username = document.getElementById('editUsername').value.trim();
            const email = document.getElementById('editEmail').value.trim();
            const newPassword = document.getElementById('editPassword').value.trim();

            let registeredUser = JSON.parse(localStorage.getItem('registeredUser')) || {};

            registeredUser.username = username;
            registeredUser.email = email;
            if (newPassword !== "") {
                registeredUser.password = newPassword;
            }

            // حفظ في Storage تحت نفس التسميات الموحدة
            localStorage.setItem('registeredUser', JSON.stringify(registeredUser));
            localStorage.setItem('username', username);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('currentUser', email);

            // تحديث العناصر في الواجهة
            const profileDisplayName = document.getElementById('profileDisplayName');
            const profileDisplayEmail = document.getElementById('profileDisplayEmail');
            if (profileDisplayName) profileDisplayName.textContent = username;
            if (profileDisplayEmail) profileDisplayEmail.textContent = email;

            // تحديث الأيادي الرمزية للـ Avatar إذا كانت مستخدمة
            const avatarInitial = document.getElementById('avatarInitial');
            if (avatarInitial) {
                avatarInitial.textContent = (username || 'U').charAt(0).toUpperCase();
            }

            showAlert('Profile updated successfully!', 'success');
        });
    }
});

// === دالة تحميل بيانات البروفايل والصورة ===
function loadUserProfile() {
    const DEFAULT_AVATAR = 'https://via.placeholder.com/100';

    // القراءة من الـ Storage مع دعم الصيغتين لتجنب المشاكل
    let registeredUser = JSON.parse(localStorage.getItem('registeredUser')) || {};
    const username = localStorage.getItem('username') || registeredUser.username || 'User Name';
    const email = localStorage.getItem('userEmail') || registeredUser.email || localStorage.getItem('currentUser') || 'user@example.com';
    const avatar = localStorage.getItem('userAvatar') || DEFAULT_AVATAR;

    // تعبئة عناصر الصفحة
    const editUsername = document.getElementById('editUsername');
    const editEmail = document.getElementById('editEmail');
    const profileDisplayName = document.getElementById('profileDisplayName');
    const profileDisplayEmail = document.getElementById('profileDisplayEmail');
    const profileImage = document.getElementById('profileImage');
    const avatarInitial = document.getElementById('avatarInitial');

    if (editUsername) editUsername.value = username;
    if (editEmail) editEmail.value = email;
    if (profileDisplayName) profileDisplayName.textContent = username;
    if (profileDisplayEmail) profileDisplayEmail.textContent = email;
    if (profileImage) profileImage.src = avatar;

    if (avatarInitial) {
        avatarInitial.textContent = (username || 'U').charAt(0).toUpperCase();
    }

    toggleRemoveAvatarBtn(avatar !== DEFAULT_AVATAR);
}

// === دالة إزالة الصورة الشخصية ===
function handleRemoveAvatar() {
    const DEFAULT_AVATAR = 'https://via.placeholder.com/100';
    const profileImage = document.getElementById('profileImage');
    const editAvatarInput = document.getElementById('editAvatarInput');

    if (profileImage) profileImage.src = DEFAULT_AVATAR;
    localStorage.removeItem('userAvatar');
    if (editAvatarInput) editAvatarInput.value = '';

    toggleRemoveAvatarBtn(false);
}

// === دالة إظهار/إخفاء أزرار الحذف ===
function toggleRemoveAvatarBtn(show) {
    const removeAvatarBtn = document.getElementById('removeAvatarBtn');
    const removeAvatarBtnInput = document.getElementById('removeAvatarBtnInput');

    if (removeAvatarBtn) {
        removeAvatarBtn.classList.toggle('d-none', !show);
    }
    if (removeAvatarBtnInput) {
        removeAvatarBtnInput.classList.toggle('d-none', !show);
    }
}

// === دالة حساب نسبة الإنجاز والإحصائيات دليلياً الديناميكية ===
function calculateTaskStats() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    const totalTasks = tasks.length;
    let pendingCount = 0;
    let completedCount = 0;

    tasks.forEach(task => {
        if (task.status === 'Completed') {
            completedCount++;
        } else {
            pendingCount++;
        }
    });

    // حساب النسبة المئوية وتجنب القسمة على صفر (NaN)
    const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    // تحديث الإحصائيات والأرقام
    const userTotalTasks = document.getElementById('userTotalTasks');
    const userPendingTasks = document.getElementById('userPendingTasks');
    const userCompletedTasks = document.getElementById('userCompletedTasks');

    if (userTotalTasks) userTotalTasks.textContent = totalTasks;
    if (userPendingTasks) userPendingTasks.textContent = pendingCount;
    if (userCompletedTasks) userCompletedTasks.textContent = completedCount;

    // تحديث شريط التقدم والنسبة
    const completionRateText = document.getElementById('completionRateText');
    const completionProgressBar = document.getElementById('completionProgressBar');

    if (completionRateText) completionRateText.textContent = `${completionRate}%`;
    if (completionProgressBar) {
        completionProgressBar.style.width = `${completionRate}%`;
        completionProgressBar.setAttribute('aria-valuenow', completionRate);
    }
}

// === دالة إظهار التنبيهات ===
function showAlert(message, type = 'success') {
    const alertEl = document.getElementById('profileAlert');
    if (alertEl) {
        alertEl.className = `alert alert-${type}`;
        alertEl.textContent = message;
        alertEl.classList.remove('d-none');

        setTimeout(() => {
            alertEl.classList.add('d-none');
        }, 3000);
    }
}

// === دالة تسجيل الخروج ===
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}