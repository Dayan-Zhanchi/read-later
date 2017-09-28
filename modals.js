var deleteAllModal = document.getElementById('deleteAllModal');
var deleteAllBtn = document.getElementById('trashcanIcon');
var closeDeleteModalBtn = document.getElementById('closeDeleteModal');

var addItemModal = document.getElementById('addItemModal');
var addItemBtn = document.getElementById('bookmarkIcon');
var closeAddItemBtn = document.getElementById('closeAddItemModal');

deleteAllBtn.onclick = function() {
    deleteAllModal.style.display = 'block';
};

addItemBtn.onclick = function() {
    addItemModal.style.display = 'block';
};

closeDeleteModalBtn.onclick = function() {
  deleteAllModal.style.display = 'none';
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
