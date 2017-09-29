var deleteAllModal = document.getElementById('deleteAllModal');
var deleteAllBtn = document.getElementById('trashcanIcon');
var deleteCancelBtn = document.getElementById('cancel-btn');
var deleteOkBtn = document.getElementById('ok-btn');
var closeDeleteModalBtn = document.getElementById('closeDeleteModal');

var addItemModal = document.getElementById('addItemModal');
var addItemBtn = document.getElementById('bookmarkIcon');
var closeAddItemBtn = document.getElementById('closeAddItemModal');

deleteAllBtn.onclick = function() {
    deleteAllModal.style.display = 'block';
};

deleteCancelBtn.onclick = function() {
    deleteAllModal.style.display = 'none';
};

deleteOkBtn.onclick = function() {
    chrome.storage.local.clear(function() {
        deleteAllModal.style.display = 'none';
    });
};

closeDeleteModalBtn.onclick = function() {
    deleteAllModal.style.display = 'none';
};

addItemBtn.onclick = function() {
    addItemModal.style.display = 'block';
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
