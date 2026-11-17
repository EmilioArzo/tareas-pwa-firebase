# Configuración de Firebase paso a paso

Esta guía cubre **todo lo que hay que hacer en la consola de Firebase**. El proyecto ya está
programado: solo falta crear el proyecto, habilitar los servicios y desplegar.

> **Plan Spark:** todo lo de esta guía funciona en el plan gratuito Spark y **no pide tarjeta**.
> No pulses “Actualizar” / “Upgrade” en ningún momento.

---

## 0. Lo que necesitas

- Una cuenta de Google.
- Este proyecto abierto en una terminal.
- Node.js 20.19+ o 22.12+.
- Navegador con sesión iniciada en la misma cuenta de Google.

Consola: <https://console.firebase.google.com/>

---

## 1. Crear el proyecto

1. Entra en <https://console.firebase.google.com/> y pulsa **Crear un proyecto**
   (o **Agregar proyecto**).
2. Escribe un nombre, por ejemplo `tareas-pwa-tunombre`.
   Firebase generará un **ID de proyecto** único (puede llevar guiones y números).
   Anota ese ID: lo usarás en `.firebaserc`.
3. Pulsa **Continuar**.
4. En “Google Analytics”, **desactiva** la opción (no es necesaria para este proyecto).
   Pulsa **Crear proyecto**.
5. Espera a que termine y pulsa **Continuar**.

**Comprueba que sigues en Spark:** en la esquina inferior izquierda de la consola debe decir
**Spark** (plan gratuito). También puedes verlo en ⚙️ → **Uso y facturación**.
Si dijera Blaze, no añadas ninguna tarjeta: crea otro proyecto, el plan Spark es el
predeterminado.

---

## 2. Registrar la app web y copiar la configuración

1. En la página **Descripción general del proyecto**, pulsa el icono **`</>`** (Web).
2. Apodo de la app: `tareas-web`. **No** marques “Configurar también Firebase Hosting”
   (lo haremos con la CLI). Pulsa **Registrar app**.
3. Firebase muestra un bloque `firebaseConfig` parecido a este:

   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "tareas-pwa-tunombre.firebaseapp.com",
     projectId: "tareas-pwa-tunombre",
     storageBucket: "tareas-pwa-tunombre.firebasestorage.app",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456"
   };
   ```

4. En la carpeta del proyecto crea `.env.local` a partir de `.env.example`:

   ```powershell
   Copy-Item .env.example .env.local
   ```

   ```bash
   # macOS / Linux
   cp .env.example .env.local
   ```

5. Pega cada valor en su variable:

   | Valor de `firebaseConfig` | Variable en `.env.local` |
   | --- | --- |
   | `apiKey` | `VITE_FIREBASE_API_KEY` |
   | `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` |
   | `projectId` | `VITE_FIREBASE_PROJECT_ID` |
   | `storageBucket` | `VITE_FIREBASE_STORAGE_BUCKET` |
   | `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
   | `appId` | `VITE_FIREBASE_APP_ID` |

   Ejemplo:

   ```dotenv
   VITE_FIREBASE_API_KEY=AIzaSyB-ejemplo
   VITE_FIREBASE_AUTH_DOMAIN=tareas-pwa-tunombre.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=tareas-pwa-tunombre
   VITE_FIREBASE_STORAGE_BUCKET=tareas-pwa-tunombre.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```

6. Pulsa **Continuar en la consola**. No hace falta copiar el SDK: el código ya está escrito.

> Si cierras esa pantalla, vuelve a ver la configuración en ⚙️ → **Configuración del proyecto**
> → **General** → **Tus apps** → `tareas-web` → **Configuración del SDK**.

`.env.local` está en `.gitignore`: no se sube al repositorio. No es un secreto peligroso
(son claves públicas del cliente), pero conviene no versionarlo.

---

## 3. Habilitar Authentication (correo y Google)

