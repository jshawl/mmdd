var myTextarea = document.querySelector('.js-input');
var editor = CodeMirror.fromTextArea(myTextarea, {
    matchBrackets: true,
    mode: "text/x-markdown",
    lineWrapping: true
});
var timer;

function refresh(cm){
    clearTimeout(timer);
    timer = setTimeout(function(){
	save( null );
	var lang = cm.getTextArea().name;
    }, 1000);
}
function save( event ){
    if (event) event.preventDefault();
    if( $('.js-view-gist') ){
	$createGist = $('<li><a href="/create-gist" class="js-create-gist">Create Gist</a></li>');
	$('.js-view-gist').parent().after( $createGist );
	$('.js-view-gist').parent().remove(); 
    }
    var data = editor.getValue();
    localStorage.setItem('data', btoa(data) );
    if( !data ){
	window.location.hash = '';
    }else{
	window.location.hash = btoa(data);
    }
}

editor.on('change', refresh );

$(document).on('click','.js-clear', function(event){
    event.preventDefault();
    localStorage.removeItem('data');
    window.location = $(this).attr('href');
});
$(document).on('click', '.js-create-gist', function(event){
    event.preventDefault();
    var ext = $('[data-lang].active').attr('data-lang');
    $.ajax({
	type: "POST",
	url: '/create-gist',
	data: { 
	  'input': editor.getValue()
	}
    }).done( function(res){
	var reply = JSON.parse(res);
	$('.js-create-gist').attr('href', reply.html_url);
	$viewGist = $('<li><a class="js-view-gist" href="'+ reply.html_url +'"> View Gist </a></li>');
	$('.js-create-gist').parent().after( $viewGist );
	$('.js-create-gist').remove();
    });
});


$(function(){
    var hash = window.location.hash.substr(1);
    if ( hash != ''){
	input = hash;
    }
    if (input){
	editor.getDoc().setValue( atob( input ) );
    } else if ( localStorage.data ){
	editor.getDoc().setValue( atob( localStorage.data ) );
	window.location.hash = localStorage.data;
    }
});