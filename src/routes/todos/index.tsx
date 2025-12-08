import { useState } from 'react'
import { orpc } from '@/integrations/orpc/client'
import { createFileRoute } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import * as z from 'zod'
import { useForm } from '@tanstack/react-form'
import { Button } from '@/components/ui/button'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Checkbox } from '@/components/ui/checkbox'

type Todo = { id: string; name: string; completed: boolean }

export const TodoSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

export const Route = createFileRoute('/todos/')({
  component: Todos,
  loader: async ({ context }) => {
    await context.queryClient.prefetchQuery(
      orpc.todos.list.queryOptions({
        input: {},
      }),
    )
  },
})

function Todos() {
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      name: '',
    },
    validators: {
      onSubmit: TodoSchema,
    },
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync(value)
    },
  })

  const queryClient = useQueryClient()
  const listOptions = orpc.todos.list.queryOptions({ input: {} })
  const { data, isLoading } = useQuery(listOptions)

  const createMutation = useMutation(
    orpc.todos.create.mutationOptions({
      onSuccess: async () => {
        const opts = orpc.todos.list.queryOptions({ input: {} })
        await queryClient.invalidateQueries({ queryKey: opts.queryKey })
        form.reset()
        toast('Todo added successfully')
      },
      onError: (error) => {
        toast(error.message)
      },
    }),
  )

  const completedMutation = useMutation(
    orpc.todos.update.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: listOptions.queryKey })
        const previous = queryClient.getQueryData<Todo[] | undefined>(
          listOptions.queryKey,
        )
        setUpdatingId(variables.id)

        queryClient.setQueryData(
          listOptions.queryKey,
          (old: Todo[] | undefined) => {
            if (!Array.isArray(old)) return old
            return old.map((t) =>
              t.id === variables.id
                ? { ...t, completed: variables.completed }
                : t,
            )
          },
        )

        return { previous }
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.previous) {
          queryClient.setQueryData(listOptions.queryKey, ctx.previous)
        }
        toast('Failed to update todo')
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({ queryKey: listOptions.queryKey })
        setUpdatingId(null)
      },
    }),
  )

  const removeMutation = useMutation(
    orpc.todos.remove.mutationOptions({
      onMutate: async (variables) => {
        await queryClient.cancelQueries({ queryKey: listOptions.queryKey })
        const previous = queryClient.getQueryData<Todo[] | undefined>(
          listOptions.queryKey,
        )
        setRemovingId(variables.id)

        queryClient.setQueryData(
          listOptions.queryKey,
          (old: Todo[] | undefined) => {
            if (!Array.isArray(old)) return old
            return old.filter((t) => t.id !== variables.id)
          },
        )

        return { previous }
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.previous) {
          queryClient.setQueryData(listOptions.queryKey, ctx.previous)
        }
        toast('Failed to remove todo')
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({ queryKey: listOptions.queryKey })
        setRemovingId(null)
      },
    }),
  )

  const handleRemove = async (id: string) => {
    await removeMutation.mutateAsync({ id })
  }

  const handleCompleted = async (
    id: string,
    checked: boolean | 'indeterminate',
  ) => {
    const completed = checked === true
    await completedMutation.mutateAsync({ id, completed })
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4 text-white"
      style={{
        backgroundImage:
          'radial-gradient(50% 50% at 50% 50%, #D2149D 0%, #8E1066 50%, #2D0A1F 100%)',
      }}
    >
      <div className="w-full max-w-2xl p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border-8 border-black/10">
        <h1 className="text-2xl mb-4">oRPC Todos list</h1>
        {isLoading ? (
          <div className="text-white/80">Loading...</div>
        ) : data && data.length > 0 ? (
          <ul className="mb-4 space-y-2">
            {data.map((t) => (
              <li
                key={t.id}
                className={
                  'bg-white/10 border border-white/20 rounded-lg p-3 backdrop-blur-sm shadow-md flex items-center justify-between gap-3' +
                  (updatingId === t.id || removingId === t.id
                    ? ' opacity-60'
                    : '')
                }
                aria-busy={updatingId === t.id || removingId === t.id}
              >
                <span
                  className={
                    'text-lg transition ' +
                    (t.completed ? 'line-through text-white/60' : 'text-white')
                  }
                >
                  {t.name}
                </span>
                <div className="flex items-center gap-2">
                  <Checkbox
                    aria-label={
                      t.completed ? 'Mark as incomplete' : 'Mark as complete'
                    }
                    checked={t.completed}
                    onCheckedChange={(checked) =>
                      handleCompleted(t.id, checked)
                    }
                    disabled={updatingId === t.id}
                  />
                  <Button
                    type="button"
                    onClick={() => handleRemove(t.id)}
                    disabled={removingId === t.id}
                  >
                    {removingId === t.id ? 'Removing...' : 'Remove'}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mb-4 text-white/80">
            No todos yet. Create one below.
          </div>
        )}
        {/* Add todo form  */}
        <form
          id="todo-form"
          onSubmit={(e) => {
            e.preventDefault()
            form.handleSubmit()
          }}
        >
          <FieldGroup>
            <form.Field
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="todo name"
                      autoComplete="off"
                      type="text"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )
              }}
            />

            <Field>
              <Button
                type="submit"
                form="todo-form"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? 'Adding...' : 'Add todo'}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}
