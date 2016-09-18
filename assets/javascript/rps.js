$(document).ready(function(){

	var userName;

	var userWins;

	var userLosses;

	var totalUsers;

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

				$('.modal-name' + snapshot.val().ID).append(_.capitalize(snapshotreq.val().name));

			}, function (errorObject) {

			  	console.log("The read failed: " + errorObject.code);

			});

			

		}

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

						requestedBy: -1

					}

				});

				$('.modal').attr('data-modalid', userIdNumber);

				$('.modal').addClass('modal' + userIdNumber);

				$('.modal-requester').addClass('modal-name' + userIdNumber);
		
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

		var future = $(this).attr('data-id');

		database.ref(future).once("value").then(function(snapshot){

			if(snapshot.val().requested == false){

				database.ref(future).update({

				requested: true,

				requestedBy: userIdNumber

				});

			}

			else {

				alert('User is already has a request');

			}

		});

	});

});