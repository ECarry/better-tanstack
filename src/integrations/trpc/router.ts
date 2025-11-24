import { todosRouter } from '@/modules/todos/server/procedures'
import { createTRPCRouter } from './init'

export const trpcRouter = createTRPCRouter({
  todos: todosRouter,
})
export type TRPCRouter = typeof trpcRouter
