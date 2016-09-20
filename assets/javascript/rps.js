$(document).ready(function(){

	var userName;

	var userWins;

	var userLosses;

	var totalUsers;

	var gameID;

	var config = {

	    apiKey: "AIzaSyB1FkxhV9lBENS4EBj7VMATN1Z6Ui6LiKo",
	    authDomain: "rps-multi-c5a5e.firebaseapp.com",
	    databaseURL: "https://rps-multi-c5a5e.firebaseio.com",
	    storageBucket: "",
	    messagingSenderId: "180232972398"

	};

	firebase.initializeApp(config);

	var database = firebase.database();

	var userIdNumber;

	var userAdd;

	database.ref().on("value", function(snapshot) {

		totalUsers = snapshot.val().numberOfUsers;

	}, function (errorObject) {

	  	console.log("The read failed: " + errorObject.code);

	});

	database.ref().on("child_added", function(snapshot) {

		if(snapshot.hasChild('ID') == true & snapshot.val().online == true){

			$('.tableBody').append($('<tr class="tableRemove '+ snapshot.val().name + '"></tr>'));

			$('.' + snapshot.val().name).append('<td class="tableRemove">' + _.capitalize(snapshot.val().name) + '</td>');

			$('.' + snapshot.val().name).append('<td class="tableRemove">' + snapshot.val().wins + '</td>');

			$('.' + snapshot.val().name).append('<td class="tableRemove">' + snapshot.val().losses + '</td>');

			$('.' + snapshot.val().name).append('<td class="tableRemove"><button class="play btn btn-outline-success" data-id="' + snapshot.val().ID + '">Play</button></td>');

		}

		

	}, function(errorObject) {

		console.log("Errors handled: " + errorObject.code);

	});

	database.ref().on("child_changed", function(snapshot) {

		if(snapshot.hasChild('ID') == true && snapshot.val().online == false){

			$('.' + snapshot.val().name).remove();
			
		}

		if(snapshot.hasChild('ID') == true & snapshot.val().requested == true & $('.modal').attr('data-modalid') == snapshot.val().ID){

			$('.modal' + snapshot.val().ID).css('display', 'block');

			database.ref(snapshot.val().requestedBy).on("value", function(snapshotreq) {

				$('.modal-name' + snapshot.val().ID).html(_.capitalize(snapshotreq.val().name));

			}, function (errorObject) {

			  	console.log("The read failed: " + errorObject.code);

			});	

		}

		if(snapshot.val().requestStatus == 'denied'){

			database.ref(snapshot.val().ID).update({
	
				requestStatus : 'neutral',

				requestedBy : -1

			});

			$('.modalR' + snapshot.val().ID).css('display', 'block');
			
		}

		if(snapshot.val().requestStatus =='accepted'){

			database.ref(snapshot.val().ID).update({

				requestStatus : 'neutral',

				mainPlayer : snapshot.val().ID,

				secondPlayer: snapshot.val().requestedBy

			});

			$('.modalA' + snapshot.val().ID).css('display', 'block');
			
		}

		// if(snapshot.val().requestStatus =='accepted' && snapshot.val().issecondPlayer == true){

		// 	database.ref(snapshot.val().ID).update({

		// 		requestStatus : 'neutral',

		// 		inGame : false,

		// 		mainPlayer : snapshot.val().requestedBy,

		// 		secondPlayer: snapshot.val().ID,

		// 	});

		// 	$('.secondPlayerContainer').addClass('container' + snapshot.val().ID);

		// 	$('.container' + snapshot.val().ID).css('display', 'block');
			
		// }



	}, function(errorObject) {

		console.log("Errors handled: " + errorObject.code);

	});

	$('#dataInitializer').on('click', function(){

		var userIni = $('.user').val().trim().toLowerCase();

		console.log(userIni);

		if(/^[a-zA-Z]+$/.test(userIni)){

			userName = userIni;

			userWins = 0;

			userLosses = 0;

			database.ref().once("value").then(function(snapshot){

				userIdNumber = snapshot.val().numberOfUsers;

				console.log(snapshot.val().numberOfUsers);

				console.log(userIdNumber);

				userIdNumber++;

				localStorage.setItem('thisUserId', userIdNumber);

				console.log(userIdNumber);

				database.ref().update({

					numberOfUsers : userIdNumber,	

					[userIdNumber]:{

						name : userIni,

						losses: 0,

						wins: 0,

						online: true,

						ID: userIdNumber,

						inGame: false,

						requested: false,

						requestedBy: -1,

						requestStatus: 'neutral',

						linkGameID : -1,

						userChoice: 'none',

						ismainPlayer: false,

						issecondPlayer: false,

						mainPlayer: -1,

						secondPlayer: -1

					}

				});

				$('.modal').attr('data-modalid', userIdNumber);

				$('.modal').addClass('modal' + userIdNumber);

				$('.modal-requester').addClass('modal-name' + userIdNumber);

				$('.modalReject').attr('data-modalid', userIdNumber);

				$('.modalReject').addClass('modalR' + userIdNumber);

				$('.modalAccept').attr('data-modalAid', userIdNumber);

				$('.modalAccept').addClass('modalA' + userIdNumber);
		
			});
			
			$(window).bind('beforeunload', function () {
 	 
				database.ref(userIdNumber).update({
	
						online: false

				});

			});

		}

		else {

			alert('not a string');

		}

		return false;

	});

	$(document).on('click', '.play', function(){

		var requestee = $(this).attr('data-id');

		database.ref(requestee).once("value").then(function(snapshot){

			if(snapshot.val().requested == false){

				database.ref(requestee).update({

					requested: true,

					requestedBy: userIdNumber

				});

				database.ref(userIdNumber).update({

					requestedBy: requestee

				});

			}

			else {

				alert('User is already has a request');

			}

		});

	});

	$('.deny').on('click', function(){

		$('#myModal').css('display', 'none');

		database.ref(userIdNumber).once("value").then(function(snapshot){

			database.ref(snapshot.val().requestedBy).update({

				requestStatus: 'denied'

			});

			database.ref(userIdNumber).update({

				requested: false,

				requestedBy: -1,

			});
	
		});

	});

	$('.accept').on('click', function(){

		$('.modal').css('display', 'none');

		$('.mainPlayerContainer').addClass('container' + userIdNumber);

		$('.container' + userIdNumber).css('display', 'block');

		$('.opponentChoiceSecond').css('display', 'block');

		database.ref().once("value").then(function(snapshot){

			database.ref(userIdNumber).once("value").then(function(snapshotReque){

				database.ref(userIdNumber).update({

					requested : false,

					inGame: true,

					ismainPlayer : true,

				});

				database.ref(snapshotReque.val().requestedBy).update({


					requestStatus: 'accepted',

					inGame: true,

					issecondPlayer: true,

				});
		
			});

		});

	});

	$('.closeReject').on('click', function(){

		$('.modalReject').css('display', 'none');

	});

	$('.closeAccept').on('click', function(){

		$('.modalAccept').css('display', 'none');

		$('.secondPlayerContainer').addClass('container' + userIdNumber);

		$('.container' + userIdNumber).css('display', 'block');

		$('.opponentChoiceMain').css('display', 'block');

	});

});