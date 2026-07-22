document.addEventListener("DOMContentLoaded", () => {
    const darkModeToggle = document.getElementById("darkModeToggle");
    const savedTheme = localStorage.getItem("theme");

    // 1. عند فتح أي صفحة: التحقق من التفضيل المحفوظ وتطبقه
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        if (darkModeToggle) {
            darkModeToggle.checked = true; // تفعيل السويتش لو كنا في صفحة Settings
        }
    }

    // 2. عند التبديل من صفحة Settings
    if (darkModeToggle) {
        darkModeToggle.addEventListener("change", () => {
            if (darkModeToggle.checked) {
                document.body.classList.add("dark-mode");
                localStorage.setItem("theme", "dark");
            } else {
                document.body.classList.remove("dark-mode");
                localStorage.setItem("theme", "light");
            }
        });
    }
});