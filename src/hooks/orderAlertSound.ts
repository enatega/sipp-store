type ExpoAvModule = {
  Audio?: {
    setAudioModeAsync?: (mode: {
      allowsRecordingIOS?: boolean;
      playsInSilentModeIOS?: boolean;
      staysActiveInBackground?: boolean;
      shouldDuckAndroid?: boolean;
      interruptionModeAndroid?: number;
    }) => Promise<void>;
    Sound: {
      createAsync: (
        source: number,
        initialStatus?: {
          shouldPlay?: boolean;
          isLooping?: boolean;
          volume?: number;
        },
      ) => Promise<{
        sound: {
          stopAsync: () => Promise<void>;
          unloadAsync: () => Promise<void>;
          getStatusAsync: () => Promise<{ isLoaded?: boolean; isPlaying?: boolean }>;
        };
      }>;
    };
  };
};

let activeSound: {
  stopAsync: () => Promise<void>;
  unloadAsync: () => Promise<void>;
  getStatusAsync: () => Promise<{ isLoaded?: boolean; isPlaying?: boolean }>;
} | null = null;

let preparingPromise: Promise<boolean> | null = null;

async function getExpoAudio() {
  const expoAv = require("expo-av") as ExpoAvModule;
  return expoAv?.Audio ?? null;
}

export async function startOrderAlertLoop() {
  try {
    if (activeSound) {
      const status = await activeSound.getStatusAsync();
      if (status?.isLoaded && status?.isPlaying) {
        return;
      }
    }

    if (preparingPromise) {
      await preparingPromise;
      return;
    }

    preparingPromise = (async () => {
      const audio = await getExpoAudio();
      if (!audio?.Sound?.createAsync) {
        console.log("[store][socket] alert loop skipped: expo-av is not available");
        return false;
      }

      if (audio.setAudioModeAsync) {
        await audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
          interruptionModeAndroid: 1,
        });
      }

      const { sound } = await audio.Sound.createAsync(
        require("../assets/sound/beep3.mp3"),
        { shouldPlay: true, isLooping: true, volume: 1 },
      );

      activeSound = sound;
      return true;
    })();

    await preparingPromise;
  } catch (error) {
    console.log("[store][socket] failed to start alert loop", error);
  } finally {
    preparingPromise = null;
  }
}

export async function stopOrderAlertLoop() {
  if (!activeSound) return;

  try {
    await activeSound.stopAsync();
    await activeSound.unloadAsync();
  } catch (error) {
    console.log("[store][socket] failed to stop alert loop", error);
  } finally {
    activeSound = null;
  }
}
