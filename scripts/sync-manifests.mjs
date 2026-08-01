import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const checkOnly = process.argv.includes('--check')
const metadata = JSON.parse(
  fs.readFileSync(path.join(root, 'distribution.json'), 'utf8'),
)

const {
  name,
  marketplaceName,
  displayName,
  version,
  description,
  packageDescription,
  shortDescription,
  longDescription,
  homepage,
  repository,
  license,
  author,
  interface: skillInterface,
  keywords,
} = metadata

const json = (value) => `${JSON.stringify(value, null, 2)}\n`
const files = new Map()
const addJson = (relativePath, value) => files.set(relativePath, json(value))

const commonPlugin = {
  name,
  version,
  description,
  author: {
    name: author.name,
    url: author.url,
  },
  homepage,
  repository,
  license,
  keywords,
}

addJson('package.json', {
  name,
  version,
  description: packageDescription,
  private: true,
  type: 'module',
  repository: {
    type: 'git',
    url: repository,
  },
  homepage,
  license,
  keywords,
  scripts: {
    sync: 'node scripts/sync-manifests.mjs',
    'sync:check': 'node scripts/sync-manifests.mjs --check',
    test: 'npm run sync:check && node scripts/validate.mjs',
  },
})

addJson('.codebuddy-plugin/plugin.json', {
  ...commonPlugin,
  category: '视频',
  skills: ['./skills/'],
})

addJson('.codebuddy-plugin/marketplace.json', {
  name: marketplaceName,
  description: `${displayName} 的 WorkBuddy 第三方 Skill 市场`,
  owner: {
    name: author.name,
    email: author.email,
  },
  plugins: [
    {
      name,
      source: '.',
      description,
      version,
      author: {
        name: author.name,
      },
      category: '视频',
      keywords,
      license,
    },
  ],
})

addJson('.codex-plugin/plugin.json', {
  ...commonPlugin,
  skills: './skills/',
  interface: {
    displayName,
    shortDescription,
    longDescription,
    developerName: author.name,
    category: 'Productivity',
    capabilities: ['Read', 'Write'],
    websiteURL: homepage,
    defaultPrompt: [
      '列出我的速创猫 AI 视频工作流。',
      '校验并运行这个 AI 视频生成工作流，持续告诉我进度。',
      '排查失败原因，并从失败节点续跑这个视频工作流。',
    ],
    brandColor: skillInterface.brandColor,
  },
})

addJson('.claude-plugin/plugin.json', {
  ...commonPlugin,
  skills: './skills/',
})

addJson('.claude-plugin/marketplace.json', {
  name: marketplaceName,
  owner: {
    name: author.name,
    email: author.email,
    url: author.url,
  },
  description: `${displayName} 的 Claude Code Skill 市场`,
  version,
  metadata: {
    description: `${displayName} 的 Claude Code Skill 市场`,
    version,
  },
  plugins: [
    {
      name,
      source: './',
      description,
      version,
      author: {
        name: author.name,
        email: author.email,
        url: author.url,
      },
      homepage,
      repository,
      license,
      keywords,
      category: 'productivity',
      skills: './skills/',
    },
  ],
})

files.set(
  'skills/suchuangmao-video-workflow/agents/openai.yaml',
  `interface:
  display_name: ${JSON.stringify(skillInterface.displayName)}
  short_description: ${JSON.stringify(skillInterface.shortDescription)}
  icon_small: ${JSON.stringify(skillInterface.icon)}
  icon_large: ${JSON.stringify(skillInterface.icon)}
  brand_color: ${JSON.stringify(skillInterface.brandColor)}
  default_prompt: ${JSON.stringify(skillInterface.defaultPrompt)}
`,
)

const drift = []

for (const [relativePath, content] of files) {
  const absolutePath = path.join(root, relativePath)
  const current = fs.existsSync(absolutePath)
    ? fs.readFileSync(absolutePath, 'utf8')
    : null

  if (current === content) continue

  if (checkOnly) {
    drift.push(relativePath)
    continue
  }

  fs.mkdirSync(path.dirname(absolutePath), { recursive: true })
  fs.writeFileSync(absolutePath, content, 'utf8')
  console.log(`updated ${relativePath}`)
}

if (drift.length > 0) {
  console.error(
    `以下宿主清单未与 distribution.json 同步：\n${drift
      .map((file) => `- ${file}`)
      .join('\n')}\n请运行 npm run sync。`,
  )
  process.exitCode = 1
} else if (checkOnly) {
  console.log('all host manifests match distribution.json')
}
