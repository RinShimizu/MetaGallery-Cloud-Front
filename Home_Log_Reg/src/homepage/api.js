export const fetchSubFileInfo = (token, account, folder_id) => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization",token);

    const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    return fetch(`http://localhost:8080/api/loadFolder/getSubFileinfo?account=${account}&folder_id=${folder_id}`, requestOptions)
        .then(response => response.json())
        .then(result => {
            console.log(result);
            return result.data;
        })
        .catch(error => {
            console.log('error', error);
            throw error;
        });
};