import { db } from '@/db'
import { todos } from '@/db/schema'
import { createTRPCRouter, publicProcedure } from '@/integrations/trpc/init'
import { z } from 'zod'
import { desc, eq } from 'drizzle-orm'

export const todosRouter = createTRPCRouter({
  add: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input }) => {
      const [newTodo] = await db
        .insert(todos)
        .values({ title: input.name })
        .returning()

      return newTodo
    }),
  remove: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(todos).where(eq(todos.id, input.id))
    }),
  list: publicProcedure.query(async () => {
    const data = await db.select().from(todos).orderBy(desc(todos.createdAt))

    return data
  }),
})
