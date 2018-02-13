
// This file handles the logic for adding, removing and rendering list items correctly


// Get the template for list items
var listItemTemplate = document.getElementById('listItem-template');

// Store all label images in array so that functions can later randomly select a label
var labelArray = ['label blue.png', 'label green.png', 'label purple.png', 'label red.png', 'label yellow.png'];

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
                if (obj.url === url) {
                    flag = true;
                }
            }

            if(!flag){
                var date = new Date();
                var dateTime = date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear();
                callback(title, url, dateTime, true);
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
 *
 * @param objects
 * @returns {string}
 */
function getLabelOfLastItem(objects){
    // The last item label in the list
    var lastItemLabel = null;
    // Get the label of the last list item
    for(var key in objects){
        if(!objects.hasOwnProperty(key))
            continue;
        lastItemLabel = objects[key].label;
    }
    return lastItemLabel;
}

/**
 * Makes it so that the list item aligns well with other list items that have screenshots as pics instead
 * of color labels
 *
 * @param labelNode - A NodeList object, representing the first element that matches the specified CSS selector(s)
 * in this case the image element for displaying the label
 */
function setLabelNodeProps(labelNode){
    labelNode.style.width = '49px';
    labelNode.style.height = '30px';
    labelNode.style.marginRight = '31px';
}

/**
 *
 * @param lastItemLabel - The label of the last item from the list container
 * @returns {string}
 */
function generateLabel(lastItemLabel){
    // Generate a new random label that is not the same color as the label of the last list item
    var currentRandomNum = Math.floor(Math.random() * (labelArray.length));
    // Check if last item label really was a label and not a thumbnail
    if(lastItemLabel != null && lastItemLabel.indexOf('label') >= 0){
        while(labelArray.indexOf(lastItemLabel) === currentRandomNum){
            currentRandomNum = Math.floor(Math.random() * (labelArray.length));
        }
    }
    return labelArray[currentRandomNum];
}

/**
 *
 * @param title
 * @returns {string}
 */
function shortenTitle(title){
    // Flag to check if we have shortened the title
    var flag = false;
    for(var i=0; i<title.trim().split(" ").length; i++){
        if(title.trim().split(" ")[i].length > 17){
            title = title.substring(0,17) + '...';
            flag = true;
        }
    }
    // 100 characters corresponds approximately to 4 rows at most
    if(!flag && title.replace(/ /g, "").length > 100){
        title = title.substring(0,100) + '...';
    }

    return title;
}

/**
 * Render the reading items to the view that is the list container
 *
 * @param {string} title - Title of tab
 * @param {string} url - Url of the tab
 * @param {string} timeStamp - Time the item was added
 * @param {string} label - Label to load for the list item
 * @param {string} id - The ID for the list item
 */
function renderItems(title, url, timeStamp, label, id){
    // The use of chrome.storage is because we want to extract all the objects and later
    // get information on what the label of the last item was
    chrome.storage.local.get(null, function(objects){
        // Clone the list item template so the function doesn't overwrite the original template
        var listItem = listItemTemplate.content.cloneNode(true);

        // Set the id of the list item
        listItem.querySelector('.listItems').setAttribute('id', id);

        var labelOfLastItem = getLabelOfLastItem(objects);

        // Set the label of the list item
        if(label.indexOf('label') >= 0) {
            var labelNode = listItem.querySelector('.label');
            setLabelNodeProps(labelNode);
            labelNode.src = './assets/' + label;
        }
        else{
            listItem.querySelector('.label').src = label;
        }
        // Fallback on the picture labels if the current label somehow is broken
        listItem.querySelector('.label').onerror = function() {
            var labelNode = listItem.querySelector('.label');
            setLabelNodeProps(labelNode);
            labelNode.src = './assets/' + generateLabel(labelOfLastItem);
        };

        var titleOfArticleNode = listItem.querySelector('.titleOfArticle');
        title = shortenTitle(title);
        // Set the title of the current tab
        titleOfArticleNode.innerHTML = title;
        // Set title with title value to make text tooltip appear when hovering over text
        titleOfArticleNode.setAttribute('title', title);

        // Make title of list item clickable so it can redirect user to the url
        titleOfArticleNode.addEventListener('click', function(){
            window.open(url,'_blank');
        });

        // Set the time of when adding the article
        listItem.querySelector('.timeStamp').innerHTML = timeStamp;

        // Add click event to delete list item
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
        document.getElementById('list-container').appendChild(listItem);
    });
}

/**
 * Add reading items to list Item and render it
 *
 * @param {string} title - Title of tab
 * @param {string} url - Url of the tab
 * @param {string} timeStamp - Time the item was added
 * @param {boolean} isScreenShot - To generate label or not generate label
 */
function addNewItem(title, url, timeStamp, isScreenShot){
    // The use of chrome.storage is because we want to extract all the objects and later
    // get information on what the label of the last item was
    chrome.storage.local.get(null, function(objects) {
        chrome.tabs.captureVisibleTab(function (dataUrl) {
            // Get current date since 1 January 1970 00:00:00 UTC in milliseconds
            var id = Date.now().toString();
            var label;
            if (isScreenShot) {
                label = dataUrl;
            }
            else {
                var labelOfLastItem = getLabelOfLastItem(objects);
                label = generateLabel(labelOfLastItem);
            }

            // Set the ID of the new list item
            // and store the new item locally in the computer to make it persistent
            var dataObj = {};
            dataObj[id] = {
                'title': title,
                'url': url,
                'date': timeStamp,
                'label': label
            };
            chrome.storage.local.set(dataObj, function () {
                updateNumberOfListItems();
                // Notify that we saved.
                // Modal should appear in the page action rather than in browser action
                console.log('Settings saved');
            });
            // Render the items to the DOM
            renderItems(title, url, timeStamp, label, id);
        });
    });
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
            renderItems(obj.title, obj.url, obj.date, obj.label, key);
        }
        updateNumberOfListItems();
    });
});

// Listen for command to add reading item
chrome.commands.onCommand.addListener(function(command) {
    if(command === 'toggle-feature-addItem'){
        getCurrentTabUrl(addNewItem);
    }
});