import { initializeApp } from 'firebase/app'
import {
  browserLocalPersistence,
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  setPersistence,
} from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'

/*
 * La configuración se toma de las variables de entorno de Vite (.env.local).
 * La guía paso a paso está en FIREBASE_SETUP.md.
 */
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const firebaseMissingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key)

export const isFirebaseConfigured = firebaseMissingKeys.length === 0

// Solo inicializamos Firebase si hay configuración válida. Así la app puede
// mostrar una pantalla de ayuda en lugar de romperse al arrancar.
let app = null
let auth = null
let db = null
let googleProvider = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)

  // Mantiene la sesión iniciada al cerrar y volver a abrir la app instalada.
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('No se pudo configurar la persistencia de sesión:', error)
  })

  googleProvider = new GoogleAuthProvider()
  googleProvider.setCustomParameters({ prompt: 'select_account' })

  // Modo opcional para desarrollo con los emuladores locales:
  //   VITE_USE_EMULATORS=true
  // No afecta al build de producción (por defecto está desactivado).
  if (import.meta.env.VITE_USE_EMULATORS === 'true') {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
    connectFirestoreEmulator(db, '127.0.0.1', 8080)
  }
}

export { app, auth, db, googleProvider }
