import { useEffect, useState } from 'react'
import { getRedirectResult, onAuthStateChanged } from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../firebase'
import { mensajeError } from '../lib/errors'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    if (!isFirebaseConfigured) return

    let activo = true

    // Recoge errores si el inicio de sesión con Google se hizo por redirección
    // (por ejemplo, en la PWA instalada cuando se bloquean las ventanas emergentes).
    getRedirectResult(auth).catch((error) => {
      if (activo) setAuthError(mensajeError(error))
    })

    const unsubscribe = onAuthStateChanged(
      auth,
      (usuario) => {
        if (!activo) return
        setUser(usuario)
        setLoading(false)
      },
      (error) => {
        if (!activo) return
        setAuthError(mensajeError(error))
        setLoading(false)
      },
    )

    return () => {
      activo = false
      unsubscribe()
    }
  }, [])

  return {
    user,
    loading,
    authError,
  }
}
