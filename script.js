const STORAGE_KEY = "data-buku";

let books = [];

function isStorageExist() {
	if (typeof Storage === undefined) {
		alert("Mohon maaf! Browser Anda tidak mendukung local storage");
		return false;
	}
	return true;
}

function saveData() {
	const parsed = JSON.stringify(books);
	localStorage.setItem(STORAGE_KEY, parsed);
	document.dispatchEvent(new Event("ondatasaved"));
}

function loadDataFromStorage() {
	const serializedData = localStorage.getItem(STORAGE_KEY);

	let data = JSON.parse(serializedData);

	if (data !== null) books = data;

	document.dispatchEvent(new Event("ondataloaded"));
}

function updateDataToStorage() {
	if (isStorageExist()) saveData();
}

function composeBook(title, author, year, isComplete) {
	return {
		id: +new Date(),
		title,
		author,
		year,
		isComplete,
	};
}

function findBook(bookId) {
	for (book of books) {
		if (book.id === bookId) return book;
	}
	return null;
}

function findBookIndex(bookId) {
	let index = 0;
	for (book of books) {
		if (book.id === bookId) return index;

		index++;
	}

	return -1;
}

function refresh() {
	const incompleteBookshelfList = document.getElementById(uncomplete);
	const completeBookshelfList = document.getElementById(completed);

	for (book of books) {
		const newBook = createBook(book.title, `Penulis: ${book.author}`, `Tahun: ${book.year}`, book.isComplete);
		newBook[bookItemId] = book.id;

		if (book.isComplete) {
			completeBookshelfList.append(newBook);
		} else {
			incompleteBookshelfList.append(newBook);
		}
	}
}

const uncomplete = "belum-dibaca";
const completed = "sudah-dibaca";
const bookItemId = "itemId";

function createBook(title, author, year, isComplete) {
	const bookTitle = document.createElement("p");
	bookTitle.innerText = title;
	bookTitle.classList.add("semi-subtitle");

	const bookAuthor = document.createElement("p");
	bookAuthor.innerText = author;

	const bookYear = document.createElement("p");
	bookYear.innerText = year;

	const bookAction = document.createElement("div");
	bookAction.classList.add("action");
	if (isComplete) {
		bookAction.append(createUndoButton(), createTrashButton());
	} else {
		bookAction.append(createCheckButton(), createTrashButton());
	}

	const container = document.createElement("article");
	container.classList.add("input", "custom");
	container.append(bookTitle, bookAuthor, bookYear, bookAction);

	return container;
}

function createUndoButton() {
	return createButton("rak", "Belum selesai dibaca", function (event) {
		undo(event.target.parentElement.parentElement);
	});
}

function createTrashButton() {
	return createButton("rak", "Hapus buku", function (event) {
		removeBook(event.target.parentElement.parentElement);
	});
}

function createCheckButton() {
	return createButton("rak", "Selesai dibaca", function (event) {
		addBookToCompleted(event.target.parentElement.parentElement);
	});
}

function createButton(buttonTypeClass, buttonText, eventListener) {
	const button = document.createElement("button");
	button.innerText = buttonText;
	button.classList.add(buttonTypeClass);
	button.addEventListener("click", function (event) {
		eventListener(event);
	});

	return button;
}

function addBook() {
	const incompleteBookshelfList = document.getElementById(uncomplete);
	const completeBookshelfList = document.getElementById(completed);

	const bookTitle = document.getElementById("judul-buku").value;
	const bookAuthor = document.getElementById("penulis-buku").value;
	const bookYear = document.getElementById("tahun-terbit").value;
	const isComplete = document.getElementById("checkbox").checked;

	const book = createBook(bookTitle, `Penulis: ${bookAuthor}`, `Tahun: ${bookYear}`, isComplete);
	const bookObject = composeBook(bookTitle, bookAuthor, bookYear, isComplete);

	book[bookItemId] = bookObject.id;
	books.push(bookObject);

	if (isComplete) {
		completeBookshelfList.append(book);
	} else {
		incompleteBookshelfList.append(book);
	}
	updateDataToStorage();
}

function addBookToCompleted(bookElement) {
	const completeBookshelfList = document.getElementById(completed);
	const bookTitle = bookElement.querySelector(".semi-subtitle").innerText;
	const bookAuthor = bookElement.querySelectorAll("p")[0].innerText;
	const bookYear = bookElement.querySelectorAll("p")[1].innerText;

	const newBook = createBook(bookTitle, bookAuthor, bookYear, true);
	const book = findBook(bookElement[bookItemId]);
	book.isComplete = true;
	newBook[bookItemId] = book.id;

	completeBookshelfList.append(newBook);
	bookElement.remove();

	updateDataToStorage();
}

function removeBook(bookElement) {
	const isDelete = window.confirm("Apakah yakin ingin menghapus buku ini?");
	if (isDelete) {
		const bookPosition = findBookIndex(bookElement[bookItemId]);
		books.splice(bookPosition, 1);

		bookElement.remove();
		updateDataToStorage();
		alert("Buku berhasil dihapus");
	} else {
		alert("Buku gagal dihapus");
	}
}

function undo(bookElement) {
	const incompleteBookshelfList = document.getElementById(uncomplete);
	const bookTitle = bookElement.querySelector(".semi-subtitle").innerText;
	const bookAuthor = bookElement.querySelectorAll("p")[0].innerText;
	const bookYear = bookElement.querySelectorAll("p")[1].innerText;

	const newBook = createBook(bookTitle, bookAuthor, bookYear, false);

	const book = findBook(bookElement[bookItemId]);
	book.isComplete = false;
	newBook[bookItemId] = book.id;

	incompleteBookshelfList.append(newBook);
	bookElement.remove();

	updateDataToStorage();
}

function searchBook() {
	const searchBook = document.getElementById("search-judul-buku");
	const filter = searchBook.value.toUpperCase();
	const bookItem = document.querySelectorAll("article");
	for (let i = 0; i < bookItem.length; i++) {
		txtValue = bookItem[i].textContent || bookItem[i].innerText;
		if (txtValue.toUpperCase().indexOf(filter) > -1) {
			bookItem[i].style.display = "";
		} else {
			bookItem[i].style.display = "none";
		}
	}
}

document.addEventListener("DOMContentLoaded", function () {
	const inputBook = document.getElementById("masukkan-rak");
	const inputSearchBook = document.getElementById("button-cari");
	const inputBookIsComplete = document.getElementById("checkbox");

	inputBook.addEventListener("click", function (event) {
		event.preventDefault();
		addBook();
	});

	inputSearchBook.addEventListener("keyup", function (event) {
		event.preventDefault();
		searchBook();
	});

	inputSearchBook.addEventListener("click", function (event) {
		event.preventDefault();
		searchBook();
	});

	if (isStorageExist()) {
		loadDataFromStorage();
	}
});

document.addEventListener("ondatasaved", () => {
	console.log("Buku berhasil disimpan.");
});

document.addEventListener("ondataloaded", () => {
	refresh();
});
