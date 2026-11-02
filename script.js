
// DIGITAL LIBRARY MANAGEMENT SYSTEM
// Prapti Kawade - TYCS

const ADMIN_EMAIL = "admin@library.com";
const ADMIN_PASSWORD = "Admin123";

const defaultBooks = [
["Python Programming","Programming","Guido van Rossum","https://greenteapress.com/thinkpython2/thinkpython2.pdf"],
["Java Programming","Programming","James Gosling","https://greenteapress.com/thinkjava2/thinkjava2.pdf"],
["C Programming","Programming","Dennis Ritchie","https://www.gnu.org/software/c-intro-and-ref/manual/c-intro-and-ref.pdf"],
["C++ Programming","Programming","Bjarne Stroustrup","https://www.learncpp.com/"],
["HTML Basics","Web Development","Tim Berners-Lee","https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content"],
["CSS Guide","Web Development","Hakon Wium Lie","https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics"],
["JavaScript","Web Development","Brendan Eich","https://eloquentjavascript.net/Eloquent_JavaScript.pdf"],
["PHP Programming","Web Development","Rasmus Lerdorf","https://www.php.net/distributions/manual/php_en.pdf"],
["MySQL Database","Database","Michael Widenius","https://dev.mysql.com/doc/"],
["Data Structures","Computer Science","Seymour Lipschutz","https://opendsa-server.cs.vt.edu/ODSA/Books/Everything/html/"],
["DBMS","Database","Raghu Ramakrishnan","https://opentextbc.ca/dbdesign01/"],
["Operating System","Computer Science","Abraham Silberschatz",""],
["Computer Networks","Networking","Andrew Tanenbaum",""],
["Software Engineering","Software","Ian Sommerville",""],
["Cyber Security","Security","William Stallings",""],
["Artificial Intelligence","AI","Stuart Russell",""],
["Machine Learning","AI","Tom Mitchell",""],
["Linux Administration","Linux","Evi Nemeth",""],
["Cloud Computing","Technology","Thomas Erl",""],
["Computer Fundamentals","Computer Science","P.K. Sinha",""]
];

function loadData(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        return fallback;
    }
}

let users = loadData("dlms_users", []);
let books = loadData("dlms_books", null);
let notes = loadData("dlms_notes", []);
let borrows = loadData("dlms_borrows", []);

let currentUser = null;

if (!Array.isArray(users)) users = [];
if (!Array.isArray(notes)) notes = [];
if (!Array.isArray(borrows)) borrows = [];

if (!Array.isArray(books)) {
    books = defaultBooks.map((b, i) => ({
        id: i + 1,
        title: b[0],
        subject: b[1],
        author: b[2],
        pdf: b[3]
    }));
}
books.forEach(book => {
    const oldBook = defaultBooks.find(b => b[0] === book.title);

    if (oldBook && (!book.pdf || book.pdf === "") && oldBook[3]) {
        book.pdf = oldBook[3];
    }
});

saveData();

function saveData() {
    try {
        localStorage.setItem("dlms_users", JSON.stringify(users));
        localStorage.setItem("dlms_books", JSON.stringify(books));
        localStorage.setItem("dlms_notes", JSON.stringify(notes));
        localStorage.setItem("dlms_borrows", JSON.stringify(borrows));
    } catch (error) {
        alert("Unable to save data. Please check browser storage.");
    }
}

function el(id) {
    return document.getElementById(id);
}

