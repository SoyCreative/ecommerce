async function getProducts() {
  try {
    const data = await fetch(
      "https://ecommercebackend.fundamentos-29.repl.co/"
    );

    const res = await data.json();

    window.localStorage.setItem("products", JSON.stringify(res));

    return res;
  } catch (error) {
    console.log(error);
  }
}

function handleMixitup() {
  var mixer = mixitup(".products", {
    selectors: {
      target: ".product",
    },
    animation: {
      duration: 300,
    },
  });

  // Manejar los botones de filtro
  var filterButtons = document.querySelectorAll("#category .button__category");

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filterValue = this.getAttribute("data-filter");

      // Cambiar la clase activa del botón
      filterButtons.forEach(function (btn) {
        btn.classList.remove("active");
      });
      this.classList.add("active");

      // Filtrar los productos
      mixer.filter(filterValue);
    });
  });
}

function printProducts(db) {
  const productsHTML = document.querySelector(".products");

  let html = "";

  for (const product of db.products) {
    const buttonAdd = product.quantity
      ? `<i class='bx bx-plus' id="${product.id}"></i>`
      : `<span class="soldOut">Sold out</span>`;

    html += `
    
    <div class="product ${category}">
      <div class="product__img">
        <p>
          <img src="${product.image}" alt="imagen de producto" />
        </p>
      </div>
        <div class="product__info">
          <a href=""><h4>${product.name}</h4></a>
          <h4><span class="stock"><b>Stock: ${product.quantity}</b></span></h4>
          <h5 class="price">
            Price: $${product.price + ".00"}
            ${buttonAdd}
          </h5>          
        </div>          
    </div>    
    `;
  }

  console.log(html);

  productsHTML.innerHTML = html;
}

function handleShowCart() {
  const iconCartHTML = document.querySelector(".bxs-cart");
  const cartHTML = document.querySelector(".cart");

  iconCartHTML.addEventListener("click", function () {
    cartHTML.classList.toggle("cart__show");
  });
}

function addToCartFromProducts(db) {
  const productsHTML = document.querySelector(".products");

  productsHTML.addEventListener("click", function (e) {
    if (e.target.classList.contains("bx-plus")) {
      const id = Number(e.target.id);

      const productFind = db.products.find((product) => product.id === id);

      if (db.cart[productFind.id]) {
        if (productFind.quantity === db.cart[productFind.id].amount)
          return alert(" Producto sin Stock");
        db.cart[productFind.id].amount++;
      } else {
        db.cart[productFind.id] = { ...productFind, amount: 1 };
      }

      window.localStorage.setItem("cart", JSON.stringify(db.cart));
      printProductsInCart(db);
      printTotal(db);
      handlePrintAmountProducts(db);
    }
  });
}

function printProductsInCart(db) {
  const cartProducts = document.querySelector(".cart__products");

  let html = "";

  for (const product in db.cart) {
    const { quantity, price, name, image, id, amount } = db.cart[product];

    console.log({ quantity, price, name, image, id, amount });
    html += `
      <div class="cart__product">
        <div class="cart__product--img">
          <img src="${image}" alt="imagen del producto"/>      
        </div>
        <div class="cart__product--body">
            <h4>${name}</h4>            
            <p>Stock: ${quantity}</p>
            <h4>Price: $${price + ".00"}</h4>
        <div class="cart__product--body-op" id='${id}'>
          <i class='bx bx-minus'></i>
          <span>${amount} Unit</span>
          <i class='bx bx-plus'></i>
          <i class='bx bx-trash'></i>            
        </div>             
        </div>      
      </div>
    
    `;
  }

  cartProducts.innerHTML = html;
}

