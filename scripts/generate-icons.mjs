/*
 * Genera los iconos PNG de la PWA sin dependencias externas.
 * Uso: node scripts/generate-icons.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const aqui = dirname(fileURLToPath(import.meta.url))
const salida = join(aqui, '..', 'public', 'icons')

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buffer) {
  let c = 0xffffffff
  for (let i = 0; i < buffer.length; i += 1) {
    c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8)
  }
  return (c ^ 0xffffffff) >>> 0
}

function chunk(tipo, datos) {
  const largo = Buffer.alloc(4)
  largo.writeUInt32BE(datos.length)
  const tipoBuf = Buffer.from(tipo, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([tipoBuf, datos])))
  return Buffer.concat([largo, tipoBuf, datos, crc])
}

function encodePNG(ancho, alto, pixeles) {
  const stride = ancho * 4
  const raw = Buffer.alloc((stride + 1) * alto)
  for (let y = 0; y < alto; y += 1) {
    raw[y * (stride + 1)] = 0
    pixeles.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(ancho, 0)
  ihdr.writeUInt32BE(alto, 4)
  ihdr[8] = 8 // bits por canal
  ihdr[9] = 6 // RGBA
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const clamp01 = (v) => Math.max(0, Math.min(1, v))
const mezclar = (a, b, t) => a + (b - a) * t

function distanciaSegmento(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const largo2 = dx * dx + dy * dy
  let t = largo2 === 0 ? 0 : ((px - x1) * dx + (py - y1) * dy) / largo2
  t = Math.max(0, Math.min(1, t))
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy))
}

function coberturaRedondeada(x, y, lado, radio) {
  const cx = Math.min(Math.max(x, radio), lado - radio)
  const cy = Math.min(Math.max(y, radio), lado - radio)
  const distancia = Math.hypot(x - cx, y - cy)
  return clamp01(radio + 0.5 - distancia)
}

const PUNTOS_CHECK = [
  [0.285, 0.535],
  [0.435, 0.68],
  [0.735, 0.35],
]

function dibujarIcono(lado, { redondeado = false, escalaCheck = 1 } = {}) {
  const pixeles = Buffer.alloc(lado * lado * 4)
  const radioEsquina = lado * 0.225
  const radioTrazo = lado * 0.05 * escalaCheck

  const puntos = PUNTOS_CHECK.map(([x, y]) => [
    lado * (0.5 + (x - 0.5) * escalaCheck),
    lado * (0.5 + (y - 0.5) * escalaCheck),
  ])

  for (let y = 0; y < lado; y += 1) {
    for (let x = 0; x < lado; x += 1) {
      const u = (x + 0.5) / lado
      const v = (y + 0.5) / lado
      const indice = (y * lado + x) * 4

      // Degradado diagonal (índigo -> violeta).
      const t = clamp01(u * 0.55 + v * 0.75)
      let r = mezclar(109, 74, t)
      let g = mezclar(92, 55, t)
      let b = mezclar(255, 224, t)

      // Brillo suave arriba a la izquierda.
      const brillo = Math.max(0, 1 - Math.hypot(u - 0.18, v - 0.02) / 0.95) ** 2 * 0.22
      r = mezclar(r, 255, brillo)
      g = mezclar(g, 255, brillo)
      b = mezclar(b, 255, brillo)

      // Trazo del check con antialias.
      const distancia = Math.min(
        distanciaSegmento(x + 0.5, y + 0.5, ...puntos[0], ...puntos[1]),
        distanciaSegmento(x + 0.5, y + 0.5, ...puntos[1], ...puntos[2]),
      )
      const tinta = clamp01(radioTrazo + 0.75 - distancia)

      r = mezclar(r, 255, tinta)
      g = mezclar(g, 255, tinta)
      b = mezclar(b, 255, tinta)

      const alfa = redondeado
        ? coberturaRedondeada(x + 0.5, y + 0.5, lado, radioEsquina)
        : 1

      pixeles[indice] = Math.round(r)
      pixeles[indice + 1] = Math.round(g)
      pixeles[indice + 2] = Math.round(b)
      pixeles[indice + 3] = Math.round(alfa * 255)
    }
  }

  return encodePNG(lado, lado, pixeles)
}

mkdirSync(salida, { recursive: true })

const archivos = [
  ['icon-192.png', dibujarIcono(192, { redondeado: true })],
  ['icon-512.png', dibujarIcono(512, { redondeado: true })],
  ['icon-maskable-512.png', dibujarIcono(512, { escalaCheck: 0.66 })],
  ['apple-touch-icon.png', dibujarIcono(180)],
]

for (const [nombre, contenido] of archivos) {
  writeFileSync(join(salida, nombre), contenido)
  console.log(`✓ public/icons/${nombre} (${(contenido.length / 1024).toFixed(1)} KB)`)
}
