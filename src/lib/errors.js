const MENSAJES = {
  'auth/invalid-email': 'El correo no tiene un formato válido.',
  'auth/missing-password': 'Escribe tu contraseña.',
  'auth/user-disabled': 'Esta cuenta está deshabilitada.',
  'auth/user-not-found': 'No existe una cuenta con ese correo.',
  'auth/wrong-password': 'La contraseña es incorrecta.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/invalid-login-credentials': 'Correo o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/popup-closed-by-user': 'Cancelaste el inicio de sesión con Google.',
  'auth/cancelled-popup-request': 'Cancelaste el inicio de sesión con Google.',
  'auth/account-exists-with-different-credential':
    'Ese correo ya está registrado con otro método de inicio de sesión.',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
  'auth/network-request-failed': 'Sin conexión. Revisa tu red e inténtalo de nuevo.',
  'auth/unauthorized-domain': 'Este dominio no está autorizado en Firebase Authentication.',
  'auth/operation-not-allowed': 'Ese método de inicio de sesión no está habilitado en Firebase.',
  'auth/popup-blocked':
    'El navegador bloqueó la ventana de Google. Vuelve a intentarlo o permite las ventanas emergentes.',
  'permission-denied': 'No tienes permiso para realizar esta acción.',
  'unavailable': 'No se pudo conectar con el servidor. Revisa tu conexión.',
  'failed-precondition': 'Firestore necesita un índice para esta consulta.',
}

export function mensajeError(error) {
  if (!error) return 'Ha ocurrido un error inesperado. Inténtalo de nuevo.'
  const codigo = String(error.code ?? '')
  return (
    MENSAJES[codigo] ??
    MENSAJES[codigo.replace('firestore/', '')] ??
    'Ha ocurrido un error inesperado. Inténtalo de nuevo.'
  )
}
