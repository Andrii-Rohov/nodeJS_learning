import {showAlert} from "./alerts";

// export const updateData = async (email, name) => {
//     try {
//         const response = fetch("http://127.0.0.1:3000/api/v1/users/updateMe", {
//             method: "PATCH" ,
//             headers: {
//                 'Content-Type': 'application/json;charset=utf-8'
//                 },
//             body: JSON.stringify({email, name})
//         });
//         if (response.ok) {
//             showAlert('success', "Logged in successfully")
//             window.setTimeout(()=> {
//                 location.assign('/');
//             }, 1000)
//         } else {
//             showAlert('error', response.statusText);
//         }
//     } catch(error) {
//         showAlert('error', error)
//     }
// }

export const updateData = async (dataToUpdate, formType) => {
    const urlEndpoint = formType === "password" ? "/updateMyPassword" : "/updateMe"
    console.log(dataToUpdate)
    console.log(formType)
    console.log(urlEndpoint)
    try {
        const response = await fetch(`http://127.0.0.1:3000/api/v1/users${urlEndpoint}`, {
            method: "PATCH" ,
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
                },
            body: JSON.stringify(dataToUpdate)
        });
        if (response.ok) {
            showAlert('success', "Updated successfully")
            window.setTimeout(()=> {
                location.reload(true);
            }, 1000)
        } else {
            showAlert('error', response.statusText);
        }
    } catch(error) {
        showAlert('error', error)
    }
}


// export const updateMyPassword = async (oldPassword, newPassword, newPasswordConfirm) => {
//     try {
//         const response = await fetch("http://127.0.0.1:3000/api/v1/users/updateMyPassword", {
//             method: "PATCH" ,
//             headers: {
//                 'Content-Type': 'application/json;charset=utf-8'
//                 },
//             body: JSON.stringify({oldPassword, newPassword, newPasswordConfirm})
//         });
//         if (response.ok) {
//             showAlert('success', "Logged in successfully")
//             window.setTimeout(()=> {
//                 location.reload(true);
//             }, 1000)
//         } else {
//             showAlert('error', response.statusText);
//         }
//     } catch(error) {
//         showAlert('error', error)
//     }
// }