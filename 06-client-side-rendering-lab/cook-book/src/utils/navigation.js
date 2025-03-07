export function renderNavigation() {
  const email = localStorage.getItem("email");
  const isLoggedIn = email?.length > 0;

  const userNavigation = document.getElementById("user");
  const guestNavigation = document.getElementById("guest");

  if (isLoggedIn) {
    userNavigation.style.display = "block";
    guestNavigation.style.display = "none";
  } else {
    userNavigation.style.display = "none";
    guestNavigation.style.display = "block";
  }
}
