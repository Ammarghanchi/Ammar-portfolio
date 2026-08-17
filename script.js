document.querySelectorAll('.accordion details').forEach((item) => {
  item.addEventListener('toggle', () => {
    if (item.open) document.querySelectorAll('.accordion details').forEach((other) => { if (other !== item) other.open = false; });
  });
});

document.querySelector('#contact-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const subject = `Portfolio inquiry from ${form.get('name')}`;
  const body = `Name: ${form.get('name')}\nEmail: ${form.get('email')}\n\nGrowth challenge:\n${form.get('message')}`;
  window.location.href = `mailto:hello@ammarganchi.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});
