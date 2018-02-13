// This file handles the logic for modals, that is both the delete all modal and the add item list modal


// Retrieve the list container, containing all the list items
var listItemContainer = document.getElementById('list-container');
// Retrieve the text that displays the number of items
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
// Retrieve the input forms, title and url in the add modal
var inputTitle = document.getElementById('ititle');
var inputURL = document.getElementById('url');


// All click events for the delete modal

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


// All the click events for the add item modal

openAddItemBtn.onclick = function() {
    addItemModal.style.display = 'block';
};

addCancelBtn.onclick = function() {
    addItemModal.style.display = 'none';
};

closeAddItemBtn.onclick = function() {
    inputTitle.value = '';
    inputURL.value = '';
    addItemModal.style.display = 'none';
};

// When user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target === deleteAllModal) {
        deleteAllModal.style.display = 'none';
    }
    else if(event.target === addItemModal) {
        inputTitle.value = '';
        inputURL.value = '';
        addItemModal.style.display = 'none';
    }
};

// Retrieve the input and create a new list item
addItemBtn.onclick = function() {
    var date = new Date();
    var dateTime = date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear();
    // Create a naive regex pattern for verification of valid urls
    var urlPattern = new RegExp('^(http:\\/\\/www\\.|https:\\/\\/www\\.|http:\\/\\/|https:\\/\\/)?[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\\.[a-z]{2,5}(:[0-9]{1,5})?(\\/.*)?$');

    // Check for either non-white space characters and valid url
    if(/\S/.test(inputTitle.value) && urlPattern.test(inputURL.value)){
        var title = document.querySelector('#ititle').value;
        var url = document.querySelector('#url').value;

        // Checking if the item to be added already exists in the storage
        chrome.storage.local.get(null, function (objects) {
            // Flag to check if item exists
            var flag = false;
            // Check to see if items key exist
            // If not exist then storage is empty
            for (key in objects) {
                if (!objects.hasOwnProperty(key))
                    continue;

                var obj = objects[key];
                // Flag set to true if the item already exists
                if (obj.url === url) {
                    flag = true;
                }
            }

            // If the item does not exist, then add it to the list
            if(!flag){
                addNewItem(title, url, dateTime, false);
                inputTitle.value = '';
                inputURL.value = '';
                addItemModal.style.display = 'none';
            }
            else{
                addItemBtn.blur();
                // A toaster should appear to inform user
                console.log('Can\'t add an already existing item to list');
            }
        });
    }
    else{
        if(!(/\S/.test(inputTitle.value))){
            inputTitle.focus();
        }
        else if(!(/\S/.test(inputURL.value)) || !urlPattern.test(inputURL.value)){
            inputURL.focus();
        }
        addItemBtn.blur();
    }
};