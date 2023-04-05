const { ipcRenderer } = require("electron");
const main = require('../main')

const productForm = document.querySelector("#productForm");
const productTitle = document.querySelector("#title");
const productYear = document.querySelector("#year");
const productDescription = document.querySelector("#description");
const productAuthor = document.querySelector("#author")
const productPublisher = document.querySelector("#publisher")
const productImg = document.querySelector("#img")
const productRating = document.querySelector("#rating")
const productIsbn = document.querySelector("#isbn")
const productsList = document.querySelector("#products");
const filterForm = document.querySelector('#filterForm');
const filterInput = document.querySelector('#filter');
const productModal = document.querySelector("#modal");
const productModalButton = document.querySelector("#modalButton")
const productsRow = document.querySelector("#productsRow")
const productsButton = document.querySelector("#productsButton")

let products = [];

document.addEventListener("DOMContentLoaded", async () => {
  products = await ipcRenderer.invoke("getProducts");
  renderProducts();
});

async function editProduct(id, title, year, description) {
  // Create the form element
  const editForm = document.createElement("form");
  editForm.classList.add("card")
  
  // Create the title input field
  const nameLabel = document.createElement("label");
  nameLabel.textContent = "title:";
  // nameLabel.style.display = "block";
  
  const nameInput = document.createElement("input");
  // nameInput.style.display = "block";
  nameInput.value = title;
  editForm.appendChild(nameLabel);
  editForm.appendChild(nameInput);
  
  // Create the year input field
  const priceLabel = document.createElement("label");
  priceLabel.textContent = "year:";
  // priceLabel.style.display = "block";
  const priceInput = document.createElement("input");
  // nameInput.style.display = "block";
  priceInput.value = year;
  editForm.appendChild(priceLabel);
  editForm.appendChild(priceInput);
  
  // Create the description input field
  const descriptionLabel = document.createElement("label");
  // descriptionLabel.style.display = "block";
  descriptionLabel.textContent = "Description:";
  const descriptionInput = document.createElement("input");
  // descriptionInput.style.display = "block";
  descriptionInput.valueescription;
  editForm.appendChild(descriptionLabel);
  editForm.appendChild(descriptionInput);
  
  // Create the OK button
  const okButton = document.createElement("button");
  // okButton.style.display = "block";
  okButton.textContent = "OK";
  okButton.classList.add("btn", "btn-danger");
  editForm.appendChild(okButton);
  
  // Add an event listener to the OK button
  okButton.addEventListener("click", async (e) => {
    e.preventDefault();
    
    // Get the values from the input fields and create an edited product object
    const editedProduct = {
      id: id,
      title: nameInput.value,
      year: priceInput.value,
      description: descriptionInput.value
    };
    
    // Call the updateProduct method and render the updated products
    await main.updateProduct(editedProduct);
    renderProducts();
  });
  
  // Set the innerHTML of the card element to the edit form
  const card = document.getElementById(id);
  card.innerHTML = "";
  card.appendChild(editForm);
}

filterForm.addEventListener('submit', async (event) => {
  event.preventDefault(); 
  const searchQuery = filterInput.value;
  const filteredProducts = await ipcRenderer.invoke('searchProduct', searchQuery);
  console.log(filteredProducts);
  renderProducts(filteredProducts);
});

productModalButton.addEventListener('click', ()=>{
  productsRow.classList.toggle("productsRow-hide");
  productModal.classList.toggle("modal-show");
})

productsButton.addEventListener('click', ()=>{
  productModal.classList.toggle("modal-hide");
  productsRow.classList.toggle("productsRow-show");
  renderProducts(products)
})

async function renderProducts(filteredProducts) {
  productsList.innerHTML = "";
  (filteredProducts || products).forEach((product) => {
    productsList.innerHTML += `
      <div class="col-md-3 h-50 card card-body m-2 animated fadeIn d-flex align-items-center" id="${product.id}">
        <h1>${product.title}</h1>
        <img src="${product.img}" width="150px"></img>
        <h2>${product.year}</h2>
        <p class="text-justify">${product.description}</p>
        <button class="btn btn-danger btn-sm" onclick="main.deleteProduct(${product.id})">Delete</button>
        <button class="btn btn-secondary btn-sm" onclick="editProduct('${product.id}','${product.title}','${product.year}','${product.description}')">Edit</button>
      </div>
    `;
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
      img: productImg.value
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
