const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

/**
 * Check if the username already exists in the records.
 * @param {string} username - The username to check.
 * @returns {boolean} True if username already exists, false otherwise.
 */
const isValid = (username) => {
    return users.some((user) => user.username === username);
};

/**
 * Verify if username and password match registered credentials.
 * @param {string} username - Registered username.
 * @param {string} password - User password.
 * @returns {boolean} True if credentials match, false otherwise.
 */
const authenticatedUser = (username, password) => {
    return users.some((user) => user.username === username && user.password === password);
};

// ==========================================
// Task 7: Only registered users can login
// ==========================================
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in: Username and password are required." });
    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        req.session.authorization = {
            accessToken,
            username
        };
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// ==========================================
// Task 8: Add or modify a book review
// ==========================================
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization ? req.session.authorization['username'] : null;

    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    if (!review) {
        return res.status(400).json({ message: "Review query parameter is required" });
    }

    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    // Add or modify review under this username
    books[isbn].reviews[username] = review;
    return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated.\n${JSON.stringify(books[isbn].reviews, null, 4)}`);
});

// ==========================================
// Task 9: Delete a book review
// ==========================================
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization ? req.session.authorization['username'] : null;

    if (!books[isbn]) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found` });
    }

    if (!username) {
        return res.status(403).json({ message: "User not logged in" });
    }

    if (books[isbn].reviews && books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).send(`Reviews for the ISBN ${isbn} posted by the user ${username} deleted.`);
    } else {
        return res.status(404).json({ message: "Review for this user not found on this book" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
