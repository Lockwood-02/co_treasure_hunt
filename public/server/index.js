export default {
  async fetch(request, env) {
    if (env.ASSETS?.fetch) {
      return env.ASSETS.fetch(request)
    }

    return new Response('CO Treasure Hunt is temporarily unavailable.', { status: 503 })
  },
}
