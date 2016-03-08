/* An Javascript port of Tarsos's JAVA implementation
 * of various pitch detection algorithms, created by
 * Joren Six of University College Ghent.
 *
 * Contains the following algorithms:
 * YIN (with and without FFT; the version with requires an external FFT library)
 * Average Magnitude Difference
 * Dynamic Wavelet
 * McLeod Pitch Method
 *
 * Since this Javascript and we have first-class functions,
 * each method creates and returns a pitch detector function
 * with the given configuration.  When called with a float32Array
 * representing an audio buffer, it returns the pitch.
 *
 * Methods vary in accuracy and speed.  I have found the best results with YIN.
 *
 * Find the original project at http://tarsos.0110.be/tag/TarsosDSP
 * or on Github at https://github.com/JorenSix/TarsosDSP
 */

export function YIN(config) {
  const DEFAULT_THRESHOLD = 0.10;
  const DEFAULT_BUFFER_SIZE = 2048;
  const DEFAULT_SAMPLE_RATE = 44100;
  const threshold = config.threshold || DEFAULT_THRESHOLD;
  const sampleRate = config.sampleRate || DEFAULT_SAMPLE_RATE;
  const bufferSize = config.bufferSize || DEFAULT_BUFFER_SIZE;
  const yinBuffer = new Float32Array(bufferSize / 2);
  const yinBufferLength = bufferSize / 2;
  const result = {};

  // Implements the difference function as described in step 2 of the YIN paper.
  function difference(float32AudioBuffer) {
    let index = 0;
    let delta = 0.0;
    let tau = 0;
    for (tau = 0; tau < yinBufferLength; tau++) {
      yinBuffer[tau] = 0;
    }
    for (tau = 1; tau < yinBufferLength; tau++) {
      for (index = 0; index < yinBufferLength; index++) {
        delta = float32AudioBuffer[index] - float32AudioBuffer[index + tau];
        yinBuffer[tau] += delta * delta;
      }
    }
  }

  // Implements the cumulative mean normalized difference as described in step 3 of the paper.
  function cumulativeMeanNormalizedDifference() {
    yinBuffer[0] = 1;
    yinBuffer[1] = 1;
    var runningSum = 0;
    for (var tau = 1; tau < yinBufferLength; tau++) {
      runningSum += yinBuffer[tau];
      yinBuffer[tau] *= tau / runningSum;
    }
  }

  function absoluteThreshold() {
    // Since the first two positions in the array are 1,
    // we can start at the third position.
    for (var tau = 2; tau < yinBufferLength; tau++) {
      if (yinBuffer[tau] < threshold) {
        while (tau + 1 < yinBufferLength && yinBuffer[tau + 1] < yinBuffer[tau]) {
          tau++;
        }
        // found tau, exit loop and return
        // store the probability
        // From the YIN paper: The threshold determines the list of
        // candidates admitted to the set, and can be interpreted as the
        // proportion of aperiodic power tolerated
        // within a periodic signal.
        //
        // Since we want the periodicity and and not aperiodicity:
        // periodicity = 1 - aperiodicity
        result.probability = 1 - yinBuffer[tau];
        break;
      }
    }

    // if no pitch found, set tau to -1
    if (tau === yinBufferLength || yinBuffer[tau] >= threshold) {
      tau = -1;
      result.probability = 0;
      result.foundPitch = false;
    } else {
      result.foundPitch = true;
    }

    return tau;
  }

  /**
   * Implements step 5 of the AUBIO_YIN paper. It refines the estimated tau
   * value using parabolic interpolation. This is needed to detect higher
   * frequencies more precisely. See http://fizyka.umk.pl/nrbook/c10-2.pdf and
   * for more background
   * http://fedc.wiwi.hu-berlin.de/xplore/tutorials/xegbohtmlnode62.html
   */

  function parabolicInterpolation(tauEstimate) {
    let betterTau;
    let x0;
    let x2;

    if (tauEstimate < 1) {
      x0 = tauEstimate;
    } else {
      x0 = tauEstimate - 1;
    }
    if (tauEstimate + 1 < yinBufferLength) {
      x2 = tauEstimate + 1;
    } else {
      x2 = tauEstimate;
    }
    if (x0 === tauEstimate) {
      if (yinBuffer[tauEstimate] <= yinBuffer[x2]) {
        betterTau = tauEstimate;
      } else {
        betterTau = x2;
      }
    } else if (x2 === tauEstimate) {
      if (yinBuffer[tauEstimate] <= yinBuffer[x0]) {
        betterTau = tauEstimate;
      } else {
        betterTau = x0;
      }
    } else {
      let s0, s1, s2;
      s0 = yinBuffer[x0];
      s1 = yinBuffer[tauEstimate];
      s2 = yinBuffer[x2];
      // fixed AUBIO implementation, thanks to Karl Helgason:
      // (2.0f * s1 - s2 - s0) was incorrectly multiplied with -1
      betterTau = tauEstimate + (s2 - s0) / (2 * (2 * s1 - s2 - s0));
    }
    return betterTau;
  }

  // Return the pitch of a given signal, or -1 if none is detected.
  return function(float32AudioBuffer) {
    // Step 2
    difference(float32AudioBuffer);

    // Step 3
    cumulativeMeanNormalizedDifference();

    // Step 4
    const tauEstimate = absoluteThreshold();

    // Step 5
    if (tauEstimate !== -1) {
      const betterTau = parabolicInterpolation(tauEstimate);

      // TODO: optimization!

      result.freq = sampleRate / betterTau;
    } else {
      result.freq = -1;
    }

    // Good luck!
    return result;
  };
};
