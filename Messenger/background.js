var windowOpen = false;
var me = this;
chrome.browserAction.onClicked.addListener(function() {

	if(!windowOpen){
		chrome.windows.create({'url': 'popup.html', width: 600, height: 600, type: 'panel'}, function(window) {
	   		windowOpen = true;
	    });
	}else{
		me.showNotification('You already have an active chatbox.');
	}
    
});

chrome.windows.onRemoved.addListener(function(){
	windowOpen = false;
})


function showNotification(msg){
	if(window.Notification){
		var notification = new Notification('Error', {
			icon: 'chatLogo.jpg',
			body: msg
		  });
	}
}

 


	

