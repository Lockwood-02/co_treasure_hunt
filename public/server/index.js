export default {
  async fetch(request, env) {
    if (env.ASSETS?.fetch) {
      return env.ASSETS.fetch(request)
    }

    return new Response('Trailbound is temporarily unavailable.', { status: 503 })
  },
}
