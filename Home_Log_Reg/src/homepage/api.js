let fileStack = []; // 定义一个栈来存储文件信息
let folderStack = []; // 定义一个栈来存储文件信息
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
            const filesFromServer = result.data; // 获取返回的数据

            // 遍历返回的数据，更新栈中的文件信息
            fileStack.push(filesFromServer);
            filesFromServer.forEach((file) => {
                const existingFile = fileStack[fileStack.length - 1].find(f => f.ID === file.ID); // 查找当前栈顶文件中是否有相同ID的文件
                if (existingFile) {
                    existingFile.isFavorite = file.Favorite; // 更新 isFavorite 属性
                }
            });


        })
        .catch(error => {
            console.log('error', error);
            throw error;
        });
};

export const fetchSubFolderInfo = (token, account, folder_id) => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization",token);

    const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    return fetch(`http://localhost:8080/api/loadFolder/getChildrenInfo?account=${account}&folder_id=${folder_id}`, requestOptions)
        .then(response => response.json())
        .then(result => {
            console.log(result);
            const flodersFromServer = result.data; // 获取返回的数据
            folderStack.push(flodersFromServer);
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

export const getTopOfFolderStack = () => {
    if (folderStack.length === 0) {
        return []; // 栈为空时返回 null
    }
    return folderStack[folderStack.length - 1]; // 返回栈顶元素
};







