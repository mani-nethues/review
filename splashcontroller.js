'use strict';
// Angular module, defining routes for the app
var pageurl = 'process.php';
var token, userinfo;
var password,referrerNSD;

app.controller('RootController', ['$rootScope', '$cookieStore', '$location', '$http',function ($rootScope, $cookieStore, $location,$http) {
    try{
		token = $cookieStore.get('token');
		if (token) {
			try {
				userinfo = $cookieStore.get('userinfo');
				$rootScope.studentid = userinfo.username;
				$rootScope.kcscode = userinfo.kcs;
				//var referrerNSD = $cookieStore.get('referrerNSD');
				//$rootScope.referrerNSD=(-1!=referrerNSD.indexOf(StrideStartURL)?'SS':(-1!=referrerNSD.indexOf('cleversuccess.php')?'CL':'SLF'));
				//$rootScope.password = password;
			}
			catch (e) {
				console.log(e);
				alert("Error getting student data");
				window.location=window.location.href.replace(/([\s\S]*?)req_splash\.html#([\s\S]*)/img, "$1#/logout");
			}
		}
	}
	catch(e){
		console.log("RootController Token Not exists.");
	}
	$rootScope.LoginMeOnStride=function(studentid){
			

			var paramToSend = {
					action: 'LoginMeOnStride',
					'studentid': studentid
				};
				var config = {
					url: pageurl,
					method: 'POST',
					data: $.param(paramToSend),
					headers: {'Content-Type': 'application/x-www-form-urlencoded'}
				};
				//Execute ajax call so that we can get a student class list
				$http(config)
					.success(function (response) {
						if (response.token) {

						//First Logout Student from New Student Dashboard
						var paramToSend = {
							action: 'logout'
						};
						var config_logout = {
							'url': pageurl,
							'method': 'POST',
							'data': $.param(paramToSend),
							'headers': {'Content-Type': 'application/x-www-form-urlencoded'}
						};
						//Execute ajax call so that we can get a student class list
						$http(config_logout)
							.success(function (resp) {
								$cookieStore.remove('token');
								$cookieStore.remove('userinfo');
								
								window.location=StrideStartURL+'?token='+response.token;
													
							})
							.error(function (resp) {
								console.log("Man an error occured during logout");
							});
								
							
						}
						else {
							console.log("Error During Stride login login");
						}
					})
					.error(function (response) {

					});					

		}	
}]);

//Controller for Required Overview Items (List View)
app.controller('requiredOverviewItems', ['$rootScope','$scope', '$location', '$cookieStore', '$http','$routeParams','$sce', function ($rootScope,$scope, $location, $cookieStore, $http, $routeParams,$sce) {
	$scope.messagelist=[];
    if ($cookieStore.get('token')) {
		$scope.StudentName=userinfo.fn;
		//Beg Required Item First
        var msid = userinfo.msid;
		var stid = userinfo.stid;
        var clsid = userinfo.classid;		
		var mydata = {'action': 'getReqItems', 'msid': msid, 'stid':stid};
		var config = {url: pageurl, method: 'POST', data: $.param(mydata), headers: {'Content-Type': 'application/x-www-form-urlencoded'}}
		$http(config).success(function (resp) {
			if (resp.error) {
				//Error? I don't know I am pretending I found nothing He He So Do Nothing....
				console.log(resp);
			}
			else {
				//Vallah god it Lets check its single item or more than one.
				if (resp.length>0) {
				   //Get and List any messages student has.
				   var mydata = {'action': 'getReqStudentMessages', 'msid': msid, 'stid':stid, 'classid': clsid};
					var config = {url: pageurl, method: 'POST', data: $.param(mydata), headers: {'Content-Type': 'application/x-www-form-urlencoded'}}
					$http(config).success(function (data) {
						if (data.error) {
							$scope.messagelist = [];
							//I hate to say that ajax request finished with some error so pretend user not have messages.
						}
						else if(data.message=='no records found') {
							$scope.messagelist = [];
						}						
						else {
							$scope.messagelist = data.message;
						}
					});
					
					//Get and List any file/resources student has.
					var filedata = {'action': 'getReqStudentFiles', 'msid': msid, 'classid': clsid,'stid':stid};
					var config = {url: pageurl, method: 'POST', data: $.param(filedata), headers: {'Content-Type': 'application/x-www-form-urlencoded'				}}
					$http(config).success(function (filedata) {
						if (filedata.error) {
							$scope.filelist = [];
							if($scope.messagelist.length==0){
								//Nothing to show back to dashboard
							
								if(userinfo.btoken_login && referrerNSD=='SS'){
									console.log("Hello");
									$rootScope.LoginMeOnStride(stid);
								}
								else{
									window.location=SiteURL+'/dashboard.php';
								}
							}
							//I hate to say that ajax request finished with some error so pretend user not have messages.
						}
						else {
							$scope.filelist = filedata.filelist;
						}
					});					
					//Have items
				}
				else{
					//Nothing to show back to dashboard
					if(userinfo.btoken_login && referrerNSD=='SS'){
						$rootScope.LoginMeOnStride(stid);
						console.log("Test:");
					}
					else{
						window.location=SiteURL+'/dashboard.php';
					}
				
				}
			}
		});			
		//End Required Item First		
    }
    else {
        //Not logged in Redirect to login page...
        window.location=window.location.href.replace(/([\s\S]*?)req_splash\.html#([\s\S]*)/img, "$1#/logout");
    }
}]);

app.controller('requiredItem', ['$scope', '$location', '$cookieStore', '$http','$routeParams','$sce', function ($scope, $location, $cookieStore, $http, $routeParams,$sce) {

    if ($cookieStore.get('token')) {
		console.log($cookieStore.get('token'));
		$scope.filename='';
		$scope.title='';
		$scope.numberOfCoinsCanEarn=0;
		$scope.ShowPopUp=false;
		$scope.SlashMessage='';		
		$scope.ViewURL='';
		//$scope.filetype='';
		$scope.usequiz=false;
		$scope.QuizURL='';
		var paramToSend = {
            action: 'ShowSplash',
            id: $routeParams.id,
            stid:userinfo.stid

        };
        var config = {
            url: pageurl,
            method: 'POST',
            data: $.param(paramToSend),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        };
        //Execute ajax call so that we can get a student class list
        $http(config)
            .success(function (data) {
				if(data.success){
					if(data.data.length>0){
						$scope.fileid=data.data[0].id;
						$scope.splashid=$routeParams.id;
						$scope.filename=data.data[0].filename;
						$scope.filetype=data.data[0].filetype;
						$scope.title=data.data[0].title;
						$scope.numberOfCoinsCanEarn=(!data.data[0].coins?0:data.data[0].coins);
						$scope.numberOfCoinsCanEarnMsg='';
						$scope.reqtype=data.data[0].reqtype;
						if(data.data[0].reqtype=='ds_assign' && !data.data[0].coins)
							$scope.numberOfCoinsCanEarn=1;	
						if($scope.numberOfCoinsCanEarn>0)
							$scope.numberOfCoinsCanEarnMsg='View this and earn '+$scope.numberOfCoinsCanEarn+' coins';						
						$scope.SlashMessage='Hi '+userinfo.fn+', '+(!data.data[0].filetype?'':'please review this '+data.data[0].filetype)+' to learn more '+(!data.data[0].topicid?'':'about how to '+ data.data[0].topicid+'...')+(data.data[0].usequiz=='t'?' You will earn up to 5 coins when you complete the quiz following review of the item.':'.');
						if(data.data[0].reqtype!='ds_assign'){
							$scope.filename='View this message';
							$scope.title='View this message';
							data.data[0].filetype='';
						}
						
						$scope.SlashMessage += "\n\n"+data.data[0].message;
						
						$scope.ViewURL='#/update/id/'+$routeParams.id+'/rt/'+data.data[0].reqtype;
						$scope.MarkRead = function (urltoexecute) {
							setTimeout(function(){window.location=window.location.href.replace(/([\s\S]*?)#([\s\S]*)/img, "$1#/update/id/"+$routeParams.id+'/rt/'+data.data[0].reqtype);},2000);
						
							
						}
						if(data.data[0].usequiz=='t'){
							$scope.usequiz=true;
							$scope.QuizURL='#/quiz/'+data.data[0].quizid;
						}
						if(data.data[0].filetype=='PDF'){
							$scope.PdfURL = $sce.trustAsResourceUrl(data.data[0].path);
							//$scope.filetype='pdf';
							$scope.reqtype='pdf';
						}
						else if(data.data[0].filetype=='DOC' || data.data[0].filetype=='Spreadsheet' || data.data[0].filetype=='PPT' || data.data[0].filetype=='RTF'){
							$scope.urlToDisplay = $sce.trustAsResourceUrl('http://docs.google.com/viewer?url='+encodeURIComponent(data.data[0].path)+'&embedded=true');
							//$scope.filetype='doc';
						}
						else if(data.data[0].filetype=='Mp4' || data.data[0].filetype=='video' || data.data[0].filetype=='GAME' || data.data[0].filetype=='game' || data.data[0].filetype=='PNG' || data.data[0].filetype=='JPG'){
							//$scope.filetype='image';
							if(data.data[0].filetype=='Mp4' || data.data[0].filetype=='video' && -1!=data.data[0].path.toLowerCase().indexOf('mp4')){
								$scope.urlToDisplay = $sce.trustAsResourceUrl('video.php?videfile='+encodeURIComponent(data.data[0].path)+'');
								//$scope.filetype='video';
							}
							else if(-1!=data.data[0].path.toLowerCase().indexOf('youtube')){
								$scope.urlToDisplay = $sce.trustAsResourceUrl(data.data[0].path);
								//$scope.filetype='video';
							}
							else if(data.data[0].filetype=='GAME' || data.data[0].filetype=='game' || data.data[0].filetype=='PNG' || data.data[0].filetype=='JPG')
								$scope.urlToDisplay = $sce.trustAsResourceUrl(data.data[0].path);
							else
								$scope.urlToDisplay = $sce.trustAsResourceUrl(data.data[0].path);
						}
						else
							$scope.urlToDisplay = $sce.trustAsResourceUrl(data.data[0].path);
						$scope.reqtype=data.data[0].reqtype;
					}	
					else{
						window.location=window.location.href.replace(/([\s\S]*?)req_splash\.php#([\s\S]*)/img, "$1req_splash.php#/update/id/"+$routeParams.id+'/rt/detect');
					}	
				}
				else{
					window.location=window.location.href.replace(/([\s\S]*?)req_splash\.php#([\s\S]*)/img, "$1req_splash.php#/update/id/"+$routeParams.id+'/rt/detect');
				}				
            })
            .error(function (data) {
                $scope.message=[];
            });		
    }
    else {
        //Not logged in Redirect to login page...
        window.location=window.location.href.replace(/([\s\S]*?)req_splash\.html#([\s\S]*)/img, "$1#/logout");
    }
}]);

app.controller('MessageSplash', ['$scope', '$location', '$cookieStore', '$http','$routeParams','$sce', function ($scope, $location, $cookieStore, $http, $routeParams,$sce) {
    if ($cookieStore.get('token')) {
		console.log($cookieStore.get('token'));
		$scope.filename='';
		$scope.title='';
		$scope.numberOfCoinsCanEarn=0;
		$scope.ShowPopUp=false;
		//$scope.SlashMessage='';		
		$scope.ViewURL='';
		$scope.filetype='';
		$scope.usequiz=false;
		$scope.QuizURL='';		
		var paramToSend = {
            action: 'MessageSplash',
            id: $routeParams.id,
            stid:userinfo.stid

        };
        var config = {
            url: pageurl,
            method: 'POST',
            data: $.param(paramToSend),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        };
        //Execute ajax call so that we can get a student class list
        $http(config)
            .success(function (data) {
				if(data.success){
					if(data.data.length>0){
						$scope.fileid=data.data[0].id;
						$scope.splashid=$routeParams.id;
						$scope.filename=data.data[0].filename;
						$scope.filetype=data.data[0].filetype;
						$scope.title=data.data[0].title;
						$scope.numberOfCoinsCanEarn=(!data.data[0].coins?0:data.data[0].coins);
						$scope.numberOfCoinsCanEarnMsg='';
						$scope.reqtype=data.data[0].reqtype;
						if(data.data[0].reqtype=='ds_assign' && !data.data[0].coins)
							$scope.numberOfCoinsCanEarn=1;	
						if($scope.numberOfCoinsCanEarn>0)
							$scope.numberOfCoinsCanEarnMsg='View this and earn '+$scope.numberOfCoinsCanEarn+' coins';						
						$scope.SlashMessage='Hi '+userinfo.fn+', '+(!data.data[0].filetype?'':'please review this '+data.data[0].filetype)+' to learn more '+(!data.data[0].topicid?'':'about how to '+ data.data[0].topicid+'...')+(data.data[0].usequiz=='t'?' You will earn up to 5 coins when you complete the quiz following review of the item.':'.');
						if(data.data[0].reqtype!='ds_assign'){
							$scope.filename='View this message';
							$scope.title='View this message';
							data.data[0].filetype='';
						}
						
						$scope.SlashMessage += "\n\n"+data.data[0].message;
						
						$scope.ViewURL='#/update/id/'+$routeParams.id+'/rt/new_message';
						
						if(data.data[0].usequiz=='t'){
							$scope.usequiz=true;
							$scope.QuizURL='#/quiz/'+data.data[0].quizid;
						}
						if(data.data[0].filetype=='PDF'){
							$scope.urlToDisplay = $sce.trustAsResourceUrl(encodeURIComponent(data.data[0].path));
							//$scope.filetype='doc';
						}
						else if(data.data[0].filetype=='DOC' || data.data[0].filetype=='Spreadsheet' || data.data[0].filetype=='PPT' || data.data[0].filetype=='RTF'){
							$scope.urlToDisplay = $sce.trustAsResourceUrl('http://docs.google.com/viewer?url='+encodeURIComponent(data.data[0].path)+'&embedded=true');
							//$scope.filetype='doc';
						}
						else if(data.data[0].filetype=='Mp4' || data.data[0].filetype=='video' || data.data[0].filetype=='GAME' || data.data[0].filetype=='game' || data.data[0].filetype=='PNG' || data.data[0].filetype=='JPG'){
							//$scope.filetype='image';
							if(data.data[0].filetype=='Mp4' || data.data[0].filetype=='video' && -1!=data.data[0].path.toLowerCase().indexOf('mp4')){
								$scope.urlToDisplay = $sce.trustAsResourceUrl('video.php?videfile='+encodeURIComponent(data.data[0].path)+'');
								//$scope.filetype='video';
							}
							else if(-1!=data.data[0].path.toLowerCase().indexOf('youtube')){
								$scope.urlToDisplay = $sce.trustAsResourceUrl(data.data[0].path);
								//$scope.filetype='video';
							}
							else if(data.data[0].filetype=='GAME' || data.data[0].filetype=='game' || data.data[0].filetype=='PNG' || data.data[0].filetype=='JPG')
								$scope.urlToDisplay = $sce.trustAsResourceUrl(data.data[0].path);
							else
								$scope.urlToDisplay = $sce.trustAsResourceUrl(data.data[0].path);
						}
						else
							$scope.urlToDisplay = $sce.trustAsResourceUrl(data.data[0].path);
						$scope.reqtype=data.data[0].reqtype;
					}	
					else{
						console.log(data);
					}	
				}
				else{
					console.log(data);
				}				
            })
            .error(function (data) {
                $scope.message=[];
            });		
    }
    else {
        //Not logged in Redirect to login page...
        window.location=window.location.href.replace(/([\s\S]*?)req_splash\.html#([\s\S]*)/img, "$1#/logout");
    }
}]);


app.controller('updateitem', ['$scope', '$location', '$cookieStore', '$http','$routeParams', function ($scope, $location, $cookieStore, $http, $routeParams) {

    if ($cookieStore.get('token')) {
		$scope.StudentName=userinfo.fn;
		//console.log($routeParams);
		var paramToSend = {
            action: 'UpdateSplash',
            id: $routeParams.id,
			reqtype: $routeParams.reqtype,
            stid:userinfo.stid,
			msid:userinfo.msid

        };
        var config = {
            url: pageurl,
            method: 'POST',
            data: $.param(paramToSend),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        };
        //Execute ajax call so that we can get a student class list
        $http(config)
            .success(function (data) {
				if(data.success){
					window.location=window.location.href.replace(/([\s\S]*?)#([\s\S]*)/img, "$1#/overview");
				}	
				else{
					console.log("Error Occured");
				}				
            })
            .error(function (data) {
                $scope.message=[];
            });		
    }
    else {
        //Not logged in Redirect to login page...
        window.location=window.location.href.replace(/([\s\S]*?)req_splash\.html#([\s\S]*)/img, "$1#/logout");
    }
}]);

//Begin Controller for Automated Quiz
app.controller('Quiz', ['$scope', '$location', '$cookieStore', '$http','$routeParams','$sce', function ($scope, $location, $cookieStore, $http, $routeParams,$sce) {

    if ($cookieStore.get('token')) {
		$scope.QuizName='Automated Quiz';
		$scope.numberOfCoinsCanEarn="You will earn up to 5 coins";
		$scope.FirstName=userinfo.fn.toUpperCase();
		$scope.LastName=userinfo.ln.toUpperCase();
		$scope.Coin=22;
		$scope.Question='';
		$scope.Answer1='';
		$scope.Answer2='';
		$scope.Answer3='';
		$scope.Answer4='';
		$scope.code='';
		$scope.correctans=0;
		$scope._secondAttempt=0;
		$scope.showDialog=false;
		$scope.hasSound=false;
		$scope.quizCompleted=false;
                
		$scope.DO_QuizAction=function(){
			$scope.showDialog=false;
			if(!$scope.quizCompleted){
				console.log("Clicked Going to refresh" );
				window.location.reload();
			}
			else{
				window.location='dashboard.php';
			}
		}
		$scope.PlayAudio=function(){
				var paramToSend = {
					action: 'SoundStatus',
					'audio': 'Enabled'
				};
				var config = {
					url: pageurl,
					method: 'POST',
					data: $.param(paramToSend),
					headers: {'Content-Type': 'application/x-www-form-urlencoded'}
				};
				//Execute ajax call so that we can get a student class list
				$http(config)
					.success(function (data) {
						if(data.success){
							$scope.hasSound=true;
							var audio = document.getElementById('audio-file');
						 	audio.play();
					
						}
						else{
							$scope.hasSound=false;
							}
					})
					.error(function (data) {
						//$scope.message=[];
						$scope.hasSound=false;
					});				
			
		}
		$scope.StopAudio=function(){

				var paramToSend = {
					action: 'SoundStatus',
					'audio': 'Disabled'
				};
				var config = {
					url: pageurl,
					method: 'POST',
					data: $.param(paramToSend),
					headers: {'Content-Type': 'application/x-www-form-urlencoded'}
				};
				//Execute ajax call so that we can get a student class list
				$http(config)
					.success(function (data) {
						if(data.success){
							$scope.hasSound=false;

						 var audio = document.getElementById('audio-file');
						 audio.pause();
							}
						else{
							$scope.hasSound=false;
							}
					})
					.error(function (data) {
						//$scope.message=[];
						$scope.hasSound=false;
					});				
			
					
		}		
		if($scope.hasSound){}
		$scope.CoinOggUrl=$sce.trustAsResourceUrl(StrideStartURL+'media/audio/coin_awarded.ogg');
		$scope.CoinMp3Url=$sce.trustAsResourceUrl(StrideStartURL+'media/audio/coin_awarded.mp3');
                            
		
						
/*							setTimeout(function(){
									$('#coin-audio').attr('autoplay', 'autoplay');
									$('h1.coin').addClass('effect');
									$('h1.coin').html($scope.Coin+1);
									//$('.total-coins').html(parseInt() + 1);
									
									setTimeout(function(){
										$('h1.coin').removeClass('effect');
									},700);									
							},200);*/
								

		var paramToSend = {
            action: 'GetNextQuestion',
            id: $routeParams.id,
            stid:userinfo.stid,
			msid:userinfo.msid

        };
        var config = {
            url: pageurl,
            method: 'POST',
            data: $.param(paramToSend),
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        };
        //Execute ajax call so that we can get a student class list
        $http(config)
            .success(function (data) {
				if(data.success){
					//console.log(data);
					if(data.result=='Complated'){
						$scope._dialogText = '<p align="center">Quiz has been completed!</p>';
						$scope._dialogHint = '';
						$scope._dialogStatus = 'success';
						$scope.showDialog=true;
						$scope.quizCompleted=true;
						
						//setTimeout(function(){window.location='dashboard.php'},3000);				
					}
					else{
						$scope.hasSound=data.result.hasSound;
						$scope.Coin=data.result.coinbalance;
						//$scope.numberOfCoinsCanEarn="You will earn upto "+data.result.coin
						//$scope.Question=data.result.prompt.replace(/\.\/\.\/\.\//mg, quizImageUrl(''));
if(data.result.prompt!=0){
						$('#question').html(data.result.prompt.replace(/\.\/\.\/\.\//mg, quizImageUrl('')));
}
                       
												
						$scope.code=data.result.code;
						/* $scope.Answer1=(!data.result.answer1?(!data.result.artnoac1?null:'<img src="'+$sce.trustAsResourceUrl(quizImageUrl(artCode(data.result.artnoac1)))+'" alt="">'):data.result.answer1.replace(/\.\/\.\/\.\//mg, quizImageUrl('')));

						$('#Answer1').html($scope.Answer1); 
						
						$scope.Answer2=(!data.result.answer2?(!data.result.artnoac2?null:'<img src="'+$sce.trustAsResourceUrl(quizImageUrl(artCode(data.result.artnoac2)))+'" alt="">'):data.result.answer2.replace(/\.\/\.\/\.\//mg, quizImageUrl('')));

						$('#Answer2').html($scope.Answer2);
						
						$scope.Answer3=(!data.result.answer3?(!data.result.artnoac3?null:'<img src="'+$sce.trustAsResourceUrl(quizImageUrl(artCode(data.result.artnoac3)))+'" alt="">'):data.result.answer3.replace(/\.\/\.\/\.\//mg, quizImageUrl('')));
						
						$('#Answer3').html($scope.Answer3);
						
						$scope.Answer4=(!data.result.answer4?(!data.result.artnoac4?null:'<img src="'+$sce.trustAsResourceUrl(quizImageUrl(artCode(data.result.artnoac4)))+'" alt="">'):data.result.answer4.replace(/\.\/\.\/\.\//mg, quizImageUrl('')));
						
						$('#Answer4').html($scope.Answer4); */
						
						$('#Answer1').html(data.result.answer1.replace(/\.\/\.\/\.\//mg, quizImageUrl('')));
						$('#Answer2').html(data.result.answer2.replace(/\.\/\.\/\.\//mg, quizImageUrl('')));
						$('#Answer3').html(data.result.answer3.replace(/\.\/\.\/\.\//mg, quizImageUrl('')));
						$('#Answer4').html(data.result.answer4.replace(/\.\/\.\/\.\//mg, quizImageUrl('')));
						
if(data.result.correctans){
												
						$scope.correctans=data.result.correctans.replace(/\.\/\.\/\.\//mg, quizImageUrl(''));
						if(!data.result.artnostem)
							$scope.artNoStem=null;
						else
							$scope.artNoStem=$sce.trustAsResourceUrl(quizImageUrl(artCode(data.result.artnostem)));
						//$scope.CoinOggUrl=$sce.trustAsResourceUrl(audioUrl(data.result.soundfile)+'.ogg');
						//$scope.CoinMp3Url=$sce.trustAsResourceUrl(audioUrl(data.result.soundfile)+'.mp3');
}					
						if(!data.result.soundfile){}
						else{

								setTimeout(function(){
													
										$('#question').append('<span><audio id="audio-file" preload="auto">' +
							'<source id="oggSource" src="'+$sce.trustAsResourceUrl(audioUrl(data.result.soundfile+'.ogg'))+'" type="audio/ogg"/>' +
							'<source id="mp3Source" src="'+$sce.trustAsResourceUrl(audioUrl(data.result.soundfile+'.mp3'))+'" type="audio/mpeg"/>' +
							'Your browser does not support the audio element.</audio></span>');
										if(data.result.hasSound){
											$('#audio-file').attr('autoplay','autoplay');
										}
										//$('#coin-audio').trigger('click');
											
								},200);	
														

							
						}
							if($scope.hasSound){
								//document.getElementById('audio-file').play();
							}						
                        setTimeout(function() {
                            MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
                            jQuery('.basicCalculator').calculator({
                showOn: "opbutton",
                buttonImageOnly: true,
                buttonImage: "views/images/calculator.png",
                showAnim: "fadeIn",
                layout: $.calculator.standardLayout,
                prompt: '<p class="calculatorTitle"><a href="javascript:void(0)" onclick="switchingCalculator()" id="calculatorToggle" class="calculatorToggle" >Switch to Scientific Calculator</a>&nbsp;&nbsp;<button title="Close the calculator" class="calculator-ctrl calculator-close calculator-nobdr" data-keystroke="@X" type="button">x<span class="calculator-keystroke calculator-keyname">Esc</span></button></p>'
            });
            
           
                                        $('.scratch-pad-icon').click(function() {
                                            $('.minimized-scratch-pad').addClass('display-none');
                                            $('.scratch-pad-minimize').removeClass('display-none');
                                            $('.scratch-main').removeClass('display-none');
                                            $('.scratch-pad-contain').removeClass('display-none');
                                            $("#wPaint").wPaint();
                                            //$('#wPaint').resize();
                                            //$( ".scratch-main" ).draggable();
                                            //$( ".scratch-main").resizable({
                                            //alsoResize:'#main-canvas,#wPaint'
                                            //});

                                          });
                                 $('.scratch-pad-minimize').click(function(){
                                     $('.scratch-main').addClass('display-none');
                                     $('.minimized-scratch-pad').removeClass('display-none');
                                 });
                                 $('.scratch-pad-maximize').click(function(){
                                     $('.scratch-main').removeClass('display-none');
                                     $('.minimized-scratch-pad').addClass('display-none');
                                 });
                                 
                                    //console.log("not");
                                    $('.scratch-pad-full').click(function(){
                                        var scratchpadHeight = $('.scratch-pad-contain').height();
                                        var scratchpadWidth = $('.scratch-pad-contain').width();
                                        var parentWidth = $(document).offsetParent().width();
                                        var percent = 100*scratchpadWidth/parentWidth;
                                        //console.log(percent);
                                        if(percent > 40){
                                            
                                            $('.scratch-main').css('width','40%');
                                            $('.scratch-main').css('height','60%');
                                            $('#restore').attr('src','./images/button_maximize.png');
                                            
                                        }else
                                        {
                                            $('.scratch-main').css('width','100%');
                                            $('.scratch-main').css('height','100%');
                                            $('#restore').attr('src','./images/button_restore.png');
                                            var scratchpadHeight1 = $('.scratch-pad-contain').height();
                                            var scratchpadWidth1 = $('.scratch-pad-contain').width();
                                            $('#main-canvas').attr('width',scratchpadWidth1 +'px');
                                            $('#main-canvas').attr('height',scratchpadHeight1 +'px');
                                        }
                    
                                    });
                                 
                                     
                                     
                                
                                 $('#resizer').on('dragmove', function(ev, drag) {
                                     console.log(drag.location.x());
                                        $('.scratch-main').width(drag.location.x())
                                            .height(drag.location.y())
                                            .trigger('resize');
                                    });
                                

                                 // Click event for hide Scratch Pad.
                                 $('.scratch-pad-contain .header span.close').click(function() {
                                     $('.scratch-pad-contain').addClass('display-none');
                                      $('.scratch-main').addClass('display-none');
                                 });

                                 /* For display different cursors */
                                 $('._wPaint_rectangle,._wPaint_ellipse,._wPaint_line,._wPaint_text').click(function() {
                                     $('#wPaint').removeAttr('class');
                                     $('#wPaint').addClass('cursor_crosshair');
                                 });

                                 $('._wPaint_pencil').click(function() {
                                     $('#wPaint').removeAttr('class');
                                     $('#wPaint').addClass('cursor_pencil');
                                 });

                                 $('._wPaint_eraser').click(function() {
                                     $('#wPaint').removeAttr('class');
                                     $('#wPaint').addClass('cursor_eraser');
                                 });

                                 $('._wPaint_rectangle,._wPaint_ellipse,._wPaint_line,._wPaint_pencil,._wPaint_eraser').click(function() {
                                     $('._wPaint_textInput').val('');
                                 });

                           // console.log("JHSdsjksABABA");
                            
                        }, 200);						
					}
				}	
				else{
					if(data.result=='No valid quiz record found or quiz completed.'){
					     // Open failure dialog
						$scope._dialogText = 'Quiz is not available for you or you already completed this quiz.';
						$scope._dialogHint = '';
						$scope._dialogStatus = 'failure';
						// If PMA mode is active then not open a dialog and not hide wrong answer box.
						$scope.showDialog=true;
						setTimeout(function(){
							window.location='splash_overview.php';	
						},1500);	
						
					}
					else{
						console.log("Error Occured");
						console.log(data);
					}
				}				
            })
            .error(function (data) {
                $scope.message=[];
            });	
			$scope.sendAnswer=function(code,ans,ansno){
				 var hint = '';
				$scope.correct=false;
				if(ansno==$scope.correctans){
					$scope.correct=true;
                    setTimeout(function() {
						//alert("Clicked");
						$('#coin-audio').trigger('play');
						$('h1.coin').addClass('effect');
						// BARTON: Change the 1 at end of next two calls, to increment by different amount.
						var coinAward;
						coinAward = 1;
						$('h1.coin').html(Number($('h1.coin').text())+coinAward );
						//$('.total-coins').html($.app.addCommas($('.total-coins').html().replace(',', ''), coinAward));
						setTimeout(function() {
							$('h1.coin').removeClass('effect');
						},700);
                    },500);
					
                    // Open success dialog
                    $scope._dialogText = '<p align="center">That\'s correct!</p>';
                    $scope._dialogHint = '';
                    $scope._dialogStatus = 'success';
 					$scope.showDialog=true;
                    setTimeout(function(){$scope.showDialog=false},3000);												
				}
				else{
					$scope.correct=false;
                   if(ansno==1) {ans = $('#Answer1').html();}
				   if(ansno==2) {ans = $('#Answer2').html();}
				   if(ansno==3) {ans = $('#Answer3').html();}
				   if(ansno==4) {ans = $('#Answer4').html();}
                    if($scope.rationale)
                    {	
                        if($scope.hasArt == true){
                            var rationaleArt = 'r_'+$scope.code+'_'+ans+'.jpg';
                            hint = '<img src="'+quizImageUrl(rationaleArt)+'" style="max-height: 100%;max-width: 100%;">';
                        }else{
                            hint = $scope.text;
                        }
                        // For rationales audio file
                        if($scope.hasSound == true && !$scope._secondAttempt) {
                            var rationaleAudio = 'r_'+$scope.code+'_'+ans;
                            _rationaleAudio = '<a onclick="document.getElementById(\''+rationaleAudio+'\').play()" class="btn pull-right rationale-audio '+rationaleAudio+'" >\
                                                    <audio id="'+rationaleAudio+'">\
                                                        <source src="'+audioUrl(rationaleAudio+'.ogg')+'" type="audio/ogg"/>\
                                                        <source src="'+audioUrl(rationaleAudio+'.mp3')+'" type="audio/mpeg"/>\
                                                    </audio>\
                                                    <i class="icon-volume-up"></i>\
                                                </a>';
                            $scope._rationaleAudio=_rationaleAudio;
							setTimeout(function() {
								//$('#question').append(_rationaleAudio);
                                    $('#'+rationaleAudio).attr('autoplay', 'autoplay');
                            },200);
                        }else{
                            _rationaleAudio = '';
                        }
                    }

                    // Open failure dialog
                    $scope._dialogText = 'You answered: <i>'+ans+'</i><br/>That is incorrect.';
                    if(hint && hint!='')
						$scope._dialogHint = hint;
					else if($scope._secondAttempt>=1)
						$scope._dialogHint = 'The correct answer is: <i>'+$scope.correctans+'</i>';
					else
						$scope._dialogHint = '';
						
                    $scope._dialogStatus = 'failure';
                    // If PMA mode is active then not open a dialog and not hide wrong answer box.
                    $scope.showDialog=true;
                    setTimeout(function(){$scope.showDialog=false},3000);
				}
				$scope._secondAttempt++;
				//alert("Attempt:"+$scope._secondAttempt);

				var paramToSend = {
					action: 'sendAnswer',
					id: $routeParams.id,
					stid:userinfo.stid,
					msid:userinfo.msid,
					classid:userinfo.classid,
					'code':code,
					'studentans':ansno,
					'correct':$scope.correct,
					'withhint':(hint!='' || $scope._secondAttempt>=1)
		
				};
				var config = {
					url: pageurl,
					method: 'POST',
					data: $.param(paramToSend),
					headers: {'Content-Type': 'application/x-www-form-urlencoded'}
				};
				//Execute ajax call so that we can get a student class list
				$http(config)
					.success(function (data) {
						if(data.success){
							$scope.showDialog=true;	
						}
						else{
							$scope.showDialog=true;
							}
					})
					.error(function (data) {
						$scope.message=[];
					});	
				
			}
    }
    else {
        //Not logged in Redirect to login page...
        window.location=window.location.href.replace(/([\s\S]*?)req_splash\.html#([\s\S]*)/img, "$1#/logout");
    }
}]);
//End   Controller for Automated Quiz

app.factory('api', ['$http', '$cookies', '$location', '$cookieStore', function ($http, $cookies, $location, $cookieStore) {
    return {
        init: function (token) {
            $http.defaults.headers.common['X-Access-Token'] = token || $cookies.token;
        }
    };
}]);


var _timerInterval = null;;
function startUrl(){
	return StrideStartURL;
}
function imageUrl(name) { //Common URL for Image
	return startUrl()+'media/stride-academy-images/'+name;
}

function quizImageUrl(name) { //Common URL for Quiz Images.
	return startUrl()+'media/curriculum/images/'+name;
}

function audioUrl(name) { //Common URL for Audo Files
	return startUrl()+'media/curriculum/audio/'+name;
}
function setIntervalTime() {
	// Get time to answer.
	var time = new Date;
	if(_timerInterval !== null) return;
	_timerInterval = setInterval(function(){_answerTime = new Date - time;},1);
}
        
function clearIntervalTime() {
	clearInterval(_timerInterval);
	_timerInterval = null;
}

function artCode(artCode) {
	artCode = artCode.toString();
	switch(artCode.length) {
		case 3:
			artCode = 'ARTA0'+artCode+'.jpg';
			break;
		case 2:
			artCode = 'ARTA00'+artCode+'.jpg';
			break;
		case 1:
			artCode = 'ARTA000'+artCode+'.jpg';
			break;
		default :
			artCode = 'ARTA'+artCode+'.jpg';
	}
	return artCode;
}

function MarkRead(urltoread){
	$.ajax({
		 type: "POST",
		 dataType:'html',
		 url: urltoread,
		 success: function(data) {
			console.log(data);
		  }
		});		
}
function switchingCalculator() {
    console.log("switchingCalculator");
                var b = $(".basicCalculator").attr("rel"),
                    c = $(".calculator-popup").attr("style");
            //_tablet=1E3=false;
            console.log(b);
                $(".basicCalculator").calculator("hide");
                $(".calculator-popup").removeAttr("style");
                $(".basicCalculator").calculator("destroy");
                "standardLayout" == b ? ($(".basicCalculator").calculator({
                        showOn: "opbutton",
						buttonImageOnly: true,
                        buttonImage: "views/images/calculator.png",
                        showAnim: "fadeIn",
                        layout: $.calculator.scientificLayout,
                        prompt: '<p class="calculatorTitle"><a href="javascript:void(0)" onclick="switchingCalculator()" id="calculatorToggle" class="calculatorToggle" >Switch to Basic Calculator</a>&nbsp;&nbsp;<button title="Close the calculator" class="calculator-ctrl calculator-close calculator-nobdr" data-keystroke="@X" type="button">x<span class="calculator-keystroke calculator-keyname">Esc</span></button></p>'
                    }),
                    $(".basicCalculator").attr("rel", "scientificLayout")) : ($(".basicCalculator").calculator({
                    showOn: "opbutton",
                    buttonImageOnly: true,
                    buttonImage: "views/images/calculator.png",
                    showAnim: "fadeIn",
                    layout: $.calculator.standardLayout,
                    prompt: '<p class="calculatorTitle"><a href="javascript:void(0)" onclick="switchingCalculator()" id="calculatorToggle" class="calculatorToggle" >Switch to Scientific Calculator</a>&nbsp;&nbsp;<button title="Close the calculator" class="calculator-ctrl calculator-close calculator-nobdr" data-keystroke="@X" type="button">x<span class="calculator-keystroke calculator-keyname">Esc</span></button></p>'
                }), $(".basicCalculator").attr("rel", "standardLayout"));
                $(".basicCalculator").calculator("show");

            }
