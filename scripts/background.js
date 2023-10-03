let keywords;

chrome.runtime.onInstalled.addListener(() => {
    console.log('Chrome Extenstion Installed Successfully')
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    keywords = message.action
});

