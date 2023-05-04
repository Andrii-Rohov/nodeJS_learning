import '@babel/polyfill';
import {logout, login} from './login';
import {updateData, updateMyPassword} from "./updateSettings"

const loginForm = document.querySelector(".form--login");
const passwordUpdateForm = document.querySelector('.form-user-password');
const logOutButton = document.querySelector('.nav__el--logout');
const updateSettingsForm = document.querySelector(".js-update-account");


if (loginForm) {
    loginForm.addEventListener('submit', (event)=> {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if (logOutButton) {
    logOutButton.addEventListener('click', (event) => {
        event.preventDefault();
        logout();
        window.setTimeout(()=> {
            location.assign('/');
        }, 1000)
    })
}
if (updateSettingsForm) {
    updateSettingsForm.addEventListener('submit', (event)=> {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;

        updateData({email, name}, "settings");
    })
}

if (passwordUpdateForm) {
    passwordUpdateForm.addEventListener('submit', async (event)=> {
        event.preventDefault();
        document.querySelector(".js-save-password-button").innerText = "Updating..."
        const oldPassword = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;

        await updateData({oldPassword, password, passwordConfirm}, "password");

        document.querySelector(".js-save-password-button").innerText = "Save Password"
        document.getElementById('password-current').value = "";
        document.getElementById('password').value = "";
        document.getElementById('password-confirm').value = "";
    })
}
