import { useEffect, useRef, useState } from 'react'
import { CalendarIcon, PencilIcon, TrashIcon, XIcon } from './Icons'

function formatearFecha(timestamp) {
  if (!timestamp?.toDate) return ''
  const fecha = timestamp.toDate()
  const ahora = new Date()
  const mismoDia =
    fecha.getDate() === ahora.getDate() &&
    fecha.getMonth() === ahora.getMonth() &&
    fecha.getFullYear() === ahora.getFullYear()

  if (mismoDia) {
    return `Hoy, ${fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
  }

  return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

export default function TaskItem({ tarea, onToggle, onGuardar, onEliminar }) {
  // El borrador solo existe mientras se edita, así no hay que sincronizar
  // el formulario con cada actualización que llega de Firestore.
  const [borrador, setBorrador] = useState(null)
  const [confirmando, setConfirmando] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const inputRef = useRef(null)

  const editando = borrador !== null

  useEffect(() => {
    if (editando) inputRef.current?.focus()
  }, [editando])

  const abrirEdicion = () => {
    setBorrador({ titulo: tarea.title, nota: tarea.notes ?? '' })
  }

  const cerrarEdicion = () => setBorrador(null)

  const guardar = async (event) => {
    event.preventDefault()
    if (!borrador) return

    const tituloLimpio = borrador.titulo.trim()
    const notaLimpia = borrador.nota.trim()

    if (!tituloLimpio) {
      inputRef.current?.focus()
      return
    }

    if (tituloLimpio === tarea.title && notaLimpia === (tarea.notes ?? '')) {
      cerrarEdicion()
      return
    }

    setOcupado(true)
    const ok = await onGuardar(tarea.id, { title: tituloLimpio, notes: notaLimpia })
    setOcupado(false)
    if (ok) cerrarEdicion()
  }

  const alternar = async () => {
    setOcupado(true)
    await onToggle(tarea.id, !tarea.completed)
    setOcupado(false)
  }

  const eliminar = async () => {
    setOcupado(true)
    const ok = await onEliminar(tarea.id)
    setOcupado(false)
    if (ok) setConfirmando(false)
  }

  if (editando) {
    return (
      <li className="task task-editing">
        <form className="task-edit-form" onSubmit={guardar}>
          <label className="field">
            <span className="field-label">Título</span>
            <span className="input-wrap">
              <input
                ref={inputRef}
                type="text"
                value={borrador.titulo}
                maxLength={200}
                onChange={(e) => setBorrador((actual) => ({ ...actual, titulo: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') cerrarEdicion()
                }}
                disabled={ocupado}
              />
            </span>
          </label>

          <label className="field">
            <span className="field-label">Nota (opcional)</span>
            <textarea
              className="textarea"
              value={borrador.nota}
              maxLength={1000}
              rows={2}
              placeholder="Añade un detalle…"
              onChange={(e) => setBorrador((actual) => ({ ...actual, nota: e.target.value }))}
              disabled={ocupado}
            />
          </label>

          <div className="task-edit-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={cerrarEdicion}
              disabled={ocupado}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={ocupado || !borrador.titulo.trim()}
            >
              Guardar cambios
            </button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className={`task${tarea.completed ? ' is-completed' : ''}`}>
      <label className="task-check">
        <input
          type="checkbox"
          checked={Boolean(tarea.completed)}
          onChange={alternar}
          disabled={ocupado}
          aria-label={
            tarea.completed
              ? `Marcar «${tarea.title}» como pendiente`
              : `Marcar «${tarea.title}» como completada`
          }
        />
        <span className="task-check-visual" aria-hidden="true" />
      </label>

      <div className="task-body">
        <p className="task-title">{tarea.title}</p>
        {tarea.notes && <p className="task-notes">{tarea.notes}</p>}
        <p className="task-meta">
          {tarea.createdAt && (
            <span>
              <CalendarIcon size={13} /> {formatearFecha(tarea.createdAt)}
            </span>
          )}
          {tarea.completed && <span className="task-done-tag">Completada</span>}
        </p>
      </div>

      <div className="task-actions">
        {confirmando ? (
          <>
            <span className="delete-question">¿Eliminar?</span>
            <button
              type="button"
              className="icon-button icon-button-danger"
              onClick={eliminar}
              disabled={ocupado}
              aria-label="Confirmar eliminación"
              title="Sí, eliminar"
            >
              <TrashIcon size={17} />
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={() => setConfirmando(false)}
              disabled={ocupado}
              aria-label="Cancelar eliminación"
              title="Cancelar"
            >
              <XIcon size={17} />
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="icon-button"
              onClick={abrirEdicion}
              disabled={ocupado}
              aria-label={`Editar «${tarea.title}»`}
              title="Editar"
            >
              <PencilIcon size={16} />
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={() => setConfirmando(true)}
              disabled={ocupado}
              aria-label={`Eliminar «${tarea.title}»`}
              title="Eliminar"
            >
              <TrashIcon size={16} />
            </button>
          </>
        )}
      </div>
    </li>
  )
}
