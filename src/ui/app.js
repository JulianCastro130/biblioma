const { ipcRenderer } = require("electron");
const main = require("../main");

const productForm = document.querySelector("#productForm");
const productTitle = document.querySelector("#title");
const productYear = document.querySelector("#year");
const productDescription = document.querySelector("#description");
const productAuthor = document.querySelector("#author");
const productPublisher = document.querySelector("#publisher");
const productImg = document.querySelector("#img");
const productRating = document.querySelector("#rating");
const productIsbn = document.querySelector("#isbn");
const productsList = document.querySelector("#products");
const filterForm = document.querySelector("#filterForm");
const filterInput = document.querySelector("#filter");
const productModal = document.querySelector("#modal");
const productModalButton = document.querySelector("#modalButton");
const productsRow = document.querySelector("#productsRow");
const productsButton = document.querySelector("#productsButton");

let products = [];

document.addEventListener("DOMContentLoaded", async () => {
  products = await ipcRenderer.invoke("getProducts");
  renderProducts();
});

function editProduct(
  productid,
  producttitle,
  productyear,
  productdescription,
  productauthor,
  productimg,
  productrating,
  productpublisher,
  productisbn
) {
  // Get the modal div and update its innerHTML to display the edit form
  const modalDiv = document.querySelector(`#product-${productid}`);
  if (!modalDiv) {
    console.error(`Could not find element with ID "product-${productid}"`);
    return;
  }
  modalDiv.innerHTML = `
    <div class="modal-content animated fadeIn" id="${productid}">
      <span class="close">&times;</span>
      <h1>Edit Product</h1>s
      <form class="edit-form card">
        <div class="form-group">
          <label for="edit-title">Title:</label>
          <input type="text" class="form-control" id="edit-title" value="${producttitle}">
        </div>
        <div class="form-group">
          <label for="edit-year">Year:</label>
          <input type="text" class="form-control" id="edit-year" value="${productyear}">
        </div>
        <div class="form-group">
          <label for="edit-description">Description:</label>
          <textarea class="form-control" id="edit-description" rows="3">${productdescription}</textarea>
        </div>
        <div class="form-group">
          <label for="edit-author">Author:</label>
          <input type="text" class="form-control" id="edit-author" value="${productauthor}">
        </div>
        <div class="form-group">
          <label for="edit-description">Img:</label>
          <input type="text" class="form-control" id="edit-img" value="${productimg}">
        </div>
        <div class="form-group">
          <label for="edit-rating">Rating:</label>
          <input type="text" class="form-control" id="edit-rating" value="${productrating}">
        </div>
        <div class="form-group">
          <label for="edit-publisher">Publisher:</label>
          <input type="text" class="form-control" id="edit-publisher" value="${productpublisher}">
        </div>
        <div class="form-group">
          <label for="edit-isbn">ISBN:</label>
          <input type="text" class="form-control" id="edit-isbn" value="${productisbn}">
        </div>
        <div class="modal-footer">
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </div>
      </form>
    </div>
  `;

  // Add an event listener to the close button
  const closeBtn = modalDiv.querySelector(".close");
  closeBtn.addEventListener("click", () => {
    modalDiv.remove();
  });

  // Add an event listener to the edit form submit button
  const editForm = modalDiv.querySelector(".edit-form");
  editForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const title = event.target.querySelector("#edit-title").value;
    const year = event.target.querySelector("#edit-year").value;
    const description = event.target.querySelector("#edit-description").value;
    const author = event.target.querySelector("#edit-author").value; // get the value of the author input
    const img = event.target.querySelector("#edit-img").value; // get the value of the img input
    const rating = event.target.querySelector("#edit-rating").value; // get the value of the rating input
    const publisher = event.target.querySelector("#edit-publisher").value; // get the value of the publisher input
    const isbn = event.target.querySelector("#edit-isbn").value; // get the value of the isbn input

    const editProduct = {
      id: productid,
      title: title === "" ? producttitle : title,
      year: year === "" ? productyear : year,
      description: description === "" ? productdescription : description,
      author: author === "" ? productauthor : author,
      img: img === "" ? productimg : img,
      rating: rating === "" ? productrating : rating,
      publisher: publisher === "" ? productpublisher : publisher,
      isbn: isbn === "" ? productisbn : isbn,
    };

    // Pass the updated product data as props to the main.updateProduct function
    await main.updateProduct(editProduct);

    // Close the modal and remove it from the DOM
    renderProducts();
    modalDiv.remove();
  });
}

