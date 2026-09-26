const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

/**
 * ============================================================================
 * Task 6: Register a new customer
 * ============================================================================
 * @route POST /register
 * @description Registers a new customer with a username and password.
 * @param {express.Request} req - Express request object containing username and password in body.
 * @param {express.Response} res - Express response object.
 * @returns {express.Response} 200 on success, or 400/404 with error message.
 */
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ 
      message: "Unable to register customer: Both 'username' and 'password' must be provided." 
    });
  }

  if (isValid(username)) {
    return res.status(404).json({ 
      message: `Customer registration failed: Username '${username}' is already taken.` 
    });
  }

  users.push({ username, password });
  return res.status(200).json({ 
    message: "Customer successfully registered. Now you can login." 
  });
});

/**
 * ============================================================================
 * Task 1 & Task 10: Get the list of books available in the shop
 * ============================================================================
 * @route GET /
 * @description Retrieves the catalog of all available books using a Promise callback.
 * @param {express.Request} req - Express request object.
 * @param {express.Response} res - Express response object.
 * @returns {Promise<express.Response>} Formatted JSON of all books.
 */
public_users.get('/', function (req, res) {
  const getBooksPromise = new Promise((resolve, reject) => {
    if (books && Object.keys(books).length > 0) {
      resolve(books);
    } else {
      reject(new Error("Unable to retrieve book catalog: Database is empty or unavailable."));
    }
  });

  getBooksPromise
    .then((bookList) => {
      return res.status(200).send(JSON.stringify(bookList, null, 4));
    })
    .catch((error) => {
      return res.status(500).json({ message: error.message });
    });
});

/**
 * Task 10 Helper: Get all books using Async/Await with Axios
 * @async
 * @function getAllBooksAsync
 * @param {string} [baseUrl="http://localhost:5000"] - Base URL of the API server.
 * @returns {Promise<Object>} Resolves with data containing all books.
 * @throws {Error} If HTTP request fails.
 */
const getAllBooksAsync = async (baseUrl = 'http://localhost:5000') => {
  try {
    const response = await axios.get(`${baseUrl}/`);
    return response.data;
  } catch (error) {
    console.error("Task 10 (Async/Await Axios) Error fetching book list:", error.message);
    throw new Error(`Failed to fetch books catalog: ${error.message}`);
  }
};

/**
 * Task 10 Helper: Get all books using Promise Callbacks with Axios
 * @function getAllBooksWithPromise
 * @param {string} [baseUrl="http://localhost:5000"] - Base URL of the API server.
 * @returns {Promise<Object>} Resolves with data containing all books.
 */
const getAllBooksWithPromise = (baseUrl = 'http://localhost:5000') => {
  return axios.get(`${baseUrl}/`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Task 10 (Promise Axios) Error fetching book list:", error.message);
      throw new Error(`Failed to fetch books catalog: ${error.message}`);
    });
};

/**
 * ============================================================================
 * Task 2 & Task 11: Get book details based on ISBN
 * ============================================================================
 * @route GET /isbn/:isbn
 * @description Retrieves a specific book by its ISBN using a Promise callback.
 * @param {express.Request} req - Express request object containing the ISBN parameter.
 * @param {express.Response} res - Express response object.
 * @returns {Promise<express.Response>} Formatted JSON of the book.
 */
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBNPromise = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject(new Error(`Book with ISBN '${isbn}' was not found in the catalog.`));
    }
  });

  getBookByISBNPromise
    .then((book) => {
      return res.status(200).send(JSON.stringify(book, null, 4));
    })
    .catch((error) => {
      return res.status(404).json({ message: error.message });
    });
});

/**
 * Task 11 Helper: Get book details by ISBN using Async/Await with Axios
 * @async
 * @function getBookByISBNAsync
 * @param {string|number} isbn - ISBN identifier of the book.
 * @param {string} [baseUrl="http://localhost:5000"] - Base URL of the API server.
 * @returns {Promise<Object>} Resolves with the book details.
 * @throws {Error} If book is not found or request fails.
 */
const getBookByISBNAsync = async (isbn, baseUrl = 'http://localhost:5000') => {
  try {
    const response = await axios.get(`${baseUrl}/isbn/${isbn}`);
    return response.data;
  } catch (error) {
    console.error(`Task 11 (Async/Await Axios) Error fetching ISBN ${isbn}:`, error.message);
    throw new Error(`Failed to fetch book with ISBN '${isbn}': ${error.message}`);
  }
};

/**
 * Task 11 Helper: Get book details by ISBN using Promise Callbacks with Axios
 * @function getBookByISBNWithPromise
 * @param {string|number} isbn - ISBN identifier of the book.
 * @param {string} [baseUrl="http://localhost:5000"] - Base URL of the API server.
 * @returns {Promise<Object>} Resolves with the book details.
 */
