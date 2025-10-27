// https://vike.dev/onRenderHtml
import { escapeInject } from 'vike/server'

/**
 * Renders the HTML template.
 * @returns {Promise<ReturnType<typeof escapeInject>>} The wrapped template.
 */
async function onRenderHtml(): Promise<ReturnType<typeof escapeInject>> {
  return escapeInject`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`
}

export { onRenderHtml }
