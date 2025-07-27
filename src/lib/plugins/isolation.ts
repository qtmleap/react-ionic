import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Plugin } from 'vite'

export const ViteSharedBuffer = (): Plugin => ({
  name: 'configure-server',

  configureServer(server) {
    server.middlewares.use((_req, res, next) => {
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
      res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
      next()
    })
  },

  closeBundle() {
    const headers: string[] = [
      // '/*',
      // '  Cross-Origin-Opener-Policy: same-origin',
      // '  Cross-Origin-Embedder-Policy: require-corp',
      // 'https://cdn.discordapp.com/*',
      // '  Cross-Origin-Resource-Policy: cross-origin',
      // 'https://image-pona.heroz.jp/*',
      // '  Cross-Origin-Resource-Policy: cross-origin'
    ]
    writeFileSync(resolve(process.cwd(), 'dist/_headers'), headers.join('\n').trim(), 'utf8')
    writeFileSync(resolve(process.cwd(), 'dist/_headers'), headers.join('\n').trim(), 'utf8')
  }
})
