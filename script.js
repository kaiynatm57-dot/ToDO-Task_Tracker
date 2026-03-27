function updateUpcomingCount() {
  let today = new Date();

  if (typeof tasks === 'undefined' || !Array.isArray(tasks)) {
    const el = document.getElementById('upcomingText');
    if (el) el.innerText = `Upcoming (0)`;
    return;
  }

  let count = tasks.filter(task => {
    return new Date(task.date) > today;
  }).length;

  const upcomingEl = document.getElementById('upcomingText');
  if (upcomingEl) {
    upcomingEl.innerText = `Upcoming (${count})`;
  }
}

updateUpcomingCount();

// Menu toggle: collapse/expand sidebar and update ARIA state
(function () {
  const menu = document.getElementById('menu');
  const menuButton = document.querySelector('.menu-icon');

  if (!menu || !menuButton) return;

  // Initialize ARIA
  menuButton.setAttribute('aria-expanded', 'true');//ARIA (Accessible Rich Internet Applications) helps screen readers understand UI state.

  menuButton.addEventListener('click', function (e) {
    e.stopPropagation();// Prevent click from bubbling up to document, which would close the menu immediately after opening it.
    const isCollapsed = menu.classList.toggle('collapsed');
    menuButton.setAttribute('aria-expanded', String(!isCollapsed));
    menuButton.setAttribute('aria-pressed', String(isCollapsed));
  });
})();