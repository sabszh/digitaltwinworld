"use client";

import type { GeneratedDilemma } from "@/types/world2046";

type AudioContextConstructor = typeof AudioContext;
type SoundscapeTag = "urban" | "coastal" | "desert" | "night" | "high-tech" | "tense" | "hopeful" | "care" | "learning" | "industrial";
type ManagedNode = AudioNode & { stop?: (when?: number) => void };
type SoundscapeState = {
  gain: GainNode;
  nodes: ManagedNode[];
  signature: string;
};

function getAudioContextConstructor(): AudioContextConstructor | undefined {
  if (typeof window === "undefined") return undefined;
  return window.AudioContext ?? (window as typeof window & { webkitAudioContext?: AudioContextConstructor }).webkitAudioContext;
}

function createNoiseBuffer(context: AudioContext, duration = 1) {
  const buffer = context.createBuffer(1, Math.max(1, Math.floor(context.sampleRate * duration)), context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }
  return buffer;
}

function rampGain(gain: AudioParam, value: number, at: number) {
  gain.cancelScheduledValues(at);
  gain.setValueAtTime(gain.value, at);
  gain.linearRampToValueAtTime(value, at);
}

function uniqueTags(tags: SoundscapeTag[]) {
  return [...new Set(tags)];
}

export function inferSoundscapeTags(dilemma: GeneratedDilemma): SoundscapeTag[] {
  const tags: SoundscapeTag[] = [];
  const placeText = `${dilemma.city} ${dilemma.country} ${dilemma.exactPlace?.name ?? ""}`.toLowerCase();

  if (["bymidte", "togstation", "lufthavn", "rådhus", "digital borgerservice", "bank"].includes(dilemma.locationType)) tags.push("urban");
  if (["havn", "kystby", "vandværk"].includes(dilemma.locationType)) tags.push("coastal");
  if (["landbrug", "gård", "energinet"].includes(dilemma.locationType)) tags.push("desert");
  if (["fabrik", "lager", "distributionscenter", "datacenter"].includes(dilemma.locationType)) tags.push("industrial");
  if (["folkeskole", "gymnasium", "universitet", "bibliotek", "fritidsklub", "online læringsplatform"].includes(dilemma.locationType)) tags.push("learning");
  if (["hospital", "sundhedsklinik", "plejehjem", "hjemmet", "apotek", "mental health center"].includes(dilemma.locationType)) tags.push("care");

  if (dilemma.problemArea === "Digital tillid, rettigheder og styring") tags.push("tense", "high-tech");
  if (dilemma.problemArea === "Mobilitet, byliv og bolig") tags.push("urban");
  if (dilemma.problemArea === "Klima, energi og resiliens") tags.push("coastal", "tense");
  if (dilemma.problemArea === "Uddannelse og læring") tags.push("learning", "hopeful");
  if (dilemma.problemArea === "Sundhed og omsorg") tags.push("care");
  if (dilemma.problemArea === "Arbejde og arbejdsliv") tags.push("industrial", "tense");

  if (dilemma.tags.some((tag) => /tillid|kontrol|overvågning|rettighed|ansvar|risiko/i.test(tag))) tags.push("tense");
  if (/AI|digital|data|robot|sensor|algoritmisk|automation/i.test(dilemma.technology)) tags.push("high-tech");
  if (dilemma.severity === "low") tags.push("hopeful");
  if (/tokyo|singapore|seoul|shanghai|new york|london|københavn|copenhagen|paris|berlin/.test(placeText)) tags.push("urban", "night");
  if (/sahara|desert|dubai|riyadh|cairo|ørken/.test(placeText)) tags.push("desert");
  if (/coast|kyst|harbor|havn|water|vand|island|ø/.test(placeText)) tags.push("coastal");

  return uniqueTags(tags.length ? tags : ["urban", "hopeful"]);
}

class WorldSoundEngine {
  private context?: AudioContext;
  private master?: GainNode;
  private sfx?: GainNode;
  private ambience?: GainNode;
  private scanNodes: AudioNode[] = [];
  private soundscape?: SoundscapeState;
  private muted = false;

