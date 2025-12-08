import * as z from 'zod'
import { db } from '@/db'
import { todos } from '@/db/schema'
import { publicProcedure } from '@/integrations/orpc/init'

export const todosRouter = {
  list: publicProcedure.input(z.object({})).handler(() => {
    const data = db.select().from(todos)
    return data
  }),
  create: publicProcedure
    .input(z.object({ name: z.string() }))
    .handler(({ input }) => {
      const newTodo = db.insert(todos).values({ name: input.name })
      return newTodo
    }),
}
