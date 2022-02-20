/** File: background.js
 * This handles the messages from page loads coming from content.js
 s*/    
 setInterval( function() { get_score(JSON); }, 30);

function get_score(json_obj) {
    let number = document.getElementById("number");
    let score = 100;

    if (json_obj.hasOwnProperty('hibp')) {
        var hibp = json_obj['hibp']
        if (hibp.hasOwnProperty('IsMalware') && hibp['IsMalware'] && score != 0) {
            score -= 30;
            number.innerHTML = score;
      
        } 
        if (hibp.hasOwnProperty('IsSpam') && hibp['IsSpam'] && score != 0) {
            score -= 5;
            number.innerHTML = score;
        }
        if (hibp.hasOwnProperty('DataClasses') && score != 0) {
            if (hibp['DataClasses'].includes('Passwords')) {
                score -= 20;
                number.innerHTML = score;
        
            
            }
            if (hibp['DataClasses'].includes('Usernames')&& score != 0) {
                score -= 5;
                number.innerHTML = score;
           
            
            }
            if (hibp['DataClasses'].includes('Password hints')&& score != 0) {
                score -= 10;
                number.innerHTML = score;
            } 
            if (hibp['DataClasses'].includes('Email addresses')&& score != 0) {
                score -= 2;
                number.innerHTML = score;
                
            }
        }
    } 
    return number.innerHTML = score;
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
            const news_api_key = '43899ab2740f419e87c9eb3f92c1c515';
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