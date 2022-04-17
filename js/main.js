//Dom element HTML
let elForm = document.querySelector('#form')
let elInput = document.querySelector('#form-input')
let elCountBooks = document.querySelector('.count-books')
let elNewestButton = document.querySelector('#newest-button')
let elBookmarkList = document.querySelector('#bookmark-list')
let elBookList = document.querySelector('#books-list')
let elBookmarkButton = document.querySelector('#bookmark-button');
let elBookModal = document.querySelector('.book-modal')

let elTemplateBooks = document.querySelector('#template-books').content
let elTemplateBookmark = document.querySelector('#template-bookmark').content

let data = {}

// Render books

function renderBooks(data, wrapper) {
    wrapper.innerHTML = null;
    
    let booksFragment = document.createDocumentFragment()
    data?.items?.forEach(item => {
        let bookTemplate = elTemplateBooks.cloneNode(true);
        
        bookTemplate.querySelector('#book-img').src = item?.volumeInfo?.imageLinks?.thumbnail
        bookTemplate.querySelector('.book-title').textContent = item?.volumeInfo?.title
        bookTemplate.querySelector('#autor-book').textContent = item?.volumeInfo?.authors
        bookTemplate.querySelector('#year-book').textContent = item?.volumeInfo?.publishedDate
        bookTemplate.querySelector('#bookmark-btn').dataset.bookId = item?.id
        bookTemplate.querySelector('#modal-open-btn').dataset.bookIdModal = item?.id;
        bookTemplate.querySelector('#read-book').href = item?.volumeInfo?.previewLink
        
        booksFragment.appendChild(bookTemplate)
    })
    
    wrapper.appendChild(booksFragment)
    elCountBooks.textContent = data.totalItems;
    
    if (data.totalItems == 0) {
        elBookList.textContent = 'No movies found'
    }
}

;(async function() {
    let responce = await fetch(`https://www.googleapis.com/books/v1/volumes?q=javascript&maxResults=15`);
    data = await responce.json();
    renderBooks(data, elBookList)
})();

//Search books

elForm.addEventListener("input", function(evt) {
    evt.preventDefault()
    
    let inValue = elInput.value.trim()
    
    let pattern = new RegExp(inValue, "gi")
    
    ;(async function() {
        let responce = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${pattern}&maxResults=15`);
        data = await responce.json();
        renderBooks(data, elBookList)
    })();
    
})

// Newest button sort year
elNewestButton.addEventListener("click", function(evt) {
    evt.preventDefault()
    
    let inValue = elInput.value.trim()
    
    let pattern = new RegExp(inValue, "gi") || 'No movies found'
    
    ;(async function() {
        let responce = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${pattern}&orderBy=newest`);
        data = await responce.json();
        renderBooks(data, elBookList)
    })();
    
})

//Bookmark render and local storage

let storage = window.localStorage;

let bookmarkedBooks = JSON.parse(storage.getItem('bookMarked')) || []

elBookList.addEventListener('click', evt => {
    let booksId = evt.target.dataset.bookId;
    
    if (booksId) {
        let foundBook = data.items.find( item => item.id == booksId)
        
        let doesInclude = bookmarkedBooks.findIndex(item => item.id === foundBook.id)
        
        if (doesInclude === -1) {
            bookmarkedBooks.push(foundBook)
            storage.setItem('bookMarked', JSON.stringify(bookmarkedBooks))
            renderBookmarked(bookmarkedBooks, elBookmarkList)
        }
    }
})

// renderBookmarked books

function renderBookmarked(array, wrapper) {
    wrapper.innerHTML = null
    let elFragment = document.createDocumentFragment();
    
    array.forEach(item => {
        let elBookmarkTemplate = elTemplateBookmark.cloneNode(true)
        
        elBookmarkTemplate.querySelector('.bookmark-title').textContent = item.volumeInfo.title;
        elBookmarkTemplate.querySelector('.bookmark-autor').textContent = item.volumeInfo.authors;
        elBookmarkTemplate.querySelector('.read-button').href = item.volumeInfo.previewLink;
        elBookmarkTemplate.querySelector('.del-button').dataset.markedId = item.id
        elBookmarkTemplate.querySelector('.del-button').dataset.markedID = item.etag
        
        elFragment.appendChild(elBookmarkTemplate)
    })
    
    wrapper.appendChild(elFragment)
}

renderBookmarked(bookmarkedBooks, elBookmarkList)

// Bookmarklist remove
elBookmarkList.addEventListener('click', evt => {
    let removeBookId = evt.target.dataset.markedId
    
    if (removeBookId) {
        let indexOfBookmark = bookmarkedBooks.findIndex(item => {
            return item.id == removeBookId
        })
        bookmarkedBooks.splice(indexOfBookmark, 1)
        storage.setItem('bookMarked', JSON.stringify(bookmarkedBooks))
        renderBookmarked(bookmarkedBooks, elBookmarkList)
    }
})

// Modal books

elBookList.addEventListener('click', evt => {
    let moreInfoBook = evt.target.dataset.bookIdModal
    
    if (moreInfoBook) {
        let foundBook = data.items.find( item => item.id == moreInfoBook)
        elBookModal.querySelector('.book-modal-img').src = foundBook.volumeInfo.imageLinks.thumbnail
        elBookModal.querySelector('.book-modal-title').textContent = foundBook.volumeInfo.title
        elBookModal.querySelector('.book-modal-text').textContent = foundBook.volumeInfo?.description
        elBookModal.querySelector('.book-author').textContent = foundBook.volumeInfo?.authors
        elBookModal.querySelector('.book-published').textContent = foundBook.volumeInfo?.publishedDate
        elBookModal.querySelector('.book-publishers').textContent = foundBook.volumeInfo?.publisher;
        elBookModal.querySelector('.book-category').textContent = foundBook.volumeInfo?.categories;
        elBookModal.querySelector('.book-page').textContent = foundBook.volumeInfo?.pageCount;
        elBookModal.querySelector('.reading-book').href = foundBook.volumeInfo?.previewLink;
    }
})
