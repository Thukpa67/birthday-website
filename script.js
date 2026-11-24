/* SPIDER-MAN WELCOME SCREEN */

function enterBirthday() {
const response = document.getElementById("spideyResponse");
const screen = document.getElementById("spideyScreen");

response.textContent = "I KNEW IT!";

setTimeout(function () {
screen.style.display = "none";
}, 900);
}

/* BIRTHDAY WEBSITE */

document.addEventListener("DOMContentLoaded", function () {
const envelope = document.querySelector(".envelope-area");
const song = document.getElementById("birthdaySong");
const musicButton = document.getElementById("musicButton");

if (!envelope || !song || !musicButton) return;

let musicTimer = null;
let volumeTimer = null;
let fadeStartTime = null;
let fadeStartVolume = 0;
let fadeElapsed = 0;
let fadeComplete = false;

const targetVolume = 1.0;
const fadeDuration = 30000;
const musicDuration = 110;

song.volume = 0;
song.loop = false;

/* WHOOSH SOUND */

function playWhoosh(isOpening) {
const AudioContext =
window.AudioContext || window.webkitAudioContext;

if (!AudioContext) return;  

const audio = new AudioContext();  
const duration = isOpening ? 0.55 : 0.35;  

const bufferSize = audio.sampleRate * duration;  
const buffer = audio.createBuffer(1, bufferSize, audio.sampleRate);  
const data = buffer.getChannelData(0);  

for (let i = 0; i < bufferSize; i++) {  
  data[i] = Math.random() * 2 - 1;  
}  

const source = audio.createBufferSource();  
source.buffer = buffer;  

const filter = audio.createBiquadFilter();  
filter.type = "lowpass";  

filter.frequency.setValueAtTime(  
  isOpening ? 900 : 650,  
  audio.currentTime  
);  

filter.frequency.exponentialRampToValueAtTime(  
  180,  
  audio.currentTime + duration  
);  

const gain = audio.createGain();  

gain.gain.setValueAtTime(0.0001, audio.currentTime);  

gain.gain.linearRampToValueAtTime(  
  isOpening ? 0.055 : 0.035,  
  audio.currentTime + duration * 0.35  
);  

gain.gain.exponentialRampToValueAtTime(  
  0.0001,  
  audio.currentTime + duration  
);  

source.connect(filter);  
filter.connect(gain);  
gain.connect(audio.destination);  

source.start();  
source.stop(audio.currentTime + duration);  

source.onended = function () {  
  audio.close();  
};

}

/* MUSIC BUTTON IMAGE */

function updateMusicImage() {
if (song.paused) {
musicButton.src = "play.png";
musicButton.alt = "Play music";
} else {
musicButton.src = "pause.png";
musicButton.alt = "Pause music";
}
}

/* MUSIC BUTTON ANIMATION */

function shakeMusicImage() {
musicButton.classList.remove("shake");
void musicButton.offsetWidth;
musicButton.classList.add("shake");
}

/* STOP FADE */

function stopFade() {
if (fadeStartTime !== null) {
fadeElapsed += Date.now() - fadeStartTime;
fadeStartTime = null;
}

clearInterval(volumeTimer);  
volumeTimer = null;

}

/* MUSIC FADE-IN */

function startFade() {
if (fadeComplete) {
song.volume = targetVolume;
return;
}

stopFade();  

fadeStartVolume = song.volume;  
fadeStartTime = Date.now();  

volumeTimer = setInterval(function () {  
  const elapsed =  
    fadeElapsed + (Date.now() - fadeStartTime);  

  const progress = Math.min(elapsed / fadeDuration, 1);  

  song.volume =  
    fadeStartVolume +  
    (targetVolume - fadeStartVolume) * progress;  

  if (progress >= 1) {  
    clearInterval(volumeTimer);  
    volumeTimer = null;  
    fadeStartTime = null;  
    fadeElapsed = fadeDuration;  
    fadeComplete = true;  
    song.volume = targetVolume;  
  }  
}, 100);

}

/* START MUSIC */

async function startMusic() {
try {
await song.play();

if (!fadeComplete && !volumeTimer) {  
    startFade();  
  }  

} catch (error) {  
  console.log("Music playback failed:", error);  
}  

updateMusicImage();

}

/* PLAY / PAUSE */

async function toggleMusic() {
shakeMusicImage();

if (song.paused) {  
  clearTimeout(musicTimer);  
  musicTimer = null;  
  await startMusic();  
} else {  
  song.pause();  
  stopFade();  
}  

updateMusicImage();

}

/* AUTOMATIC MUSIC ON ENVELOPE OPEN */

function scheduleMusic() {
clearTimeout(musicTimer);

song.volume = 0;  
song.currentTime = 0;  

song.play().then(function () {  
  updateMusicImage();  

  musicTimer = setTimeout(function () {  
    if (!song.paused) {  
      startFade();  
    }  
  }, 2000);  

}).catch(function (error) {  
  console.log("Tap the music button to start music:", error);  
  updateMusicImage();  
});

}

/* REPEAT MUSIC AFTER 1 MINUTE 50 SECONDS */

song.addEventListener("timeupdate", function () {
if (song.currentTime >= musicDuration) {
song.currentTime = 0;

if (!song.paused) {  
    song.play().catch(function (error) {  
      console.log("Music replay failed:", error);  
    });  
  }  
}

});

/* RESTART IF THE AUDIO FILE ENDS EARLIER */

song.addEventListener("ended", function () {
song.currentTime = 0;

song.play().catch(function (error) {  
  console.log("Music replay failed:", error);  
});

});

/* ENVELOPE OPEN / CLOSE */

envelope.addEventListener("click", function () {
const isOpening = !envelope.classList.contains("open");

playWhoosh(isOpening);  
envelope.classList.toggle("open");  

if (isOpening) {  
  scheduleMusic();  
} else {  
  clearTimeout(musicTimer);  
  stopFade();  

  musicTimer = null;  

  song.pause();  
  song.currentTime = 0;  
  song.volume = 0;  

  fadeComplete = false;  
  fadeElapsed = 0;  
  fadeStartVolume = 0;  
  fadeStartTime = null;  

  updateMusicImage();  
}

});

/* MUSIC BUTTON */

musicButton.addEventListener("click", function (event) {
event.stopPropagation();
toggleMusic();
});

musicButton.addEventListener("keydown", function (event) {
if (event.key === "Enter" || event.key === " ") {
event.preventDefault();
event.stopPropagation();
toggleMusic();
}
});

song.addEventListener("play", updateMusicImage);
song.addEventListener("pause", updateMusicImage);

updateMusicImage();
});