function updateUpcomingCount() {
  let today = new Date();

  let count = tasks.filter(task => {
    return new Date(task.date) > today;
  }).length;

  document.getElementById("upcomingText").innerText = 
    `Upcoming (${count})`;
}

updateUpcomingCount();