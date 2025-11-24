import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="min-h-screen bg-slate-900">
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <h1 className="text-6xl font-bold text-white">Hello World</h1>
      </section>
    </div>
  )
}
