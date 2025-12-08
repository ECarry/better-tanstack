import * as z from 'zod'
import { db } from '@/db'
import { todos } from '@/db/schema'
import { protectedProcedure, publicProcedure } from '@/integrations/orpc/init'
import { eq } from 'drizzle-orm'

export const todosRouter = {
  list: publicProcedure.input(z.object({})).handler(() => {
    const data = db.select().from(todos)
    return data
  }),
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .handler(({ input }) => {
      const newTodo = db.insert(todos).values({ name: input.name })
      return newTodo
    }),
  update: protectedProcedure
    .input(z.object({ id: z.uuid(), completed: z.boolean() }))
    .handler(({ input }) => {
      const updatedTodo = db
        .update(todos)
        .set({ completed: input.completed })
        .where(eq(todos.id, input.id))
      return updatedTodo
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .handler(({ input }) => {
      const removedTodo = db.delete(todos).where(eq(todos.id, input.id))
      return removedTodo
    }),
}
