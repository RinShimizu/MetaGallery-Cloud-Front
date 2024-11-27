var CurrentFolderID = 1;

export const changeCurrentFolderID = (ID) => {
    CurrentFolderID = ID;
}

export const getCurrentFolderID = () => {
    return CurrentFolderID;
}

/*export const fetchSubFileInfo = (token, account, folder_id) => {
    var foldersFromServer,filesFromServer;
    //获取文件夹
    const myHeadersFolder = new Headers();
    myHeadersFolder.append("Authorization",token);
    const requestOptionsFolder = {
        method: 'GET',
        headers: myHeadersFolder,
        redirect: 'follow'
    };
    fetch(`http://localhost:8080/api/loadFolder/getChildrenInfo?account=${account}&folder_id=${folder_id}`, requestOptionsFolder)
        .then(response => response.json())
        .then(result => {
            console.log(result);
            foldersFromServer = result.data; // 获取返回的数据
        })
        .catch(error => {
            console.log('error', error);
            throw error;
        });

    //获取文件
    const myHeadersFile = new Headers();
    myHeadersFile.append("Authorization",token);
    const requestOptionsFile = {
        method: 'GET',
        headers: myHeadersFile,
        redirect: 'follow'
    };
    fetch(`http://localhost:8080/api/loadFolder/getSubFileinfo?account=${account}&folder_id=${folder_id}`, requestOptionsFile)
        .then(response => response.json())
        .then(result => {
            console.log(result);
            filesFromServer = result.data; // 获取返回的数据

            // 遍历返回的数据，更新栈中的文件信息
            filesFromServer.forEach((file) => {
                const existingFile = Stack[Stack.length - 1].find(f => f.ID === file.ID); // 查找当前栈顶文件中是否有相同ID的文件
                if (existingFile) {
                    existingFile.isFavorite = file.Favorite; // 更新 isFavorite 属性
                }
            });
        })
        .catch(error => {
            console.log('error', error);
            throw error;
        });

    //压入栈中
    Stack.push([foldersFromServer, filesFromServer])
};*/

export const fetchSubInfo = (Stack, token, account, folder_id) => {
    console.log("开始获取子文件信息");
    return new Promise((resolve, reject) => {
        // 初始化文件夹和文件的请求头
        const myHeaders = new Headers();
        myHeaders.append("Authorization", token);

        // 获取文件夹的请求
        const folderRequest = fetch(
            `http://localhost:8080/api/loadFolder/getChildrenInfo?account=${account}&folder_id=${folder_id}`,
            {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow',
            }
        ).then(response => response.json());

        // 获取文件的请求
        const fileRequest = fetch(
            `http://localhost:8080/api/loadFolder/getSubFileinfo?account=${account}&folder_id=${folder_id}`,
            {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow',
            }
        ).then(response => response.json());

        // 使用 Promise.all 同时处理两个请求
        Promise.all([folderRequest, fileRequest])
            .then(([folderResponse, fileResponse]) => {

                // 处理文件夹数据
                const foldersFromServer = folderResponse.data == null ? [] : folderResponse.data.map(folder => ({
                    id: folder.id,              // 文件夹 ID
                    parent_id:folder.parent_id,
                    name: folder.folder_name,   // 文件夹名称
                    path: folder.path,          // 文件夹路径
                    isFavorite: folder.is_favorite, // 是否收藏
                    shared: folder.is_share,    // 是否分享
                    selected: false,            // 默认未选中
                    isEditing:false
                }));
                // 处理文件数据
                const filesFromServer = fileResponse.data == null ? [] : fileResponse.data;
                filesFromServer.forEach(file => {
                    console.log(1);
                    const existingFile = Stack[Stack.length - 1]?.find(f => f.ID === file.ID);
                    if (existingFile) {
                        existingFile.isFavorite = file.Favorite;
                    }
                });

                // 将数据压入栈
                Stack.push([foldersFromServer, filesFromServer]);

                // 返回结果
                resolve({ folders: foldersFromServer, files: filesFromServer });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                reject(error); // 如果发生错误，reject Promise
            });
    });
};


// export const fetchSubFolderInfo = (token, account, folder_id) => {
//     const myHeaders = new Headers();
//     myHeaders.append("Authorization",token);
//
//     const requestOptions = {
//         method: 'GET',
//         headers: myHeaders,
//         redirect: 'follow'
//     };
//
//     return fetch(`http://localhost:8080/api/loadFolder/getChildrenInfo?account=${account}&folder_id=${folder_id}`, requestOptions)
//         .then(response => response.json())
//         .then(result => {
//             console.log(result);
//             const flodersFromServer = result.data; // 获取返回的数据
//             folderStack.push(flodersFromServer);
//         })
//         .catch(error => {
//             console.log('error', error);
//             throw error;
//         });
// };
/*export const getTopOfStack = () => {
    console.log("这是测试",Stack);
    if (Stack.length === 0) {
        return []; // 栈为空时返回 null
    }
    return Stack[Stack.length - 1]; // 返回栈顶元素
};*/

export const uploadFile = async (selectedFile, token, account, folder_id) => {
    if (!selectedFile.value) {
        alert('请选择一个文件');
        return;
    }
    var myHeaders = new Headers();
    myHeaders.append("Authorization",token);

    var formdata = new FormData();
    formdata.append("account", account);
    formdata.append("parent_id", folder_id);//此处获取父文件夹id
    formdata.append("file_name", selectedFile.value.files[0].name);
    formdata.append("file", selectedFile.value.files[0], selectedFile.value.value);

    for (let [key, value] of formdata.entries()) {
        console.log(key + ': ' + value);
    }
    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow'
    };

    return fetch("http://localhost:8080/api/uploadFile", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
};







