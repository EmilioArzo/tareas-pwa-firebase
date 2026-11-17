import './App.css'
import AuthScreen from './components/AuthScreen'
import SetupScreen from './components/SetupScreen'
import TasksScreen from './components/TasksScreen'
import { CheckIcon } from './components/Icons'
import { isFirebaseConfigured } from './firebase'
import { useAuth } from './hooks/useAuth'

function Splash() {
  return (
    <div className="splash">
      <span className="logo-mark logo-mark-lg" aria-hidden="true">
        <CheckIcon size={28} strokeWidth={3} />
      </span>
      <span className="splash-title">Tareas</span>
      <span className="spinner" aria-hidden="true" />
      <span className="sr-only">Cargando…</span>
    </div>
  )
}

export default function App() {
  const { user, loading, authError } = useAuth()

  if (!isFirebaseConfigured) return <SetupScreen />
  if (loading) return <Splash />

  // Las pantallas de tareas solo existen con una sesión iniciada.
  if (!user) {
    return <AuthScreen initialError={authError} />
  }

  return <TasksScreen user={user} />
}
