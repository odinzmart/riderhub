// =====================================================
// 1. CART
// =====================================================

// Get the cart from localStorage.
// If there is no cart, create an empty array.
let cart = JSON.parse(localStorage.getItem("cart")) || [];


// =====================================================
// 2. ADD PRODUCT TO CART
// =====================================================
toggleMenu()
filterProducts()
function addToCart(name, price, productId){

      console.log("User:", localStorage.getItem("user"));
    console.log("Product ID:", productId);
    // Get the logged-in user's name
    let user = localStorage.getItem("user");

    // Check whether the user is logged in
    if(user == null){

        // Show message if user is not logged in
        alert("Please login first");

        // Send the user to login page
        window.location.href = "login.html";

        // Stop the function
        return;
    }

let cartData = {
    customerName: user,
    productId: productId,
    quantity: 1
};

fetch("http://localhost:8080/api/cart", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(cartData)
})
.then(response => response.json())
.then(data => {
    alert(name + " added to cart");
})
.catch(error => {
    console.error(error);
    alert("Unable to add product to cart");
});
}


// =====================================================
// 3. LOGIN
// =====================================================

function login(){

    // Get name entered by the user
    let name = document.getElementById("name").value;

    // Get email entered by the user
    let email = document.getElementById("email").value;

    // Check whether name or email is empty
    if(name == "" || email == ""){

        // Show error message
        document.getElementById("message").innerHTML =
        "Please enter all details";

        // Stop the function
        return;
    }

    // Save the user's name
    // This means the user is logged in
    localStorage.setItem("user", name);


    // Get existing customers from localStorage
    // If there are no customers, create an empty array
    let customers =
    JSON.parse(localStorage.getItem("customers")) || [];


    // Add the new customer to the array
    customers.push({
        name: name,
        email: email
    });


    // Save customers back to localStorage
    localStorage.setItem(
        "customers",
        JSON.stringify(customers)
    );


    // Show successful login message
    alert("Login successful");

    // Send user to products page
    window.location.href = "products.html";
}


// =====================================================
// 4. SHOW CART
// =====================================================
async function showCart(){

    let user = localStorage.getItem("user");

    if(user == null){
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    let cartResponse = await fetch(
        "http://localhost:8080/api/cart/" + user
    );

    let cartItems = await cartResponse.json();

    let productResponse = await fetch(
        "http://localhost:8080/api/products"
    );

    let products = await productResponse.json();

    let cartItemsDiv =
        document.getElementById("cartItems");

    if(cartItems.length == 0){

        cartItemsDiv.innerHTML =
        "<p>Your cart is empty</p>";

        return;
    }

    cartItemsDiv.innerHTML = "";

    cartItems.forEach(function(item){

        let product = products.find(
            p => p.id == item.productId
        );

        if(product == null){
            return;
        }

        let totalPrice =
            product.price * item.quantity;

        cartItemsDiv.innerHTML += `

            <div class="cart-item">

                <img src="${product.image}">

                <h3>${product.name}</h3>

                <p>Price: ₹${product.price}</p>

               <div class="quantity-controls">

    <button onclick="changeQuantity(${item.id}, ${item.quantity - 1})">
        −
    </button>

    <span>${item.quantity}</span>

    <button onclick="changeQuantity(${item.id}, ${item.quantity + 1})">
        +
    </button>

</div>

                <p>Total: ₹${totalPrice}</p>

                <button onclick="removeFromCart(${item.id})">
    Remove
</button>

            </div>

        `;
    });
}

async function removeFromCart(id){

    let response = await fetch(
        "http://localhost:8080/api/cart/" + id,
        {
            method: "DELETE"
        }
    );

    if(response.ok){

        alert("Product removed from cart");

        showCart();
    }
}

// =====================================================
// 5. PLACE ORDER
// =====================================================


async function placeOrder() {

    let user = localStorage.getItem("user");

    if (user == null) {
        alert("Please login first");
        window.location.href = "login.html";
        return;
    }

    try {
        // Get cart items from MySQL
        let cartResponse = await fetch(
            "http://localhost:8080/api/cart/" + encodeURIComponent(user)
        );

        if (!cartResponse.ok) {
            throw new Error("Unable to load cart");
        }

        let cartItems = await cartResponse.json();

        if (cartItems.length === 0) {
            alert("Your cart is empty");
            return;
        }

        // Get product details
        let productResponse = await fetch(
            "http://localhost:8080/api/products"
        );

        if (!productResponse.ok) {
            throw new Error("Unable to load products");
        }

        let products = await productResponse.json();

        // Save each cart item as an order
        for (let item of cartItems) {

            let product = products.find(
                p => p.id === item.productId
            );

            if (!product) {
                throw new Error("Product not found");
            }

            let order = {
                customerName: user,
                productId: item.productId,
                quantity: item.quantity,
                price: product.price
            };

            let response = await fetch(
                "http://localhost:8080/api/orders",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(order)
                }
            );

            if (!response.ok) {
                throw new Error("Unable to save order");
            }
        }

        // Clear the cart after saving all orders
        for (let item of cartItems) {

            let response = await fetch(
                "http://localhost:8080/api/cart/" + item.id,
                {
                    method: "DELETE"
                }
            );

            if (!response.ok) {
                throw new Error("Order saved, but cart could not be cleared");
            }
        }

        alert("Order placed successfully!");

        window.location.href = "index.html";

    } catch (error) {
        console.error(error);
        alert(error.message);
    }
}


