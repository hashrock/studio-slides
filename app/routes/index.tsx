import { createRoute } from 'honox/factory'
import { raw } from 'hono/html'
import { Script } from 'honox/server'
import SlideViewer from '../islands/slide-viewer'

export default createRoute(async (c) => {
  const url = c.req.query('url')

  if (!url) {
    // Show input form
    return c.render(
      <div class="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-5">
        <title>Studio Slides</title>
        <h1 class="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Studio Slides
        </h1>
        <form class="flex gap-2 w-full max-w-xl" method="get">
          <input
            type="text"
            name="url"
            placeholder="https://example.studio.site/"
            class="flex-1 px-5 py-4 rounded-lg bg-slate-800 text-white border-none outline-none"
          />
          <button
            type="submit"
            class="px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
          >
            Start
          </button>
        </form>
      </div>
    )
  }

  try {
    // Fetch HTML server-side
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`)
    }

    const html = await response.text()

    // Parse HTML to extract sections and styles
    const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)
    const headContent = headMatch ? headMatch[1] : ''

    // Extract sections
    const sectionRegex = /<section[^>]*>[\s\S]*?<\/section>/gi
    const sections = html.match(sectionRegex) || []

    if (sections.length === 0) {
      throw new Error('No sections found in the page')
    }

    return c.html(
      <html lang="ja">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Studio Slides</title>
          <Script src="/app/client.ts" async />
          {raw(headContent)}
          <style>{`
            html, body {
              margin: 0;
              padding: 0;
              overflow: hidden;
              height: 100vh;
            }
            .slide-container {
              position: relative;
              width: 100vw;
              height: 100vh;
              overflow: hidden;
            }
            .slide {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              overflow: auto;
              transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
            .slide.current {
              transform: translateX(0);
            }
            .slide.prev {
              transform: translateX(-100%);
            }
            .slide.next {
              transform: translateX(100%);
            }
            .slide.hidden {
              visibility: hidden;
            }
            .slide section {
              min-height: 100vh;
            }
            /* Override appear animation */
            .appear {
              opacity: 1 !important;
              transform: none !important;
            }
            .page-indicator {
              position: fixed;
              bottom: 20px;
              right: 20px;
              background: rgba(0, 0, 0, 0.7);
              color: #fff;
              padding: 10px 20px;
              border-radius: 20px;
              font-size: 1rem;
              font-weight: 500;
              z-index: 1000;
              backdrop-filter: blur(10px);
            }
            .nav-buttons {
              position: fixed;
              bottom: 20px;
              left: 50%;
              transform: translateX(-50%);
              display: flex;
              gap: 10px;
              z-index: 1000;
            }
            .nav-btn {
              width: 50px;
              height: 50px;
              border: none;
              border-radius: 50%;
              background: rgba(0, 0, 0, 0.7);
              color: #fff;
              font-size: 1.5rem;
              cursor: pointer;
              transition: background 0.2s, transform 0.2s;
              backdrop-filter: blur(10px);
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .nav-btn:hover {
              background: rgba(0, 0, 0, 0.9);
              transform: scale(1.1);
            }
            .nav-btn:disabled {
              opacity: 0.3;
              cursor: not-allowed;
              transform: none;
            }
          `}</style>
        </head>
        <body>
          <SlideViewer sections={sections} />
        </body>
      </html>
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return c.render(
      <div class="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-5">
        <title>Error - Studio Slides</title>
        <h1 class="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          Studio Slides
        </h1>
        <form class="flex gap-2 w-full max-w-xl" method="get">
          <input
            type="text"
            name="url"
            value={url}
            class="flex-1 px-5 py-4 rounded-lg bg-slate-800 text-white border-none outline-none"
          />
          <button
            type="submit"
            class="px-8 py-4 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
          >
            Start
          </button>
        </form>
        <p class="text-red-400 mt-4">Error: {message}</p>
      </div>
    )
  }
})
