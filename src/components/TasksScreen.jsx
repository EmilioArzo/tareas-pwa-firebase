import { useEffect, useMemo, useRef, useState } from 'react'
import { signOut } from 'firebase/auth'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { auth, db } from '../firebase'
import { mensajeError } from '../lib/errors'
import TaskItem from './TaskItem'
import {
  CheckIcon,
  ClipboardIcon,
  LogOutIcon,
  NoteIcon,
  PlusIcon,
  XIcon,
  ZapIcon,
} from './Icons'

const FILTROS = [
  { id: 'todas', etiqueta: 'Todas' },
  { id: 'pendientes', etiqueta: 'Pendientes' },
  { id: 'completadas', etiqueta: 'Completadas' },
]

function fechaDeHoy() {
  const texto = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export default function TasksScreen({ user }) {
  const [tareas, setTareas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [desdeCache, setDesdeCache] = useState(false)
  const [error, setError] = useState('')
  const [filtro, setFiltro] = useState('todas')
  const [nuevaTarea, setNuevaTarea] = useState('')
  const [nuevaNota, setNuevaNota] = useState('')
  const [notaVisible, setNotaVisible] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const inputRef = useRef(null)

  const nombre =
    user.displayName?.trim() || user.email?.split('@')[0] || 'usuario'

  useEffect(() => {
    const consulta = query(collection(db, 'tasks'), where('uid', '==', user.uid))

    const unsubscribe = onSnapshot(
      consulta,
      (snapshot) => {
        setTareas(
          snapshot.docs.map((documento) => ({
            id: documento.id,
            ...documento.data(),
          })),
        )
        setDesdeCache(snapshot.metadata.fromCache)
        setCargando(false)
      },
      (err) => {
        setError(mensajeError(err))
        setCargando(false)
      },
    )

    return unsubscribe
  }, [user.uid])

  const ordenadas = useMemo(
    () =>
      [...tareas].sort((a, b) => {
        // Las recién creadas aún no tienen createdAt del servidor: van arriba.
        const fechaA = a.createdAt?.toMillis?.() ?? Number.MAX_SAFE_INTEGER
        const fechaB = b.createdAt?.toMillis?.() ?? Number.MAX_SAFE_INTEGER
        return fechaB - fechaA
      }),
    [tareas],
  )

  const pendientes = useMemo(() => ordenadas.filter((t) => !t.completed), [ordenadas])
  const completadas = useMemo(() => ordenadas.filter((t) => t.completed), [ordenadas])

  const visibles = useMemo(() => {
    if (filtro === 'pendientes') return pendientes
    if (filtro === 'completadas') return completadas
    return ordenadas
  }, [filtro, ordenadas, pendientes, completadas])

  const crearTarea = async (event) => {
    event.preventDefault()
    setError('')
    const titulo = nuevaTarea.trim()

    if (!titulo) {
      setError('Escribe un título para la tarea.')
      inputRef.current?.focus()
      return
    }

    setGuardando(true)
    try {
      await addDoc(collection(db, 'tasks'), {
        uid: user.uid,
        title: titulo.slice(0, 200),
        notes: nuevaNota.trim().slice(0, 1000),
        completed: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      setNuevaTarea('')
      setNuevaNota('')
      setNotaVisible(false)
      setFiltro('todas')
      inputRef.current?.focus()
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setGuardando(false)
    }
  }

  const alternarTarea = async (id, completed) => {
    setError('')
    try {
      await updateDoc(doc(db, 'tasks', id), {
        completed,
        updatedAt: serverTimestamp(),
      })
      return true
    } catch (err) {
      setError(mensajeError(err))
      return false
    }
  }

  const guardarTarea = async (id, cambios) => {
    setError('')
    try {
      await updateDoc(doc(db, 'tasks', id), {
        title: cambios.title.slice(0, 200),
        notes: cambios.notes.slice(0, 1000),
        updatedAt: serverTimestamp(),
      })
      return true
    } catch (err) {
      setError(mensajeError(err))
      return false
    }
  }

  const eliminarTarea = async (id) => {
    setError('')
    try {
      await deleteDoc(doc(db, 'tasks', id))
      return true
    } catch (err) {
      setError(mensajeError(err))
      return false
    }
  }

  const cerrarSesion = async () => {
    setError('')
    try {
      await signOut(auth)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  const conteo = (id) => {
    if (id === 'pendientes') return pendientes.length
    if (id === 'completadas') return completadas.length
    return ordenadas.length
  }

  const resumen =
    pendientes.length === 0
      ? 'No tienes tareas pendientes. ¡Buen trabajo!'
      : pendientes.length === 1
        ? 'Tienes 1 tarea pendiente.'
        : `Tienes ${pendientes.length} tareas pendientes.`

  const mensajeVacio = {
    todas: {
      titulo: 'Tu lista está vacía',
      texto: 'Añade tu primera tarea con el campo de arriba. Se guardará en Firestore al instante.',
    },
    pendientes: {
      titulo: '¡Todo al día!',
      texto: 'No te queda ninguna tarea pendiente. Crea una nueva cuando quieras.',
    },
    completadas: {
      titulo: 'Nada completado todavía',
      texto: 'Marca una tarea con el círculo de la izquierda y aparecerá aquí.',
    },
  }[filtro]

  return (
    <div className="app-page">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand-lockup">
            <span className="logo-mark" aria-hidden="true">
              <CheckIcon size={19} strokeWidth={3} />
            </span>
            <div className="brand-text">
              <span className="brand-name brand-name-dark">Tareas</span>
              <span className="brand-sub">Firestore + PWA</span>
            </div>
          </div>

          <div className="topbar-right">
            <span className={`live-pill${desdeCache ? ' is-offline' : ''}`}>
              <span className="live-dot" aria-hidden="true" />
              {desdeCache ? 'Sin conexión' : 'Tiempo real'}
            </span>

            <div className="user-chip" title={user.email ?? ''}>
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="avatar" referrerPolicy="no-referrer" />
              ) : (
                <span className="avatar avatar-fallback" aria-hidden="true">
                  {nombre.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="user-info">
                <strong>{nombre}</strong>
                <span>{user.email}</span>
              </span>
            </div>

            <button
              type="button"
              className="icon-button"
              onClick={cerrarSesion}
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOutIcon size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="app-hero">
          <p className="eyebrow">{fechaDeHoy()}</p>
          <h1>Hola, {nombre}</h1>
          <p className="hero-sub">{resumen}</p>
        </section>

        <div className="stats">
          <article className="stat">
            <span className="stat-icon stat-icon-pending"><ClipboardIcon size={18} /></span>
            <div>
              <span className="stat-label">Pendientes</span>
              <strong className="stat-value">{pendientes.length}</strong>
            </div>
          </article>
          <article className="stat">
            <span className="stat-icon stat-icon-done"><CheckIcon size={18} /></span>
            <div>
              <span className="stat-label">Completadas</span>
              <strong className="stat-value">{completadas.length}</strong>
            </div>
          </article>
          <article className="stat">
            <span className="stat-icon stat-icon-total"><NoteIcon size={18} /></span>
            <div>
              <span className="stat-label">Total</span>
              <strong className="stat-value">{ordenadas.length}</strong>
            </div>
          </article>
        </div>

        {error && (
          <div className="alert alert-error alert-dismissible" role="alert">
            <span>{error}</span>
            <button
              type="button"
              className="alert-close"
              onClick={() => setError('')}
              aria-label="Cerrar aviso"
            >
              <XIcon size={16} />
            </button>
          </div>
        )}

        <section className="card composer">
          <form onSubmit={crearTarea}>
            <div className="composer-row">
              <span className="composer-icon" aria-hidden="true">
                <PlusIcon size={18} />
              </span>
              <input
                ref={inputRef}
                type="text"
                className="composer-input"
                placeholder="¿Qué necesitas hacer?"
                maxLength={200}
                value={nuevaTarea}
                onChange={(e) => setNuevaTarea(e.target.value)}
                aria-label="Título de la nueva tarea"
                disabled={guardando}
              />
              <button type="submit" className="btn btn-primary" disabled={guardando || !nuevaTarea.trim()}>
                {guardando ? (
                  <span className="spinner spinner-light" aria-hidden="true" />
                ) : (
                  <PlusIcon size={17} />
                )}
                <span className="btn-label">Añadir tarea</span>
              </button>
            </div>

            {notaVisible && (
              <div className="composer-note">
                <textarea
                  className="textarea"
                  rows={2}
                  maxLength={1000}
                  placeholder="Nota opcional (detalles, enlaces, recordatorios…)"
                  value={nuevaNota}
                  onChange={(e) => setNuevaNota(e.target.value)}
                  aria-label="Nota de la nueva tarea"
                  disabled={guardando}
                />
              </div>
            )}

            <div className="composer-footer">
              <button
                type="button"
                className="link-button"
                onClick={() => setNotaVisible((v) => !v)}
              >
                <NoteIcon size={15} />
                {notaVisible ? 'Ocultar nota' : 'Añadir nota'}
              </button>
              <span className="char-count">{nuevaTarea.length}/200</span>
            </div>
          </form>
        </section>

        <div className="list-header">
          <div className="filters" role="group" aria-label="Filtrar tareas">
            {FILTROS.map((opcion) => (
              <button
                key={opcion.id}
                type="button"
                className={`filter${filtro === opcion.id ? ' is-active' : ''}`}
                aria-pressed={filtro === opcion.id}
                onClick={() => setFiltro(opcion.id)}
              >
                {opcion.etiqueta}
                <span className="filter-count">{conteo(opcion.id)}</span>
              </button>
            ))}
          </div>
          <span className="list-count">
            {visibles.length} {visibles.length === 1 ? 'tarea' : 'tareas'}
          </span>
        </div>

        <section className="card list-card" aria-live="polite">
          {cargando ? (
            <ul className="task-list skeleton-list" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <li key={i} className="task skeleton-row">
                  <span className="skeleton skeleton-circle" />
                  <span className="skeleton-lines">
                    <span className="skeleton skeleton-line" />
                    <span className="skeleton skeleton-line short" />
                  </span>
                </li>
              ))}
            </ul>
          ) : visibles.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon" aria-hidden="true">
                <ClipboardIcon size={26} />
              </span>
              <h2>{mensajeVacio.titulo}</h2>
              <p>{mensajeVacio.texto}</p>
            </div>
          ) : (
            <ul className="task-list">
              {visibles.map((tarea) => (
                <TaskItem
                  key={tarea.id}
                  tarea={tarea}
                  onToggle={alternarTarea}
                  onGuardar={guardarTarea}
                  onEliminar={eliminarTarea}
                />
              ))}
            </ul>
          )}
        </section>

        <footer className="app-footer">
          <span>
            <ZapIcon size={13} /> Los cambios se sincronizan solos con Firestore.
          </span>
          <span>Datos privados de {user.email}</span>
        </footer>
      </main>
    </div>
  )
}
