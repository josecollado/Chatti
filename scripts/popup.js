$(document).ready(() => {
  let keywords = '';
  let currentStatus = '';
  chrome.storage.sync.get(['keywords', 'currentStatus'], function (result) {
    $('.form-control').val('').val(result.keywords);
    currentStatus = result.currentStatus ?? 'enable';
    if (currentStatus) {
      if (currentStatus === 'enable') {
        sendMessage('enable');
      }
       if (currentStatus === 'disable') {
        $('.form-check-input').prop('checked', false);
        sendMessage('disable');
      }
    }
  });

  $('.form-control').on('keyup', () => {
    keywords = $('.form-control').val();
    if (keywords.length < 150) {
      $('.invalid-feedback').remove();
      chrome.storage.sync.set({ keywords: keywords });
    }
    if (keywords.length > 150 && !$('.invalid-feedback').length) {
      $('.form-control').after(`<div class="invalid-feedback">
        Please use less keywords
      </div>`);
      $('.invalid-feedback').css('display', 'block');
    }
    chrome.storage.sync.get(['keywords'], function (result) {
      $('.form-control').val('').val(result.keywords);
    });
  });

  $('.form-check-label').on('click', () => {
    //default status is set to Enable
    chrome.storage.sync.get(['currentStatus'], function (result) {
      currentStatus = result.currentStatus;
      console.log('after the click', result);
    });
    if (currentStatus === 'enable') {
      chrome.storage.sync.set({ currentStatus: 'disable' });
      sendMessage('disable');
    }
     if (currentStatus === 'disable') {
      chrome.storage.sync.set({ currentStatus: 'enable' });
      sendMessage('enable');
    }
  });
  function sendMessage(message) {
    chrome.runtime.sendMessage({ action: message }, (response) => {
      // Handle the response here
      console.log(response.data);
    });
  }
});

