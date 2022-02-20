/** File: background.js
 * This handles the messages from page loads coming from content.js
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Reached background');

    // Get breach information from haveibeenpwned
    url = 'https://haveibeenpwned.com/api/v3/' + request.service + '/' + request.webpage;
    const promise1 = fetch(url, {
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .catch(error => console.log('Error:', error));

    // Get news articles by searching "webpage breach"
    news_api_key = 'a9d2c1e7fba74c8db7d7c2a23c10aa9e';
    news_url = 'https://newsapi.org/v2/everything?q=' + request.webpage + '%20breach&apiKey=' + news_api_key;
    const promise2 = fetch(news_url, {
        headers: {
            'Accept': 'application/json'
        }
    })
    .then(response => response.json())
    .catch(error => console.log('Error:', error));

    Promise.all([promise1, promise2]).then(data => {
        const dataFromPromise1 = data[0]
        const dataFromPromise2 = data[1]
        sendResponse({
            hibp: dataFromPromise1,
            recent_news: dataFromPromise2
        })
    })
    
    return true;
});