$(document).ready(()=>{
    let keywords = '';
    $('.form-control').on("keyup", () =>{
        keywords = $('.form-control').val()
        chrome.runtime.sendMessage({ action: keywords }, (response) => {
            // Handle the response here
            console.log(response);
        });
    })


    $('.form-check-label').on("click", event => {
        if($('.form-check-label').text().includes('Enabled')) $('.form-check-label').text('Chatti Disabled')
        else $('.form-check-label').text('Chatti Enabled')

        // Need to work on functions, script should be able to be run and stopped when chatti button is clicked 
        //work on error handling as well for when someone turns off chatti but script elements are still showing they will inform the user to enable chatti 
        // let text = $('.form-check-label').text()
        // if(text.includes('Enabled')) run chatti code
        // else stop chatti code 
    })
})