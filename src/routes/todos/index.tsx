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

const formSchema = z.object({
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
  const form = useForm({
    defaultValues: {
      name: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value)
    },
  })

  const queryClient = useQueryClient()

  const { data } = useQuery(
    orpc.todos.list.queryOptions({
      input: {},
    }),
  )

  const mutation = useMutation(
    orpc.todos.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          orpc.todos.list.queryOptions({
            input: {},
          }),
        )
        form.reset()
        toast('Todo added successfully')
      },
      onError: (error) => {
        toast(error.message)
      },
    }),
  )

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
        <ul className="mb-4 space-y-2">
          {data?.map((t) => (
            <li
              key={t.id}
              className="bg-white/10 border border-white/20 rounded-lg p-3 backdrop-blur-sm shadow-md"
            >
              <span className="text-lg text-white">{t.name}</span>
            </li>
          ))}
        </ul>
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
              <Button type="submit" form="todo-form">
                Add todo
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>
    </div>
  )
}
