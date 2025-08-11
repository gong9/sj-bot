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
  console.log(`💚 健康检查: http://localhost:${PORT}/api/health`);
  console.log(`📂 上传目录: ${uploadDir}`);
  console.log(`📥 下载目录: ${downloadDir}`);
});
