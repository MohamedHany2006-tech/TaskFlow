const loginForm = document.getElementById('loginForm');
const alertMessage = document.getElementById('alertMessage');

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('em').value.trim();
    const password = document.getElementById('pass').value.trim();

    // 1. جلب المستخدم المسجل من LocalStorage (من صفحة الـ Register)
    const registeredUser = JSON.parse(localStorage.getItem('registeredUser'));

    // 2. إعداد بيانات تجريبية افتراضية في حال عدم وجود حساب مسجل
    const defaultEmail = "admin@taskflow.com";
    const defaultPassword = "123";

    let isValid = false;

    // الفحص أولاً ضد الحساب المسجل، أو الحساب الافتراضي
    if (registeredUser && email === registeredUser.email && password === registeredUser.password) {
        isValid = true;
    } else if (email === defaultEmail && password === defaultPassword) {
        isValid = true;
    }

    if (isValid) {
        // حفظ حالة تسجيل الدخول
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', email);

        // التوجيه إلى الداشبورد
        window.location.href = 'dashboard.html';
    } else {
        // عرض رسالة خطأ
        alertMessage.innerText = 'The email or password is incorrect!';
        alertMessage.classList.remove('d-none');
    }
});