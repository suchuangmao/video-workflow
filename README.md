# 速创猫 AI 视频工作流 Skill

一句话通过速创猫官方 REST API 查看、导入、校验、运行、二创、查进度、排错并续跑 AI 视频工作流，兼容 Coze/扣子工作流。

源码仓库：https://github.com/suchuangmao/video-workflow

## 最短使用方式

把下面一句交给支持 Agent Skill 的 AI 编程助手：

```text
使用速创猫 AI 视频工作流：https://agent.ai-tools.cn/video-workflow-skill
```

用户只需要表达视频目标。Skill 会自动读取机器清单、识别工作流来源和业务输入，再调用官方 REST API；不会要求用户重复安装、配置和运行指令。

## 身份与数据边界

- 在宿主可信环境中配置 `SCM_API_KEY`。
- Skill 只把它作为请求 `https://agent.ai-tools.cn` 时的 `x-api-key` 请求头。
- 不要把密钥粘贴到聊天、工作流输入、URL、日志、脚本或仓库。
- 工作流输入定义中的 `SCM_API_KEY`、`scm_api_key`、`api_key`、`x-api-key` 和 `*_api_key` 字段必须过滤。
- API Key 缺失时，前往 `https://agent.ai-tools.cn/user` 获取或重置，再配置到宿主可信环境。

## 能力

- 列出当前账号资源库和工作流；
- 读取 workflowId、资源库链接或工作流文件；
- 导入官方体验工作流或本地工作流文件；
- 校验业务输入并异步运行工作流；
- 通过同一 Skill 异步二创已有工作流，当前支持提示词与视觉分镜修改；
- 二创权限以后端 capability 的 `allowed` / `reasonCode` 为准，当前仅向有效 SVIP 开放；
- 二创成功后生成新的派生工作流，源工作流始终只读且不会被覆盖；
- 查询 executionId 的状态与日志；
- 从失败节点续跑或取消任务；
- 上传本次任务明确需要的临时素材；
- 根据日志和引用链排查失败原因。

校验、真实执行和续跑统一使用异步请求。请求体使用 `wait=false`，随后轮询执行状态和日志，不依赖长连接同步等待。

## 宿主兼容性

仓库为 WorkBuddy、Claude Code 和 Codex 提供 Skill-only 插件清单。Cursor、OpenCode、ChatGPT、Manus、Qoder、TRAE 等宿主只要支持安装 Agent Skill、读取可信环境变量并发起 HTTPS 请求，也可以使用同一份 `SKILL.md`。

是否已经进入某个宿主官方商店，取决于对应商店的独立审核。仓库中的 `distribution.json` 是名称、版本、关键词、仓库地址和宿主清单的唯一事实源。

## 目录

```text
distribution.json                          发行元数据唯一事实源
scripts/sync-manifests.mjs                 生成并核对各宿主 Skill 清单
scripts/validate.mjs                       检查版本、关键词、安全边界和文件漂移
skills/suchuangmao-video-workflow/SKILL.md 官方 Skill 指令
skills/suchuangmao-video-workflow/agents/  OpenAI UI 元数据
skills/suchuangmao-video-workflow/assets/  速创猫 Skill 图标
.codebuddy-plugin/                         WorkBuddy Skill 清单
.claude-plugin/                            Claude Code Skill 清单
.codex-plugin/                             Codex Skill 清单
```

本仓库不提供业务 CLI、服务端实现、数据库、生产部署配置或任何用户凭据。

## 开源与服务边界

[MIT License](LICENSE) 只覆盖本仓库明确发布的公开 Skill、宿主清单、同步脚本、校验脚本和文档，不覆盖：

- 未在本仓库发布的私有服务端、网站前后端、后台、数据库和基础设施代码；
- 速创猫名称、标志、域名及其他商标或品牌标识；
- 用户账号、API Key、工作流、素材、运行结果、日志及其他服务数据；
- 第三方模型、宿主、素材、软件或在线服务。

复制或修改本仓库不会自动获得在线服务账号、额度、管理权限或数据访问权。调用官方 REST API 前，请同时阅读[使用条款](TERMS.md)和[隐私说明](PRIVACY.md)。

## 安全、隐私与条款

- 发现漏洞时请按[安全政策](SECURITY.md)私下报告，不要在公开 Issue 中附带利用细节、API Key 或用户数据。
- 在线服务的数据类型、使用目的和用户选择见[隐私说明](PRIVACY.md)。
- 开源文件与在线服务各自适用的规则见[使用条款](TERMS.md)。
- 普通安装和使用问题可联系 [support@ai-tools.cn](mailto:support@ai-tools.cn)。

## 开发与发布

修改 `distribution.json` 后运行：

```bash
npm run sync
npm test
```

`npm run sync` 生成各宿主 Skill 清单；`npm test` 检查清单漂移、Skill 结构、关键词、版本、仓库地址、凭据边界和开源边界。GitHub Actions 在 PR、主分支更新和版本 Tag 上执行相同校验。

发布新版本时更新 `distribution.json` 和 canonical Skill，提高版本号，运行同步与测试，创建 Git Tag，再分别提交各宿主商店。每个商店独立发布；某个渠道失败不会污染其他渠道。

## 搜索关键词

速创猫 AI 视频工作流、AI 视频工作流 Skill、Coze 视频工作流、扣子工作流、AI 视频生成、一键生成短视频、短视频自动化、视频工作流、视频工作流插件、工作流运行、工作流二创、视频工作流二创、工作流排错、工作流续跑、失败任务续跑、生成进度、Agent Skill、REST API、coze workflow、video workflow。

## License

Copyright (c) 2026 速创猫。本仓库公开部分采用 [MIT License](LICENSE)；许可范围及不包含的内容见“开源与服务边界”。
