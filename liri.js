require("dotenv").config();
var Spotify = require('node-spotify-api'); // Spotify api
var axios = require("axios"); // axios package
var fs = require("fs"); // fs package for reading files
var moment = require('moment'); // moment, for time formatting and such
var keys = require("./keys.js"); // the file that holds the spotify API keys
var inquirer = require("inquirer"); // I included inquirer here and in the package.json and everything because even though I didn't use it this time around, I thought it would be a cool thing to have for the future, maybe, so that a user doesn't have to rerun the application every time they want information, they could just keep it going with different commands until they entered something like 'exit'. not entirely sure how I'd pull that off but that would be why I didn't get to experimenting with it this time around. future project.
var command = process.argv[2];
var searchString = process.argv.slice(3).join(" "); // this is the variabl that takes in things like movie names, song names, and artist names.

// finally figured out how to get the stuff out of the keys file!
var spotify = new Spotify({
    id: keys.spotify.id,
    secret: keys.spotify.secret
});

// I used a switch statement and functions because it just seemed easier and less cluttered.
switch(command) {
    case "concert-this":
        getShows();
        break;
    case "spotify-this-song":
        spotifySong();
        break;
    case "movie-this":
        getMovie();
        break;
    case "do-what-it-says":
        readFile();
        break;
}

function getShows() {
    if(searchString === "") {
        console.log("Sorry, invalid input!"); // I did this because...you can't really find venues for an artist if an artist hasn't been given, and I didn't feel like making a default artist.
    }
    else {
        axios.get("https://rest.bandsintown.com/artists/" + searchString + "/events?app_id=codingbootcamp")
        .then(function(response) {
            if(response.data.length === 0) { // I noticed that sometimes there wouldn't be any upcoming shows returned for an artist, and this naturally throws an error message when the program tries to read the venue name and comes up empty, so I included something to check if this was the case.
                console.log("Sorry, but it looks like there are no known upcoming shows for this artist on BandsInTown."); // if this is the case, the program tells you that there are no upcoming shows for this artist.
            }
            else {
                console.log("Venue Name: "+response.data[0].venue.name); // log the venu name
                console.log("Venue Location: "+response.data[0].venue.city+", "+response.data[0].venue.country); // log the city and country of the venue
                console.log("Show Time: "+moment(response.data[0].datetime).format("MM/DD/YYYY")); // log when the show's date is
                console.log("Tickets On Sale: "+moment(response.data[0].on_sale_datetime).format("MM/DD/YYYY")); // I console logged when ticket sales start
                console.log("Lineup: "+response.data[0].lineup); // I console logged the lineup of the show since I figure sometimes the lineup will contain people other than the band you searched for and maybe you want to know that!
            }
        })
        .catch(function(err) { // error handling
            console.log(err);
        });
    }
}

function spotifySong() {
    if(searchString === "") {
        spotify.search({ type: "track", query: "From Heads Unworthy"}) // I know the instructions said 'The Sign by Ace of Base', but I don't know that song and this is my program so I had it default to something I like.
        .then(function(response) {
            console.log("Artist Name(s): "+response.tracks.items[0].album.artists[0].name);
            console.log("Song Name: "+response.tracks.items[0].name);
            console.log("Track Link: "+response.tracks.items[0].href);
            console.log("Album Name: "+response.tracks.items[0].album.name);
        })
        .catch(function(err) { // error handling
            console.log(err);
        });
    }
    else {
        // search spotify for the song name given. type is track. if you enter something for a song that Spotify can't find, it seems to just go for the closest match it can come up with.
        spotify.search({ type: "track", query: searchString})
        .then(function(response) {
            console.log("Artist Name(s): "+response.tracks.items[0].album.artists[0].name); // logs the artist's name
            console.log("Song Name: "+response.tracks.items[0].name); // logs the song name.
            console.log("Track Link: "+response.tracks.items[0].href); // logs a link to the track. the link will take you to the album the song appears on and then start playing the song in question.
            console.log("Album Name: "+response.tracks.items[0].album.name); // logs the album name the song is from
        })
        .catch(function(err) { // error handling
            console.log(err);
        });
    }
}

