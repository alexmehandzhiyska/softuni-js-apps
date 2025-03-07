import { renderNavigation } from "../utils/navigation.js";

const baseUrl = "http://localhost:3030/users/logout";

export default function logoutPage() {
  const token = localStorage.getItem("accessToken");
  console.log({ token });

  fetch(baseUrl, {
    "X-Authorization": token,
  })
    .then(() => {
      localStorage.clear();
      location.href = "/cook-book/index.html";

      renderNavigation();
    })
    .catch((err) => console.error(err.message));
}
