import {nextTick, ref} from 'vue';
import folderURL from "@/assets/文件夹.svg";

var CurrentFolderID = 1;
let Stackfa=[];
var folders = ref([]);
var files = ref([]);
let hoverTimer = null; // 计时器
let isHovering = false; // 标记是否仍然悬停
export const fileOrFolderInfo =  ref({
    type: '',  // 'file' 或 'folder'
    data: null  // 存储文件或文件夹的具体信息
});// 用于存储当前文件或文件夹的信息
export const popupTop = ref('0px');  // 存储悬浮框的 top 值
export const popupLeft = ref('0px'); // 存储悬浮框的 left 值
export const isLoading = ref(false);//用于预览的正在加载中状态
export const changeCurrentFolderID = (ID) => {
    CurrentFolderID = ID;
}
export const getCurrentFolderID = () => {
    return CurrentFolderID;
}
export const fetchSubInfo = (Stack, token, account, folder_id) => {
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
                const filesFromServer = fileResponse.data == null ? [] : fileResponse.data.map(file => ({
                    ID: file.ID,
                    FileName: file.FileName,
                    FileType: file.FileType,
                    Favorite: file.Favorite,
                    Share: file.Share,
                    InBin: file.InBin,
                    selected: false,            // 默认未选中
                    isEditing:false
                }));
                Stackfa.push(filesFromServer);
                filesFromServer.forEach(file => {
                    const existingFile = Stackfa[Stackfa.length - 1]?.find(f => f.ID === file.ID);
                    if (existingFile) {
                        existingFile.isFavorite = file.Favorite;
                    }
                });

                // 将数据压入栈
                Stack.push([foldersFromServer, filesFromServer]);
                Stackfa.push([foldersFromServer, filesFromServer]);
                // 返回结果
                resolve({ folders: foldersFromServer, files: filesFromServer });
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                reject(error); // 如果发生错误，reject Promise
            });
    });
};
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

    try {
        const response = await fetch("http://localhost:8080/api/uploadFile", requestOptions);
        const result = await response.json();
        if (result.status === "SUCCESS") {
            return "上传成功";
        } else if (result.status === "FAILED") {
            return `上传失败，${result.msg}`;
        }
    } catch (error) {
        console.log('error', error);
        return `上传过程中发生错误，请重试`;
    }
};
export const creatIng=(folders,isCancel)=>{
    const newFolder = {
        name: '未命名文件夹', // 默认名称
        icon: folderURL,
        selected: false,
        isEditing: true,
    };
    isCancel=false;
    // 将新文件夹添加到数组末尾
    folders.value.unshift(newFolder);
    return newFolder;
}
// 创建文件夹
export const createFolder = (folderPath, file, token, account,index,isEditing,inputEl) => {
    console.log('index2:', index);
    fetch('http://localhost:8080/api/createFolder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token,  // 使用 token 进行授权
        },
        body: JSON.stringify({
            account: account,   // 使用存储在 localStorage 的用户数据
            parent_id: folderPath,      // 使用根路径和文件夹名称拼接得到完整路径
            folder_name: file.name,
        }),
    })
        .then((response) => {
            if (!response.ok) {
                return response.text().then((errorText) => {
                    throw new Error(`创建文件夹失败: ${response.status} ${response.statusText} - ${errorText}`);
                });
            }
            return response.json(); // 返回的数据为 JSON
        })
        .then((data) => {
            console.log("返回的数据：", data); // 查看返回的数据内容

            // 如果返回的状态是失败
            if (data.status === "FAILED") {
                console.log('文件夹创建失败，返回消息:', data.msg);
                // 重新聚焦输入框并全选
                nextTick(() => {

                    console.log('inputEI2:', inputEl);
                    if (inputEl) {
                        inputEl.focus();
                        inputEl.select();
                        inputEl.classList.add('shake');
                        setTimeout(() => inputEl.classList.remove('shake'), 300); // 移除震动效果
                    }
                });
            } else {
                console.log('文件夹创建成功');
                isEditing=false;
            }
        })
        .catch((error) => {
            alert('文件夹创建失败: ' + error.message);
        });

};
export const renameFolder =  (folders, folder, oldName, account, token, isEditing) => {
    console.log('renameAPI');

    // 如果名称未更改，直接返回成功
    if (folder.name === oldName) return '文件夹重命名成功！';

    // 检查是否有重复名字
    const duplicateCount = folders.filter(existingFolder => existingFolder.name === folder.name).length;
    if (duplicateCount > 1) {
        return `重命名失败：名称 "${folder.name}" 已经存在！`;
    }

    try {
        // 发起重命名请求
        const response = fetch('http://localhost:8080/api/renameFolder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token,  // 使用 token 进行授权
            },
            body: JSON.stringify({
                account: account,
                folder_id: folder.id,
                new_folder_name: folder.name,
            }),
        });

        // 检查 HTTP 状态码
        if (!response.ok) {
            const errorText =  response.text();
            throw new Error(`文件夹重命名失败: ${response.status} ${response.statusText} - ${errorText}`);
        }

        // 解析返回数据
        const data =  response.json();

        // 根据返回数据状态判断是否成功
        if (data.status === "FAILED") {
            return `文件夹重命名失败，返回消息: ${data.msg}`;
        }

        return '文件夹重命名成功！';
    } catch (error) {
        // 捕获错误并返回信息
        return `文件夹重命名失败: ${error.message}`;
    }
};
export const renameFile =  (files, file, oldName, account, token, isEditing) => {
    // 如果名称未更改，直接返回成功
    if (file.FileName === oldName) return '文件夹重命名成功！';

    // 检查是否有重复名字
    const duplicateCount = files.filter(existingFile => existingFile.FileName === file.FileName).length;
    if (duplicateCount > 1) {
        return `重命名失败：名称 "${file.FileName}" 已经存在！`;
    }

    var myHeaders = new Headers();
    myHeaders.append("Authorization", token);

    var formdata = new FormData();
    formdata.append("account", account);
    formdata.append("file_id", file.ID);
    formdata.append("new_file_name", file.FileName);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow'
    };

    fetch("http://localhost:8080/api/renameFile", requestOptions)
        .then(response => response.text())
        .then(result => {
            console.log(result);
        })
        .catch(error => {
            console.log('error', error)
        });
};
const deleteFolder=(folder,token,account)=>{
    return new Promise((resolve, reject) => {
        try {
            const myHeaders = new Headers();
            myHeaders.append("Authorization", token);

            fetch('http://localhost:8080/api/removeFolder', {
                method: 'DELETE',
                headers: myHeaders,
                redirect: 'follow',
                body: JSON.stringify({
                    account: account,
                    folder_id: folder.id,
                }),
            })
                .then(response => {
                    if (!response.ok) {
                        return response.text().then(errorText => {
                            throw new Error(`文件夹删除失败: ${response.status} ${response.statusText} - ${errorText}`);
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.status === "FAILED") {
                        console.log('文件夹删除失败，返回消息:', data.msg);
                        reject(new Error(data.msg));
                    } else {
                        console.log('succ');
                        resolve(data); // 或者 resolve(true)，根据你的需求决定返回什么
                    }
                })
                .catch(error => {
                    reject(`文件夹删除失败: ${error.message}`);
                });
        } catch (error) {
            reject(`文件夹删除失败: ${error.message}`);
        }
    });
}
const deleteFile =  (token, account, file_id) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", token);
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "account": account,
        "file_id": file_id
    });

    console.log(raw);
    var requestOptions = {
        method: 'DELETE',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    return fetch("http://localhost:8080/api/removeFile", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}
export const deleteItems = async (selectedIds, token, account) => {
    const folders = selectedIds.value.folders;
    const files = selectedIds.value.files;
    try {
        for (const folder of folders) {
            console.log(111);
            await deleteFolder(folder, token, account);
        }
        for (const file of files) {
            console.log(111);
            await deleteFile(token, account, file.ID);
        }
        return '删除成功';
    } catch (error) {
        console.error('删除过程中发生错误:', error);
        return `删除失败: ${error.message}`;
    }
};
export const preJudge=(isFolder,folders,file)=>{
    let msg='';
    if(isFolder){
        if (file.name.length > 255) {
            return "文件夹名称不能超过 255 个字符";
        }
        // 2. 文件夹名称不能包含保留字符
        if (!file.name.trim() || /[\/\\:*?"<>|]/.test(file.name)) {
            msg = '文件名不能为空或包含非法字符！';
        }

        // 3. 文件夹名称不能是保留名称
        const reservedNames = [
            "CON", "PRN", "AUX", "NUL",
            "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
            "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"
        ];
        if (reservedNames.includes(file.name.toUpperCase())) {
            return "文件夹名称不能是保留名称";
        }

        // 4. 文件夹名称不能以空格或句点结尾
        if (file.name.trim().endsWith('.') || file.name.endsWith(' ')) {
            return "文件夹名称不能以空格或句点结尾";
        }

        const folderExists = folders.slice(1).some(existingFolder => existingFolder.name === file.name);
        if (folderExists) {
            msg='该文件夹名已存在！';
            console.log('folders:', folders); // 查看所有文件夹数据

            console.log(file.name.trim());
        }
    }
    else{
        if (file.FileName.length > 255) {
            return "文件夹名称不能超过 255 个字符";
        }
        // 2. 文件夹名称不能包含保留字符
        if (!file.FileName.trim() || /[\/\\:*?"<>|]/.test(file.FileName)) {
            msg = '文件名不能为空或包含非法字符！';
        }

        // 3. 文件夹名称不能是保留名称
        const reservedNames = [
            "CON", "PRN", "AUX", "NUL",
            "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
            "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9"
        ];
        if (reservedNames.includes(file.FileName.toUpperCase())) {
            return "文件夹名称不能是保留名称";
        }

        // 4. 文件夹名称不能以空格或句点结尾
        if (file.FileName.trim().endsWith('.') || file.FileName.endsWith(' ')) {
            return "文件夹名称不能以空格或句点结尾";
        }

        const folderExists = folders.slice(1).some(existingFolder => existingFolder.name === file.FileName);
        if (folderExists) {
            msg='该文件夹名已存在！';
            console.log('folders:', folders); // 查看所有文件夹数据

            console.log(file.FileName.trim());
        }
    }
    // 1. 文件夹名称长度不能超过 255 个字符

    return msg;
}
export const labelShake=(inputEl)=>{
    if (inputEl) {
        inputEl.focus();
        inputEl.select();
        inputEl.classList.add('shake');
        setTimeout(() => inputEl.classList.remove('shake'), 300); // 移除震动效果
    }
}
export const labelFocus=(inputEl)=>{
    if (inputEl) {
        inputEl.focus();
        inputEl.select();
    }
}
export const showLabelAlert = (msg) => {
    const container = document.getElementById('alert-container');
    // 创建提示框元素
    const alertLabel = document.createElement('div');
    alertLabel.className = 'alert-label';
    alertLabel.textContent = msg;
    // 添加提示框到容器中
    container.appendChild(alertLabel);
    // 1 秒后移除提示框
    setTimeout(() => {
        container.removeChild(alertLabel);
    }, 1000);
};
export const fetchDelSubInfo = (Stack, token, account) => {
    return new Promise((resolve, reject) => {
        // 初始化文件夹和文件的请求头
        const myHeaders = new Headers();
        myHeaders.append("Authorization", token);

        // 获取文件夹的请求
        const folderRequest = fetch(
            `http://localhost:8080/api/listBinFolder?account=${account}`,
            {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow',
            }
        ).then(response => response.json());

        // 获取文件的请求
        const fileRequest = fetch(
            `http://localhost:8080/api/listBinFile?account=${account}`,
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
                const foldersFromServer = folderResponse.data == null ? [] : folderResponse.data;
                // 处理文件数据
                const filesFromServer = fileResponse.data == null ? [] : fileResponse.data;

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
export const isAllSelectedFilesFavorited = (selectedIds) =>{
    const folders=selectedIds.value.folders;
    const files=selectedIds.value.files;
    console.log(folders,"fggghjjjkkkkk");
    const allSelectedFilesFavorited = files
        //.filter(file => file.selected)  // 过滤选中的文件
        .every(file => file.isFavorite);  // 检查是否所有选中的文件都已收藏

    const allSelectedFoldersFavorited = folders
        //.filter(folder => folder.selected)  // 过滤选中的文件夹
        .every(folder => folder.isFavorite);  // 检查是否所有选中的文件夹都已收藏

    // 返回是否文件和文件夹都已收藏
    return allSelectedFilesFavorited && allSelectedFoldersFavorited;
};
export const markAsFavorite = (selectedIds, account, token, isAllFavorited) => {
    const folders=selectedIds.value.folders;
    const files=selectedIds.value.files;
    const newFavoriteState = isAllFavorited ? 1 : 2;
    console.log(folders);
    for(const file of files) {
        //if (file.selected) {
        const requestData = {
            account,
            file_id: file.ID,
            is_favorite: newFavoriteState,
        };
        fetch('http://localhost:8080/api/favoriteFile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
            body: JSON.stringify(requestData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'SUCCESS') {
                    file.isFavorite = data.msg.includes('true');
                }
            })
            .catch(error => console.error(`请求失败：${file.name}`, error));
        //}
    }

    for(const folder of folders){
        //if (folder.selected) {
        const requestData = {
            account,
            folder_id: folder.id,
            is_favorite: newFavoriteState,
        };
        fetch('http://localhost:8080/api/favoriteFolder', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token,
            },
            body: JSON.stringify(requestData),
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'SUCCESS') {
                    folder.isFavorite = data.msg.includes('true');
                }
            })
            .catch(error => console.error(`请求失败：${folder.name}`, error));
        //}
    }
};
export const favoriteButtonIcon = (isAllFavorited, favoriteIcon, unfavoriteIcon) => {
    return isAllFavorited ? favoriteIcon : unfavoriteIcon;
};
// 显示文件/文件夹信息
export const showFileOrFolderInfo = async (id, type, token, account,event) => {
    isHovering = true; // 标记悬停开始
    hoverTimer = setTimeout(async () => {
        if (!isHovering) return; // 如果鼠标已经移出，不执行后续操作

        const info = await fetchFileOrFolderInfo(id, type, token, account);
        console.log("info",info);
        if (type === 'folder' && !info) {
            // 如果是空文件夹，不显示或清除信息
            fileOrFolderInfo.value = { type: '', data: null };
            return;
        }
        nextTick(() => {
            fileOrFolderInfo.value = {
                type: type,
                data: info,
            };
        });

        // 更新悬浮框位置
        popupTop.value = `${event.clientY - 70}px`;
        popupLeft.value = `${event.clientX - 230}px`;
    }, 1000); // 延迟 1 秒
};
// 隐藏文件/文件夹信息
export const hideFileOrFolderInfo = () => {
    isHovering = false; // 标记悬停结束
    if (hoverTimer) {
        clearTimeout(hoverTimer); // 清除计时器
        hoverTimer = null;
    }
    fileOrFolderInfo.value = { type: '', data: null };  // 清空数据
};
// 从服务器获取文件或文件夹信息
export const fetchFileOrFolderInfo = async (id, type, token, account) => {
    //console.log("fetchFileOrFolderInfo id",id);
    let url = '';
    if (type === 'file') {
        url = `http://localhost:8080/api/getFileData?account=${account}&file_id=${id}`;
    } else if (type === 'folder') {
        console.log(123);
        url = `http://localhost:8080/api/loadFolder/getFolderInfo?account=${account}&folder_id=${id}`;
    }

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': token,
        }
    });

    const data = await response.json();
    //console.log("data",data);
    if (data.data && data.data.items && data.data.items.length === 0) {
        // 处理空文件夹的情况，比如返回 null 或其他标识
        return null;
    }
    return data.data;  // 返回相关的信息
};
const recoverFile = (fileId, token, account) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", token);
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "account": account,
        "file_id": fileId
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    return fetch("http://localhost:8080/api/recoverBinFile", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}
const recoverFolder = (binID, token, account) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", token);
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "account": account,
        "bin_id": binID
    });

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    return fetch("http://localhost:8080/api/recoverBinFolder", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}
export const recoverItems = async (selectedIds, token, account) => {
    const folders = selectedIds.value.folders;
    const files = selectedIds.value.files;
    try {
        for (const folder of folders) {
            await recoverFolder(folder.bin_id, token, account);
        }
        for (const file of files) {
            await recoverFile(file.ID, token, account);
        }
        return '恢复成功';
    } catch (error) {
        console.error('删除过程中发生错误:', error);
        return `恢复失败: ${error.message}`;
    }
};
const completeDeleteFolder = (folderID, bin_id, token, account) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", token);
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "account": account,
        "bin_id": bin_id,
        "folder_id": folderID
    });

    var requestOptions = {
        method: 'DELETE',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    return fetch("http://localhost:8080/api/deleteFolder", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

export const shareItems=async (selectedItems, token, account, shared_name, intro) => {

    const folders = selectedItems.value.folders; // 选中的文件夹数组
    // const files = selectedItems.value.files; // 选中的文件数组
    try {
        for (const folder of folders) {
            console.log("shareFoldering");
            await shareFolder(token,account,folder.id,folder.folder_name,intro);
        }
        // for (const file of files) {
        //     console.log(111);
        //     await deleteFile(token, account, file.ID);
        // }
        return '文件夹共享成功';
    } catch (error) {
        console.error('共享享过程中发生错误:', error);
        return `共享失败: ${error.message}`;
    }
}

export const shareFolder=(token,account,id,name,intro)=>{
    var myHeaders = new Headers();
    myHeaders.append("Authorization", token);
    var formdata = new FormData();
    formdata.append("account", account);
    formdata.append("folder_id", id);
    formdata.append("shared_name", name);
    formdata.append("intro", intro);

    console.log("11",id);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow'
    };

    return fetch("http://localhost:8080/api/shareFolder", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}

export const fetchSharedInfo = async (token, account,curPage) => {

    let url = '';
    url = `http://localhost:8080/api/gallery/getUserGallery?account=${account}&page_num=${curPage}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': token,
        }
    });

    const data = await response.json();
    console.log("data",data);
    return data.data;  // 返回相关的信息
};

export const fetchShareSubInfo = async (Stack, token, account, name, ipfs_hash) => {
    const myHeaders = new Headers();
    myHeaders.append("Authorization", token);

    try {
        const response = await fetch(
            `http://localhost:8080/api/gallery/getFolderInfo?owner_account=${account}&folder_name=${name}&ipfs_hash=${ipfs_hash}`,
            {
                method: 'GET',
                headers: myHeaders,
                redirect: 'follow',
            }
        );

        const data = await response.json();
        if (data.data && data.data.folder_info) {
            const folderInfo = data.data.folder_info;
            const subfolders = folderInfo.subfolders
                ? folderInfo.subfolders.map(folder => ({ ...folder, selected: false }))
                : [];
            const files = folderInfo.files
                ? folderInfo.files.map(file => ({ ...file, selected: false }))
                : [];
            return { subfolders, files };
        } else {
            console.error("Invalid API response:", data);
            return { subfolders: [], files: [] }; // 确保返回一个空结构而不是 undefined
        }
    } catch (err) {
        console.error("Failed to load folder:", err);
        return { subfolders: [], files: [] }; // 捕获错误并返回空值
    }
};


