import { auth } from '@/modules/auth/lib/auth'
import { ORPCError, os } from '@orpc/server'

export async function createRPCContext(opts: { headers: Headers }) {
  const session = await auth.api.getSession({ headers: opts.headers })

  return {
    headers: opts.headers,
    session,
  }
}

const o = os.$context<Awaited<ReturnType<typeof createRPCContext>>>()

const timingMiddleware = o.middleware(async ({ next, path }) => {
  const start = Date.now()

  try {
    return await next()
  } finally {
    console.log(`[oRPC] ${path} took ${Date.now() - start}ms to execute`)
  }
})

export const publicProcedure = o.use(timingMiddleware)

export const protectedProcedure = publicProcedure.use(({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError('UNAUTHORIZED')
  }

  return next({
    context: {
      session: { ...context.session, user: context.session.user },
    },
  })
})
