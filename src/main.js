const { BrowserWindow, ipcMain } = require("electron");
const { pool } = require('./database');

let window;

function createWindow() {
  
  window = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  
  window.loadFile("src/ui/index.html");
  
  pool.query("SELECT * FROM product", (err, res) => {
    if (err) {
      console.error(err.stack);
    } else {
      console.log(res.rows);
    }
  });
}

async function createProduct(product){
  try {
    product.year = parseFloat(product.year);
    if (!product.hasOwnProperty('id')) {
      product.id = null;
    }
    // Insert the product into the database
    const result = await pool.query(
      "INSERT INTO product(title, description, year, author, img, rating, publisher, isbn) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
      [product.title, product.description, product.year, product.author, product.img, product.rating, product.publisher, product.isbn]
    );
    product.id = await result.rows[0].id;

    return product;

  } catch (error) {
    console.error(error);
  }
};

if (ipcMain) {
ipcMain.handle("createProduct", async (event, product) => {
  return await createProduct(product);
});
} else {
  console.error('ipcMain is not defined');
}

async function getProducts() {
  try {
    const res = await pool.query('SELECT * FROM product');
    return res.rows;
  } catch (error) {
    console.error(error);
  }
}

if (ipcMain) {
ipcMain.handle('getProducts', async (event) => {
  const products = await getProducts();
  return products;
});
} else {
  console.error('ipcMain is not defined');
}

async function deleteProduct(productId) {
  const query = {
    text: 'DELETE FROM product WHERE id = $1',
    values: [productId],
  };
  await pool.query(query);
  location.reload();
}

async function getProductById(id) {
  try {
    const res = await pool.query('SELECT * FROM product WHERE id = $1', [id]);
    return res.rows[0];
  } catch (error) {
    console.error(error);
  }
}

if (ipcMain) {
ipcMain.handle('getProductById', async (event, id) => {
  const product = await getProductById(id);
  return product;
});
} else {
  console.error('ipcMain is not defined');
}

if (ipcMain) {
ipcMain.handle('deleteProduct', async (event, productId) => {
  await deleteProduct(productId);
});
} else {
  console.error('ipcMain is not defined');
}

async function updateProduct(product) {

  try {
    product.year = parseFloat(product.year);
    const query = {
      text: 'UPDATE product SET title=$1, description=$2, year=$3, author=$4, img=$5, rating=$6, publisher=$7, isbn=$8 WHERE id=$9',
      values: [product.title, product.description, product.year, product.author, product.img, product.rating, product.publisher, product.isbn, product.id],
    };
    await pool.query(query);
    location.reload();
    return product.id;
  } catch (error) {
    console.error(error);
  }
}

if (ipcMain) {
  ipcMain.handle('updateProduct', async (event, product) => {
    return await updateProduct(product);
  });
} else {
  console.error('ipcMain is not defined');
}

async function searchProduct(searchQuery) {
  try {
    const query = {
      text: 'SELECT * FROM product WHERE LOWER(title) LIKE $1 OR LOWER(author) LIKE $1',
      values: [`%${searchQuery.toLowerCase()}%`],
    };
    const res = await pool.query(query);
    return res.rows;
  } catch (error) {
    console.error(error);
  }
}

if (ipcMain) {
ipcMain.handle('searchProduct', async (event, searchQuery) => {
  const products = await searchProduct(searchQuery);
  return products;
});
} else {
  console.error('ipcMain is not defined');
}


module.exports = {
  createWindow,
  createProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  searchProduct,
  getProductById
};
