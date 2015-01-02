/**
 * User: daletan
 * Date: 1/2/15
 * Time: 4:54 PM
 * Copyright 1stdibs.com, Inc. 2015. All Rights Reserved.
 */

// Saves options to chrome.storage
function save_options() {
    var jiraDomain = document.getElementById('jiraDomainInput').value;
    chrome.storage.sync.set({
        jiraDomain: jiraDomain
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
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
        jiraDomain: ''
    }, function(items) {
        document.getElementById('jiraDomainInput').value = items.jiraDomain;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
