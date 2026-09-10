# Para mi dulce niña

Una carta hecha de luz: un cometa cruza el cielo de izquierda a derecha y va
soltando polvo de estrellas que se acomoda en palabras. Cada frase deja una
estrella dorada, y al final el cielo se queda para ella.

Solo HTML, CSS y JS. Sin librerías, sin build.

## Antes de subirlo: la música

Falta un archivo, y es el único paso manual:

```
musica.mp3   ←  Amor de Cine — Humbe
```

Ponlo en esta misma carpeta, con ese nombre exacto. Arranca sola cuando ella
toca **Empezar** (los navegadores no dejan sonar nada antes de un toque) y sube
de volumen despacito. El botón `♪ música` la silencia.

Si el archivo no está, la página funciona igual: solo se queda sin sonido.

## Subirlo a GitHub Pages

```bash
git init && git add . && git commit -m "Para mi dulce niña"
```

Luego crea un repo vacío en GitHub y:

```bash
git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
git branch -M main
git push -u origin main
```

En GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root)**.
En un par de minutos queda en `https://TU-USUARIO.github.io/TU-REPO/`.

Nota: el repo es público, así que el `.mp3` queda público también. Si prefieres
no subir la canción, deja el archivo fuera y la página corre sin música.

## El aviso a tu teléfono

`script.js` manda una notificación al topic de ntfy
`Alerta-Aldair-Frappes-928471` en dos momentos:

| Cuándo | Qué te llega |
|---|---|
| Al abrir la página | `Abrio la carta` |
| Al llegar al final | `Llego al final` |
| Si pone 5 estrellas o más | `Esta jugando con el cielo` |

Es completamente silencioso de su lado: no se ve ningún aviso, ningún mensaje,
nada. Si la petición falla, se ignora y la página sigue igual.

Dos cosas que conviene que sepas:

- El topic de ntfy es público. Cualquiera que sepa el nombre puede leer esas
  notificaciones, así que no le pongas datos personales.
- El nombre del topic está en `script.js`, y el código del repo es público. Si
  no quieres que sea evidente, cámbialo por algo que no se lea como alerta
  (la constante `NTFY_TOPIC`, arriba del archivo).

## Qué toca dónde

| Archivo | Qué hay dentro |
|---|---|
| `index.html` | La portada, la carta y el crédito de la canción |
| `styles.css` | Cielo, grano de película, letterbox, tipografía |
| `script.js` | Cometa, polvo, constelaciones y el aviso a ntfy |
| `grain.svg` | El grano que se mueve encima de todo |

### Cambiar las frases

Están todas juntas al inicio de `script.js`, en `ESCENAS`:

```js
{ t: 'Te quiero', hold: 5200, scale: 1.55 }
```

- `t`: el texto (`\n` fuerza un salto de línea)
- `hold`: cuánto dura en pantalla, en milisegundos
- `scale`: qué tan grande sale
- `it: true`: cursiva
- `script: true`: letra manuscrita (como "Mi dulce niña")

Un toque en la pantalla adelanta la frase; el botón `saltar` va directo a la
carta. Con el teclado: espacio o flecha derecha.

### El cielo de ella

Cuando termina la película, tocar el cielo pone una estrella, y arrastrando
deja un rastro. Se conectan entre sí y se guardan en su navegador
(`localStorage`), así que siguen ahí la próxima vez que entre.
