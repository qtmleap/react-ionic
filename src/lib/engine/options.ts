import { Color } from 'tsshogi'
/**
 * エンジン
 */
export namespace Engine {
  /**
   * エンジンの状態
   */
  export enum State {
    // 未定義
    UNINIT = 'uninit',
    // 初期化中
    BOOTING = 'booting',
    // 初期化済み
    READY = 'ready',
    // 試行中(BESTMOVE待ち)
    RUNNING = 'running',
    /// 一時停止(BESTMOVEを受け取った)
    PAUSE = 'pause'
  }

  export class Score {
    readonly cp: number | undefined
    readonly mate: number | undefined

    constructor(param: { cp?: string | undefined; mate?: string | undefined }) {
      this.cp = param.cp === undefined ? undefined : Number.parseInt(param.cp)
      this.mate = param.mate === undefined ? undefined : Number.parseInt(param.mate)
    }

    /**
     * スコアを返す
     */
    get value(): number {
      return this.cp || this.mate || 0
    }
  }

  /**
   * エンジンから送られてきたメッセージ
   */
  export class Message {
    readonly depth: number
    readonly hashfull: number
    readonly moves: string[]
    readonly multipv: number
    readonly nodes: number
    readonly nps: number
    readonly score: Score
    readonly seldepth: number
    readonly time: number

    /**
     * 反転させた評価値のKENTO形式の文字列
     */
    // displayText(color: Color): string {
    //   // const { t } = I18n
    //   if (this.score.cp) {
    //     if (this.score.cp === -1) {
    //       return t('draw', { ns: 'engine' })
    //     }
    //     const cp: number = this.score.cp * (color === Color.BLACK ? 1 : -1)
    //     return cp > 0 ? `+${cp}` : `${cp}`
    //   }
    //   if (this.score.mate) {
    //     // 自分の手番で+が出てきている場合は自分が勝ち
    //     // 自分の手番で-が出てきている場合は相手が勝ち
    //     // return t('result', {
    //     //   side:
    //     //     this.score.mate > 0
    //     //       ? color === Color.BLACK
    //     //         ? t('black', { ns: 'engine' })
    //     //         : t('white', { ns: 'engine' })
    //     //       : color === Color.BLACK
    //     //         ? t('white', { ns: 'engine' })
    //     //         : t('black', { ns: 'engine' }),
    //     //   ply: Math.abs(this.score.mate),
    //     //   ns: 'engine'
    //     // })
    //   }
    //   return ''
    // }

    /**
     * 反転させた評価値
     * @param color
     * @returns
     */
    eval(color: Color): string {
      if (this.score.cp) {
        const cp: number = this.score.cp * (color === Color.BLACK ? 1 : -1)
        return cp > 0 ? `+${cp}` : `${cp}`
      }
      if (this.score.mate) {
        const mate: number = this.score.mate * (color === Color.BLACK ? 1 : -1)
        return mate > 0 ? `Mate:${mate}` : `-Mate:${Math.abs(mate)}`
      }
      return ''
    }

    constructor(message: string) {
      const pattern: RegExp =
        /info depth (\d+) seldepth (\d+)(?: score cp (-?\d+)| score mate (-?\d+))?(?: (upperbound|lowerbound))?(?: multipv (\d+))? nodes (\d+) nps (\d+)(?: hashfull (\d+))? time (\d+) pv (.+)/
      const matches: RegExpMatchArray | null = message.match(pattern)
      if (matches) {
        const [, depth, seldepth, cp, mate, , multipv, nodes, nps, hashfull, time, pv, _extra] = matches
        this.depth = Number.parseInt(depth)
        this.seldepth = Number.parseInt(seldepth)
        this.score = new Score({ cp: cp, mate: mate })
        this.multipv = multipv ? Number.parseInt(multipv) : 1
        this.nodes = Number.parseInt(nodes)
        this.nps = Number.parseInt(nps)
        this.hashfull = hashfull ? Number.parseInt(hashfull) : 0
        this.time = Number.parseInt(time)
        this.moves = pv.split(' ')
        return
      }
      throw new Error(`Invalid message: < ${message}`)
    }
  }

  /**
   * エンジンへの設定オプション
   */
  export type Option = {
    hash: number
    thread: number
    ponder: boolean
    multiPV: number
    // eval: string
    // book: string
    limit: 'movetime' | 'nodes' | 'depth'
    limit_value: number
  }

  /**
   * デフォルトオプション
   */
  export const OptionDefault: Engine.Option = {
    // @ts-ignore
    hash: 256,
    thread: 1,
    ponder: false,
    multiPV: 1,
    limit: 'movetime',
    limit_value: 10000
  }

  export type CallBack = (message: Engine.Message[]) => void
}
