const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
}

import getInTouch from './routes/get-in-touch.js'

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url)

        if (request.method === 'OPTIONS')
            return new Response(null, { status: 204, headers: corsHeaders })

        if (request.method !== 'POST') {
            console.error('Invalid method:', request.method)
            return new Response('Wrong request method', { status: 405, headers: corsHeaders })
        }

        if (env.ALLOWED_DOMAINS) {
            const allowedDomains = env.ALLOWED_DOMAINS
                .split(',')
                .map(d => d.trim().toLowerCase())
                .filter(Boolean)

            let requestDomain

            try {
                const origin = request.headers.get('origin')
                requestDomain = origin ? new URL(origin).hostname.toLowerCase() : null
            } catch (err) {
                console.error('Origin parse error:', err?.message)
                return new Response('Invalid request', { status: 400, headers: corsHeaders })
            }

            if (!requestDomain || !allowedDomains.includes(requestDomain)) {
                console.error('Origin not allowed', { requestDomain })
                return new Response('Forbidden', { status: 403, headers: corsHeaders })
            }
        }

        let body

        try {
            body = await request.json()
        } catch (err) {
            console.error('JSON parse error:', err?.message)
            return new Response('Invalid JSON', { status: 400, headers: corsHeaders })
        }

        switch (url.pathname) {
            case "/get-in-touch":
                return getInTouch(body, env, corsHeaders)

            default:
                console.error('Route not found:', url.pathname)
                return new Response("Not Found", { status: 404, headers: corsHeaders })
        }
    }
}
