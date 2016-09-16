$(document).ready(function(){

	var config = {

	    apiKey: "AIzaSyB1FkxhV9lBENS4EBj7VMATN1Z6Ui6LiKo",
	    authDomain: "rps-multi-c5a5e.firebaseapp.com",
	    databaseURL: "https://rps-multi-c5a5e.firebaseio.com",
	    storageBucket: "",
	    messagingSenderId: "180232972398"

	};

	firebase.initializeApp(config);

	var database = firebase.database();

	var userIdNumber = 0;

	database.ref().once("value").then(function(snapshot){

		userIdNumber = snapshot.val().numberOfUsers;
		
	});

	$('#dataInitializer').on('click', function(){

		var userIni = $('.user').val().trim().toLowerCase();

		console.log(userIni);

		if(/^[a-zA-Z]+$/.test(userIni)){

			userIdNumber = parseInt(userIdNumber);

			userIdNumber++;

			localStorage.setItem('thisUserId', userIdNumber);

			database.ref().update({

				numberOfUsers : userIdNumber,	

				[userIdNumber]:{

					name : userIni,

					losses: 0,

					wins: 0,

					online: true,

					}

			});

			$(window).bind('beforeunload', function () {
 	 
				database.ref(localStorage.getItem("thisUserId")).update({
	
						online: false

				});

			});

			

		}

		else {

			alert('not a string');

		}

		return false;

	});

	

});