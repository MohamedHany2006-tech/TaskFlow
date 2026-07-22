document.addEventListener('DOMContentLoaded', loadProfileData);

function loadProfileData() {
    // 1. تحميل بيانات المستخدم من LocalStorage
    let registeredUser = JSON.parse(localStorage.getItem('registeredUser')) || {
        username: 'Admin User',
        email: localStorage.getItem('currentUser') || 'admin@taskflow.com',
        password: '123'
    };

    // تعبئة البيانات في الواجهة والنموذج
    document.getElementById('editUsername').value = registeredUser.username || '';
    document.getElementById('editEmail').value = registeredUser.email || '';
    
    document.getElementById('profileDisplayName').innerText = registeredUser.username || 'User';
    document.getElementById('profileDisplayEmail').innerText = registeredUser.email || '';
    
    // حرف الصورة الرمزية (Avatar)
    const initial = (registeredUser.username || 'U').charAt(0).toUpperCase();
    document.getElementById('avatarInitial').innerText = initial;

    // 2. تحميل إحصائيات المهام الخاصة بالمستخدم
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    document.getElementById('userTotalTasks').innerText = tasks.length;
    document.getElementById('userCompletedTasks').innerText = tasks.filter(t => t.status === 'Completed').length;
}

// حفظ البيانات المعدلة
document.getElementById('profileForm').addEventListener('submit', function(e) {
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

    // تحديث البيانات في LocalStorage
    localStorage.setItem('registeredUser', JSON.stringify(registeredUser));
    localStorage.setItem('currentUser', email);

    // إظهار تنبيه النجاح
    const alertBox = document.getElementById('profileAlert');
    alertBox.className = 'alert alert-success';
    alertBox.innerText = 'Profile updated successfully!';
    alertBox.classList.remove('d-none');

    // إعادة إعراض البيانات المحدثة
    loadProfileData();

    // إخفاء التنبيه بعد 3 ثواني
    setTimeout(() => {
        alertBox.classList.add('d-none');
    }, 3000);
});

// دالة تسجيل الخروج
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}