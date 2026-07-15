const { contextBridge } = require('electron');

// 安全暴露有限 API 给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  appVersion: '1.0.0'
});
