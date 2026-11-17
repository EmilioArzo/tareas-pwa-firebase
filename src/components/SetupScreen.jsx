import { firebaseMissingKeys } from '../firebase'
import { ClipboardIcon, LockIcon, ZapIcon } from './Icons'

const VARIABLES = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
]

export default function SetupScreen() {
  return (
    <main className="setup-page">
      <section className="setup-card">
        <div className="brand-lockup">
          <span className="logo-mark" aria-hidden="true">
            <ClipboardIcon size={20} />
          </span>
          <span className="brand-name brand-name-dark">Tareas</span>
        </div>

        <h1>Falta conectar Firebase</h1>
        <p className="setup-lead">
          La app está completa, pero necesita las claves de tu proyecto de Firebase para
          poder autenticar usuarios y guardar tareas.
        </p>

        <ol className="setup-steps">
          <li>
            <span className="setup-num">1</span>
            <span>
              Crea el proyecto y la app web siguiendo la guía <code>FIREBASE_SETUP.md</code>.
            </span>
          </li>
          <li>
            <span className="setup-num">2</span>
            <span>
              Copia <code>.env.example</code> a <code>.env.local</code> y pega los valores.
            </span>
          </li>
          <li>
            <span className="setup-num">3</span>
            <span>
              Reinicia el servidor con <code>npm run dev</code>.
            </span>
          </li>
        </ol>

        <div className="setup-missing">
          <strong>Variables que faltan</strong>
          <ul>
            {(firebaseMissingKeys.length ? firebaseMissingKeys : VARIABLES).map((clave) => (
              <li key={clave}>
                <code>{clave}</code>
              </li>
            ))}
          </ul>
        </div>

        <div className="setup-features">
          <span><LockIcon size={14} /> Auth con correo y Google</span>
          <span><ZapIcon size={14} /> Firestore en tiempo real</span>
          <span><ClipboardIcon size={14} /> PWA instalable</span>
        </div>
      </section>
    </main>
  )
}
