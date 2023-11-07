chrome.runtime.onInstalled.addListener(() => {
  console.log('Chrome Extenstion Installed Successfully');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  let popMessage = message.action;
  if (popMessage === 'disable') {
    sendMessage('disable');
  } else if (popMessage === 'enable') {
    sendMessage('enable');
  }
  // Sending a response back
  sendResponse({
    status: 'success',
    data: 'Status Message received and processed',
  });

  // Indicate that the response will be sent asynchronously
  return true;
});

function sendMessage(message) {
  // // Some logic or event triggers the message sending
  // URLs to match
  const urlsToMatch = ['*://twitter.com/*', '*://x.com/*'];

  // Query for all tabs with the specified URLs
  chrome.tabs.query({ url: urlsToMatch }, function (tabs) {
    tabs.forEach(function (tab) {
      // Send a message to each matching tab
      chrome.tabs.sendMessage(
        tab.id,
        { message: message },
        function (response) {
          if (response && response.reply) {
            console.log(response.reply);
          }
        }
      );
    });
  });
}