function getMovie() {
    if(searchString === "") {
        axios.get("http://www.omdbapi.com/?t=The+Avengers&y=&plot=short&apikey=trilogy") // again, I know it said 'default to Mr. Nobody', but: a. it's my program and I don't know the movie and so I went with something I like instead and b. Mr. Nobody is actually not on Netflix anymore so like, if I'm going to be telling people to watch a movie they already can't see without paying for it, I might as well go with a movie I enjoy.
        .then(function(response) {
            // I wasn't sure if they actually wanted me to accompany this recommendation with the information that prints out if you actually enter a movie, so I just...included it anyway.
            console.log("Title: "+response.data.Title);
            console.log("Release Year: "+response.data.Year);
            console.log("IMBD Rating: "+response.data.Ratings[0].Value);
            console.log("Rotten Tomatoes Rating: "+response.data.Ratings[1].Value);
            console.log("Production Country: "+response.data.Country);
            console.log("Language(s): "+response.data.Language);
            console.log("Plot: "+response.data.Plot);
            console.log("Actors: "+response.data.Actors);
            console.log("\nIf you haven't watched The Avengers, you should: https://www.imdb.com/title/tt0848228/\nIt's really good!"); // I included a link to the IMDB page.
        })
        .catch(function(err) { // error handling
            console.log(err);
        });
    }
    else {
        // axios request for information for whatever movie the person's put in
        axios.get("http://www.omdbapi.com/?t="+searchString+"&y=&plot=short&apikey=trilogy")
        .then(function(response) {
            console.log("Title: "+response.data.Title); // today I learned that response values are case-sensitive. anyway. this logs the title.
            console.log("Release Year: "+response.data.Year); // this logs the year
            console.log("IMBD Rating: "+response.data.Ratings[0].Value); // this logs IMDB's rating
            console.log("Rotten Tomatoes Rating: "+response.data.Ratings[1].Value); // this logs the Rotten Tomatoes rating
            console.log("Production Country: "+response.data.Country); // this logs the country the movie was produced in
            console.log("Language(s): "+response.data.Language); // this logs languages that the movie is...I think it must be either languages the movie's available in or languages it was produced in, but I'm not really sure, beacuse for The Avengers it prints out three languages and I couldn't find anything on if those are the only languages the movie was ever produced in or what.
            console.log("Plot: "+response.data.Plot); // this logs a short plot summary.
            console.log("Actors: "+response.data.Actors); // this logs the actors. it seems like it only logs the first four actors from the IMDB page or something? because The Avengers actor list is missing Scarlett Johansson, who definitely was a star of the film, but who is also listed fifth on the actors list on the IMDB page, just behind the four people who DO get console logged here, so.
        })
        .catch(function(err) { // error handling
            console.log(err);
        });
    }
}

// so named because you're getting your information from a text file that's read in.
function readFile() {
    fs.readFile("random.txt", "utf8", function(err, data) {
        if (err) { // error handling, log error if it occurs
            return console.log(err);
        }

        // split the data in the file by commas.
        var dataArr = data.split(",");
        // right now the file is on the movie function with the movie Practical Magic, because I just didn't change it back after testing.

        if(dataArr[0] === "concert-this") {
            axios.get("http://www.bandsintown.com/event/13722599?app_id=codingbootcamp&artist="+dataArr[1]+"&came_from=67")
            .then(function(response) {
                console.log(response);
            })
            .catch(function(err) { // error handling
                console.log(err);
            });
        }
        else if(dataArr[0] === "spotify-this-song") { // I had the thought for a minute that since I have functions for the movie and spotify stuff already, it might be cool if I could just use those, except the issue with that is, of course, I need to search by whatever shows up in the file, which the other functions don't have access to. so. I just repeated the calls I made to spotify and OMDB, except with dataArr[1] for the title and such.
            // search spotify for the song name we get from the file. type is track.
            spotify.search({ type: "track", query: dataArr[1]})
            .then(function(response) {
                console.log("Artist Name(s): "+response.tracks.items[0].album.artists[0].name); // logs the artist's name
                console.log("Song Name: "+response.tracks.items[0].name); // logs the song name.
                console.log("Track Link: "+response.tracks.items[0].href); // logs a link to the track. the link will take you to the album the song appears on and then start playing the song in question.
                console.log("Album Name: "+response.tracks.items[0].album.name); // logs the album name the song is from
            })
            .catch(function(err) { // error handling
                console.log(err);
            });
        }
        else if (dataArr[0] === "movie-this") {
            // axios request for information for whatever movie title is in the file
            axios.get("http://www.omdbapi.com/?t="+dataArr[1]+"&y=&plot=short&apikey=trilogy")
            .then(function(response) {
                console.log("Title: "+response.data.Title); // today I learned that response values are case-sensitive. anyway. this logs the title.
                console.log("Release Year: "+response.data.Year); // this logs the year
                console.log("IMBD Rating: "+response.data.Ratings[0].Value); // this logs IMDB's rating
                console.log("Rotten Tomatoes Rating: "+response.data.Ratings[1].Value); // this logs the Rotten Tomatoes rating
                console.log("Production Country: "+response.data.Country); // this logs the country the movie was produced in
                console.log("Language(s): "+response.data.Language); // this logs languages that the movie is...I think it must be either languages the movie's available in or languages it was produced in, but I'm not really sure, beacuse for The Avengers it prints out three languages and I couldn't find anything on if those are the only languages the movie was ever produced in or what.
                console.log("Plot: "+response.data.Plot); // this logs a short plot summary.
                console.log("Actors: "+response.data.Actors); // this logs the actors. it seems like it only logs the first four actors from the IMDB page or something? because The Avengers actor list is missing Scarlett Johansson, who definitely was a star of the film, but who is also listed fifth on the actors list on the IMDB page, just behind the four people who DO get console logged here, so.
            })
            .catch(function(err) { // error handling
                console.log(err);
            });
        }
    });
}