// =====================================================
// 6. OWNER DASHBOARD
// =====================================================


async function showDashboard() {

    // =========================
    // CUSTOMERS
    // =========================

    let customers =
        JSON.parse(localStorage.getItem("customers")) || [];

    document.getElementById("customers").innerHTML =
        customers.length;

    let customerList =
        document.getElementById("customerList");

    customerList.innerHTML = "";

    if (customers.length === 0) {

        customerList.innerHTML = `
            <tr>
                <td colspan="2">No customers yet</td>
            </tr>
        `;

    } else {

        customers.forEach(function(customer) {

            customerList.innerHTML += `
                <tr>
                    <td>${customer.name}</td>
                    <td>${customer.email}</td>
                </tr>
            `;

        });
    }


    // =========================
    // ORDERS
    // =========================

    let orderList =
        document.getElementById("orderList");

    orderList.innerHTML = `
        <tr>
            <td colspan="7">Loading orders...</td>
        </tr>
    `;

    try {

        // Get orders
        let orderResponse = await fetch(
            "http://localhost:8080/api/orders"
        );

        if (!orderResponse.ok) {
            throw new Error("Unable to load orders");
        }

        let orders = await orderResponse.json();


        // Get products
        let productResponse = await fetch(
            "http://localhost:8080/api/products"
        );

        if (!productResponse.ok) {
            throw new Error("Unable to load products");
        }

        let products = await productResponse.json();


        // Order count
        document.getElementById("orders").innerHTML =
            orders.length;


        orderList.innerHTML = "";


        if (orders.length === 0) {

            orderList.innerHTML = `
                <tr>
                    <td colspan="7">No orders yet</td>
                </tr>
            `;

            return;
        }


        // Display orders
        orders.forEach(function(order) {

            let product = products.find(
                p => p.id === order.productId
            );


            let productName = product
                ? product.name
                : "Product ID: " + order.productId;


            let total =
                order.price * order.quantity;


            orderList.innerHTML += `
                <tr>
                    <td>#${order.id}</td>
                    <td>${order.customerName}</td>
                    <td>${productName}</td>
                    <td>₹${order.price}</td>
                    <td>${order.quantity}</td>
                    <td>₹${total}</td>
                    <td>${order.status}</td>
                </tr>
            `;

        });


    } catch (error) {

        console.error(error);

        orderList.innerHTML = `
            <tr>
                <td colspan="7">
                    Unable to load orders. Check Spring Boot.
                </td>
            </tr>
        `;
    }
}


// =====================================================
// 7. UPDATE STOCK
// =====================================================

function updateStock(number){

    // Get the stock input value
    // Example: stock1, stock2, stock3...
    let value = document.getElementById(
        "stock" + number
    ).value;


    // Save the stock value in localStorage
    localStorage.setItem(
        "stock" + number,
        value
    );


    // Show confirmation message
    alert("Stock updated to " + value);
}


// =====================================================
// 8. SHOW SAVED STOCK
// =====================================================

function showStock(){

    // Loop through all 10 products
    for(let i = 1; i <= 10; i++){

        // Get saved stock from localStorage
        let stock = localStorage.getItem(
            "stock" + i
        );


        // Check whether stock exists
        if(stock != null){

            // Put saved stock into the input box
            document.getElementById(
                "stock" + i
            ).value = stock;
        }
    }
}


// =====================================================
// 9. CALCULATE TOTAL STOCK
// =====================================================

function showTotalStock(){

    // Start total stock from zero
    let total = 0;


    // Loop through all 10 products
    for(let i = 1; i <= 10; i++){

        // Get stock from localStorage
        let stock =
        localStorage.getItem("stock" + i);


        // If stock does not exist,
        // use zero
        if(stock == null){
            stock = 0;
        }


        // Convert stock from String to Number
        // and add it to total
        total = total + Number(stock);
    }


    // Display total stock in dashboard
    document.getElementById("stockTotal").innerHTML =
    total;
}

// =====================================================
// 10. PRICE FILTER
// =====================================================

