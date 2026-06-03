import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

function readJson<T>(relativePath: string): T {
  const filePath = fileURLToPath(new URL(relativePath, import.meta.url))

  expect(existsSync(filePath)).toBe(true)

  return JSON.parse(readFileSync(filePath, 'utf8')) as T
}

function readText(relativePath: string) {
  const filePath = fileURLToPath(new URL(relativePath, import.meta.url))

  expect(existsSync(filePath)).toBe(true)

  return readFileSync(filePath, 'utf8')
}

describe('Tauri tray shell configuration', () => {
  it('adds Tauri v2 scripts and dependencies to package.json', () => {
    const packageJson = readJson<{
      dependencies?: Record<string, string>
      devDependencies?: Record<string, string>
      scripts?: Record<string, string>
    }>('../package.json')

    expect(packageJson.scripts).toMatchObject({
      tauri: 'tauri',
      'tauri:dev': 'tauri dev',
      'tauri:build': 'tauri build',
    })
    expect(packageJson.dependencies?.['@tauri-apps/api']).toMatch(/^\^2\./)
    expect(packageJson.devDependencies?.['@tauri-apps/cli']).toMatch(/^\^2\./)
  })

  it('points Tauri at the existing Vite build and dev server', () => {
    const config = readJson<{
      build?: {
        beforeBuildCommand?: string
        beforeDevCommand?: string
        devUrl?: string
        frontendDist?: string
      }
      identifier?: string
      productName?: string
    }>('../src-tauri/tauri.conf.json')

    expect(config.productName).toBe('status4fpb')
    expect(config.identifier).toBe('com.status4fpb.app')
    expect(config.build).toMatchObject({
      beforeBuildCommand: 'npm run build',
      beforeDevCommand:
        'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort',
      devUrl: 'http://localhost:5173',
      frontendDist: '../dist',
    })
  })

  it('defines the Rust-side tray menu spike actions', () => {
    const libRs = readText('../src-tauri/src/lib.rs')
    const cargoToml = readText('../src-tauri/Cargo.toml')

    expect(cargoToml).toContain('name = "status4fpb"')
    expect(cargoToml).toContain('features = ["tray-icon"]')
    expect(libRs).toContain('TrayIconBuilder')
    expect(libRs).toContain('"open_home"')
    expect(libRs).toContain('"quit"')
    expect(libRs).toContain('get_webview_window("main")')
  })
})
