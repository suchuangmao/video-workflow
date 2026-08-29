import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const readJson = (relativePath) =>
  JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'))
const readText = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), 'utf8')

const distribution = readJson('distribution.json')
const codex = readJson('.codex-plugin/plugin.json')
const workbuddy = readJson('.codebuddy-plugin/plugin.json')
const workbuddyMarketplace = readJson('.codebuddy-plugin/marketplace.json')
const claude = readJson('.claude-plugin/plugin.json')
const claudeMarketplace = readJson('.claude-plugin/marketplace.json')
const pkg = readJson('package.json')
const readme = readText('README.md')
const license = readText('LICENSE')
const security = readText('SECURITY.md')
const privacy = readText('PRIVACY.md')
const terms = readText('TERMS.md')
const skill = readText('skills/suchuangmao-video-workflow/SKILL.md')
const openai = readText('skills/suchuangmao-video-workflow/agents/openai.yaml')
const logo = fs.readFileSync(
  path.join(root, 'skills/suchuangmao-video-workflow/assets/scm-logo.png'),
)

const expectedName = 'suchuangmao-video-workflow'
const expectedVersion = distribution.version
const escapedExpectedVersion = expectedVersion.replaceAll('.', '\\.')
const expectedRepository = 'https://github.com/suchuangmao/video-workflow'
const expectedHeadline = '# 速创猫 AI 视频工作流 Skill'
const removedServerField = ['m', 'cpServers'].join('')
const requiredKeywords = [
  '视频工作流插件',
  '工作流运行',
  '工作流二创',
  '视频工作流二创',
  '工作流续跑',
  '失败任务续跑',
  '生成进度',
  'Coze 视频工作流',
  '扣子',
  'coze workflow',
  '视频工作流',
  '短视频自动化',
  '速创猫',
  '速创猫 AI 视频工作流',
  'AI 视频工作流 Skill',
  'REST API',
]

assert.equal(distribution.name, expectedName)
assert.equal(distribution.version, expectedVersion)
assert.equal(distribution.repository, expectedRepository)
assert.equal(distribution.api.baseUrl, 'https://agent.ai-tools.cn')
assert.equal(distribution.api.authentication, 'x-api-key')
assert.equal(distribution.api.credentialEnv, 'SCM_API_KEY')
assert.equal(distribution.api.executionMode, 'async')
assert.equal(distribution.api.wait, false)
assert.equal(distribution.compatibility.protocol, 'Agent Skill + HTTPS REST API')

const hostPlugins = new Map([
  ['Codex Skill', codex],
  ['Claude Code Skill', claude],
  ['WorkBuddy Skill', workbuddy],
])

for (const [label, manifest] of hostPlugins) {
  assert.equal(manifest.name, expectedName, `${label} name 不一致`)
  assert.equal(manifest.version, expectedVersion, `${label} version 不一致`)
  assert.equal(manifest.description, distribution.description, `${label} description 不一致`)
  assert.equal(manifest.repository, expectedRepository, `${label} repository 不一致`)
  assert.equal(manifest[removedServerField], undefined, `${label} 只能声明 skills`)
  assert.ok(manifest.skills, `${label} 缺少 skills`)
}

for (const [label, marketplace] of [
  ['Claude Code 市场', claudeMarketplace],
  ['WorkBuddy 市场', workbuddyMarketplace],
]) {
  const entry = marketplace.plugins[0]
  assert.equal(marketplace.name, distribution.marketplaceName)
  assert.equal(entry.name, expectedName)
  assert.equal(entry.version, expectedVersion)
  assert.equal(entry.description, distribution.description, `${label} description 不一致`)
  assert.equal(entry[removedServerField], undefined, `${label} 只能发布 Skill`)
}

assert.equal(pkg.version, expectedVersion)
assert.equal(pkg.private, true)
assert.equal(pkg.bin, undefined)
assert.equal(pkg.repository.url, expectedRepository)
assert.equal(pkg.homepage, distribution.homepage)

