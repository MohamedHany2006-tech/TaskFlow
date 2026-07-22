const registerForm = document.getElementById('registerForm');
const alertMessage = document.getElementById('alertMessage');

registerForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('regUsername').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const confirmPassword = document.getElementById('regConfirmPassword').value.trim();

    // 1. الفحص: هل كلمتا السر متطابقتان؟
    if (password !== confirmPassword) {
        alertMessage.className = 'alert alert-danger';
        alertMessage.innerText = 'كلمتا السر غير متطابقتين!';
        alertMessage.classList.remove('d-none');
        return;
    }

    // 2. الفحص: طول كلمة السر
    if (password.length < 4) {
        alertMessage.className = 'alert alert-warning';
        alertMessage.innerText = 'كلمة السر يجب أن تكون 4 خانات على الأقل.';
        alertMessage.classList.remove('d-none');
        return;
    }

    // 3. حفظ بيانات المستخدم الجديد في LocalStorage
    const userObj = {
        username: username,
        email: email,
        password: password
    };

    localStorage.setItem('registeredUser', JSON.stringify(userObj));

    // 4. إظهار رسالة نجاح والتحويل لصفحة اللوجن
    alertMessage.className = 'alert alert-success';
    alertMessage.innerText = 'Account created successfully!';
    alertMessage.classList.remove('d-none');

    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1500);
});