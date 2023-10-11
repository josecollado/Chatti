const OpenAI = require('openai');
const dotenv = require('dotenv');
const errorSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-exclamation-circle response-error " viewBox="0 0 16 16">
<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
<path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
</svg>`

dotenv.config();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!DISCORD_WEBHOOK_URL || !OPENAI_API_KEY) {
  console.error('Essential environment variables are missing!');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

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
  if(ChattiRunStatus === 'disable') return;
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
    'in a Short response, Which quote comes to mind that aligns with the theme of this tweet and who is this quote from?',
  Agree:
    'in a Short response, Given the essence of this tweet, how would you convey a similar sentiment, but in a way that feels uniquely yours? no hashtags in the response',
  Disagree:
    'in a Short response, Share a concise counterpoint to this tweet while keeping the conversation positive and insightful. no hashtags in the response',
  Question:
    'in a Short response, What probing question does this tweet inspire in you? no hashtags in the response',
  Cool: 'in a Short response, Refine the prompt by asking for a concise description of your cool image, focusing on your unique qualities or achievements. Use straightforward and specific language, avoiding unnecessary details like catchphrases or trend references.',
  Funny:
    "Write a humorous, light-hearted response that gives this tweet a clever comedic twist. Use wit and wordplay for amusement without hashtags.",
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
  let element4 = document.querySelector(
    '[data-testid="tweetTextarea_0RichTextInputContainer"]'
  );

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
  } else if (element4) {
    element4.value = text;
    element4.dispatchEvent(event);
  } else console.log('cannot find elements to add to');
};

$(document).on('click', async (event) => {
  if (ChattiRunStatus != 'enable') return;
  const tweetContent = extractQuotedContent(event.currentTarget.title);
  const targetID = '#' + event.target.id;
  checkURL(tweetContent);
  if (targetID === '#chatti') return renderChattiPost();
  if (!event.target.id || !$('.btn-group').find(targetID).length) return;
  const tone = $(targetID).text();

  const promptPlate = {
    prompt: `In 1-2 sentences, ${tonePrompts[tone]}. Tweet: ${tweetContent}`,
};
  $('.tone').prop('disabled', true);
  $(targetID).html(`
        <div class="spinner-border text-light" role="status">
            <span class="visually-hidden">Loading...</span>
        </div>
    `);

  const response = await roboAnswer(promptPlate);
  if (response) {
    $(targetID).html(tone);
    $('.tone').prop('disabled', false);
    addToBox(response);
  } else {
    $(targetID).html(errorSVG);
    setTimeout(() => {
      $(targetID).html(tone);
    }, 1500);
    $('.tone').prop('disabled', false);
  }
});

async function renderChattiPost() {
  let keywordPrompt = {
    prompt: `Craft a compelling tweet using one or more of the given keywords: ${keywords}. Your response should be short and clear, avoiding hashtags, emojis, or excessive abbreviations. Use precise language and tone to make a lasting impact. Balance brevity with enthusiasm, ensuring your message is memorable and relevant.`,
  };
  let button = $('.chatti-button');

  if (button.length && keywords.length > 0) {
    let buttonText = button.text();
    button.prop('disabled', true);
    button.html(`
          <div class="chatti-spinner spinner-border text-light " role="status">
              <span class="visually-hidden">Loading...</span>
          </div>
      `);
    let response = await roboAnswer(keywordPrompt);
    if (response) {
      button.html(buttonText);
      button.prop('disabled', false);
      addToBox(response);
    } else {
      button.html(errorSVG);
      setTimeout(() => {
        button.html(buttonText);
      }, 1500);
      button.prop('disabled', false);
    }
  } else if (keywords.length === 0) addToBox('Need to add keywords');
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
    return true
  } else if (status === 'enable') {
    checkURL();
    ChattiRunStatus = status;
    return false
  }
}

async function roboAnswer({ prompt }) {
  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'system', content: prompt }],
      model: 'gpt-3.5-turbo',
      max_tokens: 50,
      temperature: 0.2
    });

    //this is here for testing purposes
    // await fetch(DISCORD_WEBHOOK_URL, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     content: '<><><><>MESSAGE SENT @here<><><><>'
    //   })
    // });

    return (responseContent = chatCompletion.choices[0].message.content.replace(
      /(^[\s]+)|"/g,
      ''
    ));
  } catch (error) {
    console.log(`GPT ERROR: ${error}`);
    return false;
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
