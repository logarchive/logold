# Log

This fork currently contains the production build of the Log web app in `b/`.

## Chat WebSocket

The bundled client uses a shared WebSocket connector that derives its default
endpoint from the app's API configuration and appends the built-in socket
path. To use a different server, set `window.LOG_CHAT_SOCKET` to a `wss://`
base URL before the app bundle loads. The server must implement the same
message, authentication, room, and presence protocol as the existing service;
a generic WebSocket echo server will not work.

Add this in the `<head>` of `b/index.html`, before the asset-loader script:

```html
<script>
  window.LOG_CHAT_SOCKET = "wss://chat.example.com/socket/";
</script>
```

Replace the example URL with your server; the app appends its existing socket
path to that base. If unset, the bundled client keeps its existing endpoint
behavior. Do not use `ws://` for a public deployment; use `wss://`.

This changes the WebSocket destination only. The existing HTTP API, login,
presence, and other backend calls still target the upstream service; a fully
independent chat requires self-hosting and reconfiguring those APIs too.

## Mock browser URLs

The app's embedded browser recognizes `log://home` and `log://game/<slug>`.
Enter those in the address bar inside Log. Brave's real omnibox does not know
the custom `log://` scheme and may search for it instead; websites cannot
register browser-wide custom URL schemes. In Brave, open the normal `https://`
Log site first.

The root `index.html` is a standalone HTML-runner launcher: it fetches the app
HTML from jsDelivr, then loads its CSS and JavaScript from the same CDN. It
requires the runner to allow JavaScript, cross-origin fetches, and an
`about:blank` iframe. `index.svg` loads the sibling root `index.html`; keep
both files together when using the SVG. The launcher pins the CDN to the
commit hash inside `index.html` so a stale jsDelivr `@main` cache cannot
revert the app to Cherri. After pushing later app changes, update that hash
to the new commit. This is a launcher, not a self-contained copy of the app.

### Google Apps Script

Create an Apps Script project with an HTML file named `index`, paste the root
`index.html` launcher into it, and paste `Code.gs` into the script editor.
Deploy it as a Web app, then open the deployment URL. The script serves the
launcher only; app assets still come from jsDelivr and the app's existing
backend remains external.

Brave does not recognize `log://` as a website address. Open the HTTPS Google
Apps Script deployment URL in Brave; use `log://home` or `log://game/<slug>`
only in Log's own embedded address bar.

## Discord

The existing invite is [discord.gg/hUYzETaQ9U](https://discord.gg/hUYzETaQ9U).
It is currently embedded in `b/assets/bundle-1lkto7bl.js`.

## Source and formatting

The repository contains compiled/minified browser assets rather than the
original source tree, and no source maps are included. The app bundle is
therefore difficult to deobfuscate safely; make feature changes in the
original source project and rebuild the bundle when that source is available.
Internal legacy storage and service identifiers are retained so existing
settings and app behavior continue to work.

## UI changes and hosting

The Log-specific UI overrides are in `b/log-ui.css`. The home page uses a
subtle green grid and animated particles, with animation disabled for users
who prefer reduced motion. The navigation rail is at the bottom, the home
wordmark says LOG, the subtitle is more prominent, the tutorial no longer
launches, Comic Sans is used, and Music has been removed from the navigation.
There is no Movies route in this build.

The `b/` directory is a static front end, not a complete self-hostable service.
Publishing it to static hosting serves the page but does not provide the
upstream API, authentication, presence, chat, or game-catalog endpoints. A
separate compatible backend is required for those features; changing the
WebSocket URL alone does not replace the HTTP API.

The static Games list is `b/assets/json/log-games.json`. It maps each slug to
its title and HTML entry file. The corresponding static game files are included
under `games/`, copied from the public
[games-for-log repository](https://github.com/logthedeveloper/games-for-log)
at commit `6af9cf9ff2cf0850fbb9493e74dff1d44a4d1aee` (which credits
[x8rr/games](https://github.com/x8rr/games)). This includes 49 game folders
and about 1.5 GiB of files. For example, `log://game/2048` opens
`games/2048/index.html` and `log://game/worldshardestgame` opens
`games/worldshardestgame/game.html`.

The launcher points game pages at the repository's `/games/` folder. However,
jsDelivr serves `.html` files as `text/plain` with `nosniff`; game entry pages
need a regular static web host to execute. Some large game assets may also be
unavailable from the CDN. Game titles can make their own third-party requests
for ads or game services.

Do not expose a home-server backend to the public internet until it has a
firewall, TLS, authentication, and current security updates. A firewall should
allow only the intended public web traffic; do not forward admin or remote
management ports. The static Games catalog does not need that backend.