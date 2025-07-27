import { type EngineInfo, EngineInfoStringSchema } from '@/models/message.dto'
import YaneuraOu_K_P from './lib/yaneuraou.k-p'
import type { YaneuraOuModule } from './lib/yaneuraou.module'
// import { Engine } from './options'

export enum EngineOptionName {}

export type EngineOption = {
  name: EngineOptionName
  value: string | number | boolean
}

export class YaneuraOu {
  private engine: YaneuraOuModule | null = null
  // private options: EngineOption[] = []
  private wCache: { [index: string]: boolean } = {}
  private rCache: { [index: string]: string } = {}

  postMessage = async (command: string): Promise<void> => {
    console.log(`> ${command}`)
    if (this.engine === null) {
      console.error('Engine is not initialized.', command)
      return
    }
    this.engine.postMessage(command)
  }

  postMessageWait = async (command: string, line: string, ...lines: string[]): Promise<{ [index: string]: string }> => {
    this.wCache[line] = true
    for (const line of lines) {
      this.rCache[line] = ''
    }
    this.postMessage(command)
    return new Promise<{ [index: string]: string }>((resolve) => {
      const poll = () => {
        if (this.wCache[line]) {
          setTimeout(poll, 0)
        } else {
          delete this.wCache[line]
          const result: { [index: string]: string } = {}
          result[line] = this.rCache[line]
          for (const line of lines) {
            result[line] = this.rCache[line]
          }
          resolve(result)
        }
      }
      poll()
    })
  }

  async init(): Promise<boolean> {
    this.engine = await YaneuraOu_K_P()
    if (this.engine === null) {
      console.error('Engine is not initialized.')
      return false
    }
    this.engine.addMessageListener((line) => {
      console.log(`< ${line}`)
      Object.keys(this.rCache)
        .filter((v) => line.startsWith(v))
        .forEach((v) => {
          this.rCache[v] = line
        })
      Object.keys(this.wCache)
        .filter((v) => line.startsWith(v))
        .forEach((v) => {
          this.rCache[v] = line
          this.wCache[v] = false
        })
    })
    await this.postMessageWait('usi', 'usiok')
    await this.postMessage('setoption name USI_Hash value 256')
    await this.postMessage('setoption name PvInterval value 1000')
    await this.postMessage('setoption name MultiPV value 1')
    await this.postMessage('setoption name Threads value 2')
    await this.postMessageWait('isready', 'readyok')
    return true
  }

  eval = async (usi: string): Promise<EngineInfo> => {
    // 思考中の可能性もあるので、一旦止める
    await this.postMessage('stop')
    await this.postMessage(usi)
    const result = await this.postMessageWait('go movetime 1000', 'bestmove', 'info')
    result.position = usi
    console.log('Engine Info:', result)
    try {
      return EngineInfoStringSchema.parse({ ...result, position: usi })
    } catch (error) {
      console.error(error)
      throw error
    }

    // const results = []
    // for (const position of [usi]) {
    //   await this.postMessage(position)
    //   const result = await this.postMessageWait('go movetime 1000', 'bestmove', 'info')
    //   result.position = position
    //   results.push(result)
    // }
    // for (const result of results) {
    //   const schema = EngineInfoStringSchema.safeParse(result)
    //   if (!schema.success) {
    //     console.error('Failed to parse engine info:', schema.error.message)
    //     return []
    //   }
    //   console.log(schema.data)
    // }
    // await this.postMessage('stop')
    // return results
  }

  get isReady(): boolean {
    return this.engine !== null
  }

  deinit() {
    if (this.engine === null) {
      console.error('Engine is not initialized.')
      return
    }
    this.engine.terminate()
  }
}