1. Menú izquierdo: **Compilación → Authentication** (o **Build → Authentication**).
2. Pulsa **Comenzar** / **Get started**.
3. Pestaña **Sign-in method** / **Métodos de acceso**:
   - **Correo electrónico/contraseña**:
     - Activa **Correo electrónico/contraseña**.
     - Deja **desactivado** “Vínculo de correo electrónico (sin contraseña)”.
     - **Guardar**.
   - **Google**:
     - Activa **Google**.
     - Nombre público del proyecto: `Tareas` (o tu nombre).
     - Correo de asistencia: tu correo.
     - **Guardar**.
     - No se pide tarjeta: Firebase crea el cliente OAuth por ti.
4. Pestaña **Settings** / **Configuración → Dominios autorizados**:
   - `localhost` ya aparece (necesario para `npm run dev`).
   - `TU-PROYECTO.web.app` y `TU-PROYECTO.firebaseapp.com` se añaden **automáticamente** al
     desplegar Hosting (puede tardar un par de minutos).
   - Si usas un dominio propio o `127.0.0.1`, añádelo aquí con **Agregar dominio**.
5. Opcional (recomendado): pestaña **Templates**, elige **Password reset** y traduce el correo
   al español. Es el correo que envía “¿Olvidaste tu contraseña?”.

> Los correos de verificación/restablecimiento salen desde
> `noreply@TU-PROYECTO.firebaseapp.com`. Si no llegan, revisa spam.

---

## 4. Crear Firestore y publicar las reglas

1. Menú izquierdo: **Compilación → Firestore Database**.
2. Pulsa **Crear base de datos**.
3. Elige una ubicación cercana (por ejemplo `southamerica-east1` para Sudamérica,
   `northamerica-south1` para México o `europe-west1` para Europa).
   **La ubicación no se puede cambiar después**, pero para este proyecto cualquiera sirve.
4. Modo: **Modo de producción** (NO elijas modo de prueba).
5. Pulsa **Crear**.

### Publicar las reglas

**Opción A — desde la consola (sirve para la captura):**

1. Dentro de Firestore, abre la pestaña **Reglas** / **Rules**.
2. Borra el contenido que aparece y pega el de [`firestore.rules`](../firestore.rules).
3. Pulsa **Publicar**.

**Opción B — desde la terminal:**

```bash
firebase deploy --only firestore:rules
```

