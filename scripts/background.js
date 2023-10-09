
chrome.runtime.onInstalled.addListener(() => {
    console.log('Chrome Extenstion Installed Successfully')
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    let popMessage = message.action
    if(popMessage === 'disable'){
        sendMessage('disable')
    } else if(popMessage === 'enable'){
        sendMessage('enable')
    }
        // Sending a response back
        sendResponse({ status: 'success', data: 'Status Message received and processed' });

        // Indicate that the response will be sent asynchronously
        return true;
});



function sendMessage(message){

    // Some logic or event triggers the message sending
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.sendMessage(activeTab.id, {"message": message}, function(response) {
            if(response && response.reply){
                console.log(response.reply)
            }
        });
    });
}



