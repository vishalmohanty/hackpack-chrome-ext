/** File: background.js
 * This handles the messages from page loads coming from content.js
 s*/    
//  setInterval( function() { get_score(JSON); }, 30);

function get_score(json_obj) {
    let score = 100;

    if (json_obj.hasOwnProperty("hibp") && json_obj["hibp"] !== undefined) {
        var hibp = json_obj["hibp"]
        if (hibp.hasOwnProperty("IsMalware") && hibp["IsMalware"]) {
            score -= 30;
        } 
        if (hibp.hasOwnProperty("IsSpam") && hibp["IsSpam"]) {
            score -= 5;
        }
        if (hibp.hasOwnProperty('DataClasses')) {
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
                score -= 3;
            }
            if (hibp['DataClasses'].includes('Dates of birth')) {
                score -= 1;
            }
            if (hibp['DataClasses'].includes('IP addresses')) {
                score -= 2;
            }
            if (hibp['DataClasses'].includes('Phone numbers')) {
                score -= 3;
            }
            if (hibp['DataClasses'].includes('Physical addresses')) {
                score -= 10;
            }
            if (hibp['DataClasses'].includes('Names')) {
                score -= 1;
            }
        }
    } 

    return score;
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
            const news_api_key = '7d0dc6f2545140938ba2881e762b24a5';
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
                console.log('dataFromPromise1 ', dataFromPromise1, ' dataFromPromise2 ', dataFromPromise2);
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