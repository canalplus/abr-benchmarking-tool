import { testRxplayer } from "./test-rx";
//import { testDashJs } from "./test-dashjs";
const videoElement = document.querySelector("video");
const MPD_URL =
  "http://localhost:5001/videos/BigBuckBunny/2sec/BigBuckBunny_2s_simple_2014_05_09.mpd";

testRxplayer(videoElement, MPD_URL)
//testDashJs(videoElement, MPD_URL)