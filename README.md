<div align="center">

# 速创猫视频工作流 Skill

**把工作流链接交给你的 Agent，让它帮你校验、运行、续跑和排查 AI 视频任务。**

Suchuangmao Video Workflow is an open-source Agent Skill for running and troubleshooting Suchuangmao/Coze AI video workflows.

[![Validate](https://github.com/suchuangmao/video-workflow/actions/workflows/validate.yml/badge.svg)](https://github.com/suchuangmao/video-workflow/actions/workflows/validate.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-2563eb.svg)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-compatible-7c3aed.svg)](skills/suchuangmao-video-workflow/SKILL.md)

[浏览工作流库](https://agent.ai-tools.cn/workflow-library) · [60 秒安装](#60-秒安装) · [第一次运行](#3-分钟完成第一次运行) · [问题反馈](https://github.com/suchuangmao/video-workflow/issues)

</div>

> **当前发布状态**
>
> 公开源码已经可以通过 `skills` CLI 安装。适用于 WorkBuddy 的免解压 ZIP 将随 `v1.0.0` GitHub Release 提供；正式发布前，请不要从非官方渠道下载同名安装包。
>
> WorkBuddy 本地桌面版目前可以上传 Skill，但官方尚未公开统一的自定义 Secret 配置入口。需要调用速创猫 API 时，请先阅读下方的[平台密钥兼容说明](#首次运行前安全配置-api-key)。

## 它能帮你做什么

- **运行工作流**：把速创猫工作流资源库链接或 `workflowId` 交给 Agent，完成输入确认、校验和执行。
- **先校验再消耗**：在真正运行前检查工作流、权限和必填参数，减少无效执行。
- **失败后继续**：通过 `executionId` 查看状态，并从可恢复的失败节点续跑。
- **协助排错**：分析失败信息，给出下一步动作，同时避免在聊天和代码仓库中暴露密钥、签名链接或完整日志。
- **导入与检查**：识别 zip、txt、json、yaml 工作流文件，在用户确认后执行导入或能力检查。

适合希望让 Agent 处理视频工作流的创作者，也适合在 Codex、Claude Code、腾讯云智能体开发平台或 WorkBuddy 企业 Agent 中开发和维护视频工作流的团队。

## 60 秒安装

### WorkBuddy 本地桌面版

`v1.0.0` 正式发布后：

1. 打开本仓库的 [Releases](https://github.com/suchuangmao/video-workflow/releases) 页面。
2. 下载 `suchuangmao-video-workflow-1.0.0.zip`，**不要解压**。
3. 在 WorkBuddy 中选择“添加技能” → “上传技能”，直接上传 ZIP。

上传的 ZIP 是固定版本快照。GitHub 更新不会静默替换你已经安装的版本；新版本发布后，需要重新上传新版 ZIP，或使用未来的商店版本更新。

> 上传成功只表示 Skill 文件已经安装。涉及速创猫 API 的操作还需要安全注入 `SCM_API_KEY`；WorkBuddy 本地桌面版目前没有公开、可依赖的统一 Secret 配置方式，请勿把密钥粘贴到聊天中。

### skills CLI / Claude Code

```bash
npx skills add suchuangmao/video-workflow --skill suchuangmao-video-workflow
```

### Codex

直接对 Codex 说：

```text
请从下面的 GitHub 地址安装 Skill：
https://github.com/suchuangmao/video-workflow/tree/main/skills/suchuangmao-video-workflow
```

正式版发布后，如果你希望固定使用某个版本，请把地址中的 `main` 换成对应标签，例如 `v1.0.0`。

## 首次运行前：安全配置 API Key

安装 Skill 本身不需要密钥。第一次读取或运行工作流前：

1. 前往[速创猫用户中心](https://agent.ai-tools.cn/user)获取或重置 API Key。
2. 按当前平台支持的安全方式配置 `SCM_API_KEY`。
3. **不要把 API Key 粘贴到聊天、提示词、工作流文件、Issue 或代码仓库中。**

Codex、Claude Code 等可信本地终端环境示例：

```bash
export SCM_API_KEY="your-api-key"
```

不同平台的安全配置边界：

- **Codex / Claude Code 等本地 Agent**：在启动 Agent 的可信终端环境中配置 `SCM_API_KEY`。
- **[腾讯云智能体开发平台](https://cloud.tencent.com/document/product/1759/129563)**：在“管理 Skills”→“环境变量”中新增 `SCM_API_KEY`，由平台加密保存并在调用时注入。
- **[WorkBuddy 企业 Agent](https://cloud.tencent.com/document/product/1831/134527)**：通过 Agent Manifest 的 `secrets` 或企业后台“凭据管理”配置。
- **[WorkBuddy 本地桌面版](https://cloud.tencent.com/document/product/1831/134432)**：截至当前，官方尚未公开上传自定义 Skill 后的统一 Secret 配置入口，也未保证继承终端环境变量。如果客户端没有“环境变量”或“凭据”设置，请勿在聊天中粘贴密钥；可暂时改用上述本地、云端或企业方式。

## 3 分钟完成第一次运行

### 第 1 步：选择工作流

打开[速创猫工作流资源库](https://agent.ai-tools.cn/workflow-library)，选择一个你有权使用的工作流，并复制完整链接。

### 第 2 步：先校验

把下面这段话和工作流链接发给已经安装 Skill 的 Agent：

```text
请使用 suchuangmao-video-workflow。
先只校验，不要执行。请读取这个工作流需要的输入，并只追问缺少的必填项：
<粘贴从工作流资源库复制的完整链接>
```

### 第 3 步：确认执行

校验通过后继续说：

```text
校验通过后运行这个工作流，等待任务结束，并把 executionId、运行状态和结果链接告诉我。
```

如果任务失败，可以继续说：

```text
请排查这个 executionId 的失败原因；如果能够安全续跑，请先说明将从哪里继续，等我确认后再执行：
<粘贴 executionId>
```

## 安装与更新方式

| 平台 | 安装方式 | 更新方式 |
| --- | --- | --- |
| WorkBuddy 本地桌面版 | 上传 GitHub Release ZIP；API 调用仍取决于安全凭据能力 | 新版本发布后重新上传 ZIP；商店版本上线后可按商店提示更新 |
| 腾讯云智能体开发平台 / WorkBuddy 企业 Agent | 上传 Skill，并在平台凭据功能中配置密钥 | 按平台版本管理或企业发布流程更新 |
| skills CLI / Claude Code | `npx skills add suchuangmao/video-workflow` | 重新运行安装命令并检查版本变更 |
| Codex | 从 GitHub Skill 目录安装 | 重新安装最新版，或固定使用 `v*` 标签 |

GitHub 是本项目的唯一源码和版本源。未来上架 SkillHub、WorkBuddy 等渠道时，各渠道将使用相同的 Skill 名称、版本号和发布内容。

## 常见问题

### 为什么 WorkBuddy 现在还没有 ZIP？

首个 ZIP 会由 `v1.0.0` 标签触发 GitHub Actions 自动生成，并与 manifest、SHA-256 校验文件一起发布。在正式 Release 出现前，请使用公开源码安装方式。

### 出现 401 怎么办？

确认运行 Agent 的可信环境中已经配置 `SCM_API_KEY`。不要把 Key 发到 Issue 或聊天中。

### 出现 403 怎么办？

通常表示当前账号没有目标工作流的访问或执行权限。请检查工作流是否公开、是否已经购买，或是否属于当前账号。

### 工作流失败后如何求助？

优先把 `executionId` 交给 Agent 排查。如果需要提交 GitHub Issue，只描述可公开复现的步骤和脱敏后的错误摘要；不要提交 API Key、客户工作流、签名资源链接、私有文档或包含用户数据的原始日志。

## 数据与安全边界

Skill 没有安装钩子，安装时不会向速创猫发送业务数据。GitHub、npm 或其他分发渠道仍可能收到正常的网络元数据。

在用户发起校验、检查、导入、执行、续跑、排错或确认提交能力报告时，所选工作流、提示词、代码、必要输入、用户明确提供的媒体、执行标识和最小诊断证据可能会发送到 `https://agent.ai-tools.cn`。API Key 只应通过 `x-api-key` 请求头发送。临时资源链接和执行日志应按敏感数据处理，不应复制到聊天摘要或代码仓库。

完整操作规则和隐私约束见 [`SKILL.md`](skills/suchuangmao-video-workflow/SKILL.md)。

## 版本与发布

- Skill 名称：`suchuangmao-video-workflow`
- 当前源码版本：`1.0.0`
- 首个正式标签：`v1.0.0`
- WorkBuddy 安装包：`suchuangmao-video-workflow-1.0.0.zip`
- 开源协议：MIT

每个 `v*` 标签都会由 GitHub Actions 自动校验并打包。Release 资产包括 ZIP、manifest 和 SHA-256 校验文件。

## 项目链接

- 官网：<https://agent.ai-tools.cn>
- 工作流资源库：<https://agent.ai-tools.cn/workflow-library>
- Skill 说明页：<https://agent.ai-tools.cn/video-workflow-skill>
- 问题反馈：<https://github.com/suchuangmao/video-workflow/issues>

## 参与贡献

欢迎提交 Issue 和 Pull Request。请勿提交 API Key、客户工作流、签名资源链接、私有文档或包含用户数据的执行日志。

贡献即表示你同意以 MIT License 授权你的贡献。MIT License 只覆盖本仓库原创文件，不授予远程速创猫服务、用户工作流、第三方媒体、第三方 API、Coze 或其他第三方商标的相关权利。

## English summary

Suchuangmao Video Workflow is an open-source Agent Skill for Codex, Claude Code, WorkBuddy, and other Agent Skills-compatible clients. It can validate, run, import, resume, and troubleshoot Suchuangmao/Coze AI video workflows.

Install from GitHub:

```bash
npx skills add suchuangmao/video-workflow --skill suchuangmao-video-workflow
```

Before the first API operation, store your Suchuangmao API key through a trusted credential mechanism as `SCM_API_KEY`. WorkBuddy Desktop currently has no documented universal Secret configuration path for uploaded custom Skills. Never paste the key into chat, prompts, workflow files, issues, or source control.
