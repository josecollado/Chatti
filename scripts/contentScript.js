// Ensuring the document is fully loaded before executing any scripts

$(document).ready(() => {
  // Initial check
  checkURL();

  // Listen for URL changes
  $(window).on('popstate', function () {
    checkURL();
  });

  console.log('Chatti Running in Background');

  // Overriding the addEventListener method first
});

function checkURL(tweetContent) {
  if (ChattiRunStatus === 'disable') return;
  var validUrls = [
    'https://twitter.com/home',
    'https://twitter.com',
    'https://x.com/',
    'https://x.com',
    'https://twitter.com/',
  ];
  var url = window.location.href;
  if (validUrls.includes(url)) {
    buttonRender();
  } else renderTones(tweetContent);
}

// Mapping of tones to their respective prompts
const tonePrompts = {
  'One Liner':
    'in a Short response, If you had to capture the essence of this tweet in just one catchy sentence, what would it be? no hashtags in the response',
  Quote:
    'in a Short response, Which quote comes to mind that aligns with the theme of this tweet?',
  Agree:
    'in a Short response, Given the essence of this tweet, how would you convey a similar sentiment, but in a way that feels uniquely yours? no hashtags in the response',
  Disagree:
    'in a Short response, Share a concise counterpoint to this tweet while keeping the conversation positive and insightful. no hashtags in the response',
  Question:
    'in a Short response, What probing question does this tweet inspire in you? no hashtags in the response',
  Cool: 'in a Short response, Refine the prompt by asking for a concise description of your cool image, focusing on your unique qualities or achievements. Use straightforward and specific language, avoiding unnecessary details like catchphrases or trend references.',
  Funny:
    "in a Short response, imagine you're a stand-up comedian for a moment. How would you give a light-hearted twist to this tweet? no hashtags in the response",
};

// Function to add text to the current active element
const addToBox = (text) => {
  let element1 = document.querySelector('[data-testid="tweetTextarea_0"]');
  let element2 = document.querySelector(
    '.public-DraftStyleDefault-block.public-DraftStyleDefault-ltr'
  );
  let element3 = document.querySelector(
    '.notranslate.public-DraftEditor-content'
  );
  let element4 = document.querySelector('[data-testid="tweetTextarea_0RichTextInputContainer"]');

  let event = new Event('change', { bubbles: true });

  if (element1) {
    element1.value = text;
    element1.dispatchEvent(event);
  } else if (element2) {
    element2.value = text;
    element2.dispatchEvent(event);
  } else if (element3) {
    element3.value = text;
    element3.dispatchEvent(event);
  }else if(element4){
    element4.value = text;
    element4.dispatchEvent(event);
  }

};

$(document).on('click', async (event) => {
  if (ChattiRunStatus != 'enable') return;
  const tweetContent = extractQuotedContent(event.currentTarget.title);
  const targetID = '#' + event.target.id;
  checkURL(tweetContent);
  if (targetID === '#chatti') return renderChattiPost();
  if (!event.target.id || !$('.btn-group').find(targetID).length) return;
  const tone = $(targetID).text();

  const prompt = {
    prompt: `${tonePrompts[tone]} here is the tweet: ${tweetContent}`,
  };

  try {
    $('.tone').prop('disabled', true);
    $(targetID).html(`
          <div class="spinner-border text-light" role="status">
              <span class="visually-hidden">Loading...</span>
          </div>
      `);

    const response = await fetch('http://localhost:3000/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(prompt),
    });

    let responseData = await response.json();
    responseData = responseData.replace(/(^[\s]+)|"/g, '');

    $(targetID).html(tone);
    $('.tone').prop('disabled', false);

    addToBox(responseData);
    console.log(responseData);
  } catch (error) {
    console.error('Fetch Error:', error);
  }
});

