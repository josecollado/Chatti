// Import required packages and modules
const OpenAI = require('openai');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// SVG for error display
const errorSVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-exclamation-circle response-error " viewBox="0 0 16 16">
<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
<path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
</svg>`;

// Environment variables for Discord and OpenAI
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Validate that the environment variables exist
if (!DISCORD_WEBHOOK_URL || !OPENAI_API_KEY) {
  console.error('Essential environment variables are missing!');
  process.exit(1);
}

// Initialize OpenAI API
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Wait for the document to be fully loaded
$(document).ready(() => {
  // Initial URL check
  checkURL();

  // Listen for changes in the URL
  $(window).on('popstate', () => {
    checkURL();
  });

  // Log that the script is running
  console.log('Chatti Running in Background');
});

// Function to check the current URL
function checkURL(tweetContent) {
  if (ChattiRunStatus === 'disable') return;
  // URLs where the script should activate
  var validUrls = [
    'https://twitter.com/home',
    'https://twitter.com',
    'https://x.com/',
    'https://x.com',
    'https://twitter.com/',
  ];

  // Current URL
  const url = window.location.href;

  // Decide which UI to render based on the URL
  if (validUrls.includes(url)) {
    buttonRender();
  } else {
    renderTones(tweetContent);
  }
}

// Mapping between tone types and prompts for OpenAI
// const tonePrompts = {
//   'One Liner':
//     'Reply with a clever, original one-liner response that captures the essence of this tweet, without using emojis or hashtags.',
//   Quote:
//     'Reply with a fitting quote from someone famous that resonates with the themes of this tweet, mentioning the author, without emojis or hashtags.',
//   Agree:
//     'Reply sharing your own relatable perspective and experience based on this tweet, without emojis or hashtags.',
//   Disagree:
//     'Respectfully reply with a different point of view contrary to this tweet to further the discussion, without using emojis or hashtags.',
//   Question:
//     'Reply with an open-ended question that prompts deeper thinking about this tweet and its themes, without emojis or hashtags.',
//   Cool: 'Reply with a concise description of what makes the image/content cool, focusing on unique qualities without unnecessary details or emojis/hashtags.',
//   Funny:
//     'Reply with a humorous, lighthearted response that gives the tweet a clever comedic twist using wit and wordplay, without emojis or hashtags.',
// };

const tonePrompts = {
  'One Liner':
    'Craft a sharp, witty one-liner that epitomizes this tweet. Skip emojis and hashtags.',
  Quote:
    `Respond with a relevant quote from a notable figure that echoes the tweet's themes. Attribute the author. No emojis or hashtags.`,
  Agree:
    'Express agreement with a personal insight or experience that aligns with this tweet. Avoid emojis and hashtags.',
  Disagree:
    'Offer a polite counter-argument to this tweet, enriching the conversation. Refrain from using emojis or hashtags.',
  Question:
    `Pose a thought-provoking question related to this tweet's deeper implications. Exclude emojis and hashtags.`,
  Cool: 
    `Define what makes this content stand out, in brief, without delving into extraneous details. Omit emojis and hashtags.` ,
  Funny:
    'Deliver a witty retort that adds a comedic angle to this tweet, using humor and cleverness. No emojis or hashtags.'
};


// Function to wait for an element to appear in the DOM
const waitForElement = (selector, timeout = 5000, interval = 100) => {
  return new Promise((resolve, reject) => {
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
        reject(new Error(`Element not found: ${selector}`));
      }
    }, interval);
  });
};

const addToBox = async (text) => {
  // Array of selectors to identify the tweet box in various situations
  const selectors = [
    '.public-DraftStyleDefault-block.public-DraftStyleDefault-ltr',
    '[data-testid="tweetTextarea_0"]',
    '.notranslate.public-DraftEditor-content',
    '.DraftEditor-root',
    '[data-testid="tweetTextarea_0RichTextInputContainer"]',
    '[data-offset-key="6dhdr"]',
  ];

  // Try to find the parent div by its class
  const parentDiv = document.querySelector(
    '.public-DraftStyleDefault-block.public-DraftStyleDefault-ltr'
  );

  // If the parent div exists, find its child span
  const span = parentDiv ? parentDiv.querySelector('span') : null;

  // If the span exists, add the text to it
  if (span) {
    span.textContent = text;

    // Dispatch an 'input' event to notify of the text change
    const inputEvent = new Event('input', { bubbles: true });
    span.dispatchEvent(inputEvent);

    // Exit the function early since we've found the target
    return true;
  }

  // If we couldn't find the span, try other selectors
  for (const selector of selectors) {
    try {
      const element = await waitForElement(selector);

      // If the element exists, add the text to it
      if (element) {
        element.value = text;

        // Dispatch a 'change' event to notify of the text change
        const changeEvent = new Event('change', { bubbles: true });
        element.dispatchEvent(changeEvent);

        // Return true to indicate success
        return true;
      }
    } catch (error) {
      console.error(
        `Failed to find element for selector ${selector}: ${error.message}`
      );

      // Return false to indicate failure
      return false;
    }
  }
};