function safe(value) {
    return String(value).replace(/[&<>"']/g, c => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[c]);
}

// SIGNUP

function showSignup() {
    el("authTitle").textContent = "Create Account";
    el("name").classList.remove("hidden");
    el("loginBtn").classList.add("hidden");
    el("signupBtn").classList.remove("hidden");

    el("switchText").innerHTML =
        'Already have an account? <a href="#" onclick="showLogin()">Login</a>';
}

function showLogin() {
    el("authTitle").textContent = "Login";
    el("name").classList.add("hidden");
    el("loginBtn").classList.remove("hidden");
    el("signupBtn").classList.add("hidden");

    el("switchText").innerHTML =
        'Don\'t have an account? <a href="#" onclick="showSignup()">Sign Up</a>';
}

function signup() {
    const name = el("name").value.trim();
    const email = el("email").value.trim().toLowerCase();
    const password = el("password").value;

    if (!name || !email || !password) {
        alert("Please fill all details.");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters.");
        return;
    }

    if (email === ADMIN_EMAIL || users.some(u => u.email === email)) {
        alert("Email already registered.");
        return;
    }

    users.push({
        id: Date.now(),
        name: name,
        email: email,
        password: password
    });

    saveData();

    alert("Registration successful! Please Login.");

    el("name").value = "";
    el("password").value = "";
    showLogin();
}

// LOGIN

function login() {
    const email = el("email").value.trim().toLowerCase();
    const password = el("password").value.trim();

    if (!email || !password) {
        alert("Please enter Email and Password.");
        return;
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        currentUser = {
            name: "Administrator",
            email: ADMIN_EMAIL,
            role: "admin"
        };
        openDashboard();
        return;
    }

    const user = users.find(u =>
        u.email === email && u.password === password
    );

    if (!user) {
        alert("Incorrect Email or Password.");
        return;
    }

    currentUser = {
        name: user.name,
        email: user.email,
        role: "user"
    };

    openDashboard();
}

// DASHBOARD

function openDashboard() {
    el("authSection").classList.add("hidden");
    el("dashboard").classList.remove("hidden");
    el("logoutBtn").classList.remove("hidden");

    el("welcome").textContent = "Welcome, " + currentUser.name + "!";

    el("adminNav").classList.toggle(
        "hidden", currentUser.role !== "admin"
    );

    showSection("library");
    updateStats();
}

function logout() {
    currentUser = null;

    el("dashboard").classList.add("hidden");
    el("authSection").classList.remove("hidden");
    el("logoutBtn").classList.add("hidden");

    el("email").value = "";
    el("password").value = "";

    showLogin();
}

function showSection(section) {
    if (!currentUser) return;

    if (section === "admin" && currentUser.role !== "admin") {
        alert("Admin access only.");
        return;
    }

    ["library", "notes", "admin"].forEach(id => {
        el(id).classList.toggle("hidden", id !== section);
    });

    if (section === "library") displayBooks();
    if (section === "notes") displayNotes();
    if (section === "admin") displayAdminBooks();
}

// STATISTICS

function updateStats() {
    if (!currentUser) return;

    el("totalBooks").textContent = books.length;

    el("borrowedBooks").textContent =
        borrows.filter(b =>
            b.email === currentUser.email && !b.returned
        ).length;

    el("totalNotes").textContent =
        notes.filter(n => n.email === currentUser.email).length;
}

// BOOKS

function displayBooks() {
    if (!currentUser) return;

    const search = el("searchInput").value.toLowerCase().trim();

    const result = books.filter(b =>
        b.title.toLowerCase().includes(search) ||
        b.subject.toLowerCase().includes(search) ||
        b.author.toLowerCase().includes(search)
    );

    if (result.length === 0) {
        el("bookList").innerHTML = "<p>No Books Found.</p>";
        return;
    }

    el("bookList").innerHTML = result.map(b => {
        const borrowed = borrows.some(x =>
            x.bookId === b.id &&
            x.email === currentUser.email &&
            !x.returned
        );

        return `
        <div class="book-card">
            <h3>📚 ${safe(b.title)}</h3>
            <p>Subject: ${safe(b.subject)}</p>
            <p>Author: ${safe(b.author)}</p>

            <button onclick="viewBook(${b.id})">View Details</button>

            <button onclick="${borrowed ? "returnBook" : "borrowBook"}(${b.id})">
                ${borrowed ? "Return Book" : "Borrow Book"}
            </button>

            <button onclick="downloadPDF(${b.id})">Download PDF</button>
        </div>`;
    }).join("");
}

function viewBook(id) {
    const b = books.find(x => x.id === id);
    if (!b) return;

    alert(
        "BOOK DETAILS\n\n" +
        "Title: " + b.title +
        "\nSubject: " + b.subject +
        "\nAuthor: " + b.author +
        "\nPDF: " + (b.pdf ? "Available" : "Not Available")
    );
}

function borrowBook(id) {
    if (!currentUser) return;

    const already = borrows.some(b =>
        b.bookId === id &&
        b.email === currentUser.email &&
        !b.returned
    );

    if (already) {
        alert("Already Borrowed.");
        return;
    }

    borrows.push({
        bookId: id,
        email: currentUser.email,
        returned: false,
        date: new Date().toLocaleDateString()
    });

    saveData();
    displayBooks();
    updateStats();

    alert("Book Borrowed Successfully!");
}

function returnBook(id) {
    const record = borrows.find(b =>
        b.bookId === id &&
        b.email === currentUser.email &&
        !b.returned
    );

    if (!record) return;

    record.returned = true;

    saveData();
    displayBooks();
    updateStats();

    alert("Book Returned Successfully!");
}

// PDF DOWNLOAD

function downloadPDF(id) {
    const book = books.find(b => String(b.id) === String(id));

    if (!book) {
        alert("Book not found!");
        return;
    }

    if (!book.pdf || book.pdf.trim() === "") {
        alert("PDF is not available for this book.");
        return;
    }

    const url = book.pdf.trim();

    if (!url.startsWith("https://") && !url.startsWith("http://")) {
        alert("Invalid PDF link!");
        return;
    }

    window.location.href = url;
}

// NOTES

function addNote() {
    if (!currentUser) return;

    const title = el("noteTitle").value.trim();
    const content = el("noteContent").value.trim();

    if (!title || !content) {
        alert("Please enter Note Title and Content.");
        return;
    }

    notes.push({
        id: Date.now(),
        email: currentUser.email,
        title: title,
        content: content
    });

    saveData();

    el("noteTitle").value = "";
    el("noteContent").value = "";

    displayNotes();
    updateStats();

    alert("Note Saved Successfully!");
}

function displayNotes() {
    if (!currentUser) return;

    const mine = notes.filter(n => n.email === currentUser.email);

    if (mine.length === 0) {
        el("notesList").innerHTML = "<p>No Notes Available.</p>";
        return;
    }

    el("notesList").innerHTML = mine.map(n => `
        <div class="note-card">
            <h3>${safe(n.title)}</h3>
            <p>${safe(n.content).replace(/\n/g, "<br>")}</p>
            <button onclick="downloadNote(${n.id})">Download Note</button>
            <button onclick="deleteNote(${n.id})">Delete</button>
        </div>
    `).join("");
}

function deleteNote(id) {
    if (!confirm("Delete this note?")) return;

    notes = notes.filter(n =>
        !(n.id === id && n.email === currentUser.email)
    );

    saveData();
    displayNotes();
    updateStats();
}

// Notes are opened as readable text instead of using blob download,
// because some Android editor previews do not support blob downloads.
function downloadNote(id) {
    const note = notes.find(n =>
        n.id === id && n.email === currentUser.email
    );

    if (!note) {
        alert("Note not found.");
        return;
    }

    const content = note.title + "\n\n" + note.content;
    const dataUrl = "data:text/plain;charset=utf-8," + encodeURIComponent(content);

    const opened = window.open(dataUrl, "_blank");

    if (!opened) {
        alert("Popup blocked. Please allow popups to view your note.");
    }
}

// ADMIN

function addBook() {
    if (!currentUser || currentUser.role !== "admin") {
        alert("Admin access only.");
        return;
    }

    const title = el("newTitle").value.trim();
    const subject = el("newSubject").value.trim();
    const author = el("newAuthor").value.trim();
    const pdf = el("newPdf").value.trim();

    if (!title || !subject || !author) {
        alert("Fill all required book details.");
        return;
    }

    if (pdf) {
        try {
            const url = new URL(pdf);

            if (!["http:", "https:"].includes(url.protocol)) {
                throw new Error("Invalid URL");
            }
        } catch (e) {
            alert("Enter a valid PDF URL.");
            return;
        }
    }

    books.push({
        id: Date.now(),
        title: title,
        subject: subject,
        author: author,
        pdf: pdf
    });

    saveData();

    el("newTitle").value = "";
    el("newSubject").value = "";
    el("newAuthor").value = "";
    el("newPdf").value = "";

    displayAdminBooks();
    updateStats();

    alert("Book Added Successfully!");
}

function displayAdminBooks() {
    if (!currentUser || currentUser.role !== "admin") return;

    if (books.length === 0) {
        el("adminBookList").innerHTML = "<p>No books available.</p>";
        return;
    }

    el("adminBookList").innerHTML = books.map(b => `
        <div class="note-card">
            <h3>${safe(b.title)}</h3>
            <p>${safe(b.subject)} - ${safe(b.author)}</p>
            <button onclick="deleteBook(${b.id})">Delete Book</button>
        </div>
    `).join("");
}

function deleteBook(id) {
    if (!currentUser || currentUser.role !== "admin") return;

    if (!confirm("Are you sure you want to delete this book?")) return;

    books = books.filter(b => b.id !== id);

    saveData();
    displayAdminBooks();
    updateStats();

    alert("Book Deleted Successfully!");
}

// INITIALIZATION

function initializeLibrary() {
    showLogin();
    console.log("Digital Library JavaScript Loaded Successfully!");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeLibrary);
} else {
    initializeLibrary();
}
