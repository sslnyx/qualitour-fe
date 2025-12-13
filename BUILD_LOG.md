2025-12-13T01:13:30.868113Z	Cloning repository...
2025-12-13T01:13:31.701183Z	From https://github.com/sslnyx/qualitour-fe
2025-12-13T01:13:31.701712Z	 * branch            2bd02ea74cd51aca6def9996e23eee1f5b1dde22 -> FETCH_HEAD
2025-12-13T01:13:31.701863Z	
2025-12-13T01:13:31.738459Z	HEAD is now at 2bd02ea fix: add runtime = 'edge' to static pages for Cloudflare Pages compatibility
2025-12-13T01:13:31.739023Z	
2025-12-13T01:13:31.814652Z	
2025-12-13T01:13:31.815195Z	Using v2 root directory strategy
2025-12-13T01:13:31.839096Z	Success: Finished cloning repository files
2025-12-13T01:13:33.675123Z	Checking for configuration in a Wrangler configuration file (BETA)
2025-12-13T01:13:33.675754Z	
2025-12-13T01:13:34.76992Z	No wrangler.toml file found. Continuing.
2025-12-13T01:13:34.839192Z	Detected the following tools from environment: npm@10.9.2, nodejs@22.16.0
2025-12-13T01:13:34.83981Z	Installing project dependencies: npm clean-install --progress=false
2025-12-13T01:13:36.320622Z	(node:422) Warning: Setting the NODE_TLS_REJECT_UNAUTHORIZED environment variable to '0' makes TLS connections and HTTPS requests insecure by disabling certificate verification.
2025-12-13T01:13:36.320853Z	(Use `node --trace-warnings ...` to show where the warning was created)
2025-12-13T01:13:46.733049Z	
2025-12-13T01:13:46.733325Z	added 372 packages, and audited 373 packages in 11s
2025-12-13T01:13:46.733991Z	
2025-12-13T01:13:46.734096Z	146 packages are looking for funding
2025-12-13T01:13:46.734167Z	  run `npm fund` for details
2025-12-13T01:13:46.783262Z	
2025-12-13T01:13:46.783573Z	2 vulnerabilities (1 moderate, 1 critical)
2025-12-13T01:13:46.783922Z	
2025-12-13T01:13:46.78427Z	To address issues that do not require attention, run:
2025-12-13T01:13:46.784405Z	  npm audit fix
2025-12-13T01:13:46.784509Z	
2025-12-13T01:13:46.784629Z	To address all issues, run:
2025-12-13T01:13:46.784732Z	  npm audit fix --force
2025-12-13T01:13:46.784827Z	
2025-12-13T01:13:46.784922Z	Run `npm audit` for details.
2025-12-13T01:13:46.812761Z	Executing user command: npx @cloudflare/next-on-pages@1
2025-12-13T01:13:47.61795Z	(node:574) Warning: Setting the NODE_TLS_REJECT_UNAUTHORIZED environment variable to '0' makes TLS connections and HTTPS requests insecure by disabling certificate verification.
2025-12-13T01:13:47.61824Z	(Use `node --trace-warnings ...` to show where the warning was created)
2025-12-13T01:13:47.904247Z	npm warn exec The following package was not found and will be installed: @cloudflare/next-on-pages@1.13.16
2025-12-13T01:14:00.224818Z	npm warn deprecated path-match@1.2.4: This package is archived and no longer maintained. For support, visit https://github.com/expressjs/express/discussions
2025-12-13T01:14:01.652334Z	npm warn deprecated @cloudflare/next-on-pages@1.13.16: Please use the OpenNext adapter instead: https://opennext.js.org/cloudflare
2025-12-13T01:14:10.653714Z	⚡️ @cloudflare/next-on-pages CLI v.1.13.16
2025-12-13T01:14:10.818028Z	⚡️ Detected Package Manager: npm (10.9.2)
2025-12-13T01:14:10.818524Z	⚡️ Preparing project...
2025-12-13T01:14:10.821728Z	⚡️ Project is ready
2025-12-13T01:14:10.821954Z	⚡️ Building project...
2025-12-13T01:14:11.424097Z	▲  (node:839) Warning: Setting the NODE_TLS_REJECT_UNAUTHORIZED environment variable to '0' makes TLS connections and HTTPS requests insecure by disabling certificate verification.
2025-12-13T01:14:11.424386Z	▲  (Use `node --trace-warnings ...` to show where the warning was created)
2025-12-13T01:14:11.663725Z	▲  npm warn exec The following package was not found and will be installed: vercel@50.0.1
2025-12-13T01:14:16.508827Z	▲  npm warn deprecated path-match@1.2.4: This package is archived and no longer maintained. For support, visit https://github.com/expressjs/express/discussions
2025-12-13T01:14:19.289457Z	▲  Vercel CLI 50.0.1
2025-12-13T01:14:19.293569Z	▲  > NOTE: The Vercel CLI now collects telemetry regarding usage of the CLI.
2025-12-13T01:14:19.294052Z	▲  > This information is used to shape the CLI roadmap and prioritize features.
2025-12-13T01:14:19.294166Z	▲  > You can learn more, including how to opt-out if you'd not like to participate in this program, by visiting the following URL:
2025-12-13T01:14:19.29429Z	▲  > https://vercel.com/docs/cli/about-telemetry
2025-12-13T01:14:19.390066Z	▲  WARN! Build not running on Vercel. System environment variables will not be available.
2025-12-13T01:14:19.573674Z	▲  Installing dependencies...
2025-12-13T01:14:20.453809Z	▲  up to date in 747ms
2025-12-13T01:14:20.454069Z	▲  146 packages are looking for funding
2025-12-13T01:14:20.454792Z	▲  run `npm fund` for details
2025-12-13T01:14:20.462585Z	▲  Detected Next.js version: 16.0.0
2025-12-13T01:14:20.467261Z	▲  Running "npm run build"
2025-12-13T01:14:20.668134Z	▲  > qualitour-fe@0.1.0 build
2025-12-13T01:14:20.668393Z	▲  > next build
2025-12-13T01:14:20.986426Z	▲  [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
2025-12-13T01:14:21.634835Z	▲  Attention: Next.js now collects completely anonymous telemetry regarding usage.
2025-12-13T01:14:21.635066Z	▲  This information is used to shape Next.js' roadmap and prioritize features.
2025-12-13T01:14:21.635509Z	▲  You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
2025-12-13T01:14:21.635702Z	▲  https://nextjs.org/telemetry
2025-12-13T01:14:21.651044Z	▲  ▲ Next.js 16.0.0 (Turbopack)
2025-12-13T01:14:21.651356Z	▲  
2025-12-13T01:14:21.697623Z	▲  (node:988) Warning: Setting the NODE_TLS_REJECT_UNAUTHORIZED environment variable to '0' makes TLS connections and HTTPS requests insecure by disabling certificate verification.
2025-12-13T01:14:21.697903Z	▲  (Use `node --trace-warnings ...` to show where the warning was created)
2025-12-13T01:14:21.698776Z	▲  ⚠ The "middleware" file convention is deprecated. Please use "proxy" instead. Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
2025-12-13T01:14:21.726091Z	▲  Creating an optimized production build ...
2025-12-13T01:14:21.917566Z	▲  [baseline-browser-mapping] The data in this module is over two months old.  To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`
2025-12-13T01:14:27.568272Z	▲  ✓ Compiled successfully in 5.2s
2025-12-13T01:14:27.571384Z	▲  Running TypeScript ...
2025-12-13T01:14:31.450528Z	▲  Collecting page data ...
2025-12-13T01:14:31.551834Z	▲  > Build error occurred
2025-12-13T01:14:31.556286Z	▲  Error: Page "/[lang]/contact/page" cannot use both `export const runtime = 'edge'` and export `generateStaticParams`.
2025-12-13T01:14:31.556545Z	▲  at ignore-listed frames
2025-12-13T01:14:31.600299Z	▲  Error: Command "npm run build" exited with 1
2025-12-13T01:14:31.648564Z	▲  (node:902) Warning: Setting the NODE_TLS_REJECT_UNAUTHORIZED environment variable to '0' makes TLS connections and HTTPS requests insecure by disabling certificate verification.
2025-12-13T01:14:31.649002Z	▲  (Use `node --trace-warnings ...` to show where the warning was created)
2025-12-13T01:14:31.733818Z	
2025-12-13T01:14:31.734141Z	⚡️ The Vercel build (`npx vercel build`) command failed. For more details see the Vercel logs above.
2025-12-13T01:14:31.734389Z	⚡️ If you need help solving the issue, refer to the Vercel or Next.js documentation or their repositories.
2025-12-13T01:14:31.734586Z	
2025-12-13T01:14:31.764859Z	Failed: Error while executing user command. Exited with error code: 1
2025-12-13T01:14:31.773499Z	Failed: build command exited with code: 1
2025-12-13T01:14:33.078447Z	Failed: error occurred while running build command
