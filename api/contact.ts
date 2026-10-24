type ContactPayload = {
  nombre?: unknown;
  correo?: unknown;
  motivo?: unknown;
  detalles?: unknown;
  website?: unknown;
};

const json = (body: object, status = 200) => Response.json(body, { status });
const text = (value: unknown) => typeof value === 'string' ? value.trim() : '';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const resendFrom = 'Fundación Pedro Franco <contacto@fundacionpedrofranco.site>';

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);

    const contentType = request.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) return json({ error: 'Solicitud inválida.' }, 415);

    let payload: ContactPayload;
    try {
      payload = await request.json() as ContactPayload;
    } catch {
      return json({ error: 'Solicitud inválida.' }, 400);
    }

    const nombre = text(payload.nombre);
    const correo = text(payload.correo).toLowerCase();
    const motivo = text(payload.motivo);
    const detalles = text(payload.detalles);
    const website = text(payload.website);

    if (website) return json({ ok: true }, 201);
    if (!nombre || !correo || !motivo || !detalles || !emailPattern.test(correo)) {
      return json({ error: 'Completa correctamente los campos requeridos.' }, 400);
    }
    if (nombre.length > 150 || correo.length > 254 || motivo.length > 100 || detalles.length > 4000) {
      return json({ error: 'Uno de los campos supera la longitud permitida.' }, 400);
    }

    const { RESEND_API_KEY, CONTACT_TO } = process.env;
    if (!RESEND_API_KEY || !CONTACT_TO) {
      console.error('Contact service is not configured.');
      return json({ error: 'El canal de contacto no está disponible temporalmente.' }, 503);
    }

    try {
      const message = [
        `Motivo: ${motivo}`,
        `Nombre: ${nombre}`,
        `Correo de respuesta: ${correo}`,
        '',
        'Mensaje:',
        detalles,
        '',
        'Autorización de tratamiento de datos: aceptada desde el formulario web.',
      ].join('\n');
      const sent = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: resendFrom,
          to: [CONTACT_TO],
          reply_to: correo,
          subject: `[Web] ${motivo}`,
          text: message,
        }),
        signal: AbortSignal.timeout(8_000),
      });
      if (!sent.ok) {
        const detail = (await sent.text()).slice(0, 1_000);
        console.error('Resend rejected contact email.', { status: sent.status, detail });
        return json({ error: 'No fue posible enviar la solicitud. Inténtalo nuevamente.' }, 502);
      }
    } catch (error) {
      console.error('Contact delivery failed.', error);
      return json({ error: 'No fue posible enviar la solicitud. Inténtalo nuevamente.' }, 502);
    }

    return json({ ok: true }, 201);
  },
};
