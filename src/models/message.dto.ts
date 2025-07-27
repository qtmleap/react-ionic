import { Color, Record } from 'tsshogi'
import z from 'zod'

const decodeEngineInfo = (data: { bestmove: string; info: string; position: string }): EngineInfo => {
  const record: Record | Error = Record.newByUSI(data.position)
  if (record instanceof Error) {
    console.error('Failed to create record from USI position:', data.position)
    return {
      bestmove: {
        move: '',
        ponder: undefined
      },
      info: {
        depth: 0,
        seldepth: 0,
        score: { cp: undefined, mate: undefined },
        nodes: 0,
        rate: 0,
        nps: 0,
        time: 0,
        pv: []
      },
      position: data.position
    }
  }
  const bestmove = (() => {
    const pattern = /bestmove\s+(\S+)(?:\s+ponder\s+(\S+))?/
    const match = data.bestmove.match(pattern)
    if (!match) {
      return {
        move: '',
        ponder: undefined
      }
    }
    return {
      move: match[1],
      ponder: match[2] || undefined
    }
  })()
  const info = (() => {
    const pattern =
      /info\sdepth\s(\d+)\sseldepth\s+(\d+)\sscore\s(cp|mate)\s(-?\d+)\snodes\s(\d+)\snps\s(\d+)\stime\s(\d+)\spv\s(.+)/
    const match = data.info.match(pattern)
    if (!match) {
      return {
        depth: 0,
        seldepth: 0,
        score: { cp: undefined, mate: undefined },
        nodes: 0,
        nps: 0,
        time: 0,
        rate: 0,
        pv: []
      }
    }
    const score: number = parseInt(match[4], 10) * (record.position.color === Color.BLACK ? 1 : -1)
    return {
      depth: parseInt(match[1], 10),
      seldepth: parseInt(match[2], 10),
      score: {
        cp: match[3] === 'cp' ? score : undefined,
        mate: match[3] === 'mate' ? score : undefined
      },
      rate: match[3] === 'mate' ? 1 : 1 / (1 + Math.exp(-score / 600)),
      nodes: parseInt(match[5], 10),
      nps: parseInt(match[6], 10),
      time: parseInt(match[7], 10),
      pv: match[8].split(' ')
    }
  })()
  return {
    bestmove,
    info,
    position: record.position.sfen
  }
}

export const EngineInfoSchema = z.object({
  bestmove: z.object({
    move: z.string(),
    ponder: z.string().optional()
  }),
  info: z.object({
    depth: z.number().int().min(0),
    seldepth: z.number().int().min(0),
    score: z.object({
      cp: z.number().int().optional(),
      mate: z.number().int().optional()
    }),
    rate: z.number(),
    nodes: z.number().int().min(0),
    nps: z.number().int().min(0),
    time: z.number().int().min(0),
    pv: z.array(z.string())
  }),
  position: z.string()
})
export type EngineInfo = z.infer<typeof EngineInfoSchema>

export const EngineInfoStringSchema = z
  .object({
    bestmove: z.string(),
    info: z.string(),
    position: z.string()
  })
  .transform(decodeEngineInfo)
  .pipe(EngineInfoSchema)
