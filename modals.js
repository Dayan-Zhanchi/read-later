var listItemContainer = document.getElementById('list-container');
var numberOfItemsText = document.getElementById('numberOfItemsText');

// Retrieve all the necessary elements in the delete modal
var deleteAllModal = document.getElementById('deleteAllModal');
var openDeleteAllBtn = document.getElementById('trashcanIcon');
var deleteCancelBtn = document.getElementById('delete-cancel-btn');
var deleteOkBtn = document.getElementById('ok-btn');
var closeDeleteModalBtn = document.getElementById('closeDeleteModal');

// Retrieve all the necessary elements in the add modal
var addItemModal = document.getElementById('addItemModal');
var openAddItemBtn = document.getElementById('bookmarkIcon');
var addCancelBtn = document.getElementById('add-cancel-btn');
var addItemBtn = document.getElementById('add-btn');
var closeAddItemBtn = document.getElementById('closeAddItemModal');

// Set the add button in add item modal to disabled and only activate when all the fields have been filled
addItemBtn.disabled = true;


openDeleteAllBtn.onclick = function() {
    deleteAllModal.style.display = 'block';
};

deleteCancelBtn.onclick = function() {
    deleteAllModal.style.display = 'none';
};

deleteOkBtn.onclick = function() {
    chrome.storage.local.clear(function() {
        listItemContainer.innerHTML = '';
        numberOfItemsText.innerHTML = 'You have ' + 0 +
            ' items to read';
        deleteAllModal.style.display = 'none';
    });
};

closeDeleteModalBtn.onclick = function() {
    deleteAllModal.style.display = 'none';
};

openAddItemBtn.onclick = function() {
    addItemModal.style.display = 'block';
};

addCancelBtn.onclick = function() {
    addItemModal.style.display = 'none';
};



closeAddItemBtn.onclick = function() {
    addItemModal.style.display = 'none';
};

// When user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target === deleteAllModal) {
        deleteAllModal.style.display = 'none';
    }
    else if(event.target === addItemModal) {
        addItemModal.style.display = 'none';
    }
};
