export namespace USI {
  /**
   * エンジンに送ることができる単純コマンド
   */
  export enum Command {
    USI = 'usi',
    IsReady = 'isready',
    Mated = 'mated',
    Eval = 'eval',
    NewGame = 'usinewgame',
    Stop = 'stop',
    USI_OK = 'usiok',
    ReadyOK = 'readyok'
  }

  /**
   * エンジンに設定できるオプション
   */
  export enum Option {
    USI_Hash = 'USI_Hash',
    MultiPV = 'MultiPV',
    PvInterval = 'PvInterval',
    Threads = 'Threads',
    EvalDir = 'EvalDir',
    EvalFile = 'EvalFile',
    BookFile = 'BookFile',
    BookDir = 'BookDir'
  }
}

export namespace Command {
  interface EngineCommand {
    toString(): string
  }

  export type LimitType = 'movetime' | 'depth' | 'nodes'

  export type GoParam = {
    value: number
    options: { type: LimitType }
  }
  export const GoParamDefault = {
    value: 1000,
    options: { type: 'movetime' as LimitType }
  }

  export class Go implements EngineCommand {
    private readonly value: number
    private readonly type: LimitType

    constructor(param: GoParam) {
      this.value = param.value
      this.type = param.options.type
    }

    toString(): string {
      return `go ${this.type} ${this.value}`
    }
  }

  export class SetPosition implements EngineCommand {
    private readonly position: string

    constructor(position: string) {
      this.position = position
    }

    toString(): string {
      return `position sfen ${this.position}`
    }
  }

  export class SetOption implements EngineCommand {
    private readonly name: USI.Option
    private readonly value: number | string

    constructor(name: USI.Option, value: number | string) {
      this.name = name
      this.value = value
    }

    toString(): string {
      return `setoption name ${this.name} value ${this.value}`
    }
  }
}
