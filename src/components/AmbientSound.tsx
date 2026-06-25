import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "./ui/button";

const STORAGE = "ikigai-ambient";

export function AmbientSound() {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (localStorage.getItem(STORAGE) === "on") {
      // require a user gesture to start audio — defer until toggle
    }
  }, []);

  const stop = () => {
    nodesRef.current?.stop();
    nodesRef.current = null;
    ctxRef.current?.close();
    ctxRef.current = null;
  };

  const start = async () => {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    const ctx: AudioContext = new Ctx();
    await ctx.resume();
    ctxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.value = 0;
    master.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 2);
    master.connect(ctx.destination);

    // Low drone — two detuned sine oscillators + slow LFO on gain
    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    oscA.type = "sine"; oscB.type = "sine";
    oscA.frequency.value = 55;      // A1
    oscB.frequency.value = 55 * 1.5; // perfect fifth
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.6;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.2;
    lfo.connect(lfoGain).connect(droneGain.gain);
    oscA.connect(droneGain); oscB.connect(droneGain);
    droneGain.connect(master);

    // Wind — filtered noise
    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer; noise.loop = true;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "lowpass"; noiseFilter.frequency.value = 420;
    const noiseGain = ctx.createGain();
    noiseGain.gain.value = 0.08;
    const windLfo = ctx.createOscillator();
    windLfo.frequency.value = 0.12;
    const windLfoGain = ctx.createGain();
    windLfoGain.gain.value = 0.05;
    windLfo.connect(windLfoGain).connect(noiseGain.gain);
    noise.connect(noiseFilter).connect(noiseGain).connect(master);

    oscA.start(); oscB.start(); lfo.start(); noise.start(); windLfo.start();

    // Occasional chime
    const chimeInterval = setInterval(() => {
      if (!ctxRef.current) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
      const f = notes[Math.floor(Math.random() * notes.length)];
      const o = ctx.createOscillator();
      o.type = "sine"; o.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = 0;
      g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4);
      o.connect(g).connect(master);
      o.start(); o.stop(ctx.currentTime + 4.1);
    }, 12000 + Math.random() * 8000);

    nodesRef.current = {
      stop: () => {
        clearInterval(chimeInterval);
        master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        setTimeout(() => { try { oscA.stop(); oscB.stop(); lfo.stop(); noise.stop(); windLfo.stop(); } catch {} }, 450);
      },
    };
  };

  const toggle = async () => {
    if (on) { stop(); setOn(false); localStorage.setItem(STORAGE, "off"); }
    else { await start(); setOn(true); localStorage.setItem(STORAGE, "on"); }
  };

  useEffect(() => () => stop(), []);

  return (
    <Button
      variant="ghost" size="sm"
      onClick={toggle}
      title={on ? "Mute ambient" : "Play ambient soundscape"}
      className="text-muted-foreground gap-1.5"
    >
      {on ? <Volume2 className="h-4 w-4 text-accent" /> : <VolumeX className="h-4 w-4" />}
    </Button>
  );
}
