import * as z from 'zod'
import { publicProcedure } from '@/integrations/orpc/init'

const todos = [
  { id: 1, name: 'Get groceries' },
  { id: 2, name: 'Buy a new phone' },
  { id: 3, name: 'Finish the project' },
]

export const todosRouter = {
  list: publicProcedure.input(z.object({})).handler(() => {
    return todos
  }),
  create: publicProcedure
    .input(z.object({ name: z.string() }))
    .handler(({ input }) => {
      const newTodo = { id: todos.length + 1, name: input.name }
      todos.push(newTodo)
      return newTodo
    }),
}
