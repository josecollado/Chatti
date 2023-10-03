$(document).ready(()=>{
    let keywords = '';
    $('.form-control').on("keyup", () =>{
        keywords = $('.form-control').val()
        chrome.runtime.sendMessage({ action: keywords });
    })
})