import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { AuroraBackground } from "./components/AuroraBackground";
import { ComfortDock } from "./components/ComfortDock";
import { ComfortMessages } from "./components/ComfortMessages";
import { ComfortRoom } from "./components/ComfortRoom";
import { FavoriteThings } from "./components/FavoriteThings";
import { FloatingParticles } from "./components/FloatingParticles";
import { MoodCheckIn } from "./components/MoodCheckIn";
import { PersonalMemories } from "./components/PersonalMemories";
import { RelaxationActivities } from "./components/RelaxationActivities";
import { SettingsModal } from "./components/SettingsModal";
import { Soundscapes } from "./components/Soundscapes";
import { TopBar } from "./components/TopBar";
import { Welcome } from "./components/Welcome";
import { BreathingSpace } from "./components/BreathingSpace";
import { loadFavorites, loadMemories, loadMood, loadSettings, saveFavorites, saveMemories, saveMood, saveSettings } from "./lib/storage";
import { setAmbienceVolume, startAmbience, stopAmbience } from "./lib/ambientAudio";
import { useSystemReducedMotion } from "./hooks/useReducedMotion";
import type { EnvironmentId, FavoriteThing, Memory, Mood, Screen, UserSettings } from "./types/app";

const pageTransition = {
  initial: { opacity: 0, y: 14, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -10, filter: "blur(8px)" },
  transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] },
} as const;

export default function App() {
  const systemReducedMotion = useSystemReducedMotion();
  const [activeScreen, setActiveScreen] = useState<Screen>("welcome");
  const [environment, setEnvironment] = useState<EnvironmentId>("rain");
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [favorites, setFavorites] = useState<FavoriteThing[]>([]);
  const [settings, setSettings] = useState<UserSettings>({
    reducedMotion: false,
    reducedTransparency: false,
    ambienceVolume: 0.35,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isAmbiencePlaying, setIsAmbiencePlaying] = useState(false);

  useEffect(() => {
    setMemories(loadMemories());
    setFavorites(loadFavorites());
    setSettings(loadSettings());
    const storedMood = loadMood();
    if (storedMood) setSelectedMood(storedMood as Mood);
  }, []);

  useEffect(() => {
    saveSettings(settings);
    setAmbienceVolume(settings.ambienceVolume);
  }, [settings]);

  const effectiveReducedMotion = systemReducedMotion || settings.reducedMotion;

  const shellClasses = useMemo(
    () =>
      settings.reducedTransparency
        ? "bg-slate-950/40 [--glass-strength:0.16]"
        : "bg-transparent [--glass-strength:0.075]",
    [settings.reducedTransparency],
  );

  function navigate(screen: Screen): void {
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: effectiveReducedMotion ? "auto" : "smooth" });
  }

  function handleSelectMood(mood: Mood): void {
    setSelectedMood(mood);
    saveMood(mood);
  }

  function handleAddMemory(memory: Memory): void {
    const updated = [memory, ...memories];
    setMemories(updated);
    saveMemories(updated);
  }

  function handleDeleteMemory(id: string): void {
    const updated = memories.filter((memory) => memory.id !== id);
    setMemories(updated);
    saveMemories(updated);
  }

  function handleAddFavorite(favorite: FavoriteThing): void {
    const updated = [favorite, ...favorites];
    setFavorites(updated);
    saveFavorites(updated);
  }

  function handleDeleteFavorite(id: string): void {
    const updated = favorites.filter((favorite) => favorite.id !== id);
    setFavorites(updated);
    saveFavorites(updated);
  }

  async function toggleAmbience(): Promise<void> {
    if (isAmbiencePlaying) {
      stopAmbience();
      setIsAmbiencePlaying(false);
      return;
    }

    await startAmbience(environment, settings.ambienceVolume);
    setIsAmbiencePlaying(true);
  }

  async function changeEnvironment(nextEnvironment: EnvironmentId): Promise<void> {
    setEnvironment(nextEnvironment);
    if (isAmbiencePlaying) {
      await startAmbience(nextEnvironment, settings.ambienceVolume);
    }
  }

  function handleSettingsChange(nextSettings: UserSettings): void {
    setSettings(nextSettings);
  }

  function clearLocalData(): void {
    stopAmbience();
    window.localStorage.clear();
    setMemories([]);
    setFavorites([]);
    setSelectedMood(null);
    setIsAmbiencePlaying(false);
    setSettings({ reducedMotion: false, reducedTransparency: false, ambienceVolume: 0.35 });
  }

  useEffect(() => {
    return () => stopAmbience();
  }, []);

  return (
    <div className={`min-h-screen text-cream-100 ${shellClasses}`}>
      <AuroraBackground environment={environment} reducedMotion={effectiveReducedMotion} />
      <FloatingParticles reducedMotion={effectiveReducedMotion} />
      <TopBar onOpenSettings={() => setSettingsOpen(true)} />

      <main id="main-content">
        <AnimatePresence mode="wait">
          <motion.div key={activeScreen} {...(effectiveReducedMotion ? {} : pageTransition)}>
            {activeScreen === "welcome" ? <Welcome onNavigate={navigate} reducedMotion={effectiveReducedMotion} /> : null}
            {activeScreen === "mood" ? <MoodCheckIn selectedMood={selectedMood} onSelectMood={handleSelectMood} onNavigate={navigate} /> : null}
            {activeScreen === "breathe" ? <BreathingSpace reducedMotion={effectiveReducedMotion} onOpenRoom={() => navigate("room")} /> : null}
            {activeScreen === "room" ? (
              <ComfortRoom
                environment={environment}
                mood={selectedMood}
                onChangeEnvironment={(next) => void changeEnvironment(next)}
                onNavigate={navigate}
                isAmbiencePlaying={isAmbiencePlaying}
                onToggleAmbience={() => void toggleAmbience()}
              />
            ) : null}
            {activeScreen === "sounds" ? (
              <Soundscapes
                environment={environment}
                volume={settings.ambienceVolume}
                isAmbiencePlaying={isAmbiencePlaying}
                onEnvironmentChange={(next) => void changeEnvironment(next)}
                onVolumeChange={(volume) => setSettings({ ...settings, ambienceVolume: volume })}
                onToggleAmbience={() => void toggleAmbience()}
              />
            ) : null}
            {activeScreen === "memories" ? (
              <PersonalMemories memories={memories} onAddMemory={handleAddMemory} onDeleteMemory={handleDeleteMemory} />
            ) : null}
            {activeScreen === "messages" ? <ComfortMessages selectedMood={selectedMood} /> : null}
            {activeScreen === "favorites" ? (
              <FavoriteThings favorites={favorites} onAddFavorite={handleAddFavorite} onDeleteFavorite={handleDeleteFavorite} />
            ) : null}
            {activeScreen === "activities" ? <RelaxationActivities onNavigate={navigate} /> : null}
          </motion.div>
        </AnimatePresence>
      </main>

      {activeScreen !== "welcome" ? <ComfortDock activeScreen={activeScreen} onChangeScreen={navigate} /> : null}

      <SettingsModal
        open={settingsOpen}
        settings={settings}
        onClose={() => setSettingsOpen(false)}
        onChangeSettings={handleSettingsChange}
        onClearData={clearLocalData}
      />
    </div>
  );
}
