// تطبيق الثيم المكتوب في LocalStorage فور تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    const currentTheme = localStorage.getItem('theme') || 'light';
    applyTheme(currentTheme === 'dark');
});

function toggleDarkMode(isDark) {
    const theme = isDark ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
    applyTheme(isDark);
}

function applyTheme(isDark) {
    if (isDark) {
        document.body.classList.add('bg-dark', 'text-light');
        document.querySelectorAll('.card').forEach(c => c.classList.add('bg-dark', 'text-light', 'border-secondary'));
    } else {
        document.body.classList.remove('bg-dark', 'text-light');
        document.querySelectorAll('.card').forEach(c => c.classList.remove('bg-dark', 'text-light', 'border-secondary'));
    }
}