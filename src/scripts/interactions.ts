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
form?.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const subject = String(data.get('motivo') || 'Consulta institucional');
  const body = `Nombre: ${data.get('nombre')}\nCorreo: ${data.get('correo')}\n\n${data.get('detalles')}\n\nAutorizo el tratamiento de mis datos para responder esta solicitud.`;
  window.location.href = `mailto:fundacionpedrofranco@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const status = document.getElementById('contact-status');
  if (status) status.textContent = 'Mensaje preparado. Completa el envío en tu aplicación de correo. Si no se abrió, escribe a fundacionpedrofranco@gmail.com. Tus datos permanecen en el formulario.';
});
