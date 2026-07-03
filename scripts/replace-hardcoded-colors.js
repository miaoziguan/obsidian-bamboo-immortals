const fs = require('fs');
const path = require('path');

const styleDir = '/Users/pokerhu/Downloads/CJ/obsidian-bamboo-review/webapp/assets/styles';

// 排除 bamboo-garden.css（装饰性渐变保留）
const files = [
  'variables.css',
  'base.css',
  'display.css',
  'theme-effects.css',
  'toast.css',
  'forms.css',
  'fab.css',
  'timeline.css',
  'section-manager.css',
  'goals.css',
  'components.css',
  'modal.css',
];

// 需要替换的硬编码颜色映射
// 格式：正则 → 替换字符串（$1 保留 alpha 值）
const replacements = [
  // 竹绿主色 rgba(90, 154, 90, A) → 自适应
  {
    regex: /rgba\(\s*90,\s*154,\s*90,\s*([0-9.]+)\)/g,
    replace: (_, a) => `rgba(var(--primary-rgb), ${a})`,
    name: 'primary'
  },
  // 竹深绿 rgba(45, 90, 39, A) → 自适应
  {
    regex: /rgba\(\s*45,\s*90,\s*39,\s*([0-9.]+)\)/g,
    replace: (_, a) => `rgba(var(--deep-rgb), ${a})`,
    name: 'deep'
  },
  // 暗色模式竹绿 rgba(90, 154, 88, A) → 自适应（用 primary-rgb）
  {
    regex: /rgba\(\s*90,\s*154,\s*88,\s*([0-9.]+)\)/g,
    replace: (_, a) => `rgba(var(--primary-rgb), ${a})`,
    name: 'primary-dark'
  },
  // 暗色模式边框绿 rgba(100, 160, 100, A) → 自适应
  {
    regex: /rgba\(\s*100,\s*160,\s*100,\s*([0-9.]+)\)/g,
    replace: (_, a) => `rgba(var(--primary-rgb), ${a})`,
    name: 'primary-mid-dark'
  },
  // 竹浅绿 rgba(168, 213, 168, A) → 自适应
  {
    regex: /rgba\(\s*168,\s*213,\s*168,\s*([0-9.]+)\)/g,
    replace: (_, a) => `rgba(var(--pale-rgb), ${a})`,
    name: 'pale'
  },
  // 竹浅绿 #A8D5A8 的 hex 形式（在 gradients 里可能用）
  // rgba(138, 196, 138, A) → 自适应（接近 dark primary）
  {
    regex: /rgba\(\s*138,\s*196,\s*138,\s*([0-9.]+)\)/g,
    replace: (_, a) => `rgba(var(--primary-rgb), ${a})`,
    name: 'primary-light'
  },
  //  danger rgb
  {
    regex: /rgba\(\s*201,\s*72,\s*59,\s*([0-9.]+)\)/g,
    replace: (_, a) => `rgba(var(--danger-rgb), ${a})`,
    name: 'danger'
  },
  // gold rgb
  {
    regex: /rgba\(\s*212,\s*175,\s*55,\s*([0-9.]+)\)/g,
    replace: (_, a) => `rgba(var(--gold-rgb), ${a})`,
    name: 'gold'
  },
  // 暗色模式 danger rgba(239, 83, 80, A) 和 rgba(255, 107, 107, A)
  {
    regex: /rgba\(\s*239,\s*83,\s*80,\s*([0-9.]+)\)/g,
    replace: (_, a) => `rgba(var(--danger-rgb), ${a})`,
    name: 'danger-dark'
  },
  {
    regex: /rgba\(\s*255,\s*107,\s*107,\s*([0-9.]+)\)/g,
    replace: (_, a) => `rgba(var(--danger-rgb), ${a})`,
    name: 'danger-dark-2'
  },
  // 暗色模式 gold rgba(255, 217, 61, A) 和 rgba(255, 224, 130, A)
  {
    regex: /rgba\(\s*255,\s*217,\s*61,\s*([0-9.]+)\)/g,
    replace: (_, a) => `rgba(var(--gold-rgb), ${a})`,
    name: 'gold-dark'
  },
  {
    regex: /rgba\(\s*255,\s*224,\s*130,\s*([0-9.]+)\)/g,
    replace: (_, a) => `rgba(var(--gold-rgb), ${a})`,
    name: 'gold-dark-2'
  },
  // info blue rgba(79, 195, 247, A)
  {
    regex: /rgba\(\s*79,\s*195,\s*247,\s*([0-9.]+)\)/g,
    replace: (_, a) => `rgba(var(--info-rgb, 79, 195, 247), ${a})`,
    name: 'info'
  },
];

// 先检查 variables.css 是否有 --info-rgb，没有就加
const varFile = path.join(styleDir, 'variables.css');
let varContent = fs.readFileSync(varFile, 'utf8');

// 确保 --info-rgb 存在
if (!varContent.includes('--info-rgb')) {
  varContent = varContent.replace(
    /(--status-info-bg:\s*rgba\(\s*79,\s*195,\s*247,\s*[0-9.]+\);)/,
    '$1\n    --info-rgb: 79, 195, 247;'
  );
  // 暗色也加
  varContent = varContent.replace(
    /(html\.dark\s*\{)/,
    '$1\n    --info-rgb: 79, 195, 247;'
  );
  fs.writeFileSync(varFile, varContent, 'utf8');
  console.log('Added --info-rgb to variables.css');
}

let totalReplacements = 0;

for (const file of files) {
  const filePath = path.join(styleDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file} (not found)`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fileCount = 0;

  for (const { regex, replace } of replacements) {
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, replace);
      fileCount += matches.length;
    }
  }

  if (fileCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`${file}: ${fileCount} replacements`);
    totalReplacements += fileCount;
  } else {
    console.log(`${file}: no changes`);
  }
}

console.log(`\nTotal replacements: ${totalReplacements}`);
