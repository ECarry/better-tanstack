import { Button } from '@/components/ui/button'
import { useSession, signOut } from '@/modules/auth/lib/auth-client'
import { Link, useNavigate } from '@tanstack/react-router'

const Header = () => {
  const navigate = useNavigate()
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: '/login' })
        },
      },
    })
  }

  return (
    <header className="fixed w-full top-0 z-50">
      <div className="flex justify-between items-center p-4">
        <Link to="/" className="text-xl font-bold text-rose-400">
          Better TanStack.s
        </Link>

        <nav className="flex items-center gap-4">
          {session ? (
            <Button onClick={handleSignOut}>Sign out</Button>
          ) : (
            <>
              <Button asChild>
                <Link to="/login">Login in</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Header