const getBookByISBNWithPromise = (isbn, baseUrl = 'http://localhost:5000') => {
  return axios.get(`${baseUrl}/isbn/${isbn}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error(`Task 11 (Promise Axios) Error fetching ISBN ${isbn}:`, error.message);
      throw new Error(`Failed to fetch book with ISBN '${isbn}': ${error.message}`);
    });
};

/**
 * ============================================================================
 * Task 3 & Task 12: Get book details based on Author
 * ============================================================================
 * @route GET /author/:author
 * @description Retrieves books written by a specified author using array filter() and Promises.
 * @param {express.Request} req - Express request object containing the author parameter.
 * @param {express.Response} res - Express response object.
 * @returns {Promise<express.Response>} Formatted JSON array of matching books.
 */
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  const getBooksByAuthorPromise = new Promise((resolve, reject) => {
    // Optimized filtering using native Array.prototype.filter()
    const matchingBooks = Object.values(books).filter(
      (book) => book.author.toLowerCase() === author.toLowerCase()
    );

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject(new Error(`No books found for author matching '${author}'.`));
    }
  });

  getBooksByAuthorPromise
    .then((matching) => {
      return res.status(200).send(JSON.stringify(matching, null, 4));
    })
    .catch((error) => {
      return res.status(404).json({ message: error.message });
    });
});

/**
 * Task 12 Helper: Get books by author using Async/Await with Axios
 * @async
 * @function getBooksByAuthorAsync
 * @param {string} author - Name of the author.
 * @param {string} [baseUrl="http://localhost:5000"] - Base URL of the API server.
 * @returns {Promise<Array>} Resolves with list of matching books.
 * @throws {Error} If request fails or author not found.
 */
const getBooksByAuthorAsync = async (author, baseUrl = 'http://localhost:5000') => {
  try {
    const encodedAuthor = encodeURIComponent(author);
    const response = await axios.get(`${baseUrl}/author/${encodedAuthor}`);
    return response.data;
  } catch (error) {
    console.error(`Task 12 (Async/Await Axios) Error fetching author '${author}':`, error.message);
    throw new Error(`Failed to fetch books by author '${author}': ${error.message}`);
  }
};

/**
 * Task 12 Helper: Get books by author using Promise Callbacks with Axios
 * @function getBooksByAuthorWithPromise
 * @param {string} author - Name of the author.
 * @param {string} [baseUrl="http://localhost:5000"] - Base URL of the API server.
 * @returns {Promise<Array>} Resolves with list of matching books.
 */
const getBooksByAuthorWithPromise = (author, baseUrl = 'http://localhost:5000') => {
  const encodedAuthor = encodeURIComponent(author);
  return axios.get(`${baseUrl}/author/${encodedAuthor}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error(`Task 12 (Promise Axios) Error fetching author '${author}':`, error.message);
      throw new Error(`Failed to fetch books by author '${author}': ${error.message}`);
    });
};

/**
 * ============================================================================
 * Task 4 & Task 13: Get all books based on Title
 * ============================================================================
 * @route GET /title/:title
 * @description Retrieves books with a matching title using array filter() and Promises.
 * @param {express.Request} req - Express request object containing the title parameter.
 * @param {express.Response} res - Express response object.
 * @returns {Promise<express.Response>} Formatted JSON array of matching books.
 */
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  const getBooksByTitlePromise = new Promise((resolve, reject) => {
    // Optimized filtering using native Array.prototype.filter()
    const matchingBooks = Object.values(books).filter(
      (book) => book.title.toLowerCase() === title.toLowerCase()
    );

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject(new Error(`No books found with title matching '${title}'.`));
    }
  });

  getBooksByTitlePromise
    .then((matching) => {
      return res.status(200).send(JSON.stringify(matching, null, 4));
    })
    .catch((error) => {
      return res.status(404).json({ message: error.message });
    });
});

/**
 * Task 13 Helper: Get books by title using Async/Await with Axios
 * @async
 * @function getBooksByTitleAsync
 * @param {string} title - Title of the book.
 * @param {string} [baseUrl="http://localhost:5000"] - Base URL of the API server.
 * @returns {Promise<Array>} Resolves with list of matching books.
 * @throws {Error} If request fails or title not found.
 */
const getBooksByTitleAsync = async (title, baseUrl = 'http://localhost:5000') => {
  try {
    const encodedTitle = encodeURIComponent(title);
    const response = await axios.get(`${baseUrl}/title/${encodedTitle}`);
    return response.data;
  } catch (error) {
    console.error(`Task 13 (Async/Await Axios) Error fetching title '${title}':`, error.message);
    throw new Error(`Failed to fetch books with title '${title}': ${error.message}`);
  }
};

/**
 * Task 13 Helper: Get books by title using Promise Callbacks with Axios
 * @function getBooksByTitleWithPromise
 * @param {string} title - Title of the book.
 * @param {string} [baseUrl="http://localhost:5000"] - Base URL of the API server.
 * @returns {Promise<Array>} Resolves with list of matching books.
 */
const getBooksByTitleWithPromise = (title, baseUrl = 'http://localhost:5000') => {
  const encodedTitle = encodeURIComponent(title);
  return axios.get(`${baseUrl}/title/${encodedTitle}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error(`Task 13 (Promise Axios) Error fetching title '${title}':`, error.message);
      throw new Error(`Failed to fetch books with title '${title}': ${error.message}`);
    });
};

/**
 * ============================================================================
 * Task 5: Get book reviews based on ISBN
 * ============================================================================
 * @route GET /review/:isbn
 * @description Retrieves all reviews submitted for a specific book by its ISBN.
 * @param {express.Request} req - Express request object containing the ISBN parameter.
 * @param {express.Response} res - Express response object.
 * @returns {express.Response} Formatted JSON of reviews for the requested book.
 */
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({ 
      message: `Unable to retrieve reviews: Book with ISBN '${isbn}' was not found.` 
    });
  }
});

module.exports.general = public_users;
module.exports.getAllBooksAsync = getAllBooksAsync;
module.exports.getAllBooksWithPromise = getAllBooksWithPromise;
module.exports.getBookByISBNAsync = getBookByISBNAsync;
module.exports.getBookByISBNWithPromise = getBookByISBNWithPromise;
module.exports.getBooksByAuthorAsync = getBooksByAuthorAsync;
module.exports.getBooksByAuthorWithPromise = getBooksByAuthorWithPromise;
module.exports.getBooksByTitleAsync = getBooksByTitleAsync;
module.exports.getBooksByTitleWithPromise = getBooksByTitleWithPromise;