filterForm.addEventListener("submit", async (event) => {
  productsRow.style.display = "block";
  event.preventDefault();
  const searchQuery = filterInput.value;
  const filteredProducts = await ipcRenderer.invoke(
    "searchProduct",
    searchQuery
  );
  renderProducts(filteredProducts);
});

productModalButton.addEventListener("click", () => {
  productsRow.style.display = "none";
  productModal.style.display = "block";
});

productsButton.addEventListener("click", () => {
  productModal.style.display = "none";
  productsRow.style.display = "block";
  renderProducts(products);
});

async function renderProducts(filteredProducts) {
  if (
    typeof filteredProducts === "object" &&
    !Array.isArray(filteredProducts)
  ) {
    // If the filteredProducts argument is an object, display the product details in a modal
    showModal(filteredProducts);
    productsRow.style.display = "none";
  } else {
    // If the filteredProducts argument is an array or not provided, display the list of products
    productsList.innerHTML = "";
    (filteredProducts || products).forEach((product) => {
      productsList.innerHTML += `
        <div class="col-md-3 h-50 m-2 animated fadeIn d-flex align-items-center product-card" id="${product.id}" style="background-image: url(${product.img})">

        </div>
      `;
    });

    // Add event listener to each product card
    const productCards = document.querySelectorAll(".product-card");
    productCards.forEach((productCard) => {
      productCard.addEventListener("click", async () => {
        const productId = productCard.id;
        const product = await main.getProductById(productId);
        renderProducts(product);
      });
    });
  }
}

function showModal(product) {
  const modalDiv = document.createElement("div");
  modalDiv.classList.add("modalId");
  modalDiv.innerHTML = `
  <div class="position-relative translate-middle modal-content animated fadeIn bg-white" id="product-${product.id}">
  <div class="d-flex flex-row-reverse justify-content-between p-2">
    <span class="close">&times;</span>
    <div class="d-flex">
      <button class="btn btn-danger btn-sm mr-2" onclick="main.deleteProduct(${product.id})">Delete</button>
      <button class="btn btn-primary btn-sm" onclick="editProduct('${product.id}','${product.title}','${product.year}','${product.description}','${product.author}','${product.img}','${product.rating}','${product.publisher}','${product.isbn}')">Edit</button>
    </div>
  </div>
  <div class="d-flex flex-row justify-content-around">
    <div class="p-2">
      <h1 class="p-2 font-weight-bold">${product.title}</h1>
      <p class="pl-2 font-weight-bold">Año: ${product.year}</p>
      <img class="p-2" src="${product.img}" alt="${product.title}" width="300px">
      <h2 class="p-2 font-weight-bold">Autor: ${product.author}</h2>
      <p class="p-2 font-weight-bold">Rating: ${product.rating}</p>
      <p class="p-2 font-weight-bold">Publisher: ${product.publisher}</p>
      <p class="p-2">ISBN: ${product.isbn}</p>
    </div>
    <div>
      <p class="text-justify p-5">${product.description}</p>
    </div>
  </div>
</div>
    `;
  document.body.appendChild(modalDiv);

  const closeBtn = modalDiv.querySelector(".close");
  closeBtn.addEventListener("click", () => {
    productsRow.style.display = "block";
    modalDiv.remove();
  });
}

productForm.addEventListener("submit", async (e) => {
  try {
    const product = {
      title: productTitle.value,
      year: productYear.value,
      description: productDescription.value,
      author: productAuthor.value,
      publisher: productPublisher.value,
      rating: productRating.value,
      isbn: productIsbn.value,
      img: productImg.value,
    };

    const savedProduct = await ipcRenderer.invoke("createProduct", product);

    products.push(savedProduct);
    renderProducts();

    productForm.reset();
    productTitle.focus();
  } catch (error) {
    console.log(error);
  }
});
