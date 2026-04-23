document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.login-body');
  if (!container) return;

  const strength = 30; // movement strength
  let raf = null;

  function onMove(e){
    const rect = container.getBoundingClientRect();

    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    const tx = -x * strength;
    const ty = -y * (strength * 0.6);

    container.style.setProperty('--px', `${tx}px`);
    container.style.setProperty('--py', `${ty}px`);
  }

  container.addEventListener('mousemove', e => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => onMove(e));
  });

  container.addEventListener('mouseleave', () => {
    container.style.setProperty('--px','0px');
    container.style.setProperty('--py','0px');
  });

  /* touch support */
  container.addEventListener('touchmove', e => {
    if (!e.touches.length) return;
    const t = e.touches[0];
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => onMove(t));
  }, { passive:true });

  container.addEventListener('touchend', () => {
    container.style.setProperty('--px','0px');
    container.style.setProperty('--py','0px');
  });
});