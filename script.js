const API_BASE_URL = "https://android-seminar-flask-api.vercel.app";

function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = (section.id === sectionId) ? 'block' : 'none';
    });

    if (sectionId === 'book-list') {
        fetchBooks();
    } else if (sectionId === 'borrow-list') {
        fetchBorrows();
    } else if (sectionId === 'edit-book-form') {
        populateEditForm();
    }
}

function fetchBooks() {
    fetch(`${API_BASE_URL}/books`, {
        method: 'GET',
        mode: 'cors'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error fetching books: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        displayBooks(data);
    })
    .catch(error => {
        console.error('Error fetching books:', error);
        alert("Failed to fetch books. Please check your network connection.");
    });
}

function displayBooks(books) {
    let bookList = document.getElementById('book-items');
    bookList.innerHTML = "";

    books.forEach(book => {
        let bookItem = document.createElement('div');
        bookItem.innerHTML = `
            <h3>${book.title}</h3>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>Category:</strong> ${book.category}</p>
            <p><strong>Stock:</strong> ${book.stock}</p>
            <button onclick="editBook('${book._id}', '${book.title}', '${book.author}', ${book.stock}, '${book.category}')">Edit</button>
            <button onclick="deleteBook('${book._id}')">Delete</button>
            <hr>
        `;
        bookList.appendChild(bookItem);
    });
}


function deleteBook(bookId) {
    if (confirm("Are you sure you want to delete this book?")) {
        fetch(`${API_BASE_URL}/books/${bookId}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to delete book. The book might be borrowed.");
                }
                return response.json();
            })
            .then(data => {
                alert(data.message || "Book deleted successfully");
                fetchBooks(); 
            })
            .catch(error => {
                console.error('Error deleting book:', error);
                alert("Cannot delete book. It might be borrowed.");
            });
    }
}


function toggleAddBookForm() {
    const form = document.getElementById('add-book-form');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function submitNewBook() {
    const newBook = {
        title: document.getElementById('title').value.trim(),
        author: document.getElementById('author').value.trim(),
        stock: parseInt(document.getElementById('stock').value),
        category: document.getElementById('category').value.trim()
    };

    if (!newBook.title || !newBook.author || isNaN(newBook.stock) || !newBook.category) {
        alert("Please fill in all fields correctly.");
        return;
    }

    fetch(`${API_BASE_URL}/books`, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newBook)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to add book.");
        }
        return response.json();
    })
    .then(data => {
        alert("Book added successfully!");
        document.querySelectorAll('#add-book-form input').forEach(input => input.value = ''); 
        toggleAddBookForm();
        })
    .catch(error => {
        console.error('Error adding book:', error);
        alert("Failed to add the book. Please try again.");
    });
}



function editBook(bookId, title, author, stock, category) {
    document.getElementById('edit-book-id').value = bookId;
    document.getElementById('edit-title').value = title;
    document.getElementById('edit-author').value = author;
    document.getElementById('edit-stock').value = stock;
    document.getElementById('edit-category').value = category;
    
    showSection('edit-book-form'); 
}

function submitBookEdit() {
    const bookId = document.getElementById('edit-book-id').value;
    const updatedBook = {
        title: document.getElementById('edit-title').value.trim(),
        author: document.getElementById('edit-author').value.trim(),
        stock: parseInt(document.getElementById('edit-stock').value),
        category: document.getElementById('edit-category').value.trim()
    };

    if (!updatedBook.title || !updatedBook.author  || isNaN(updatedBook.stock) || !updatedBook.category) {
        alert("Please fill in all fields correctly.");
        return;
    }

    fetch(`${API_BASE_URL}/books/${bookId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedBook)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to update book.");
        }
        return response.json();
    })
    .then(() => {
        alert("Book updated successfully!");
        showSection('book-list');
        fetchBooks();  
    })
    .catch(error => {
        console.error('Error updating book:', error);
        alert("Failed to update the book. Please try again.");
    });
}

function fetchBorrows() {
    fetch(`${API_BASE_URL}/admin/borrows`, {
        method: 'GET',
        mode: 'cors'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error fetching borrows: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        window.allBorrows = data;  
        displayBorrows(data);
    })
    .catch(error => {
        console.error('Error fetching borrows:', error);
        alert("Failed to fetch borrow records.");
    });
}

function filterBorrows(status) {
    let filteredBorrows = [];

    if (status === 'all') {
        filteredBorrows = window.allBorrows;
    } else {
        filteredBorrows = window.allBorrows.filter(borrow => borrow.status === status);
    }

    displayBorrows(filteredBorrows);
}

function displayBorrows(borrows) {
    let container = document.getElementById('borrows-container');
    container.innerHTML = "";

    if (borrows.length === 0) {
        container.innerHTML = "<p>No borrow records found.</p>";
        return;
    }

    borrows.forEach(borrow => {
        let borrowItem = document.createElement('div');
        borrowItem.innerHTML = `
            <p><strong>Book:</strong> ${borrow.book_title}</p>
            <p><strong>User:</strong> ${borrow.username}</p>
            <p><strong>Status:</strong> ${borrow.status}</p>
            <p><strong>Borrowed At:</strong> ${borrow.borrowed_at}</p>
            ${borrow.status === 'pending' ? `<button onclick="approveBorrow('${borrow._id}')">Approve</button>` : ''}
            ${borrow.status === 'approved' ? `<button onclick="returnBook('${borrow._id}')">Mark as Returned</button>` : ''}
            <hr>
        `;
        container.appendChild(borrowItem);
    });
}

function approveBorrow(borrowId) {
    fetch(`${API_BASE_URL}/admin/approve-borrow/${borrowId}`, {
        method: 'PUT',
        mode: 'cors'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to approve borrow request.");
        }
        return response.json();
    })
    .then(data => {
        alert(data.message || "Borrow request approved successfully!");
        fetchBorrows();
    })
    .catch(error => {
        console.error('Error approving borrow:', error);
        alert("Failed to approve the borrow request.");
    });
}

function returnBook(borrowId) {
    fetch(`${API_BASE_URL}/admin/return/${borrowId}`, {
        method: 'PUT',
        mode: 'cors'
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to return book.");
        }
        return response.json();
    })
    .then(data => {
        alert(data.message || "Book returned successfully!");
        fetchBorrows();
    })
    .catch(error => {
        console.error('Error returning book:', error);
        alert("Failed to return the book.");
    });
}

