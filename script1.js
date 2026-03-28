// Load sidebar dynamically
fetch("sidebar.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("sidebar-container").innerHTML = data;
  })
  .catch(error => console.error("Error loading sidebar:", error));
  
// Sidebar Toggle
document.addEventListener("click", function (e) {
    // Check if clicked on menu icon
    if (e.target.closest(".menu-icon")) {
        const menu = document.getElementById("menu");
        menu.classList.toggle("collapsed");
    }
});