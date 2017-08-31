/*
 TODO Add date
 TODO Use firebase to store maybe
 TODO Add thumbnail
 TODO Add settings
 TODO Make bookmark icon clickable to add list items
 TODO Add remove icon to list items
 TODO Add modal to respond to user action when adding the same item
 TODO Fix text dynamically "You have x items to read"
 */



// Get the template for list items
var listItemTemplate = document.getElementById('listItem-template');

// Store all label images in array so that functions can later randomly select a label
var imagesArray = ['label blue.png', 'label green.png', 'label purple.png', 'label red.png', 'label yellow.png'];

// Keep track of previous randomly generated number
// Start with a number that is larger than the amount of labels just to guarantee that
// the first label can be one of the labels in the imagesArray
var prevRandomNum = 100;

/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
    // Query filter to be passed to chrome.tabs.query - see
    // https://developer.chrome.com/extensions/tabs#method-query
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    // A flag to check if item already exists in the storage
    var flag = false;

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
        chrome.storage.local.get(null, function(objects){
            // Check to see if items key exist
            // If not exist then storage is empty
            if(objects.hasOwnProperty('items')) {
                while(item in objects.items) {
                    if (item.title === url && item.url === title) {
                        flag = true;
                    }
                }

                if(!flag){
                    callback(title, url, '4.45 AM', true);
                }
                else{
                    // This should instead invoke a modal to alert the user
                    console.log("You can't add the same item");
                }
            }
            else{
                callback(title, url, '4.45 AM', true);
            }
        });
    });

    // Most methods of the Chrome extension APIs are asynchronous. This means that
    // you CANNOT do something like this:
    //
    // var url;
    // chrome.tabs.query(queryInfo, function(tabs) {
    //   url = tabs[0].url;
    // });
    // alert(url); // Shows "undefined", because chrome.tabs.query is async.
}

/**
 * Add reading items to listItem
 *
 * @param {string} title - Title of tab
 * @param {string} url - Url of the tab
 * @param {string} timeStamp - Time the item was added
 */
function addItem(title, url, timeStamp, toStore){
    // Clone the list item template so the function doesn't overwrite the original template
    var listItem = listItemTemplate.content.cloneNode(true);
    var date = Date.now().toString();
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

    // Set ID to listItem
    listItem.querySelector('.listItems').setAttribute('id', date);

    // Set the thumbnail of current tab
    // Make sure that no labels can be of the same color consecutively
    //chrome.tabs.captureVisibleTab(thumbNailCb);
    var currentRandomNum = Math.floor(Math.random() * (imagesArray.length+1));
    while(prevRandomNum === currentRandomNum){
        currentRandomNum = Math.floor(Math.random() * (imagesArray.length+1));
    }
    prevRandomNum = currentRandomNum;
    listItem.querySelector('.label').src = './assets/' + imagesArray[prevRandomNum];

    // Set the title of the current tab
    // 117 characters corresponds approximately to 5 rows at most
    if(title.length > 117){
        console.log(listItem.querySelector('.titleOfArticle'));
        var titleOfArticleNode = listItem.querySelector('.titleOfArticle');
        titleOfArticleNode.innerHTML = title.substring(0,117) + '...';
        titleOfArticleNode.setAttribute('title', title);
        titleOfArticleNode.setAttribute('onclick', 'location.href = ' + function(){
            location.href = url;
        });
    }
    else {
        console.log(listItem.querySelector('.titleOfArticle'));
        listItem.querySelector('.titleOfArticle').innerHTML = title;
    }

    // Set the time of when adding the article
    listItem.querySelector('.timeStamp').innerHTML = timeStamp;

    // Store the list item locally in the computer
    if(toStore){
        chrome.storage.local.set({'items': {'title': title, 'url': url}}, function() {
            // Notify that we saved.
            message('Settings saved');
        });
    }

    // Add the list item to the DOM
    document.getElementById('container').appendChild(listItem);
}

// Listen for command to add reading item
chrome.commands.onCommand.addListener(function(command) {
    if(command === 'toggle-feature-addItem'){
        getCurrentTabUrl(addItem);
    }
});


document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.local.get(null, function(objects){
        if(objects.hasOwnProperty('items')){
            while(item in objects.items){
                addItem(item.title, item.url, '4.45 AM', false);
            }
        }
    });
});