assert.match(skill, /^---\nname: suchuangmao-video-workflow\ndescription: [^\n]+\n---\n/)
assert.match(skill, new RegExp(`version: ${escapedExpectedVersion}`))
assert.match(skill, new RegExp(expectedRepository.replaceAll('.', '\\.')))
assert.match(skill, /SCM_API_KEY/)
assert.match(skill, /x-api-key: \$SCM_API_KEY/)
assert.match(skill, /mode=validate_only.*wait=false/)
assert.match(skill, /mode=run.*wait=false/)
assert.match(skill, /workflow\.remix@1/)
assert.match(skill, /GET \/api\/v1\/video-workflow-operations\/capabilities/)
assert.match(skill, /POST \/api\/v1\/video-workflow-operations\/operations/)
assert.match(skill, /active SVIP account/)
assert.match(skill, /allowed.*reasonCode/)
assert.match(skill, /sourceWorkflowId.*read-only origin/s)
assert.match(skill, /data\.result\.derivedWorkflowId/)
assert.match(skill, /supports only `prompt` and `storyboard`/)
assert.match(skill, /not a separate Skill/)
assert.doesNotMatch(skill, /COZE_LLM_DATA_CONTRACT/)
assert.doesNotMatch(skill, /outputJsonShape/)
assert.doesNotMatch(skill, /allowCodeExecution\s*[:=]\s*true/)

assert.match(openai, /display_name: "速创猫 AI 视频工作流"/)
assert.match(openai, /icon_small: "\.\/assets\/scm-logo\.png"/)
assert.match(openai, /icon_large: "\.\/assets\/scm-logo\.png"/)
assert.match(openai, /default_prompt: ".*\$suchuangmao-video-workflow.*"/)
assert.doesNotMatch(openai, /^dependencies:/m)
assert.equal(logo.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')

assert.equal(readme.split('\n')[0], expectedHeadline)
assert.match(readme, /SCM_API_KEY/)
assert.match(readme, /官方 REST API/)
assert.match(readme, /不提供业务 CLI/)
assert.match(readme, /MIT License.*只覆盖本仓库明确发布的公开 Skill/s)
assert.match(readme, /私有服务端、网站前后端、后台、数据库和基础设施代码/)
assert.match(readme, /https:\/\/github\.com\/suchuangmao\/video-workflow/)
assert.match(readme, /\[安全政策\]\(SECURITY\.md\)/)
assert.match(readme, /\[隐私说明\]\(PRIVACY\.md\)/)
assert.match(readme, /\[使用条款\]\(TERMS\.md\)/)

assert.match(license, /Copyright \(c\) 2026 速创猫/)
assert.match(security, /support@ai-tools\.cn/)
assert.match(security, /官方 REST API/)
assert.match(privacy, /SCM_API_KEY/)
assert.match(privacy, /二创并生成派生工作流/)
assert.match(privacy, /本仓库本身不会要求你提供账号、Token 或 API Key/)
assert.match(terms, /公开 Agent Skill、宿主清单、同步脚本、校验脚本和文档按 MIT License 提供/)
assert.match(terms, /未在本仓库发布的私有服务端、前端、后台、数据库和部署代码/)

const shortDescriptionMatch = openai.match(
  /^\s*short_description:\s*"([^"]+)"\s*$/m,
)
assert.ok(shortDescriptionMatch, 'openai.yaml 缺少 short_description')
const shortDescriptionLength = Array.from(shortDescriptionMatch[1]).length
assert.ok(
  shortDescriptionLength >= 25 && shortDescriptionLength <= 64,
  `short_description 长度必须为 25–64 个字符，当前为 ${shortDescriptionLength}`,
)

for (const [label, keywords] of [
  ['WorkBuddy Skill', workbuddy.keywords],
  ['WorkBuddy 市场 Skill', workbuddyMarketplace.plugins[0].keywords],
  ['Codex Skill', codex.keywords],
  ['Claude Code Skill', claude.keywords],
  ['Claude Code 市场 Skill', claudeMarketplace.plugins[0].keywords],
  ['package.json', pkg.keywords],
]) {
  assert.ok(Array.isArray(keywords), `${label} keywords 必须是数组`)
  assert.equal(new Set(keywords).size, keywords.length, `${label} keywords 存在重复项`)
  for (const keyword of requiredKeywords) {
    assert.ok(keywords.includes(keyword), `${label} 缺少关键词：${keyword}`)
  }
}

console.log('suchuangmao-video-workflow Skill + REST distribution is valid')
