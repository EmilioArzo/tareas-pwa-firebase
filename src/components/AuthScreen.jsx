import { useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  updateProfile,
} from 'firebase/auth'
import { auth, googleProvider } from '../firebase'
import { mensajeError } from '../lib/errors'
import {
  CheckIcon,
  ClipboardIcon,
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  LockIcon,
  MailIcon,
  UserIcon,
  ZapIcon,
} from './Icons'

export default function AuthScreen({ initialError = '' }) {
  const [modo, setModo] = useState('login')
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [verPassword, setVerPassword] = useState(false)
  const [error, setError] = useState(initialError)
  const [aviso, setAviso] = useState('')
  const [ocupado, setOcupado] = useState(false)

  useEffect(() => {
    // `initialError` puede llegar después del montaje porque getRedirectResult
    // es asíncrono (por ejemplo, al volver del login con Google).
    // oxlint-disable-next-line react/set-state-in-effect
    if (initialError) setError(initialError)
  }, [initialError])

  const esRegistro = modo === 'register'

  const cambiarModo = (nuevoModo) => {
    setModo(nuevoModo)
    setError('')
    setAviso('')
    setPassword('')
    setConfirmar('')
  }

  const enviar = async (event) => {
    event.preventDefault()
    setError('')
    setAviso('')

    const correo = email.trim()
    if (!correo) return setError('Escribe tu correo electrónico.')
    if (!password) return setError('Escribe tu contraseña.')
    if (esRegistro && password.length < 6) {
      return setError('La contraseña debe tener al menos 6 caracteres.')
    }
    if (esRegistro && password !== confirmar) {
      return setError('Las contraseñas no coinciden.')
    }

    setOcupado(true)
    try {
      if (esRegistro) {
        const credencial = await createUserWithEmailAndPassword(auth, correo, password)
        const nombreLimpio = nombre.trim()
        if (nombreLimpio) {
          await updateProfile(credencial.user, { displayName: nombreLimpio.slice(0, 60) })
        }
      } else {
        await signInWithEmailAndPassword(auth, correo, password)
      }
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setOcupado(false)
    }
  }

  const entrarConGoogle = async () => {
    setError('')
    setAviso('')
    setOcupado(true)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      const usarRedireccion = [
        'auth/popup-blocked',
        'auth/cancelled-popup-request',
        'auth/operation-not-supported-in-this-environment',
      ].includes(err?.code)

      if (usarRedireccion) {
        // En la PWA instalada los popups pueden estar bloqueados: redirigimos.
        await signInWithRedirect(auth, googleProvider)
        return
      }
      if (err?.code !== 'auth/popup-closed-by-user') {
        setError(mensajeError(err))
      }
    } finally {
      setOcupado(false)
    }
  }

  const restablecerPassword = async () => {
    setError('')
    setAviso('')
    const correo = email.trim()
    if (!correo) {
      return setError('Escribe tu correo arriba para enviarte el enlace de recuperación.')
    }
    setOcupado(true)
    try {
      await sendPasswordResetEmail(auth, correo)
      setAviso('Te enviamos un enlace para restablecer la contraseña. Revisa tu correo (y la carpeta de spam).')
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setOcupado(false)
    }
  }

  return (
    <main className="auth">
      <aside className="auth-brand">
        <div className="auth-brand-top">
          <div className="brand-lockup">
            <span className="logo-mark logo-mark-light" aria-hidden="true">
              <CheckIcon size={22} strokeWidth={3} />
            </span>
            <span className="brand-name">Tareas</span>
          </div>

          <div className="brand-copy">
            <h1>
              Tus tareas,
              <br />
              <span className="brand-accent">al instante.</span>
            </h1>
            <p>
              Una lista de tareas sencilla, privada y sincronizada en todos tus dispositivos.
            </p>
          </div>

          <ul className="brand-features">
            <li>
              <span className="feature-icon"><ZapIcon size={18} /></span>
              <div>
                <strong>Tiempo real</strong>
                <span>Los cambios aparecen al momento con Firestore.</span>
              </div>
            </li>
            <li>
              <span className="feature-icon"><LockIcon size={18} /></span>
              <div>
                <strong>Solo tú</strong>
                <span>Cada cuenta ve únicamente sus propias tareas.</span>
              </div>
            </li>
            <li>
              <span className="feature-icon"><ClipboardIcon size={18} /></span>
              <div>
                <strong>Instalable</strong>
                <span>Funciona como app desde el navegador.</span>
              </div>
            </li>
          </ul>
        </div>

        <p className="brand-footnote">Hecha con React + Firebase · Plan Spark</p>
      </aside>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-mobile-brand">
            <span className="logo-mark" aria-hidden="true">
              <CheckIcon size={20} strokeWidth={3} />
            </span>
            <span className="brand-name brand-name-dark">Tareas</span>
          </div>

          <header className="auth-heading">
            <h2>{esRegistro ? 'Crea tu cuenta' : 'Bienvenido de nuevo'}</h2>
            <p>
              {esRegistro
                ? 'Empieza a organizar tu día en menos de un minuto.'
                : 'Inicia sesión para ver tus tareas.'}
            </p>
          </header>

          <div className="segmented" role="group" aria-label="Tipo de acceso">
            <button
              type="button"
              className={modo === 'login' ? 'is-active' : ''}
              aria-pressed={modo === 'login'}
              onClick={() => cambiarModo('login')}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className={modo === 'register' ? 'is-active' : ''}
              aria-pressed={modo === 'register'}
              onClick={() => cambiarModo('register')}
            >
              Crear cuenta
            </button>
          </div>

          <form className="auth-form" onSubmit={enviar} noValidate>
            {esRegistro && (
              <label className="field">
                <span className="field-label">Nombre</span>
                <span className="input-wrap">
                  <UserIcon size={17} className="input-icon" />
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    maxLength={60}
                    placeholder="Cómo te llamas (opcional)"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    disabled={ocupado}
                  />
                </span>
              </label>
            )}

            <label className="field">
              <span className="field-label">Correo electrónico</span>
              <span className="input-wrap">
                <MailIcon size={17} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  inputMode="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={ocupado}
                  required
                />
              </span>
            </label>

            <label className="field">
              <span className="field-label">Contraseña</span>
              <span className="input-wrap">
                <LockIcon size={17} className="input-icon" />
                <input
                  type={verPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete={esRegistro ? 'new-password' : 'current-password'}
                  placeholder={esRegistro ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={ocupado}
                  required
                />
                <button
                  type="button"
                  className="input-action"
                  onClick={() => setVerPassword((v) => !v)}
                  aria-label={verPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  tabIndex={-1}
                >
                  {verPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
                </button>
              </span>
            </label>

            {esRegistro && (
              <label className="field">
                <span className="field-label">Confirmar contraseña</span>
                <span className="input-wrap">
                  <LockIcon size={17} className="input-icon" />
                  <input
                    type={verPassword ? 'text' : 'password'}
                    name="confirm-password"
                    autoComplete="new-password"
                    placeholder="Repite la contraseña"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    disabled={ocupado}
                    required
                  />
                </span>
              </label>
            )}

            {!esRegistro && (
              <div className="auth-form-row">
                <button
                  type="button"
                  className="link-button"
                  onClick={restablecerPassword}
                  disabled={ocupado}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            )}

            {error && (
              <p className="alert alert-error" role="alert">
                {error}
              </p>
            )}
            {aviso && (
              <p className="alert alert-success" role="status">
                {aviso}
              </p>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={ocupado}>
              {ocupado ? (
                <span className="spinner" aria-hidden="true" />
              ) : (
                <CheckIcon size={18} strokeWidth={2.5} />
              )}
              {esRegistro ? 'Crear cuenta' : 'Entrar'}
            </button>
          </form>

          <div className="auth-divider">
            <span>o continúa con</span>
          </div>

          <button
            type="button"
            className="btn btn-google btn-block"
            onClick={entrarConGoogle}
            disabled={ocupado}
          >
            <GoogleIcon size={19} />
            Continuar con Google
          </button>

          <p className="auth-switch">
            {esRegistro ? '¿Ya tienes una cuenta?' : '¿Aún no tienes cuenta?'}{' '}
            <button
              type="button"
              className="link-button"
              onClick={() => cambiarModo(esRegistro ? 'login' : 'register')}
            >
              {esRegistro ? 'Inicia sesión' : 'Regístrate gratis'}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}
