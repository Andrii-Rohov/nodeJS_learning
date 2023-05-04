export const hideAlert = () => {
    const element = document.querySelector('.alert');
    if (element) element.parentElement.removeChild(element);
};

export const showAlert = (type, msg) => {
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    const body = document.querySelector('body')
    body.insertAdjacentHTML('afterbegin', markup);
    window.setTimeout(() => {
        hideAlert()
    }, 5000)
}