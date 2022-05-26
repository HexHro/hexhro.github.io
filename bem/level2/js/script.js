// Toast function
function toast({
    title = '',
    message = '',
    type = 'info',
    duration = 3000
}) {
    const main = document.getElementById('toast');
    const icons = {
        success: 'fa-circle-check',
        info: 'fa-circle-info',
        warning: 'fa-circle-exclamation',
        danger: 'fa-exclamation'
    };
    const icon = icons[type];
    const delay = (duration / 1000).toFixed(2);

    if (main) {
        const toast = document.createElement('div');

        // Auto remove toast
        const autoRemoveId = setTimeout(function () {
            main.removeChild(toast);
        }, duration + 1000)

        // Remove toast on close
        toast.onclick = function (e) {
            if (e.target.closest('.toast__close')) {
                main.removeChild(toast);
                clearTimeout(autoRemoveId);
            }
        }

        toast.classList.add('toast', `toast--${type}`);
        toast.style.animation = `slideInLeft ease .3s, fadeOut linear 1s ${delay}s forwards`;
        toast.innerHTML = `
            <div class="toast__icon">
                <i class="fa-solid ${icon}"></i>
            </div>
            <div class="toast__body">
                <h3 class="toast__title">${title}</h3>
                <p class="toast__msg">${message}</p>
            </div>
            <div class="toast__close">
                <i class="fa-solid fa-xmark"></i>
            </div>
        `;
        main.appendChild(toast);
    }
}

function showSuccessToast() {
    toast({
        title: 'Success',
        message: 'Bạn đã nâng skills thành công.',
        type: 'success',
        duration: 5000
    })
}

function showErrorToast() {
    toast({
        title: 'Error',
        message: 'Bạn đã lười trong quá trình học Tiếng Anh :(.',
        type: 'danger',
        duration: 5000
    })
}