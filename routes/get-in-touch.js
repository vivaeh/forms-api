export default async function (body, env, corsHeaders) {
    console.info('[get-in-touch] Process started')

    const { formData, formUrl } = body || {}

    const { email, name, message, company, phone } = formData || {}

    if (company) return new Response("OK", { status: 200, headers: corsHeaders })

    if (!email || !message || !name) {
        console.error('[get-in-touch] Missing form data required fields')
        return new Response("Internal Error", { status: 500, headers: corsHeaders })
    }

    if (!env.BREVO_API_KEY || !env.CONTACT_MAIL_ADDRESS || !env.NO_REPLY_MAIL_ADDRESS || !env.MAIL_FROM_NAME) {
        console.error('[get-in-touch] Missing environment variables')
        console.log({
            BREVO_API_KEY: !!env.BREVO_API_KEY,
            CONTACT_MAIL_ADDRESS: !!env.CONTACT_MAIL_ADDRESS,
            NO_REPLY_MAIL_ADDRESS: !!env.NO_REPLY_MAIL_ADDRESS,
            MAIL_FROM_NAME: !!env.MAIL_FROM_NAME
        })
        return new Response("Internal Error", { status: 500, headers: corsHeaders })
    }

    let res

    try {
        res = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "api-key": env.BREVO_API_KEY
            },
            body: JSON.stringify({
                sender: {
                    name: env.MAIL_FROM_NAME,
                    email: env.NO_REPLY_MAIL_ADDRESS
                },
                to: [
                    {
                        email: env.CONTACT_MAIL_ADDRESS
                    }
                ],
                replyTo: {
                    email: email,
                    name: name
                },
                subject: `New get in touch form from ${name}!`,
                textContent:
                    `Name: ${name}\n` +
                    `Email: ${email}\n\n` +
                    `Phone: ${phone || ''}\n\n` +
                    `Message:\n${message}\n\n` +
                    `Form URL:\n${formUrl}`
            })
        })
    } catch (err) {
        console.error('[get-in-touch] Brevo send request failed:', err?.message)
        return new Response("Internal Error", { status: 500, headers: corsHeaders })
    }

    if (!res.ok) {
        console.error('[get-in-touch] Brevo API returned error', { status: res.status })
        return new Response("Internal Error", { status: 500, headers: corsHeaders })
    }

    console.info('[get-in-touch] Processed successfully')
    return new Response("OK", { status: 200, headers: corsHeaders })
}