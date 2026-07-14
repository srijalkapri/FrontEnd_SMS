import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src');
const files = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (entry.name.endsWith('.tsx') && fs.readFileSync(fullPath, 'utf8').includes('className="table-wrapper"')) {
      files.push(fullPath);
    }
  }
}

walk(root);

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('TableScrollWrapper')) {
    continue;
  }

  const openTag = '<div className="table-wrapper">';
  const start = content.indexOf(openTag);
  if (start === -1) {
    continue;
  }

  const openIndent = content.slice(content.lastIndexOf('\n', start) + 1, start);
  const closeTag = `${openIndent}</div>`;
  const searchFrom = start + openTag.length;
  const closeIndex = content.indexOf(closeTag, searchFrom);

  if (closeIndex === -1) {
    console.warn(`Skip ${file}: closing tag not found`);
    continue;
  }

  content =
    content.slice(0, start) +
    '<TableScrollWrapper>' +
    content.slice(start + openTag.length, closeIndex) +
    '</TableScrollWrapper>' +
    content.slice(closeIndex + closeTag.length);

  if (!content.includes("from '../components/ui/TableScrollWrapper'") &&
      !content.includes('from "../../components/ui/TableScrollWrapper"') &&
      !content.includes("from './ui/TableScrollWrapper'")) {
    const importLine = "import { TableScrollWrapper } from '../components/ui/TableScrollWrapper';\n";
    const importLine2 = "import { TableScrollWrapper } from '../../components/ui/TableScrollWrapper';\n";
    const importLine3 = "import { TableScrollWrapper } from './ui/TableScrollWrapper';\n";

    if (file.includes(`${path.sep}components${path.sep}`) && !file.includes(`${path.sep}components${path.sep}ui${path.sep}`)) {
      const lastImport = content.lastIndexOf('\nimport ');
      const insertAt = content.indexOf('\n', lastImport) + 1;
      content = content.slice(0, insertAt) + importLine3 + content.slice(insertAt);
    } else if (file.includes(`${path.sep}pages${path.sep}`)) {
      const lastImport = content.lastIndexOf('\nimport ');
      const insertAt = content.indexOf('\n', lastImport) + 1;
      content = content.slice(0, insertAt) + importLine2 + content.slice(insertAt);
    } else {
      const lastImport = content.lastIndexOf('\nimport ');
      const insertAt = content.indexOf('\n', lastImport) + 1;
      content = content.slice(0, insertAt) + importLine + content.slice(insertAt);
    }
  }

  fs.writeFileSync(file, content);
  console.log(`Updated ${file}`);
}