// Function to render tone buttons based on tweet content
function renderTones(tweetContent) {
  if (!tweetContent || $('.tone-button-row').length) return;

  // const rowDiv = $(
  //   '.css-1dbjc4n.r-1awozwy.r-kemksi.r-18u37iz.r-1w6e6rj.r-1wtj0ep.r-id7aif.r-184en5c'
  // );
  var rowDiv = $('.css-1dbjc4n.r-kemksi.r-jumn1c.r-xd6kpl.r-gtdqiz.r-ipm5af.r-184en5c');

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

  const rowDiv = $('[data-testid="toolBar"]');
  const appDiv = $('.chatti-button');

  if (rowDiv.length && !appDiv.length) {
    rowDiv.after(
      '<button type="button" id="chatti" class="chatti-button btn btn-outline-primary btn-sm">Use Chatti</button>'
    );
  }
}

// Function to extract quoted content from a string
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
  keywords = result.keywords ?? '';
});

// Function to handle changes in Chatti status
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

// Function to interact with OpenAI and get a response
async function roboAnswer({ prompt }) {
  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'system', content: prompt }],
      model: 'gpt-4-1106-preview',
      max_tokens: 50,
      temperature: 0.2,
    });

    return chatCompletion.choices[0].message.content.replace(/(^[\s]+)|"/g, '');
  } catch (error) {
    console.log(`GPT ERROR: ${error}`);
    return false;
  }
}

// Listener for messages from the Chrome extension
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

// Main click event handler
$(document).on('click', async (event) => {
  if (ChattiRunStatus != 'enable') return;
  const tweetContent = extractQuotedContent(event.currentTarget.title);
  const targetID = '#' + event.target.id;
  checkURL(tweetContent);

  if (targetID === '#chatti') {
    let button = document.getElementById('chatti');
    let text = button.textContent;
    chrome.storage.sync.get(['keywords'], function (result) {
      keywords = result.keywords ?? keywords;
    });

    // Disable the button and change its HTML
    button.disabled = true;
    button.innerHTML = `
            <div class="chatti-spinner spinner-border text-light" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          `;

    let keywordPrompt = {
      prompt: `Write a tweet, at random use only one of these keywords that is in an array:[${keywords}]. Be clear, brief, short, concise and impactful. No hashtags, emojis, or abbreviations. Make every word count for a memorable message.`
    };
    
    
    

    // Simulate async call
    setTimeout(async () => {
      if (keywords.length !== 0) {
        let response = await roboAnswer(keywordPrompt)
        const boxResult = addToBox(response);
        if (response && boxResult) {
          button.innerHTML = text;
          button.disabled = false;
        } else {
          button.innerHTML = errorSVG;
          setTimeout(() => {
            button.innerHTML = text;
          }, 1500);
          button.disabled = false;
        }
      } else {
        button.innerHTML = text;
        button.disabled = false;
        addToBox('Need to add keywords');
      }
    }, 3000);
  }

  if (!event.target.id || !$('.btn-group').find(targetID).length) return;
  const tone = $(targetID).text();

  const promptPlate = {
    prompt: `Tweet: ${tweetContent}
          
          Response: In 1 concise sentence and Make every word count for a memorable response, ${tonePrompts[tone]}`,
  };
  $('.tone').prop('disabled', true);
  $(targetID).html(`
              <div class="spinner-border text-light" role="status">
                  <span class="visually-hidden">Loading...</span>
              </div>
          `);

  const response = await roboAnswer(promptPlate);
  const boxResponse = await addToBox(response);
  if (boxResponse) {
    $(targetID).html(tone);
    $('.tone').prop('disabled', false);
  } else {
    $(targetID).html(errorSVG);
    setTimeout(() => {
      $(targetID).html(tone);
    }, 1500);
    $('.tone').prop('disabled', false);
  }
});

