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
var inputTitle = document.getElementById('ititle');
var inputURL = document.getElementById('url');

// Set the add button in add item modal to disabled and only activate when all the fields have been filled


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

if(inputTitle.value.length !==0 && inputURL.value.length !==0){
    addItemBtn.disabled = false;
}

// Retrieve the input and create a new list item
addItemBtn.onclick = function() {
    /*var urlPattern = new RegExp('^(https?:\/\/)?'+ // protocol
        '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|'+ // domain name
        '((\d{1,3}\.){3}\d{1,3}))'+ // OR ip (v4) address
        '(\:\d+)?(\/[-a-z\d%_.~+]*)*'+ // port and path
        '(\?[;&a-z\d%_.~+=-]*)?'+ // query string
        '(\#[-a-z\d_]*)?$' + 'i'); // fragment locater*/

    if(/\S/.test(inputTitle.value) && /\S/.test(inputURL.value)){
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
                if (obj.title === title && obj.url === url) {
                    flag = true;
                }
            }

            if(!flag){
                addNewItem(title, url, '4.45 AM');
                inputTitle.value = '';
                inputURL.value = '';
                addItemModal.style.display = 'none';
            }
            else{
                // A Modal should appear to inform user
                console.log('Can\'t add an already existing item to list');
            }
        });
    }
    else{
        if(!(/\S/.test(inputTitle.value))){
            inputTitle.focus();
        }
        else if(!(/\S/.test(inputURL.value))){
            inputURL.focus();
        }
        addItemBtn.blur();
    }
};




