#!/usr/bin/env node
// Verifies messages/en/*.json and messages/bn/*.json have identical key sets
// and that every namespace in i18n/namespaces.ts has both files.
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..', 'messages')
const locales = ['en', 'bn']
const nsSource = readFileSync(join(import.meta.dirname, '..', 'i18n', 'namespaces.ts'), 'utf8')
const namespaces = [...nsSource.matchAll(/'([a-zA-Z]+)'/g)].map((m) => m[1])

function flatten(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v) ? flatten(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  )
}

let problems = 0
const files = new Set(locales.flatMap((l) => readdirSync(join(root, l)).filter((f) => f.endsWith('.json'))))
for (const ns of namespaces) {
  if (!files.has(`${ns}.json`)) files.add(`${ns}.json`)
}
for (const file of [...files].sort()) {
  const keys = {}
  for (const l of locales) {
    const p = join(root, l, file)
    if (!existsSync(p)) {
      console.error(`✗ missing ${l}/${file}`)
      problems++
      continue
    }
    keys[l] = new Set(flatten(JSON.parse(readFileSync(p, 'utf8'))))
  }
  if (!keys.en || !keys.bn) continue
  for (const [a, b] of [['en', 'bn'], ['bn', 'en']]) {
    for (const k of keys[a]) {
      if (!keys[b].has(k)) {
        console.error(`✗ ${file}: "${k}" in ${a} but not ${b}`)
        problems++
      }
    }
  }
  if (!namespaces.includes(file.replace(/\.json$/, ''))) {
    console.error(`✗ ${file} is not listed in i18n/namespaces.ts`)
    problems++
  }
}
if (problems) {
  console.error(`\n${problems} i18n problem(s).`)
  process.exit(1)
}
console.log(`✓ en/bn message keys match across ${files.size} namespaces.`)
