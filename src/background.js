chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Reached background');
    url = 'https://haveibeenpwned.com/api/v3/' + request.service + '/' + request.webpage;
    fetch(url, {
        headers: {
            'Accept': 'application/json'
        //   'apiKey': process.env.HIBP_API_KEY
        }
    })
    .then(response => response.json())
    .then(response => sendResponse(response))
    .catch(error => console.log('Error:', error));
    return true;
});