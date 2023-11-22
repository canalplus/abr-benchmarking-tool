import { computeBufferSize, emitBufferingEvents } from "../utils";

/**
 * Bind the player-tester to ShakaPlayer events
 * @param {Object} player - The ShakaPlayer instance
 * @param {HTMLMediaElement} videoElement - The media element on which the
 * content plays.
 * @param {Object} metricsStore
 * @returns {Function} - returns a function to unsubscribe to binded events.
 */
export default function bindToShaka(player, videoElement, metricsStore) {
  player.addEventListener('adaptation', onAdaptation);
  const stopEmittingBuffering = emitBufferingEvents(videoElement, metricsStore);
  updatePlaybackRate();
  videoElement.addEventListener("ratechange", updatePlaybackRate);

  updateBufferSize();
  const bufferSizeItv = setInterval(updateBufferSize, 100);

  let videoBandwidth;
  let audioBandwidth;

  function onAdaptation() {
    var tracks = player.getVariantTracks();
    tracks.forEach(function(t) {
      if (t.active) {  // an active track, that is, in use by the player right now
        if (videoBandwidth !== t.videoBandwidth) {
          videoBandwidth = t.videoBandwidth;
          metricsStore.registerEvent("videoBitrate", videoBandwidth);
        }
        if (audioBandwidth !== t.audioBandwidth) {
          audioBandwidth = t.audioBandwidth;
          metricsStore.registerEvent("audioBitrate", audioBandwidth);
        }
      }
    });
  }

  function updateBufferSize() {
    const bufferSize = computeBufferSize(videoElement);
    metricsStore.registerEvent("bufferSize", bufferSize);
  }

  function updatePlaybackRate() {
    metricsStore.registerEvent("playbackRate", videoElement.playbackRate);
  }

  return () => {
    stopEmittingBuffering();

    // send for the last time exceptional events (to have a continuous chart)
    updatePlaybackRate();

    // unbind event listeners
    clearInterval(bufferSizeItv);
    videoElement.removeEventListener("ratechange", updatePlaybackRate);
    player.removeEventListener('adaptation', onAdaptation);
  };
}
