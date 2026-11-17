# Guía de entrega

Lista de comprobación para producir los cuatro entregables. La app ya está programada; los
pasos de Firebase están detallados en [`../FIREBASE_SETUP.md`](../FIREBASE_SETUP.md).

---

## 1. URL de la app desplegada

1. Completa los pasos 1–5 de `FIREBASE_SETUP.md`.
2. Ejecuta:

   ```bash
   npm install
   npm run build
   firebase deploy --only hosting,firestore:rules
   ```

3. Copia la **Hosting URL** que imprime la CLI:
   `https://TU-PROYECTO.web.app`.
4. Compruébala en incógnito: debe cargar el login, permitir crear una cuenta y guardar tareas.
5. Pega la URL en el README, en la tabla de la sección **Demo**.

---

## 2. Repositorio con README

El README ya explica requisitos, configuración, ejecución, despliegue, reglas y pruebas.

### Subir a GitHub

**Con GitHub CLI** (recomendado si lo tienes instalado):

```bash
git init
git add .
git commit -m "PWA de tareas con Firebase: auth, Firestore y hosting"
gh repo create tareas-pwa-firebase --public --source=. --remote=origin --push
```

**Desde la web de GitHub:**

1. Crea un repositorio vacío (sin README ni .gitignore).
2. En la carpeta del proyecto:

   ```bash
   git init
   git add .
   git commit -m "PWA de tareas con Firebase"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
   git push -u origin main
   ```

3. Antes de hacer `git add`, verifica con `git status` que **no** aparecen `node_modules/`,
   `dist/` ni `.env.local`. El `.gitignore` ya los excluye.
4. Pega el enlace del repositorio en el README y en el documento de entrega.

> Si el profesor pide el enlace público, comprueba que el repositorio no sea privado o que
> tenga acceso.

---

## 3. Captura de las reglas de seguridad de Firestore

1. Publica las reglas (consola o `firebase deploy --only firestore:rules`).
2. Abre **Firebase Console → Firestore Database → Reglas**.
3. Deja visible el nombre del proyecto (barra superior), el bloque completo de reglas y el botón
   **Publicar**. Si no cabe, baja el zoom del navegador al 80 %.
4. Captura la ventana completa y guárdala como `docs/captura-reglas-firestore.png`.
5. Añádela al README (opcional pero recomendable):

   ```md
   ## Reglas de seguridad

   ![Reglas de Firestore](docs/captura-reglas-firestore.png)
   ```

La captura debe demostrar que **no** hay `allow read, write: if true`. Las reglas del proyecto
permiten únicamente al dueño (`resource.data.uid == request.auth.uid`) y bloquean el resto.

---

## 4. Video de máximo 3 minutos

### Guion sugerido (2:40)

| Tiempo | Qué mostrar |
| --- | --- |
| 0:00–0:10 | Título, nombre, URL `TU-PROYECTO.web.app` visible en la barra de direcciones. |
| 0:10–0:35 | Registro con correo/contraseña, cierre de sesión y nuevo inicio de sesión. |
| 0:35–0:50 | Inicio de sesión con Google (se ve la cuenta y el avatar). |
| 0:50–1:20 | CRUD: crear tarea con nota, editarla, marcarla como completada y eliminarla. |
| 1:20–1:50 | **Dos pestañas**: crear/editar/completar en una y ver el cambio automático en la otra, sin recargar. |
| 1:50–2:10 | **App instalada**: icono de instalar en Chrome, ventana standalone y menú de la app. |
| 2:10–2:25 | Reglas de Firestore: pestaña Reglas y simulador denegando el acceso a otro UID. |
| 2:25–2:40 | Cierre: URL y repositorio. |

### Consejos de grabación

- Graba a 1080p y comprime si el archivo es grande.
- Usa una cuenta nueva y tareas legibles (nada de “asdf”).
- En la demo de dos pestañas, deja las dos visibles a la vez (ventana dividida) para que se
  vea que no hay recarga.
- Para la PWA: `npm run build` + `npm run preview` sirve para probar, pero **graba la app
  desplegada en `https://...web.app`**, que es la que se entrega. El icono de instalación
  aparece en la barra de direcciones de Chrome/Edge.
- Si Chrome no muestra el icono, menú ⋮ → **Guardar y compartir → Instalar página como app**.
- Silencia notificaciones y cierra pestañas ajenas.
- Comprueba el límite de 3 minutos antes de subirlo (YouTube oculto o Drive con permiso de
  lectura).

---

## 5. Antes de entregar (checklist)

- [ ] `https://TU-PROYECTO.web.app` carga y permite registrarse.
- [ ] Login con correo, con Google y cierre de sesión funcionan.
- [ ] Crear, listar, editar, completar y eliminar tareas funciona.
- [ ] Dos pestañas se sincronizan solas.
- [ ] Las cuentas A y B ven listas distintas.
- [ ] `firestore.rules` publicado y capturado.
- [ ] Manifest + service worker activos (`DevTools → Application`).
- [ ] La app se instala y abre en ventana independiente.
- [ ] Repositorio público con README y `.env.local` fuera del repo.
- [ ] README con URL y enlace del repositorio reales.
- [ ] Video ≤ 3 min subido y con permiso de visualización.
- [ ] Plan de Firebase en **Spark** (sin tarjeta).