async function renderChattiPost() {
  let keywordPrompt = {
    prompt: `Craft a compelling tweet using one or more of the given keywords: ${keywords}. Your response should be short and clear, avoiding hashtags, emojis, or excessive abbreviations. Use precise language and tone to make a lasting impact. Balance brevity with enthusiasm, ensuring your message is memorable and relevant.`,
  };
  let button = $('.chatti-button');

  if (button.length && keywords.length > 0) {
    let buttonText = button.text();
    try {
      button.prop('disabled', true);
      button.html(`
            <div class="chatti-spinner spinner-border text-light " role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        `);

      const response = await fetch('http://localhost:3000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(keywordPrompt),
      });

      let responseData = await response.json();
      responseData = responseData.replace(/(^[\s]+)|"/g, '');

      button.html(buttonText);
      button.prop('disabled', false);

      addToBox(responseData);
      console.log(responseData);
    } catch (error) {
      console.error('Fetch Error:', error);
    }
  } else if (keywords.length === 0) addToBox('Need to add more keywords');
}

// Renders the tone buttons based on the tweet content
function renderTones(tweetContent) {
  if (!tweetContent || $('.tone-button-row').length) return;

  const rowDiv = $(
    '.css-1dbjc4n.r-1awozwy.r-kemksi.r-18u37iz.r-1w6e6rj.r-1wtj0ep.r-id7aif.r-184en5c'
  );
  $('.chatti-button').remove();

  rowDiv.after(`
      <div class="btn-group tone-button-row" role="group" aria-label="Basic outlined example">
          <button type="button" class="tone btn btn-outline-primary" id='btn1'>One Liner</button>
          <button type="button" class="tone btn btn-outline-primary" id='btn2'>Quote</button>
          <button type="button" class="tone btn btn-outline-primary" id='btn3'>Agree</button>
          <button type="button" class="tone btn btn-outline-primary" id='btn4'>Disagree</button>
          <button type="button" class="tone btn btn-outline-primary" id='btn5'>Question</button>
          <button type="button" class="tone btn btn-outline-primary" id='btn6'>Cool</button>
          <button type="button" class="tone btn btn-outline-primary" id='btn7'>Funny</button>
      </div>
  `);
}

// Function to render the Chatti button
function buttonRender(tweetContent) {
  if (ChattiRunStatus === 'disable') return;
  if (tweetContent) {
    $('.chatti-button').remove();
    return;
  }

  if ($('.tone-button-row').length) $('.tone-button-row').remove();

  const rowDiv = $(
    '.css-1dbjc4n.r-1awozwy.r-kemksi.r-18u37iz.r-1w6e6rj.r-1wtj0ep.r-id7aif.r-184en5c'
  );
  const appDiv = $('.chatti-button');

  if (rowDiv.length && !appDiv.length) {
    rowDiv.after(
      '<button type="button" id="chatti" class="chatti-button btn btn-outline-primary btn-sm">Use Chatti</button>'
    );
  }
  // else {
  //   setTimeout(buttonRender, 1000);
  // }
}

// Extracts the quoted content from a string
function extractQuotedContent(str) {
  const startIndex = str.indexOf('"');
  const endIndex = str.lastIndexOf('"');

  if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    return str.substring(startIndex + 1, endIndex);
  }

  return null;
}

let ChattiRunStatus = '',
  keywords = '';
chrome.storage.sync.get(['currentStatus', 'keywords'], function (result) {
  ChattiRunStatus = result.currentStatus;
  keywords = result.keywords;
});

function chattiStatus(status) {
  if (status === 'disable') {
    if ($('.chatti-button').length) $('.chatti-button').remove();
    else $('.tone-button-row').remove();
    ChattiRunStatus = status;
  } else if (status === 'enable') {
    checkURL();
    ChattiRunStatus = status;
  }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  let message = request.message;
  if (message === 'disable') {
    // Do something with the message in the content script
    chattiStatus(message);
  } else if (message === 'enable') {
    chattiStatus(message);
  }
  // Send a response back
  sendResponse({ reply: 'Message received in content script' });
});
