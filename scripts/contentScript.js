$(document).ready(() => {
  console.log('Chatti Running in Background');
  buttonRender()
});

$(document).on('click', (event) => {
  let tweetContent = extractQuotedContent(event.currentTarget.title);
  let targetID = '#' + event.target.id;
  buttonRender(tweetContent);
  renderTones(tweetContent);
  if (event.target.id) {
    if ($('.btn-group').find(targetID).length > 0) {
      console.log($(targetID).text());
    }
  }
});

function renderTones(tweetContent) {
  if (tweetContent && !$('.tone-button-row').length) {
    let rowDiv = $(
      '.css-1dbjc4n.r-1awozwy.r-kemksi.r-18u37iz.r-1w6e6rj.r-1wtj0ep.r-id7aif.r-184en5c'
    );
    let textAreaDiv = $('[data-testid="tweetTextarea_0"]')
    $('.chatti-button').remove();
    rowDiv.after(`<div class="btn-group tone-button-row" role="group" aria-label="Basic outlined example">
    <button type="button" class="btn btn-outline-primary" id='btn1'>One Liner</button>
    <button type="button" class="btn btn-outline-primary" id='btn2'>Quote</button>
    <button type="button" class="btn btn-outline-primary" id='btn3'>Agree</button>
    <button type="button" class="btn btn-outline-primary" id='btn4'>Disagree</button>
    <button type="button" class="btn btn-outline-primary" id='btn5'>Question</button>
    <button type="button" class="btn btn-outline-primary" id='btn6'>Cool</button>
    <button type="button" class="btn btn-outline-primary" id='btn7'>Funny</button>
  </div>`);
  }
}

function buttonRender(tweetContent) {
  if (tweetContent) return $('.chatti-button ').remove();
  else {
    if ($('.tone-button-row').length) $('.tone-button-row').remove();
    let rowDiv = $(
      '.css-1dbjc4n.r-1awozwy.r-kemksi.r-18u37iz.r-1w6e6rj.r-1wtj0ep.r-id7aif.r-184en5c'
    );
    let appDiv = $('.chatti-button');
    if (appDiv.length) {
      clearTimeout($(this));
      return;
    }
    if (rowDiv.length && !appDiv.length) {
      // Element found, run your code
      rowDiv.after(`<button type="button" class="chatti-button btn btn-outline-primary btn-sm">Chatti</button>
  `);
    } else {
      // Element not found, check again after a delay
      setTimeout(buttonRender, 3000);
    }
  }
}

function extractQuotedContent(str) {
  const startIndex = str.indexOf('"');
  const endIndex = str.lastIndexOf('"');

  if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
    return str.substring(startIndex + 1, endIndex);
  }

  return null; // or return null, if you prefer
}