export const unShareItems=async (shareItems, token, account) => {
    const folders = shareItems.value.folders;
    const files = shareItems.value.files;
    try {
        for (const folder of folders) {
            console.log("unshareFoldering");
            await unShareFolder(folder.folder_name, token, account);
        }
        // for (const file of files) {
        //     console.log(111);
        //     await deleteFile(token, account, file.ID);
        // }
        return '取消分享成功';
    } catch (error) {
        console.error('取消分享过程中发生错误:', error);
        return `取消分享失败: ${error.message}`;
    }
}

export const unShareFolder=(name,token,account)=>{
    var myHeaders = new Headers();
    myHeaders.append("Authorization", token);
    // myHeaders.append("Content-Type", "application/json");
    // var raw = JSON.stringify({
    //     "account": account,
    //     "shared_name": name
    // });

    var formdata = new FormData();
    formdata.append("account", account);
    formdata.append("shared_name", name);

    console.log("name:",name);

    var requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: formdata,
        redirect: 'follow'
    };

    return fetch("http://localhost:8080/api/gallery/unshareFolder", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}
const completeDeleteFile = (fileID, token, account) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", token);
    myHeaders.append("Content-Type", "application/json");

    var raw = JSON.stringify({
        "account": account,
        "file_id": fileID
    });

    var requestOptions = {
        method: 'DELETE',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    return fetch("http://localhost:8080/api/deleteFile", requestOptions)
        .then(response => response.text())
        .then(result => console.log(result))
        .catch(error => console.log('error', error));
}
export const completeDeleteItems = async (selectedIds, token, account) => {
    const folders = selectedIds.value.folders;
    const files = selectedIds.value.files;
    try {
        for (const folder of folders) {
            await completeDeleteFolder(folder.id, folder.bin_id, token, account);
        }
        for (const file of files) {
            await completeDeleteFile(file.ID, token, account);
        }
        return '删除成功';
    } catch(error) {}
}

