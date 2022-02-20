/**
 * popup.js handles the populating of values in the popup dialog 
 */

// Update the relevant fields with the new data.
const setDOMInfo = info => {
    webpage = info.webpage;
    console.log("Webpage from popup ", webpage);
    // Read data from local storage
    chrome.storage.local.get([webpage], function (result) {
        console.log("Score: ", result[webpage]["score"]);
        document.getElementById("number").innerHTML = result[webpage]["score"];
        if (result[webpage].hasOwnProperty("hibp")) {
            document.getElementById("breaches").innerHTML = result[webpage]["hibp"]["BreachDate"];
            document.getElementById("c-accounts").innerHTML = result[webpage]["hibp"]["PwnCount"];
            document.getElementById("c-data").innerHTML = result[webpage]["hibp"]["DataClasses"];
            document.getElementById("spam").innerHTML = result[webpage]["hibp"]["IsSpamList"];
            document.getElementById("malware").innerHTML = result[webpage]["hibp"]["IsMalware"];
        }
        if (result[webpage].hasOwnProperty("recent_news")) {
            if (result[webpage]["recent_news"].hasOwnProperty("articles")) {
                const articles = result[webpage]["recent_news"]["articles"]
                if (articles.length > 0) {
                    var title1 = result[webpage]["recent_news"]["articles"][0]["title"];
                    var url1 = result[webpage]["recent_news"]["articles"][0]["url"];
                    var a1 = document.createElement('a');
                    a1.setAttribute('href',url1);
                    a1.innerHTML = title1;
                    document.getElementById("news1").append(a1);
                }
                if (articles.length > 1) {
                    var title2 = result[webpage]["recent_news"]["articles"][1]["title"];
                    var url2 = result[webpage]["recent_news"]["articles"][1]["url"];
                    var a2 = document.createElement('a');
                    a2.setAttribute('href',url2);
                    a2.innerHTML = title2;
                    document.getElementById("news2").append(a2);
                }
            }
            
        }
    });
};

// Add a listener when the popup's DOM loads
window.addEventListener('DOMContentLoaded', () => {
    // ...query for the active tab...
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, tabs => {
        // ...and send a request for the DOM info...
        chrome.tabs.sendMessage(
            tabs[0].id,
            {from: 'popup', subject: 'DOMInfo'},
            // ...also specifying a callback to be called 
            //    from the receiving end (content script).
            setDOMInfo);
    });
});