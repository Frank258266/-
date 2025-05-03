// 简易本地服务器，用于直接部署游戏
const http = require('http');
const fs = require('fs');
const path = require('path');

// 配置端口，默认为8080
const PORT = process.env.PORT || 8080;

// MIME类型映射
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json'
};

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    console.log(`请求: ${req.url}`);
    
    // 解析URL，获取文件路径
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }
    
    // 获取文件扩展名
    const extname = path.extname(filePath).toLowerCase();
    
    // 设置默认的MIME类型
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // 读取文件
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // 文件不存在
                fs.readFile('./index.html', (err, content) => {
                    if (err) {
                        // 无法提供404页面
                        res.writeHead(500);
                        res.end('服务器错误: ' + err.code);
                    } else {
                        // 返回404页面
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    }
                });
            } else {
                // 服务器错误
                res.writeHead(500);
                res.end('服务器错误: ' + error.code);
            }
        } else {
            // 成功响应
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// 启动服务器
server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}/`);
    console.log('按 Ctrl+C 停止服务器');
});