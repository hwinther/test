// https://vike.dev/onRenderHtml
import { escapeInject } from 'vike/server'

/**
 * Renders the HTML template.
 * @returns {Promise<any>} The wrapped template.
 */
async function onRenderHtml(): Promise<any> {
  return escapeInject`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React + TS</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
`
}

export { onRenderHtml }
