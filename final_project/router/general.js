const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// ==========================================
// Task 6: Register a new user
// ==========================================
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "Customer successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "Customer with same username already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register customer. Username and password must be provided." });
});

// ==========================================
// Task 1 & Task 10: Get the book list available in the shop
// Implemented using Promise callbacks / Async-Await
// ==========================================
public_users.get('/', function (req, res) {
  const getBooksPromise = new Promise((resolve, reject) => {
    if (books) {
      resolve(books);
    } else {
      reject({ message: "Unable to fetch books" });
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

// Task 10: Async function using Axios to get all books
const getAllBooksAsync = async () => {
  try {
    const response = await axios.get('http://localhost:5000/');
    return response.data;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
};

// ==========================================
// Task 2 & Task 11: Get book details based on ISBN
// Implemented using Promise callbacks / Async-Await
// ==========================================
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  const getBookByISBNPromise = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject({ message: `Book with ISBN ${isbn} not found` });
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

// Task 11: Async function using Axios to get book details by ISBN
const getBookByISBNAsync = async (isbn) => {
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching book with ISBN ${isbn}:`, error);
    throw error;
  }
};

// ==========================================
// Task 3 & Task 12: Get book details based on author
// Implemented using Promise callbacks / Async-Await
// ==========================================
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  const getBooksByAuthorPromise = new Promise((resolve, reject) => {
    const bookKeys = Object.keys(books);
    const matchingBooks = [];

    bookKeys.forEach((key) => {
      if (books[key].author.toLowerCase() === author.toLowerCase()) {
        matchingBooks.push(books[key]);
      }
    });

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject({ message: `No books found for author: ${author}` });
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

// Task 12: Async function using Axios to get books by author
const getBooksByAuthorAsync = async (author) => {
  try {
    const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching books by author ${author}:`, error);
    throw error;
  }
};

// ==========================================
// Task 4 & Task 13: Get all books based on title
// Implemented using Promise callbacks / Async-Await
// ==========================================
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  const getBooksByTitlePromise = new Promise((resolve, reject) => {
    const bookKeys = Object.keys(books);
    const matchingBooks = [];

    bookKeys.forEach((key) => {
      if (books[key].title.toLowerCase() === title.toLowerCase()) {
        matchingBooks.push(books[key]);
      }
    });

    if (matchingBooks.length > 0) {
      resolve(matchingBooks);
    } else {
      reject({ message: `No books found with title: ${title}` });
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

// Task 13: Async function using Axios to get books by title
const getBooksByTitleAsync = async (title) => {
  try {
    const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching books by title ${title}:`, error);
    throw error;
  }
};

// ==========================================
// Task 5: Get book review based on ISBN
// ==========================================
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  } else {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
  }
});

module.exports.general = public_users;
module.exports.getAllBooksAsync = getAllBooksAsync;
module.exports.getBookByISBNAsync = getBookByISBNAsync;
module.exports.getBooksByAuthorAsync = getBooksByAuthorAsync;
module.exports.getBooksByTitleAsync = getBooksByTitleAsync;