// 批量下载文件函数
export const downloadFile = async (account, selectedIds, token) => {
    const folders=selectedIds.value.folders;
    const files=selectedIds.value.files;
    console.log("folders",folders);
    // 检查是否有选中的文件夹
    if (folders.length>0) {
        alert('不允许下载文件夹！');
        return;  // 如果有文件夹，终止下载
    }

    // 如果没有文件夹，继续下载选中的文件
    const downloadPromises = [];

    // 下载选中的文件
    files.forEach(file => {
        const fileId = file.ID;
        console.log(file.ID);
        const url = `http://localhost:8080/api/downloadFile?account=${account}&file_id=${fileId}`;
        downloadPromises.push(downloadSingleFile(url, token, file.FileName)); // 将文件名传入
    });
    // 等待所有文件下载完成
    try {
        await Promise.all(downloadPromises);
        console.log('所有文件下载完成！');
    } catch (error) {
        console.error('批量下载时出现错误:', error);
    }
};

// 下载单个文件的工具函数
const downloadSingleFile = async (url, token, defaultName) => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: token,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();

        // 提取文件名
        const contentDisposition = response.headers.get('Content-Disposition');
        let fileName = defaultName || 'downloaded_file';
        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?(.+)"?/);
            if (match && match[1]) {
                fileName = decodeURIComponent(match[1]);
            }
        }

        // 创建下载链接
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        console.error('下载单个文件时出错:', error);
    }
};

