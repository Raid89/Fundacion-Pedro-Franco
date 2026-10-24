const filters = document.querySelectorAll<HTMLButtonElement>('[data-filter]');
filters.forEach(button => button.addEventListener('click', () => {
  const value = button.dataset.filter;
  filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  let count = 0;
  document.querySelectorAll<HTMLElement>('[data-program]').forEach(card => {
    card.hidden = value !== 'all' && card.dataset.program !== value;
    if (!card.hidden) count++;
  });
  const status = document.getElementById('filter-status');
  if (status) status.textContent = `${count} áreas de trabajo visibles`;
}));
const form = document.querySelector<HTMLFormElement>('#contact-institutional-form');
form?.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const status = document.getElementById('contact-status');
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  button?.setAttribute('disabled', '');
  if (status) status.textContent = 'Enviando solicitud…';
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        motivo: data.get('motivo'),
        nombre: data.get('nombre'),
        correo: data.get('correo'),
        detalles: data.get('detalles'),
        website: data.get('website'),
      }),
    });
    const result = await response.json().catch(() => ({})) as { error?: string; ok?: boolean };
    if (!response.ok || !result.ok) throw new Error(result.error || 'No fue posible enviar la solicitud.');
    form.reset();
    if (status) status.textContent = 'Solicitud enviada correctamente. El equipo institucional responderá al correo indicado.';
  } catch (error) {
    if (status) status.textContent = error instanceof Error ? error.message : 'No fue posible enviar la solicitud. Inténtalo nuevamente.';
  } finally {
    button?.removeAttribute('disabled');
  }
});
