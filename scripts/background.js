let keywords;

chrome.runtime.onInstalled.addListener(() => {
    console.log('Chrome Extenstion Installed Successfully')
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    keywords = message.action
        // Sending a response back
        sendResponse({ status: 'success', data: 'Keywords received and processed' });

        // Indicate that the response will be sent asynchronously
        return true;
});