  async unlock() {
    const AudioCtor = getAudioContextConstructor();
    if (!AudioCtor) return;

    if (!this.context) {
      this.context = new AudioCtor();
      this.master = this.context.createGain();
      this.sfx = this.context.createGain();
      this.ambience = this.context.createGain();

      this.master.gain.value = this.muted ? 0 : 0.72;
      this.sfx.gain.value = 0.74;
      this.ambience.gain.value = 0.42;

      this.sfx.connect(this.master);
      this.ambience.connect(this.master);
      this.master.connect(this.context.destination);
    }

    if (this.context.state === "suspended") {
      await this.context.resume();
    }
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (!this.context || !this.master) return;
    rampGain(this.master.gain, muted ? 0 : 0.72, this.context.currentTime + 0.18);
  }

  playButtonTap() {
    const context = this.context;
    if (!context || !this.sfx) return;

    const sfx = this.sfx;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(420, now);
    oscillator.frequency.exponentialRampToValueAtTime(650, now + 0.06);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.065, now + 0.025);
    gain.gain.setTargetAtTime(0.0001, now + 0.09, 0.08);
    oscillator.connect(gain);
    gain.connect(sfx);
    oscillator.start(now);
    oscillator.stop(now + 0.28);
  }

  playStartJourney() {
    const context = this.context;
    if (!context || !this.sfx) return;

    const sfx = this.sfx;
    const now = context.currentTime;
    [196, 294, 392].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.14, now + 1.6);
      gain.gain.setValueAtTime(0.0001, now + index * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.085 / (index + 1), now + 0.46 + index * 0.12);
      gain.gain.setTargetAtTime(0.0001, now + 1.25 + index * 0.08, 0.42);
      oscillator.connect(gain);
      gain.connect(sfx);
      oscillator.start(now + index * 0.06);
      oscillator.stop(now + 2.35);
    });
  }

  startScanLoop() {
    const context = this.context;
    if (!context || !this.ambience || this.scanNodes.length > 0) return;

    const ambience = this.ambience;
    const now = context.currentTime;
    const pad = context.createOscillator();
    const pulse = context.createOscillator();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const pulseGain = context.createGain();

    pad.type = "sine";
    pad.frequency.value = 82;
    pulse.type = "triangle";
    pulse.frequency.value = 1.7;
    filter.type = "lowpass";
    filter.frequency.value = 560;
    filter.Q.value = 4.5;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + 1.35);
    pulseGain.gain.value = 10;

    pulse.connect(pulseGain);
    pulseGain.connect(filter.frequency);
    pad.connect(filter);
    filter.connect(gain);
    gain.connect(ambience);

    pad.start(now);
    pulse.start(now);
    this.scanNodes = [pad, pulse, gain];
  }

  stopScanLoop() {
    const context = this.context;
    if (!context || this.scanNodes.length === 0) return;

    const now = context.currentTime;
    const gain = this.scanNodes[2] as GainNode | undefined;
    if (gain) {
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.setTargetAtTime(0.0001, now, 0.8);
    }
    this.scanNodes.forEach((node) => {
      const stoppableNode = node as AudioNode & { stop?: () => void };
      if (typeof stoppableNode.stop === "function") {
        window.setTimeout(() => stoppableNode.stop?.(), 2200);
      }
      window.setTimeout(() => node.disconnect(), 2350);
    });
    this.scanNodes = [];
  }

  private addTone(group: GainNode, frequency: number, gainValue: number, type: OscillatorType = "sine") {
    const context = this.context;
    if (!context) return undefined;

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(gainValue, now);
    oscillator.connect(gain);
    gain.connect(group);
    oscillator.start(now);
    return oscillator as ManagedNode;
  }

  private addNoise(group: GainNode, options: { frequency: number; gain: number; type?: BiquadFilterType; q?: number }) {
    const context = this.context;
    if (!context) return undefined;

    const now = context.currentTime;
    const noise = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    noise.buffer = createNoiseBuffer(context, 3);
    noise.loop = true;
    filter.type = options.type ?? "bandpass";
    filter.frequency.value = options.frequency;
    filter.Q.value = options.q ?? 1.2;
    gain.gain.value = options.gain;
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(group);
    noise.start(now);
    return noise as ManagedNode;
  }

  private addPulse(group: GainNode, frequency: number, gainValue: number, rate: number) {
    const context = this.context;
    if (!context) return undefined;

    const now = context.currentTime;
    const tone = context.createOscillator();
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();
    const gain = context.createGain();
    tone.type = "triangle";
    tone.frequency.value = frequency;
    lfo.type = "sine";
    lfo.frequency.value = rate;
    lfoGain.gain.value = gainValue * 0.42;
    gain.gain.value = gainValue;
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    tone.connect(gain);
    gain.connect(group);
    tone.start(now);
    lfo.start(now);
    return [tone as ManagedNode, lfo as ManagedNode];
  }

  startSoundscape(tags: SoundscapeTag[]) {
    const context = this.context;
    if (!context || !this.ambience) return;

    const normalizedTags = uniqueTags(tags).sort();
    const signature = normalizedTags.join("|");
    if (this.soundscape?.signature === signature) return;

    this.stopSoundscape();

    const now = context.currentTime;
    const group = context.createGain();
    const nodes: ManagedNode[] = [];
    group.gain.setValueAtTime(0.0001, now);
    group.gain.exponentialRampToValueAtTime(0.18, now + 2.4);
    group.connect(this.ambience);

    const add = (node?: ManagedNode | ManagedNode[]) => {
      if (!node) return;
      if (Array.isArray(node)) nodes.push(...node);
      else nodes.push(node);
    };

    normalizedTags.forEach((tag) => {
      switch (tag) {
        case "urban":
          add(this.addNoise(group, { frequency: 380, gain: 0.05, type: "bandpass", q: 0.8 }));
          add(this.addPulse(group, 110, 0.018, 0.8));
          break;
        case "coastal":
          add(this.addNoise(group, { frequency: 620, gain: 0.07, type: "lowpass", q: 0.5 }));
          add(this.addTone(group, 146.8, 0.018));
          break;
        case "desert":
          add(this.addNoise(group, { frequency: 1150, gain: 0.045, type: "bandpass", q: 0.55 }));
          add(this.addTone(group, 73.4, 0.025));
          break;
        case "night":
          add(this.addPulse(group, 329.6, 0.012, 0.16));
          add(this.addTone(group, 659.2, 0.006, "sine"));
          break;
        case "high-tech":
          add(this.addPulse(group, 246.9, 0.02, 2.4));
          add(this.addPulse(group, 493.9, 0.012, 3.2));
          break;
        case "tense":
          add(this.addTone(group, 55, 0.028));
          add(this.addTone(group, 58.2, 0.018));
          break;
        case "hopeful":
          add(this.addTone(group, 196, 0.02));
          add(this.addTone(group, 246.9, 0.014));
          add(this.addTone(group, 329.6, 0.012));
          break;
        case "care":
          add(this.addTone(group, 174.6, 0.018));
          add(this.addPulse(group, 261.6, 0.01, 0.22));
          break;
        case "learning":
          add(this.addTone(group, 220, 0.015));
          add(this.addPulse(group, 440, 0.009, 0.42));
          break;
        case "industrial":
          add(this.addNoise(group, { frequency: 180, gain: 0.05, type: "lowpass", q: 0.9 }));
          add(this.addPulse(group, 92.5, 0.026, 1.05));
          break;
      }
    });

    this.soundscape = { gain: group, nodes, signature };
  }

  stopSoundscape() {
    const context = this.context;
    if (!context || !this.soundscape) return;

    const { gain, nodes } = this.soundscape;
    const now = context.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.setTargetAtTime(0.0001, now, 1.2);
    nodes.forEach((node) => {
      window.setTimeout(() => node.stop?.(), 3200);
      window.setTimeout(() => node.disconnect(), 3400);
    });
    window.setTimeout(() => gain.disconnect(), 3500);
    this.soundscape = undefined;
  }

  playFlyToEarth() {
    const context = this.context;
    if (!context || !this.sfx) return;

    const sfx = this.sfx;
    const now = context.currentTime;
    const noise = context.createBufferSource();
    const noiseGain = context.createGain();
    const filter = context.createBiquadFilter();
    const rumble = context.createOscillator();
    const rumbleGain = context.createGain();

    noise.buffer = createNoiseBuffer(context, 6.1);
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(260, now);
    filter.frequency.exponentialRampToValueAtTime(1900, now + 2.4);
    filter.frequency.exponentialRampToValueAtTime(480, now + 5.6);
    filter.Q.value = 1.4;
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.2, now + 0.95);
    noiseGain.gain.setTargetAtTime(0.0001, now + 4.25, 0.72);

    rumble.type = "sine";
    rumble.frequency.setValueAtTime(42, now);
    rumble.frequency.exponentialRampToValueAtTime(28, now + 5.7);
    rumbleGain.gain.setValueAtTime(0.0001, now);
    rumbleGain.gain.exponentialRampToValueAtTime(0.14, now + 1.45);
    rumbleGain.gain.setTargetAtTime(0.0001, now + 4.35, 0.85);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(sfx);
    rumble.connect(rumbleGain);
    rumbleGain.connect(sfx);

    noise.start(now);
    noise.stop(now + 6.2);
    rumble.start(now);
    rumble.stop(now + 6.2);
  }

  playTimeMachineCharge() {
    const context = this.context;
    if (!context || !this.sfx) return;

    const sfx = this.sfx;
    const now = context.currentTime;
    const noise = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const noiseGain = context.createGain();
    const pulse = context.createOscillator();
    const lfo = context.createOscillator();
    const lfoGain = context.createGain();
    const pulseGain = context.createGain();
    const swell = context.createOscillator();
    const swellGain = context.createGain();

    noise.buffer = createNoiseBuffer(context, 2.7);
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(120, now);
    filter.frequency.exponentialRampToValueAtTime(2400, now + 2.5);
    filter.Q.value = 2.2;
    noiseGain.gain.setValueAtTime(0.0001, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.16, now + 2.2);
    noiseGain.gain.setTargetAtTime(0.0001, now + 2.4, 0.18);

    pulse.type = "triangle";
    pulse.frequency.value = 220;
    lfo.type = "sine";
    lfo.frequency.setValueAtTime(1, now);
    lfo.frequency.exponentialRampToValueAtTime(8, now + 2.5);
    lfoGain.gain.value = 60;
    pulseGain.gain.setValueAtTime(0.0001, now);
    pulseGain.gain.exponentialRampToValueAtTime(0.05, now + 2.3);
    pulseGain.gain.setTargetAtTime(0.0001, now + 2.4, 0.18);

    swell.type = "sine";
    swell.frequency.setValueAtTime(55, now);
    swell.frequency.exponentialRampToValueAtTime(110, now + 2.6);
    swellGain.gain.setValueAtTime(0.0001, now);
    swellGain.gain.exponentialRampToValueAtTime(0.1, now + 2.4);
    swellGain.gain.setTargetAtTime(0.0001, now + 2.5, 0.2);

    lfo.connect(lfoGain);
    lfoGain.connect(pulse.frequency);
    pulse.connect(pulseGain);
    pulseGain.connect(sfx);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(sfx);
    swell.connect(swellGain);
    swellGain.connect(sfx);

    noise.start(now);
    noise.stop(now + 2.7);
    pulse.start(now);
    pulse.stop(now + 2.7);
    lfo.start(now);
    lfo.stop(now + 2.7);
    swell.start(now);
    swell.stop(now + 2.7);
  }

  playLandingArrival() {
    const context = this.context;
    if (!context || !this.sfx) return;

    const sfx = this.sfx;
    const now = context.currentTime;
    const noise = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const noiseGain = context.createGain();

    noise.buffer = createNoiseBuffer(context, 1.9);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 1.8);
    noiseGain.gain.setValueAtTime(0.12, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(sfx);
    noise.start(now);
    noise.stop(now + 1.9);

    [196, 247, 330].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now + 0.2 + index * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.045, now + 0.8 + index * 0.1);
      gain.gain.setTargetAtTime(0.0001, now + 1.6, 0.5);
      oscillator.connect(gain);
      gain.connect(sfx);
      oscillator.start(now + 0.2 + index * 0.08);
      oscillator.stop(now + 2.4);
    });
  }

  playRecordTick(on: boolean) {
    const context = this.context;
    if (!context || !this.sfx) return;

    const sfx = this.sfx;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(on ? 520 : 380, now);
    oscillator.frequency.exponentialRampToValueAtTime(on ? 780 : 260, now + 0.09);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
    gain.gain.setTargetAtTime(0.0001, now + 0.08, 0.06);
    oscillator.connect(gain);
    gain.connect(sfx);
    oscillator.start(now);
    oscillator.stop(now + 0.22);
  }

  playDilemmaReveal() {
    const context = this.context;
    if (!context || !this.sfx) return;

    const sfx = this.sfx;
    const now = context.currentTime;
    const frequencies = [247, 370, 554];
    frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.0001, now + index * 0.055);
      gain.gain.exponentialRampToValueAtTime(0.052, now + 0.34 + index * 0.09);
      gain.gain.setTargetAtTime(0.0001, now + 1.1 + index * 0.1, 0.46);
      oscillator.connect(gain);
      gain.connect(sfx);
      oscillator.start(now + index * 0.055);
      oscillator.stop(now + 2.35);
    });
  }
}

export const worldSound = new WorldSoundEngine();
