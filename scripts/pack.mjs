/**
 * Creates a versioned zip of dist/ → releases/re-phraser-v{version}.zip
 * Run via: npm run package  (which runs: npm run build && node scripts/pack.mjs)
 */

import { execSync } from 'child_process';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
const { version } = pkg;

const distDir = resolve(root, 'dist');
const releasesDir = resolve(root, 'releases');
const zipName = `re-phraser-v${version}.zip`;
const zipPath = resolve(releasesDir, zipName).replaceAll('\\', '/');

if (!existsSync(distDir)) {
  console.error('Error: dist/ not found. Run `npm run build` first.');
  process.exit(1);
}

mkdirSync(releasesDir, { recursive: true });

const pyScript = `
import zipfile, pathlib
dist = pathlib.Path(r'${distDir}')
out  = pathlib.Path(r'${zipPath}')
with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as zf:
    for f in dist.rglob('*'):
        if f.is_file():
            zf.write(f, f.relative_to(dist))
print(f'Created {out.name}  ({round(out.stat().st_size/1024, 1)} KB)')
`.trim();

const py = process.platform === 'win32' ? 'python' : 'python3';

console.log(`Packaging Re-Phraser v${version}...`);
execSync(`${py} -c "${pyScript.replaceAll('"', '\\"')}"`, { stdio: 'inherit', shell: true });
console.log(`\nDone → releases/${zipName}`);
console.log('Attach this file to your GitHub Release.');
