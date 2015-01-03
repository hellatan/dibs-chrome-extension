/**
 * User: daletan
 * Date: 1/2/15
 * Time: 4:54 PM
 * Copyright 1stdibs.com, Inc. 2015. All Rights Reserved.
 */

function convertToArray(obj) {
    return [].map.call(obj, function(element) {
        return element;
    })
}

// Saves options to chrome.storage
function saveOptions() {
    var jiraDomain = document.getElementById('jiraDomainInput').value;
    var defaultTab = convertToArray(document.querySelectorAll('input[name=formDefaultTab]'));
    defaultTab = defaultTab.filter(function (element) {
        return !!element.checked;
    });
    chrome.storage.sync.set({
        jiraDomain: jiraDomain,
        defaultTab: defaultTab.length ? defaultTab[0].value : ''
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        jiraDomain: '',
        defaultTab: ''
    }, function(items) {
        document.getElementById('jiraDomainInput').value = items.jiraDomain;
        var defaultTab = convertToArray(document.querySelectorAll('input[name=formDefaultTab]'));
        defaultTab.forEach(function (element) {
            if (element.value === items.defaultTab) {
                element.checked = true;
            }
        });
    });
}
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
