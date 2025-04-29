# Solana 地址生成器

## 环境要求

- Node.js (v16 或更高版本)
  - 下载地址：https://nodejs.org/dist/v18.19.1/node-v18.19.1-x64.msi
  - 选择 Windows 64位版本安装包
  - 安装时全部选择默认选项即可

## 必需的依赖包

项目依赖以下 npm 包：
- @solana/web3.js@1.87.6 (Solana Web3 工具包)
- bs58@5.0.0 (Base58 编码工具)

## 安装步骤

1. 安装 Node.js
   - 下载并安装 Node.js
   - 安装完成后，打开命令提示符(CMD)
   - 输入 `node -v` 和 `npm -v` 确认安装成功

2. 安装项目依赖
   ```bash
   # 进入项目目录
   cd calculate

   # 安装依赖包
   npm install @solana/web3.js@1.87.6 bs58@5.0.0
   ```

## 使用方法

运行程序：
```bash
node start.js
```

程序会启动多个工作线程来搜索 Solana 地址。每找到一个符合条件的地址就会自动保存。

## 输出结果

程序会将找到的地址和私钥保存为 JSON 文件：
- 文件名格式：`found_address_年-月-日T时-分-秒.json`
- 文件内容包括：
  - address: 公钥地址
  - secretKey: 私钥
  - attempts: 尝试次数
  - timestamp: 找到时的时间戳

## 注意事项

- 程序会自动使用多线程
- 会根据 CPU 核心数自动优化线程数量
- 运行时会显示实时搜索速度和进度



