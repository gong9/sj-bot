import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import cors from "cors";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// 创建上传目录
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 生成唯一文件名
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: function (req, file, cb) {
    // 检查文件类型
    const allowedTypes = [".txt", ".pdf", ".doc", ".docx", ".md"];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error("不支持的文件类型"));
    }
  },
});

// 中间件
app.use(
  cors({
    origin: "http://localhost:5173", // Vite 默认端口
    credentials: true,
  })
);
app.use(express.json());

// 静态文件服务 - 用于下载生成的文件
app.use("/downloads", express.static(path.join(__dirname, "downloads")));

// 创建下载目录
const downloadDir = path.join(__dirname, "downloads");
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir, { recursive: true });
}

// 文件上传处理接口
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "未接收到文件" });
    }

    console.log("收到文件上传:", {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    // 模拟文件处理时间
    // await new Promise(resolve => setTimeout(resolve, 2000));

    // // 模拟生成处理结果文件
    // const resultFiles = await generateMockResultFiles(req.file);

    res.json({
      message: "文件上传处理成功",
      data: [
        {
          name: "分析报告",
          url: "/downloads/analysis_report.txt",
          size: 1000,
        },
        {
          name: "内容摘要",
          url: "/downloads/content_summary.md",
          size: 1000,
        },
        {
          name: "xlsx",
          url: "/downloads/content_summary.xlsx",
          size: 20,
        },
      ],
    });
  } catch (error) {
    console.error("文件上传处理错误:", error);
    res.status(500).json({
      error: "文件处理失败",
      details: error.message,
    });
  }
});

// 模拟生成处理结果文件的函数
async function generateMockResultFiles(uploadedFile) {
  const fileExt = path.extname(uploadedFile.originalname);
  const baseName = path.basename(uploadedFile.originalname, fileExt);

  const resultFiles = [];

  // 生成分析报告
  const analysisFileName = `${baseName}_分析报告.txt`;
  const analysisFilePath = path.join(downloadDir, analysisFileName);
  const analysisContent = `文件分析报告
=================

原文件名: ${uploadedFile.originalname}
文件大小: ${(uploadedFile.size / 1024).toFixed(2)} KB
上传时间: ${new Date().toLocaleString("zh-CN")}

AI分析结果:
- 这是一个模拟的分析报告
- 文件类型识别正确
- 内容结构良好
- 建议进一步优化格式

处理完成时间: ${new Date().toLocaleString("zh-CN")}
`;

  fs.writeFileSync(analysisFilePath, analysisContent, "utf8");
  resultFiles.push({
    name: analysisFileName,
    url: `/downloads/${analysisFileName}`,
    size: fs.statSync(analysisFilePath).size,
  });

  // 生成摘要文件
  const summaryFileName = `${baseName}_内容摘要.md`;
  const summaryFilePath = path.join(downloadDir, summaryFileName);
  const summaryContent = `# 文档内容摘要

## 基本信息
- **文件名**: ${uploadedFile.originalname}
- **处理时间**: ${new Date().toLocaleString("zh-CN")}

## 主要内容
这是一个由AI生成的文档摘要示例。实际使用时，这里会包含对上传文档的智能分析和摘要。

## 关键词提取
- 人工智能
- 文档处理
- 自动摘要
- 内容分析

## 建议
基于文档内容，建议继续完善相关功能模块。
`;

  fs.writeFileSync(summaryFilePath, summaryContent, "utf8");
  resultFiles.push({
    name: summaryFileName,
    url: `/downloads/${summaryFileName}`,
    size: fs.statSync(summaryFilePath).size,
  });

  return resultFiles;
}

// 文本消息处理接口
app.post("/api/text", async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "消息内容不能为空" });
    }

    console.log("收到文本消息:", {
      message: message.trim(),
      timestamp: new Date().toISOString(),
    });

    // 模拟AI处理时间
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // 生成AI回复文件
    const resultFiles = await generateTextResponseFiles(message.trim());

    res.json({
      message: "文本处理成功",
      data: resultFiles
    });

  } catch (error) {
    console.error("文本处理错误:", error);
    res.status(500).json({
      error: "文本处理失败",
      details: error.message,
    });
  }
});

// 生成文本回复文件的函数
async function generateTextResponseFiles(userMessage) {
  const timestamp = Date.now();
  const resultFiles = [];

  // 生成AI回复文件
  const replyFileName = `AI回复_${timestamp}.md`;
  const replyFilePath = path.join(downloadDir, replyFileName);
  
  const responses = [
    `您好！我收到了您的消息："${userMessage}"。我是蓝盾智擎AI助手，很高兴为您服务！`,
    `感谢您的消息："${userMessage}"。基于我的分析，这是一个很有趣的话题。`,
    `我理解您提到的："${userMessage}"。让我为您提供一些相关的建议和分析。`,
    `关于您说的"${userMessage}"，我觉得这是一个值得深入探讨的问题。`,
    `您的消息"${userMessage}"让我想到了很多相关的知识点，让我为您详细分析一下。`
  ];

  const randomResponse = responses[Math.floor(Math.random() * responses.length)];
  
  const replyContent = `# AI智能回复

## 用户消息
${userMessage}

## AI分析回复
${randomResponse}

## 处理信息
- **处理时间**: ${new Date().toLocaleString("zh-CN")}
- **系统**: 蓝盾智擎-市场监管智能大脑
- **处理状态**: 完成

---
*此回复由AI智能生成，如有疑问请联系技术支持。*
`;

  fs.writeFileSync(replyFilePath, replyContent, "utf8");
  resultFiles.push({
    name: "AI智能回复",
    url: `/downloads/${replyFileName}`,
    size: fs.statSync(replyFilePath).size,
  });

  // 生成对话记录文件
  const logFileName = `对话记录_${timestamp}.txt`;
  const logFilePath = path.join(downloadDir, logFileName);
  
  const logContent = `对话记录
=================

时间: ${new Date().toLocaleString("zh-CN")}
系统: 蓝盾智擎-市场监管智能大脑

[用户]: ${userMessage}
[AI助手]: ${randomResponse}

---
会话ID: TEXT_${timestamp}
处理状态: 完成
`;

  fs.writeFileSync(logFilePath, logContent, "utf8");
  resultFiles.push({
    name: "对话记录",
    url: `/downloads/${logFileName}`,
    size: fs.statSync(logFilePath).size,
  });

  return resultFiles;
}

// 健康检查接口
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Mock Server 运行正常",
    timestamp: new Date().toISOString(),
  });
});

// 错误处理中间件
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "文件大小超过限制(最大10MB)" });
    }
  }

  console.error("服务器错误:", error);
  res.status(500).json({ error: "服务器内部错误" });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 Mock Server 已启动!`);
  console.log(`📍 服务地址: http://localhost:${PORT}`);
  console.log(`📁 文件上传接口: http://localhost:${PORT}/api/upload`);
  console.log(`💬 文本消息接口: http://localhost:${PORT}/api/text`);
  console.log(`💚 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`📂 上传目录: ${uploadDir}`);
  console.log(`📥 下载目录: ${downloadDir}`);
});
