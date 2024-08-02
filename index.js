const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DATA_FILE = './book.json';

app.use(bodyParser.json());


const readBooks = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};


const writeBooks = (books) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(books, null, 2), 'utf8');
};

// GET - /books
app.get('/books', (req, res) => {
    const books = readBooks();
    res.json(books);
});

// GET - /books/:id
app.get('/books/:id', (req, res) => {
    const books = readBooks();
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (book) {
        res.json(book);
    } else {
        res.status(404).json({ message: 'Book not found' });
    }
});

// POST - /books
app.post('/books', (req, res) => {
    const books = readBooks();
    const { title, author } = req.body;
    
    if (!title || !author) {
        return res.status(400).json({ message: 'Title and author are required' });
    }

    const existingBook = books.find(b => b.title === title);
    if (existingBook) {
        return res.status(400).json({ message: 'Book already exists' });
    }

    const newBook = {
        id: books.length ? books[books.length - 1].id + 1 : 1,
        title,
        author
    };

    books.push(newBook);
    writeBooks(books);

    res.status(201).json(newBook);
});

// PUT - /books/:id
app.put('/books/:id', (req, res) => {
    const books = readBooks();
    const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));
    
    if (bookIndex === -1) {
        return res.status(404).json({ message: 'Book not found' });
    }

    const { title, author } = req.body;
    
    if (title) books[bookIndex].title = title;
    if (author) books[bookIndex].author = author;

    writeBooks(books);

    res.json(books[bookIndex]);
});

// DELETE - /books/:id
app.delete('/books/:id', (req, res) => {
    const books = readBooks();
    const bookIndex = books.findIndex(b => b.id === parseInt(req.params.id));

    if (bookIndex === -1) {
        return res.status(404).json({ message: 'Book not found' });
    }

    const deletedBook = books.splice(bookIndex, 1);
    writeBooks(books);

    res.json(deletedBook[0]);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
