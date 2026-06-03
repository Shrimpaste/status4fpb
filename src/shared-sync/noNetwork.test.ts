/// <reference types="node" />

import { readFileSync, readdirSync } from 'node:fs'
import { basename, dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const sharedSyncDirectory = dirname(fileURLToPath(import.meta.url))

const forbiddenNetworkPatterns = [
  { label: 'fetch', pattern: /\bfetch\s*\(/ },
  { label: 'WebSocket', pattern: /\b(?:new\s+)?WebSocket\s*\(/ },
  { label: 'EventSource', pattern: /\b(?:new\s+)?EventSource\s*\(/ },
  { label: 'XMLHttpRequest', pattern: /\b(?:new\s+)?XMLHttpRequest\s*\(/ },
]

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(directory, entry.name)

    if (entry.isDirectory()) {
      return collectSourceFiles(entryPath)
    }

    if (
      !entry.isFile() ||
      !entry.name.endsWith('.ts') ||
      entry.name.endsWith('.test.ts')
    ) {
      return []
    }

    return [entryPath]
  })
}

describe('shared sync no-network guard', () => {
  it('does not introduce network clients in shared-sync sources', () => {
    const sourceFiles = collectSourceFiles(sharedSyncDirectory)

    expect(sourceFiles.map((file) => basename(file)).sort()).toEqual([
      'localMockSyncClient.ts',
      'localSharedTownSession.ts',
      'sharedStateAdapter.ts',
      'sharedStateValidation.ts',
      'types.ts',
    ])

    const violations = sourceFiles.flatMap((file) => {
      const source = readFileSync(file, 'utf8')
      const displayPath = relative(process.cwd(), file).replaceAll('\\', '/')

      return forbiddenNetworkPatterns
        .filter(({ pattern }) => pattern.test(source))
        .map(({ label }) => `${displayPath}: ${label}`)
    })

    expect(violations).toEqual([])
  })
})
