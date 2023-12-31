import shaka from "shaka-player";
import bindToShaka from "../../binders/shaka";

/**
 * Scenario to launch a low-latency DASH content with autoPlay until a timeout,
 * its end (or an error) through the shaka-player.
 * @param {HTMLMediaElement} mediaElement - The media element on which the
 * content will play.
 * @param {Object} metricsStore
 * @param {string} mpdUrl - URL to the DASH MPD that you want to play.
 * @param {number} timeout - Timeout after which the test will end, in
 * milliseconds.
 * @returns {Promise}
 */
export default function ShakaSimpleLoadVideoDash(
  mediaElement,
  metricsStore,
  mpdUrl,
  timeout
) {
  return new Promise(async (res) => {
    let hasEnded = false;

    shaka.polyfill.installAll();
    const player = new shaka.Player(mediaElement);
    player.configure({
      streaming: {
        lowLatencyMode: true,
      },
    });
    window.player = player;
    const unbind = bindToShaka(player, mediaElement, metricsStore);

    player
      .load(mpdUrl)
      .then(() => {
        mediaElement.play();
      })
      .catch((err) => {
        console.error(err);
      });

    const timeoutId = setTimeout(finish, timeout);

    function finish() {
      if (hasEnded) {
        return;
      }
      hasEnded = true;
      clearTimeout(timeoutId);
      unbind();
      player.destroy();
      delete window.player;
      res();
    }
  });
}
