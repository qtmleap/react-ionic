import z from 'zod'

export const PlayerSchema = z
  .object({
    first_name: z.string(),
    last_name: z.string(),
    rank: z.string()
  })
  .transform((v) => ({
    ...v,
    display_name: `${v.last_name} ${v.first_name}`
  }))

export const GameListItemSchema = z.object({
  game_id: z.number(),
  start_time: z.coerce.date(),
  end_time: z.coerce.date().nullable(),
  moves: z.number().int().min(0),
  black: PlayerSchema,
  white: PlayerSchema
})
export type GameListItem = z.infer<typeof GameListItemSchema>

export const GameListSchema = z.object({
  games: z.array(GameListItemSchema),
  count: z.number().int().min(0)
})
export type GameList = z.infer<typeof GameListSchema>
