import axios from 'axios';
import {showAlert} from './alerts'

export const logout = async () => {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/v1/users/logout', {
            method: "GET"
        })
        if (response.ok) {
            showAlert('success', "Logged out successfully")
            window.setTimeout(()=> {
                location.assign('/');
            }, 1000)
        } else {
            showAlert('error', response.statusText);
        }
    } catch(error){
        showAlert('error', response.sattusText);
    }

    return;
}

export const login = async (email, password) => {
    try {

        // const response = await axios({
        //     method: "POST",
        //     url: "http://127.0.0.1:3000/api/v1/users/login",
        //     data: {
        //         email: email,
        //         password: password
        //     }
        // })
        const response = await fetch('http://127.0.0.1:3000/api/v1/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
                },
            body: JSON.stringify({email, password})
            });
            if (response.ok) {
                showAlert('success', "Logged in successfully")
                window.setTimeout(()=> {
                    location.assign('/');
                }, 1000)
            } else {
                showAlert('error', response.statusText);
            }

    } catch(error) {
        showAlert('error', error);
    }
}
