var chatApp = angular.module('chatApp',['appFactory','appConstants']);

chatApp.directive('modalDialog', function() {
  return {
    restrict: 'E',
    scope: {
      show: '='
    },
    replace: true, // Replace with the template below
    transclude: true, // we want to insert custom content inside the directive
    link: function(scope, element, attrs) {
      scope.dialogStyle = {};
      if (attrs.width)
        scope.dialogStyle.width = attrs.width;
      if (attrs.height)
        scope.dialogStyle.height = attrs.height;
      scope.hideModal = function() {
        scope.show = false;
      };
    },
    template: "<div class='ng-modal' ng-show='show'><div class='ng-modal-overlay' ng-click='hideModal()'></div><div class='ng-modal-dialog' ng-style='dialogStyle'><div class='ng-modal-dialog-content' ng-transclude></div></div></div>"
  };
});

chatApp.controller('mainController',function($scope,$filter,Config,socket){
	$scope.appName = 'Messenger',
	$scope.userName = null;
	$scope.userNameExist = false
	$scope.userList = null;
  $scope.chattingTo = null;
  $scope.message = null;

  $scope.$watch('userName', function (val) {
      $scope.userName = $filter('lowercase')(val);
  },true);

  

	$scope.addUser = function(){
		socket.emit('addUser',{'name' : this.userName});
		$scope.userNameExist = true;
	};

  $scope.selectUser = function(user){
    $scope.chattingTo = user;

    var newText = document.getElementById(user+'_new');
    newText.setAttribute('class', 'hiddenNew');
  };

  $scope.sendMessage = function(){
    var data = {'from' : this.userName, 'to' : this.chattingTo, 'msg' : this.message}

    var to = data.to;
    var msg = data.msg;
    var divToUpdate = document.getElementById(to)

    msg = msg.replace(Config.emojiPattern,function(matched){
      return Config.emojiMapObj[matched];
    });

    divToUpdate.innerHTML = divToUpdate.innerHTML + '<div class="bubble you">'+msg+'</div>';

    divToUpdate.scrollTop = divToUpdate.scrollHeight;

    this.message = null;
    
    socket.emit('message',data);
  };

  $scope.sendTypingStatus = function(){
    var data = {'from' : this.userName, 'to' : this.chattingTo};

    socket.emit('typing',data);
  };
  
	socket.on('userList',function(userList){
		$scope.userList = userList;
	});

	socket.on('userExist',function(data){
    $scope.userNameExist = null;
    var errorMsg = $scope.userName+' is already taken :(';
		$scope.showNotification('Sorry',errorMsg)
	});

  socket.on('newMessage',function(data){
    var from = data.from;
    var msg = data.msg;

    msg = msg.replace(Config.emojiPattern,function(matched){
      return Config.emojiMapObj[matched];
    });

    var divToUpdate = document.getElementById(from);
    divToUpdate.innerHTML = divToUpdate.innerHTML + '<div class="bubble me">'+msg+'</div>';

    divToUpdate.scrollTop = divToUpdate.scrollHeight;

    var label = document.getElementById(from+'_label');
    var labelclasses = label.className;

    if(labelclasses.indexOf('selected') == -1){
      var newText = document.getElementById(from+'_new');
      newText.setAttribute('class', 'visibleNew');
    }

    chrome.windows.getCurrent(function(currentWin){
     var windowFocused = currentWin.focused;
      if(!windowFocused){
        $scope.showNotification(from,msg)
      }
    });
    
  });

  socket.on('broadcastMessage',function(data){
    var from = data.from;
    var msg = data.msg;
    var divToUpdate = document.getElementById('Broadcast');

    msg = msg.replace(Config.emojiPattern,function(matched){
      return Config.emojiMapObj[matched];
    });

    divToUpdate.innerHTML = divToUpdate.innerHTML + '<div class="bubble me"><span class="broadcastFrom">'+from+'</span><br>'+msg+'</div>';

    divToUpdate.scrollTop = divToUpdate.scrollHeight;

    var label = document.getElementById('Broadcast_label');
    var labelclasses = label.className;

    console.log(labelclasses.indexOf('selected'));

    if(labelclasses.indexOf('selected') == -1){
      var newText = document.getElementById('Broadcast_new');
      newText.setAttribute('class', 'visibleNew');
    }

    chrome.windows.getCurrent(function(currentWin){
     var windowFocused = currentWin.focused;
      if(!windowFocused){
        $scope.showNotification(from,msg,true);
      }
    });
    
  });

  socket.on('newTyping',function(data){
    var from = data.from;

    var label = document.getElementById(from+'_label');
    var labelclasses = label.className;

    var typingText = document.getElementById(from+'_typing');

    if(labelclasses.indexOf('selected') == -1){
      typingText.setAttribute('class', 'visibleTyping');
      setTimeout(function(){
        typingText.setAttribute('class', 'hiddenTyping');
      },2000);
    }else{
      typingText.setAttribute('class', 'visibleTypingSelected');
      setTimeout(function(){
        typingText.setAttribute('class', 'hiddenTyping');
      },2000);
    }
  });

  socket.on('disconnect',function(){
    $scope.userName = null;
    $scope.userNameExist = false
    $scope.userList = null;
    $scope.chattingTo = null;

    var divToUpdate = document.getElementById('Broadcast');
    divToUpdate.innerHTML = null;
  });



  $scope.showNotification= function(heading,msg,Broadcast){
    
    if(window.Notification){
      var notification = new Notification(heading, {
          icon: 'chatLogo.jpg',
          body: msg
        });
      notification.onclick = function(){
        window.focus();
        if(Broadcast){
          document.getElementById('Broadcast_label').click();
          document.getElementById('Broadcast_message_input').focus();
        }else{
          document.getElementById(heading+'_label').click();
          document.getElementById(heading+'_message_input').focus();
        }
        notification.close();
      }
    }
  };

  $scope.changeTheme = function(cssFile){
    var oldlink = document.getElementsByTagName("link").item(0);

    var newlink = document.createElement("link");
    newlink.setAttribute("rel", "stylesheet");
    newlink.setAttribute("type", "text/css");
    newlink.setAttribute("href", cssFile);

    document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink);
  }

  $scope.modalShown = false;
  $scope.toggleModal = function() {
    $scope.modalShown = !$scope.modalShown;
  };
});
