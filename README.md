# Suchuangmao Video Workflow

Open-source Agent Skill for running, validating, importing, resuming, and troubleshooting Suchuangmao/Coze AI video workflows.

速创猫视频工作流开源 Skill：让 Codex、Claude Code、WorkBuddy 及其他兼容 Agent Skills 的智能体，能够调用速创猫的视频工作流能力。

## Why this project

Video workflows should be easy to discover, install, run, update, and share. This repository is the single source of truth for the public Skill and every release package.

我们希望把复杂的视频生产流程变成任何创作者和小团队都能使用的 Agent 能力，并确保 GitHub、SkillHub、WorkBuddy 等渠道使用同一个版本。

## Install

### skills.sh / Claude Code

```bash
npx skills add suchuangmao/video-workflow --skill suchuangmao-video-workflow
```

### Codex

Ask Codex to install:

```text
Install the Skill from:
https://github.com/suchuangmao/video-workflow/tree/v1.0.0/skills/suchuangmao-video-workflow
```

### WorkBuddy

1. Download `suchuangmao-video-workflow-1.0.0.zip` from the latest GitHub Release.
2. In WorkBuddy, choose “添加技能” → “上传技能”.
3. Upload the ZIP. Its root contains `SKILL.md` and the MIT `LICENSE`.

An uploaded ZIP is a versioned snapshot. WorkBuddy cannot silently replace it when GitHub changes; install the next release or use a marketplace version when available.

## Use

After installation, try:

```text
运行这个工作流：https://agent.ai-tools.cn/workflow-library?workflowId=...
```

```text
用这个 zip 工作流生成一个图文口播视频。
```

```text
排查 executionId 为 ... 的失败原因，并从失败处继续。
```

The Skill does not require credentials during installation. Before the first API operation, store your Suchuangmao API key in a trusted local environment:

```bash
export SCM_API_KEY="your-api-key"
```

Get or reset the key at <https://agent.ai-tools.cn/user>.

## Data boundary

The Skill has no installation hook and sends no application data during installation. GitHub, npm, or another distribution channel may still receive ordinary network metadata.

Validation, inspection, import, execution, resume, troubleshooting, and user-confirmed capability reporting may send the selected workflow, prompts, code, requested inputs, explicitly provided media, execution identifiers, logs, and minimal diagnostic evidence to `https://agent.ai-tools.cn`. The API key is sent only through the `x-api-key` header. Temporary asset URLs and execution logs must be treated as sensitive and should not be copied into chat summaries or source control. The service may retain normal request metadata, workflow execution state, and uploaded assets according to its product policy.

See the complete operating and privacy rules in [`SKILL.md`](skills/suchuangmao-video-workflow/SKILL.md).

## Releases

- Skill version: `1.0.0`
- Release tag: `v1.0.0`
- WorkBuddy package: `suchuangmao-video-workflow-1.0.0.zip`
- License: MIT

Every `v*` tag is validated and packaged by GitHub Actions. Release assets include the ZIP, a manifest, and a SHA-256 checksum.

## Project links

- Website: <https://agent.ai-tools.cn>
- Workflow library: <https://agent.ai-tools.cn/workflow-library>
- Skill documentation: <https://agent.ai-tools.cn/video-workflow-skill>
- Issues: <https://github.com/suchuangmao/video-workflow/issues>

## Contributing

Issues and pull requests are welcome. Never include API keys, customer workflows, signed asset URLs, private documents, or execution logs containing user data.

By contributing, you agree that your contribution is licensed under the MIT License.

The MIT License covers original files in this repository. It does not grant rights to the remote Suchuangmao service, user workflows, third-party media, third-party APIs, or the Coze and other third-party trademarks.
