var myClientId = "7c5798ec1304cce772b3ffc9158a66a2";
function initSC() {
    // init SoundCloud
    SC.initialize({
        client_id: myClientId
    });
}
var currentAge;
var predictiveAge;
// Get elements from DOM
var pageheader = $("#page-header")[0]; //note the [0], jQuery returns an object, so to get the html DOM object we need the first item in the object
var pagecontainer = $("#page-container")[0];
// The html DOM object has been casted to a input element (as defined in index.html) as later we want to get specific fields that are only avaliable from an input element object
var imgSelector = $("#my-file-selector")[0];
var refreshbtn = $("#refreshbtn")[0]; //You dont have to use [0], however this just means whenever you use the object you need to refer to it with [0].
// Register button listeners
imgSelector.addEventListener("change", function () {
    pageheader.innerHTML = "Just a sec while we analyse your picture...";
    processImage(function (file) {
        // Get emotions based on image
        sendEmotionRequest(file, function (faceAttributes) {
            // Find out most dominant emotion
            currentAge = getCurrAge(faceAttributes); //this is where we send out scores to find out the predominant emotion
            changeUI(); //time to update the web app, with their emotion!
            loadSong(currentAge);
            //Done!!
        });
    });
});
refreshbtn.addEventListener("click", function () {
    // TODO: Load random song based on age
    // Load random song based on age
    loadSong(currentAge);
});
function processImage(callback) {
    var file = imgSelector.files[0]; //get(0) is required as imgSelector is a jQuery object so to get the DOM object, its the first item in the object. files[0] refers to the location of the photo we just chose.
    var reader = new FileReader();
    if (file) {
        reader.readAsDataURL(file); //used to read the contents of the file
    }
    else {
        console.log("Invalid file");
    }
    reader.onloadend = function () {
        //After loading the file it checks if extension is jpg or png and if it isnt it lets the user know.
        if (!file.name.match(/\.(jpg|jpeg|png)$/)) {
            pageheader.innerHTML = "Please upload an image file (jpg or png).";
        }
        else {
            //if file is photo it sends the file reference back up
            callback(file);
        }
    };
}
function changeUI() {
    //Show detected age range
    pageheader.innerHTML = "The estimated age range category falls under: " + currentAge.range + "<br/><br/>The predictive age is: " + predictiveAge; //Remember currentAge is a Age object, which has a age and age range picture linked to it.
    //Show age range photo
    var img = $("#selected-img")[0]; //getting a predefined area on our webpage to show the displayAge range
    img.src = currentAge.displayAge; //link that area to the displayAge range of our currentAge.
    img.style.display = "block"; //just some formating of the displayAge's location
    //Display song refresh button
    refreshbtn.style.display = "inline";
    //Remove offset at the top
    pagecontainer.style.marginTop = "20px";
}
// Refer to http://stackoverflow.com/questions/35565732/implementing-microsofts-project-oxford-emotion-api-and-file-upload
// and code snippet in emotion API documentation
function sendEmotionRequest(file, callback) {
    $.ajax({
        url: "https://api.projectoxford.ai/face/v1.0/detect?returnFaceAttributes=age",
        beforeSend: function (xhrObj) {
            // Request headers
            xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "1b3db931b67143a68c4cdd73137ab9bd");
        },
        type: "POST",
        data: file,
        processData: false
    })
        .done(function (data) {
        if (data.length != 0) {
            // Get the face attributes i.e. age is selected later on
            var faceAttributes = data[0].faceAttributes;
            callback(faceAttributes);
        }
        else {
            pageheader.innerHTML = "Hmm, we can't detect a human face in that photo. Try another?";
        }
    })
        .fail(function (error) {
        pageheader.innerHTML = "Sorry, something went wrong. :( Try again in a bit?";
        console.log(error.getAllResponseHeaders());
    });
}
// Section of code that handles the age
//A Age class which has the age as a string and its corresponding displayAge
var Age = (function () {
    function Age(age, displayAgeNumber) {
        this.age = age;
        this.displayAgeNumber = displayAgeNumber;
        this.range = age;
        this.displayAge = displayAgeNumber;
    }
    return Age;
}());
var teens = new Age("teens", "https://aos.iacpublishinglabs.com/question/aq/1400px-788px/how-can-my-teenager-make-friends_39535e87bf2dbc60.jpg?domain=cx.aos.ask.com");
var youngAdults = new Age("youngAdults", "http://dropoflife.com.au/images/dropoflife/young-adults.jpg");
var adults = new Age("adults", "http://matherconsulting.com/blog/wp-content/uploads/2012/03/young-adults.jpg");
var matureAdults = new Age("matureAdults", "http://www.naturalnews.com/gallery/640/Women/Confident-People-Happy-Group.jpg");
var seniors = new Age("seniors", "https://www.auroragov.org/UserFiles/Servers/Server_1881137/Image/Residents/Senior%20Resources/019601.jpg");
var matureSeniors = new Age("matureSeniors", "http://cel.csusb.edu/images/cel_slideshow_osher.png");
// any type as the scores values is from the project oxford api request (so we dont know the type)
function getCurrAge(faceAttributes) {
    predictiveAge = faceAttributes.age; //Assign actual predictive age to the variable
    // In a practical sense, you would find the max emotion out of all the emotions provided. However we'll do the below just for simplicity's sake :P
    if (faceAttributes.age < 20) {
        currentAge = teens;
    }
    else if (faceAttributes.age < 30) {
        currentAge = youngAdults;
    }
    else if (faceAttributes.age < 40) {
        currentAge = adults;
    }
    else if (faceAttributes.age < 50) {
        currentAge = matureAdults;
    }
    else if (faceAttributes.age < 60) {
        currentAge = seniors;
    }
    else {
        currentAge = matureSeniors;
    }
    return currentAge;
}
// Section of code that handles the music and soundcloud
//A Song class which has the song's name and URL on soundcloud
var Song = (function () {
    function Song(songtitle, songurl) {
        this.title = songtitle;
        this.url = songurl;
    }
    return Song;
}());
//A Playlist class which holds various amount of songs for each different age
var Playlist = (function () {
    function Playlist() {
        this.teens = [];
        this.youngAdults = [];
        this.adults = [];
        this.matureAdults = [];
        this.seniors = [];
        this.matureSeniors = [];
    }
    Playlist.prototype.addSong = function (age, song) {
        // depending on the age we want to add it to its corresponding list in our playlist
        if (age === "teens") {
            this.teens.push(song); // this means the value of happy of the playlist object that got invoked the method "addSong"
        }
        else if (age === "youngAdults") {
            this.youngAdults.push(song);
        }
        else if (age === "adults") {
            this.adults.push(song);
        }
        else if (age === "matureAdults") {
            this.matureAdults.push(song);
        }
        else if (age === "seniors") {
            this.seniors.push(song);
        }
        else if (age === "matureSeniors") {
            this.matureSeniors.push(song);
        } // do a default one as well
    };
    Playlist.prototype.getRandSong = function (age) {
        if (age === "teens") {
            return this.teens[Math.floor(Math.random() * this.teens.length)];
        }
        else if (age === "youngAdults") {
            return this.youngAdults[Math.floor(Math.random() * this.youngAdults.length)];
        }
        else if (age === "adults") {
            return this.adults[Math.floor(Math.random() * this.adults.length)];
        }
        else if (age === "matureAdults") {
            return this.matureAdults[Math.floor(Math.random() * this.matureAdults.length)];
        }
        else if (age === "seniors") {
            return this.seniors[Math.floor(Math.random() * this.seniors.length)];
        }
        else if (age === "matureSeniors") {
            return this.matureSeniors[Math.floor(Math.random() * this.matureSeniors.length)];
        }
    };
    return Playlist;
}());
var myPlaylist;
function init() {
    // init playlist
    myPlaylist = new Playlist();
    myPlaylist.addSong("teens", new Song("Wings", "https://soundcloud.com/little-mix/03-track-03")); // Song name and the url of the song on SoundCloud
    myPlaylist.addSong("teens", new Song("Ain't It Fun", "https://soundcloud.com/haidar-alhamid-1/paramore-aint-it-fun-official"));
    myPlaylist.addSong("teens", new Song("Behind Bars", "https://soundcloud.com/thewanted/the-wanted-behind-bars-1-min"));
    myPlaylist.addSong("youngAdults", new Song("Day and Night", "https://soundcloud.com/loricyk/kid-cudi-day-and-night-2"));
    myPlaylist.addSong("youngAdults", new Song("Flatline", "https://soundcloud.com/bobatl/bob-flatline-feat-neil-tyson"));
    myPlaylist.addSong("youngAdults", new Song("Nikes On My Feet", "https://soundcloud.com/sick_cherry_ru/mac-miller-nikes-on-my-feet"));
    myPlaylist.addSong("adults", new Song("Glory", "https://soundcloud.com/johnlegend/glory-ft-common"));
    myPlaylist.addSong("adults", new Song("Mechanical Bull", "https://soundcloud.com/kingsofleon/sets/mechanical-bull-deluxe-version"));
    myPlaylist.addSong("adults", new Song("About the Money", "https://soundcloud.com/tiofficial/ti-about-the-money-ft-young-thug"));
    myPlaylist.addSong("matureAdults", new Song("I'm Not the Marrying Kind", "https://soundcloud.com/elvissonymusic/im-not-the-marrying-kind"));
    myPlaylist.addSong("matureAdults", new Song("4 Minutes", "https://soundcloud.com/loveblonde2014/madonna-4-minutes-2015-loose-ur-breath-mix"));
    myPlaylist.addSong("matureAdults", new Song("Sunday Bloody Sunday", "https://soundcloud.com/you-two/u2-sunday-bloody-sunday"));
    myPlaylist.addSong("seniors", new Song("Captain Fantastic And The Brown Dirt Cowboy", "https://soundcloud.com/elton-john/elton-john-captain-fantastic-1"));
    myPlaylist.addSong("seniors", new Song("Take It Easy", "https://soundcloud.com/silverdogmusic/take-it-easy-the-eagles-1"));
    myPlaylist.addSong("seniors", new Song("Shackled And Drawn", "https://soundcloud.com/brucespringsteen/shackled-and-drawn"));
    myPlaylist.addSong("matureSeniors", new Song("Sway", "https://soundcloud.com/salma-spy/sway-dean-martin"));
    myPlaylist.addSong("matureSeniors", new Song("Ghost Riders in the Sky", "https://soundcloud.com/invizibleman/willie-nelson-johnny-cash-ghost-riders-in-the-sky"));
    myPlaylist.addSong("matureSeniors", new Song("Dancing Queen", "https://soundcloud.com/cainan-esdras-1/abba-dancing-queen-live"));
    // init soundcloud
    initSC();
}
function loadPlayer(trackurl) {
    SC.oEmbed(trackurl, { auto_play: true }).then(function (oEmbed) {
        var div = $("#musicplayer")[0];
        div.innerHTML = oEmbed.html; // puts the soundcloud player inside the musicplayer div
    });
}
// Initialise playlist and soundcloud
init();
function loadSong(currentAge) {
    var songSelected = myPlaylist.getRandSong(currentAge.range); // gets a random song based on the age
    var track_url = songSelected.url;
    $("#track-name")[0].innerHTML = "Have a listen to: " + songSelected.title; // display the song being played
    $("#track-name")[0].style.display = "block"; // changing this style to block makes it appear (before was set to none so it wasnt seen)
    $("#musicplayer")[0].style.display = "block";
    loadPlayer(track_url); // load soundcloud player to play this song
}
