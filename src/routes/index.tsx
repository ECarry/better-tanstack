import Header from '@/components/header'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <>
      <Header />
      <main className="flex items-center justify-center"></main>
    </>
  )
}
