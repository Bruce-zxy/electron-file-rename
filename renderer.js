// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.

const fs = require("fs");
const path = require("path");
const { app, ipcRenderer, remote } = require('electron');


const get_dir = document.getElementById("dir");
const table_grid_dom = document.getElementsByClassName('table-grid')[0]

get_dir.addEventListener("click", getdir)

function getdir(e) {
    e.preventDefault();
    ipcRenderer.send('post', {
        hostname: global.$.hostname,
        port: global.$.port,
        data: JSON.stringify({
            "flag": "oepnDir"
        }),
        window: "mainWindow", // 判断是哪个窗口中调用的请求，方便主进程指定该窗口进行数据交互
        id: 'main' // 主进程回调时的唯一参数，通过该参数来确定各个接口不受影响
    });
    ipcRenderer.on('get_dir', (e, params) => {
        const [dir_path, dir_files] = params;
        const len = dir_files.length;
        const table_dom = document.createElement('table')
        const th_dom = document.createElement('th')
        th_dom.setAttribute('colspan', 3)
        th_dom.innerHTML = `<p>总计共 ${len} 张图片</p>`
        table_dom.appendChild(th_dom)
        dir_files.forEach((file, i) => {
            const tr_dom = document.createElement('tr');
            const td1_dom = document.createElement('td');
            const td2_dom = document.createElement('td');
            const img_dom = document.createElement('img');
            const td3_dom = document.createElement('td');
            const input_dom = document.createElement('input');

            td1_dom.textContent = `第${i + 1}张`;

            img_dom.src = path.join(dir_path, file);
            td2_dom.appendChild(img_dom)

            input_dom.defaultValue = file.split('.')[0]
            td3_dom.appendChild(input_dom)

            tr_dom.appendChild(td1_dom)
            tr_dom.appendChild(td2_dom)
            tr_dom.appendChild(td3_dom)
            table_dom.appendChild(tr_dom)
        })
        table_grid_dom.innerHTML = `<table class="table table-striped">${table_dom.innerHTML}<table>`

        const inputs = document.querySelectorAll('.table-grid input')
        Array.from(inputs).forEach((input, i) => {
            input.addEventListener('change', renameFile(dir_path, dir_files[i]))
        })
    })
}


const renameFile = (dir_path, file) => async(e) => {
    const ext = path.extname(file)
    const { value } = e.target
    const old_path = path.join(dir_path, file);
    const new_path = path.join(dir_path, value + ext);
    console.log(await fs.renameSync(old_path, new_path));
}