document.addEventListener('DOMContentLoaded', loadSettings);

function loadSettings() {
    const isDarkMode = localStorage.getItem('theme') === 'dark';
    const isReminders = localStorage.getItem('taskReminders') !== 'false';
    const isSound = localStorage.getItem('soundEffects') === 'true';

    const darkModeToggle = document.getElementById('darkModeToggle');
    const taskRemindersToggle = document.getElementById('taskRemindersToggle');
    const soundToggle = document.getElementById('soundToggle');

    if (darkModeToggle) darkModeToggle.checked = isDarkMode;
    if (taskRemindersToggle) taskRemindersToggle.checked = isReminders;
    if (soundToggle) soundToggle.checked = isSound;

    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', (e) => {
            applyTheme(e.target.checked);
        });
    }
}

function saveSettings() {
    const isDarkMode = document.getElementById('darkModeToggle').checked;
    const isReminders = document.getElementById('taskRemindersToggle').checked;
    const isSound = document.getElementById('soundToggle').checked;

    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('taskReminders', isReminders);
    localStorage.setItem('soundEffects', isSound);

    applyTheme(isDarkMode);

    const alertBox = document.getElementById('settingsAlert');
    alertBox.className = 'alert alert-success';
    alertBox.innerText = 'Settings saved successfully!';
    alertBox.classList.remove('d-none');

    setTimeout(() => {
        alertBox.classList.add('d-none');
    }, 2500);
}

function applyTheme(isDark) {
    if (isDark) {
        document.body.classList.add('bg-dark', 'text-light');
    } else {
        document.body.classList.remove('bg-dark', 'text-light');
    }
}

function clearAllData() {
    if (confirm("Are you sure you want to delete all tasks? This action cannot be reversed!")) {
        localStorage.removeItem('tasks');
        
        const alertBox = document.getElementById('settingsAlert');
        alertBox.className = 'alert alert-warning';
        alertBox.innerText = 'All task data has been cleared!';
        alertBox.classList.remove('d-none');

        setTimeout(() => {
            alertBox.classList.add('d-none');
        }, 3000);
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}