/** File: background.js
 * This handles the messages from page loads coming from content.js
 */

function get_score(json_obj) {
    var score = 100
    if (json_obj.hasOwnProperty('hibp')) {
        var hibp = json_obj['hibp']
        if (hibp['IsMalware']) {
            score -= 30;
        }
        if (hibp['IsSpam']) {
            score -= 5;
        }
        if (hibp['DataClasses'].includes('Passwords')) {
            score -= 20;
        }
        if (hibp['DataClasses'].includes('Usernames')) {
            score -= 5;
        }
        if (hibp['DataClasses'].includes('Password hints')) {
            score -= 10;
        }
        if (hibp['DataClasses'].includes('Email addresses')) {
            score -= 2;
        }
    }
    return score
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Reached background');
    const webpage = request.webpage;

    chrome.storage.local.get(webpage, function(data) {
        if (data[webpage] !== undefined) {
            console.log('Found data in storage')
            sendResponse(data[webpage])
        } else {
            console.log('Did not find data in storage')
            // Get breach information from haveibeenpwned
            const url = 'https://haveibeenpwned.com/api/v3/' + request.service + '/' + webpage;
            const promise1 = fetch(url, {
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .catch(error => console.log('Error:', error));

            // Get news articles by searching "webpage breach"
            const news_api_key = 'a9d2c1e7fba74c8db7d7c2a23c10aa9e';
            const news_url = 'https://newsapi.org/v2/everything?q=' + webpage + '%20breach&apiKey=' + news_api_key;
            const promise2 = fetch(news_url, {
                headers: {
                    'Accept': 'application/json'
                }
            })
            .then(response => response.json())
            .catch(error => console.log('Error:', error));

            Promise.all([promise1, promise2]).then(data => {
                const dataFromPromise1 = data[0];
                const dataFromPromise2 = data[1];
                console.log(dataFromPromise1);
                console.log(dataFromPromise2);
                const json_obj = {
                    "hibp": dataFromPromise1,
                    "recent_news": dataFromPromise2,
                };
                const score = get_score(json_obj)
                json_obj["score"] = score
                var obj = {}
                obj[webpage] = json_obj
                chrome.storage.local.set(obj, function(){
                    console.log("Added to storage: ", obj)
                });
                sendResponse(json_obj);
            });
        }
    })
    
    return true;
});