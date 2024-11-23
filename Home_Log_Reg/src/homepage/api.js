let fileStack = []; // 定义一个栈来存储文件信息

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
            fileStack.push(result.data)
        })
        .catch(error => {
            console.log('error', error);
            throw error;
        });
};

export const getTopOfFileStack = () => {
    if (fileStack.length === 0) {
        return []; // 栈为空时返回 null
    }
    return fileStack[fileStack.length - 1]; // 返回栈顶元素
};