//预览功能（只支持预览单个文件）,目前未完全实现
//预览函数

export async function handlepreviewFile(account,fileID,token,setPreviewContent,event){
    event.preventDefault();
    const previewUrl = await previewFile(account,fileID,token);
    //const previewPageUrl = `/preview?url=${encodeURIComponent(previewUrl)}`;
    console.log("previewPageUrl",previewUrl);
    //window.open(previewPageUrl, '_blank');
    //window.open(previewUrl, '_blank');
    setPreviewContent(previewUrl);
}
export async function previewFile(account, fileID,token) {
    if (!account || !fileID) {
        throw new Error("账号或文件ID不能为空");
    }
    console.log("进入预览函数");
    // const queryParams = new URLSearchParams({ account, file_id: fileID }).toString();
    // const url = `/api/preview?${queryParams}`;
    const url = `http://localhost:8080/api/previewFile?account=${account}&file_id=${fileID}`;
    try {
        isLoading.value=true;
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: token,
            },
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "预览失败，请稍后再试");
        }
        // const data = await response.json();
        // console.log("url:",data.url);
        // return data.url || "";
        const blob = await response.blob();
        console.log("blob:",blob);
        if(blob.type==="application/json"){
            return null;
        }
        const previewUrl = URL.createObjectURL(blob); // 生成本地 URL
        console.log("预览 URL:", previewUrl);
        return previewUrl;
    } catch (error) {
        throw new Error(error.message || "预览失败，请稍后再试");
    }finally {
        isLoading.value=false;
    }
}

export const getAllSharedItems = async (page_num) => {
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "");

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch(`http://localhost:8080/api/gallery/getAllGallery?page_num=${page_num}`, requestOptions)
        .then(response => response.json())
        .then(result => {
            return result.data == null ? [] : result.data;
        })
        .catch(error => console.log('error', error));
}
const getUserInfo = async (account) => {

}