El contenido que debes ver publicado es:

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    function signedIn() {
      return request.auth != null;
    }

    function isOwner() {
      return signedIn() && resource.data.uid == request.auth.uid;
    }

    function validTask(data) {
      return data.keys().hasAll(['uid', 'title', 'completed', 'createdAt', 'updatedAt'])
        && data.uid == request.auth.uid
        && data.title is string
        && data.title.size() > 0
        && data.title.size() <= 200
        && data.completed is bool
        && (!data.keys().hasAny(['notes'])
            || (data.notes is string && data.notes.size() <= 1000));
    }

    match /tasks/{taskId} {
      allow read: if isOwner();
      allow create: if signedIn() && validTask(request.resource.data);
      allow update: if isOwner()
        && request.resource.data.uid == resource.data.uid
        && validTask(request.resource.data)
        && request.resource.data.diff(resource.data).affectedKeys()
             .hasOnly(['title', 'notes', 'completed', 'updatedAt']);
      allow delete: if isOwner();
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Importante:** si ves `allow read, write: if true` en algún sitio, no has pegado las reglas
correctas. Vuelve a publicarlas.

La colección `tasks` aparecerá sola cuando crees la primera tarea desde la app. No hace falta
crearla a mano ni crear índices (la consulta solo filtra por `uid`).

### Captura para la entrega

Con las reglas publicadas:

1. Ve a **Firestore Database → Reglas**.
2. Ajusta el zoom del navegador (80–90 %) para que se vea todo el bloque.
3. Captura la pantalla completa del panel (incluye el nombre del proyecto arriba y el botón
   **Publicar**). Guarda la imagen como `docs/captura-reglas-firestore.png`.
4. Puedes añadirla al README:

   ```md
   ![Reglas de Firestore](docs/captura-reglas-firestore.png)
   ```

---

## 5. Instalar la CLI y desplegar en Hosting

1. Instala Firebase CLI (una sola vez):

   ```bash
   npm install -g firebase-tools
   ```

   Si en PowerShell aparece “la ejecución de scripts está deshabilitada”, usa
   `npm.cmd install -g firebase-tools`.

2. Inicia sesión (abre el navegador; usa la misma cuenta de Google):

   ```bash
   firebase login
   ```

   Si trabajas por SSH o el navegador no se abre: `firebase login --no-localhost`.

3. Asocia la carpeta con tu proyecto. Ejecútalo **dentro de la carpeta que contiene
   `firebase.json`**:

   ```bash
   firebase use --add
   ```

   - Elige tu proyecto de la lista.
   - Alias: escribe `default`.
   - Esto rellena `.firebaserc` automáticamente.

   También puedes abrir `.firebaserc` y sustituir `TU_PROYECTO_ID` por tu ID de proyecto.

4. Construye y despliega:

   ```bash
   npm install
   npm run build
   firebase deploy --only hosting,firestore:rules
   ```

   El comando debe terminar con algo como:

   ```text
   ✔  Deploy complete!
   Hosting URL: https://TU-PROYECTO.web.app
   ```

5. Abre la URL en una ventana normal y en incógnito para probar dos cuentas.

> **No ejecutes `firebase init`**: el proyecto ya trae `firebase.json`, `.firebaserc` y las
> reglas configuradas. Si lo ejecutas por error, no sobrescribas `firebase.json`,
> `firestore.rules` ni `index.html`; el directorio público es `dist` y la app es una SPA
> (rewrite a `/index.html` ya configurado).

### Cada vez que cambies algo

```bash
npm run build
firebase deploy --only hosting
```

Si cambias `.env.local`, es obligatorio reconstruir: Vite inserta las variables en el build.

---

## 6. Verificación final en Firebase

- [ ] El proyecto sigue en **Spark** (⚙️ → Uso y facturación).
- [ ] **Authentication → Users** muestra las cuentas creadas.
- [ ] **Authentication → Sign-in method** tiene Email/Password y Google habilitados.
- [ ] **Authentication → Settings → Authorized domains** incluye `localhost` y
      `TU-PROYECTO.web.app`.
- [ ] **Firestore Database → Data** muestra la colección `tasks` con documentos que tienen
      `uid`, `title`, `notes`, `completed`, `createdAt`, `updatedAt`.
- [ ] **Firestore Database → Reglas** muestra las reglas cerradas (sin `if true`).
- [ ] **Hosting** muestra el sitio con la última fecha de despliegue.
- [ ] La app abre en `https://TU-PROYECTO.web.app` y permite registrarse.

---

## 7. Problemas frecuentes

| Síntoma | Solución |
| --- | --- |
| `Error: Failed to get project` al desplegar | Ejecuta `firebase use --add` dentro de la carpeta correcta. |
| `HTTP Error: 403` | La cuenta con la que hiciste `firebase login` no es dueña del proyecto. |
| `auth/unauthorized-domain` | Añade el dominio en Authentication → Settings → Authorized domains. |
| `auth/operation-not-allowed` | Falta habilitar Email/Password o Google. |
| `permission-denied` al crear tareas | Reglas no publicadas o pertenecen a otro proyecto. |
| Se queda en “Falta conectar Firebase” | `.env.local` mal nombrado o sin valores; reinicia `npm run dev`. |
| Google no funciona en la PWA instalada | Permite ventanas emergentes; la app usa redirección como respaldo. |
| No aparece la opción de instalar la PWA | Debe ser HTTPS o localhost y con `npm run build && npm run preview`. |
| Tras desplegar veo la versión anterior | Recarga forzada (Ctrl+Shift+R) o sube `VERSION` en `public/sw.js` y vuelve a desplegar. |
| `firebase: no se reconoce como comando` | Cierra y abre la terminal, o usa `npx firebase-tools`. |

---

## 8. Cuotas del plan Spark (referencia)

Para una demo académica son más que suficientes:

- Firestore: 50 000 lecturas/día, 20 000 escrituras/día, 20 000 borrados/día, 1 GiB almacenados.
- Hosting: 10 GB de transferencia/mes y 360 MB de almacenamiento.
- Authentication: sin coste para correo/contraseña ni Google dentro de los límites normales.

No actives Cloud Functions, Cloud Storage ni Blaze: no son necesarios.