function filterProducts(){

    // Get selected price
    let filter =
    document.getElementById("priceFilter").value;

    // Get all products
    let products =
    document.getElementsByClassName("product");

    // Check every product
    for(let i = 0; i < products.length; i++){

        // Get product price
        let price =
        Number(products[i].getAttribute("data-price"));

        // Show all products
        if(filter == "all"){

            products[i].style.display = "block";
        }

        // Show products below selected price
        else if(price < Number(filter)){

            products[i].style.display = "block";
        }

        // Hide products that are above the selected price
        else{

            products[i].style.display = "none";
        }
    }
}

function toggleAbout() {
    let content = document.getElementById("moreAbout");
    let button = document.getElementById("moreBtn");

    if (content.classList.contains("hidden")) {
        content.classList.remove("hidden");
        button.innerText = "Show Less";
    } else {
        content.classList.add("hidden");
        button.innerText = "Show More";
    }
}

document.addEventListener("DOMContentLoaded", function () {

    const params = new URLSearchParams(window.location.search);
    const selectedProduct = params.get("product");

    if (selectedProduct) {
        const products = document.querySelectorAll(".product");

        products.forEach(function (product) {
            if (product.dataset.name !== selectedProduct) {
                product.style.display = "none";
            }
        });

        // Hide the price filter when viewing one product
        const priceFilter = document.querySelector(".price-filter");

        if (priceFilter) {
            priceFilter.style.display = "none";
        }
    }
});




// async function loadProducts() {

//     // Get the product container from HTML
//     let productList =
//         document.getElementById("productList");

//     // Run only on the Products page
//     if (productList == null) {
//         return;
//     }

//     // Get products from Spring Boot
//     let response = await fetch(
//         "http://localhost:8080/api/products"
//     );

//     // Convert the response into JavaScript data
//     let products = await response.json();

//     // Get the product selected on the Home page
// let params = new URLSearchParams(window.location.search);
// let selectedProduct = params.get("product");

//     // Display every product
//     products.forEach(function(product) {

//         // Skip products that were not selected
// if (selectedProduct && product.name !== selectedProduct) {
//     return;
// }
//         productList.innerHTML += `
//             <div class="product"
//                  data-name="${product.name}"
//                  data-price="${product.price}">

//                 <div class="image">
//                     <img src="${product.image}">
//                 </div>

//                 <h3>${product.name}</h3>

//                 <p>₹${product.price}</p>

//                 <button onclick="addToCart(
//     '${product.name}',
//     ${product.price},
//     ${product.id}
// )">
//                     Add to Cart
//                 </button>

//             </div>
//         `;
//     });
// }

// // Run after the page loads
// document.addEventListener(
//     "DOMContentLoaded",
//     loadProducts
// );



async function changeQuantity(id, quantity) {

    if (quantity < 1) {
        alert("Minimum quantity is 1");
        return;
    }

    let response = await fetch(
        `http://localhost:8080/api/cart/${id}/quantity?quantity=${quantity}`,
        {
            method: "PUT"
        }
    );

    if (response.ok) {
        showCart();
    } else {
        alert("Unable to update quantity");
    }
}



// Bike brand section
const brandSection = document.querySelector(".brand-logos");

const brandObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            brandSection.classList.add("show");
            brandObserver.unobserve(brandSection);
        }
    });
}, {
    threshold: 0.3
});

brandObserver.observe(brandSection);

/* =====================================================
   MENU
===================================================== */

function toggleMenu() {
      

    const pageContainer =
        document.getElementById("pageContainer");

    const menuButton =
        document.getElementById("menuBtn");
        
    const navbar = document.getElementById("Navbar");
    const logo = document.querySelector(".riderhub-logo");
  

    pageContainer.classList.toggle("menu-open");
    if (pageContainer.classList.contains("menu-open")) {

        menuButton.innerHTML = "↓";
        logo.style.marginLeft = "30em";
    
    } else {

        menuButton.innerHTML = "☰";
    logo.style.marginLeft = "1em";
    logo.style.transition = "0.6s";
    }
}

/* =====================================================
   PRICE FILTER
===================================================== */

function filterProducts() {

    const filter =
        document.getElementById("priceFilter").value;

    const products =
        document.querySelectorAll(".product");


    products.forEach(function(product) {

        const price =
            Number(product.getAttribute("data-price"));


        if (filter === "all") {

            product.style.display = "block";

        }

        else if (price < Number(filter)) {

            product.style.display = "block";

        }

        else {

            product.style.display = "none";

        }

    });

}



const imageSection = document.querySelector(".imageimage");

const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            imageSection.classList.add("animate");

            observer.unobserve(imageSection);

        }

    });

}, {
    threshold: 0.35
});

observer.observe(imageSection);
