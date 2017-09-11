/*
 TODO Add date
 TODO Add thumbnail
 TODO Add settings
 TODO Make bookmark icon clickable to add list items
 TODO Add modals to respond to user action when adding the same item or adding item
 TODO Fix timestamp
 TODO Still need to fix so that no two labels can be of the same color consecutively
 */

// Get the template for list items
var listItemTemplate = document.getElementById('listItem-template');

// Store all label images in array so that functions can later randomly select a label
var imagesArray = ['label blue.png', 'label green.png', 'label purple.png', 'label red.png', 'label yellow.png'];

// Keep track of previous randomly generated number
// Start with a number that is larger than the amount of labels just to guarantee that
// the first label can be one of the labels in the imagesArray
var prevRandomNum = 100;


// Update number of list items
function updateNumberOfListItems(){
    chrome.storage.local.get(null, function(objects) {
        // Keep track of how many list items there are
        var count = 0;
        for (var key in objects) {
            // skip loop if the property is from prototype
            if (!objects.hasOwnProperty(key))
                continue;

            count++;
        }
        document.getElementById('numberOfItemsText').innerHTML = 'You have ' + count +
            ' items to read';
    });
}

/**
 * Get the current URL.
 *
 * @param {function(string, string, string)} callback - called when the URL and title of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function(tabs) {
        // chrome.tabs.query invokes the callback with a list of tabs that match the
        // query. When the popup is opened, there is certainly a window and at least
        // one tab, so we can safely assume that |tabs| is a non-empty array.
        // A window can only have one active tab at a time, so the array consists of
        // exactly one tab.
        var tab = tabs[0];

        // A tab is a plain object that provides information about the tab.
        // See https://developer.chrome.com/extensions/tabs#type-Tab
        var url = tab.url;

        // Get title of the current tab
        var title = tab.title;

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
                callback(title, url, '4.45 AM', true, '', '');
            }
            else{
                // A Modal should appear to inform user
                console.log('Can\'t add an already existing item to list');
            }
        });

        // Most methods of the Chrome extension APIs are asynchronous. This means that
        // you CANNOT do something like this:
        //
        // var url;
        // chrome.tabs.query(queryInfo, function(tabs) {
        //   url = tabs[0].url;
        // });
        // alert(url); // Shows "undefined", because chrome.tabs.query is async.
    });
}

/**
 * Add reading items to listItem
 *
 * @param {string} title - Title of tab
 * @param {string} url - Url of the tab
 * @param {string} timeStamp - Time the item was added
 * @param {boolean} toStore - Boolean to store or not to store list item
 * @param {string} label - Label to load for the list item
 * @param {string} key - The ID for the listitem
 */
function addItem(title, url, timeStamp, toStore, label, key){
    // The id of the listitem
    var id;
    // Clone the list item template so the function doesn't overwrite the original template
    var listItem = listItemTemplate.content.cloneNode(true);

    // Check if the id already exists
    // if not then generate a new id
    if(key !== ''){
        id = key;
    }
    else{
        // Get current date since 1 January 1970 00:00:00 UTC in milliseconds
        id = Date.now().toString();
    }

    /*var thumbNailCb = function(dataUrl){
        if(dataUrl === null || dataUrl === ''){
            var randomNum = Math.floor(Math.random() * (imagesArray.length+1));
            listItem.querySelector('.label').src = './assets/' + imagesArray[randomNum];
        }
        else {
            console.log(listItem.querySelector('.label'));
            var randomNum = Math.floor(Math.random() * (imagesArray.length+1));
            listItem.querySelector('.label').src = './assets/' + imagesArray[randomNum];
            //listItem.querySelector('.label').src = dataUrl;
        }
    };*/

    // Set the id of the listitem
    listItem.querySelector('.listItems').setAttribute('id', id);


    // Set the thumbnail of current tab
    // Make sure that no labels can be of the same color consecutively
    //chrome.tabs.captureVisibleTab(thumbNailCb);
    var currentRandomNum = Math.floor(Math.random() * (imagesArray.length));
    while(prevRandomNum === currentRandomNum){
        currentRandomNum = Math.floor(Math.random() * (imagesArray.length));
    }
    prevRandomNum = currentRandomNum;
    var tempLabel = imagesArray[currentRandomNum];
    // Check whether to load the label from storage or set a new random label
    if(label !== ''){
        listItem.querySelector('.label').src = './assets/' + label;
    }
    else {
        listItem.querySelector('.label').src = './assets/' + tempLabel;
    }

    // Set the title of the current tab
    // 117 characters corresponds approximately to 5 rows at most
    var titleOfArticleNode = listItem.querySelector('.titleOfArticle');
    if(title.length > 117){
        titleOfArticleNode.innerHTML = title.substring(0,117) + '...';
        titleOfArticleNode.setAttribute('title', title);
    }
    else {
        titleOfArticleNode.innerHTML = title;
    }
    // Make title of list item clickable so it can redirect user to the url
    titleOfArticleNode.addEventListener('click', function(){
        window.open(url,'_blank');
    });

    // Set the time of when adding the article
    listItem.querySelector('.timeStamp').innerHTML = timeStamp;


    // This conditional statement will only be executed when the user
    // is adding a new item
    // Set the ID of the new listitem
    // and store the new item locally in the computer to make it persistent
    if(toStore){
        // Set ID to listItem
        listItem.querySelector('.listItems').setAttribute('id', id);
        var dataObj = {};
        dataObj[id] = {
            'title': title,
            'url': url,
            'label': tempLabel};
        chrome.storage.local.set(dataObj, function() {
            // Notify that we saved.
            // Modal should appear in the page action rather than in browser action
            console.log('Settings saved');
        });
        updateNumberOfListItems();
    }

    // Add click event to delete listitem
    listItem.querySelector('.deleteIcon').addEventListener('click', function(){
        var listElement = document.getElementById(id);
        listElement.parentNode.removeChild(listElement);
        chrome.storage.local.remove(id, function(){
            // Notify that successfully removed
            console.log('Deletion successful!');
            updateNumberOfListItems();
        });
    });

    // Add the list item to the DOM
    document.getElementById('container').appendChild(listItem);
}

// Listen for when html content has been loaded to render list items
document.addEventListener('DOMContentLoaded', function() {
    // Render all stored list items to the DOM
    chrome.storage.local.get(null, function(objects){
        for(var key in objects){
            // Skip loop if the property is from prototype
            if(!objects.hasOwnProperty(key))
                continue;

            var obj = objects[key];
            addItem(obj.title, obj.url, '4.45 AM', false, obj.label, key);
        }
        updateNumberOfListItems();
    });
});

// Listen for command to add reading item
chrome.commands.onCommand.addListener(function(command) {
    if(command === 'toggle-feature-addItem'){
        getCurrentTabUrl(addItem);
    }
});