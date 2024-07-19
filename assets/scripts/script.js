let cart = JSON.parse(localStorage.getItem("cart")) || [];

let items = [];

async function renderItems() {
  const itemsContainer = document.getElementById("highlight-cards");
  const offerContainer = document.getElementById("offer-cards");

  if (itemsContainer && offerContainer) {
    const response = await fetch("http://localhost:3000/items");
    items = await response.json();

    itemsContainer.innerHTML = "";
    offerContainer.innerHTML = "";

    items.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "card";

      const isInCart = cart.some((cartItem) => cartItem.id === item.id);

      itemDiv.innerHTML = `
        <img src="${item.image}" alt="${item.name}" />
        <p class=${item.bought ? "bought" : ""}>${item.name}</p>
        <p class=${item.bought ? "bought" : ""}>KES ${item.price}</p>
        <button class="buy-button" onclick="addToCart(${item.id})" ${
        isInCart || item.bought ? "disabled" : ""
      }>
          ${isInCart ? "IN CART" : item.bought ? "BOUGHT" : "ADD TO CART"}
        </button>
      `;

      if (item.onOffer) {
        offerContainer.appendChild(itemDiv);
      } else {
        itemsContainer.appendChild(itemDiv);
      }
    });
  }
}

function addToCart(itemId) {
  const item = items.find((i) => i.id === itemId);
  if (item && !cart.some((cartItem) => cartItem.id === itemId)) {
    cart.push(item);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderItems();
    renderCart();
  }
}

function removeFromCart(itemId) {
  const itemIndex = cart.findIndex((i) => i.id === itemId);
  if (itemIndex !== -1) {
    cart.splice(itemIndex, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderItems();
    renderCart();
  }
}

function calculateTotal() {
  return cart.reduce((total, item) => total + item.price, 0);
}

function renderCart() {
  const cartCount = document.getElementById("cart-count");
  cartCount.innerHTML = cart.length;

  const cartContainer = document.getElementById("cart");
  const cartTotal = document.getElementById("cart-total");

  if (cartContainer && cartTotal) {
    cartContainer.innerHTML = "";
    cartTotal.innerHTML = `Total: KES ${calculateTotal()}`;

    cart.forEach((item) => {
      const itemDiv = document.createElement("tr");
      itemDiv.innerHTML = `
          <td>${item.name}</td>
          <td>KES ${item.price}</td>
          <td>
            <button class="remove-button" onclick="removeFromCart(${item.id})">REMOVE</button>
          </td>
      `;
      cartContainer.appendChild(itemDiv);
    });
  }
}

async function checkout() {
  const patchRequests = cart.map((item) => {
    console.log("item is: ", item);
    console.log("items is: ", items);
    const itemToUpdate = items.find((i) => i.id === item.id);

    console.log("Item to update is: ", itemToUpdate);

    if (itemToUpdate) {
      return fetch(`http://localhost:3000/items/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bought: true }),
      }).then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
      });
    }
  });

  try {
    await Promise.all(patchRequests);

    // Clear the cart after successful checkout
    cart = [];
    localStorage.setItem("cart", JSON.stringify(cart));

    renderItems();
    renderCart();
    alert("Checkout successful!");
  } catch (error) {
    console.error("Error during checkout:", error);
    alert("Checkout failed. Please try again.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderItems();
  renderCart();
});
