/* File: content.js
 * ---------------
 * Hello! You'll be making most of your changes
 * in this file. At a high level, this code replaces
 * the substring "cal" with the string "butt" on web pages.
 *
 * This file contains javascript code that is executed
 * everytime a webpage loads over HTTP or HTTPS.
 */
String.prototype.rsplit = function(sep, maxsplit) {
    var split = this.split(sep);
    return maxsplit ? [ split.slice(0, -maxsplit).join(sep) ].concat(split.slice(-maxsplit)) : split;
}

function handle_page_load() {
    var service='breach'
    var webpage=window.location.hostname.rsplit(".", 2)[1]
    chrome.runtime.sendMessage({service: service, webpage: webpage}, (response) => {
        if (response != undefined && response != "") {
            console.log(response);
        }
    });
}
window.addEventListener('load', handle_page_load);