function handleProductsInCart(db) {
  const cartProducts = document.querySelector(".cart__products");

  cartProducts.addEventListener("click", function (e) {
    if (e.target.classList.contains("bx-plus")) {
      const id = Number(e.target.parentElement.id);

      const productFind = db.products.find((product) => product.id === id);
      if (productFind.quantity === db.cart[productFind.id].amount)
        return alert(" Producto sin Stock");

      db.cart[id].amount++;
    }

    if (e.target.classList.contains("bx-minus")) {
      const id = Number(e.target.parentElement.id);
      if (db.cart[id].amount === 1) {
        const response = confirm(
          "¿Estás seguro que quieres eliminar este producto?"
        );

        if (!response) return;
        delete db.cart[id];
      } else {
        db.cart[id].amount--;
      }
    }

    if (e.target.classList.contains("bx-trash")) {
      const id = Number(e.target.parentElement.id);
      const response = confirm(
        "¿Estás seguro que quieres eliminar este producto?"
      );

      if (!response) return;
      delete db.cart[id];
    }
    window.localStorage.setItem("cart", JSON.stringify(db.cart));
    printProductsInCart(db);
    printTotal(db);
    handlePrintAmountProducts(db);
  });
}

function printTotal(db) {
  const infoTotal = document.querySelector(".info__total");
  const infoAmount = document.querySelector(".info__amount");

  let totalProducts = 0;
  let amountProducts = 0;

  for (const product in db.cart) {
    const { amount, price } = db.cart[product];
    totalProducts += price * amount;
    amountProducts += amount;
  }
  infoTotal.textContent = "Total $" + totalProducts + ".00 USD";
  infoAmount.textContent = amountProducts + " Units";
}

function handleTotal(db) {
  const btnBuy = document.querySelector(".btn__buy");

  btnBuy.addEventListener("click", function () {
    if (!Object.values(db.cart).length)
      return alert(
        "¡Ooops! \n El carrito está vacio. \n Debes seleccionar al menos un producto"
      );
    const response = confirm("¿Está seguro que quieres comprar?");
    if (!response) return;

    const currentProducts = [];
    for (const product of db.products) {
      const productCart = db.cart[product.id];
      if (product.id === productCart?.id) {
        currentProducts.push({
          ...product,
          quantity: product.quantity - productCart.amount,
        });
      } else {
        currentProducts.push(product);
      }
    }

    db.products = currentProducts;
    db.cart = {};

    window.localStorage.setItem("products", JSON.stringify(db.products));
    window.localStorage.setItem("cart", JSON.stringify(db.cart));

    printTotal(db);
    printProductsInCart(db);
    printProducts(db);
    handlePrintAmountProducts(db);
  });
}

function handlePrintAmountProducts(db) {
  const amountProducts = document.querySelector(".amountProducts");
  let amount = 0;

  for (const product in db.cart) {
    amount += db.cart[product].amount;
  }
  amountProducts.textContent = amount;
}

function handleShowMenu() {
  const menu = document.querySelector(".menu");
  const bxMenu = document.querySelector(".bx-menu");

  bxMenu.addEventListener("click", function () {
    menu.classList.toggle("menu_show");
  });
}

function handleSwitchDarkMode() {
  const checkbox = document.getElementById("checkbox");

  checkbox.addEventListener("change", () => {
    // Change the theme of the siteweb
    document.body.classList.toggle("dark");
    document.footer.classList.toggle("dark");
  });
}

function handleModalProduct() {
  const openModal = document.querySelector(".modal__product");
  const modal = document.querySelector(".modal");
  const closeModal = document.querySelector(".modal__close");

  openModal.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.add("modal__show");
  });

  closeModal.addEventListener("click", (e) => {
    e.preventDefault();
    modal.classList.remove("modal__show");
  });
}

async function main() {
  const db = {
    products:
      JSON.parse(window.localStorage.getItem("products")) ||
      (await getProducts()),
    cart: JSON.parse(window.localStorage.getItem("cart")) || {},
  };
  handleMixitup();
  printProducts(db);
  handleShowCart();
  addToCartFromProducts(db);
  printProductsInCart(db);
  handleProductsInCart(db);
  printTotal(db);
  handleTotal(db);
  handlePrintAmountProducts(db);
  handleShowMenu();
  handleSwitchDarkMode();
  handleModalProduct();
}

main();
