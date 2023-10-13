const OpenAI = require('openai');
const dotenv = require('dotenv');
const errorSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-exclamation-circle response-error " viewBox="0 0 16 16">
<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
<path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
</svg>`;

dotenv.config();

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!DISCORD_WEBHOOK_URL || !OPENAI_API_KEY) {
  console.error('Essential environment variables are missing!');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
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
    'Reply with a clever, original one-liner response that captures the essence of this tweet, without using emojis or hashtags.',
  Quote:
    'Reply with a fitting quote from someone famous that resonates with the themes of this tweet, mentioning the author, without emojis or hashtags.',
  Agree:
    'Reply sharing your own relatable perspective and experience based on this tweet, without emojis or hashtags.',
  Disagree:
    'Respectfully reply with a different point of view contrary to this tweet to further the discussion, without using emojis or hashtags.',
  Question:
    'Reply with an open-ended question that prompts deeper thinking about this tweet and its themes, without emojis or hashtags.',
  Cool: 'Reply with a concise description of what makes the image/content cool, focusing on unique qualities without unnecessary details or emojis/hashtags.',
  Funny:
    'Reply with a humorous, lighthearted response that gives the tweet a clever comedic twist using wit and wordplay, without emojis or hashtags.',
};

const waitForElement = (selector, timeout = 5000, interval = 100) => {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }
    let elapsed = 0;
    const timer = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(timer);
        resolve(element);
      }
      elapsed += interval;
      if (elapsed >= timeout) {
        clearInterval(timer);
        reject(new Error('Element not found within timeout'));
      }
    }, interval);
  });
};

const addToBox = async (text) => {
  try {
    const selectors = [
      '[data-testid="tweetTextarea_0"]',
      '.public-DraftStyleDefault-block.public-DraftStyleDefault-ltr',
      '.notranslate.public-DraftEditor-content',
      '[data-testid="tweetTextarea_0RichTextInputContainer"]',
      '.DraftEditor-root',
      '[data-offset-key="6dhdr"]',
    ];

    for (const selector of selectors) {
      const element = await waitForElement(selector);
      if (element) {
        element.value = text;
        const event = new Event('change', { bubbles: true });
        element.dispatchEvent(event);
        return; // Exit once we've found and updated an element
      }
    }
  } catch (error) {
    console.log('Error:', error.message);
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

  const promptPlate = {
    prompt: `Tweet: ${tweetContent}
    
    Response: In 1 concise sentence, ${tonePrompts[tone]}`
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
    return true;
  } else if (status === 'enable') {
    checkURL();
    ChattiRunStatus = status;
    return false;
  }
}

async function roboAnswer({ prompt }) {
  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'system', content: prompt }],
      model: 'gpt-3.5-turbo',
      max_tokens: 50,
      temperature: 0.2,
    });

    // this is here for testing purposes
    // await fetch(DISCORD_WEBHOOK_URL, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     content: '<><><><>MESSAGE SENT @here<><><><>'
    //   })
    // });

    console.log(chatCompletion);

    return chatCompletion.choices[0].message.content.replace(/(^[\s]+)|"/g, '');
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
