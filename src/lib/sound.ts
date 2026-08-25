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
  private scoreNodes: ManagedNode[] = [];
  private scoreGain?: GainNode;
  private scoreHeartbeat?: number;
  private soundscape?: SoundscapeState;
  private droneNodes: ManagedNode[] = [];
  private droneGain?: GainNode;
  private droneBellTimer?: number;
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

  private playSoftTone(frequency: number, gainValue: number, duration = 0.28, type: OscillatorType = "sine") {
    const context = this.context;
    if (!context || !this.sfx) return;

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainValue, now + 0.025);
    gain.gain.setTargetAtTime(0.0001, now + duration * 0.42, duration * 0.24);
    oscillator.connect(gain);
    gain.connect(this.sfx);
    oscillator.start(now);
    oscillator.stop(now + duration);
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

  playChoiceSelect(index = 0) {
    const frequencies = [294, 330, 370, 440];
    this.playSoftTone(frequencies[index % frequencies.length], 0.075, 0.34);
  }

  playTextFocus() {
    this.playSoftTone(196, 0.028, 0.22, "triangle");
  }

  playPersonaCheckIn() {
    const context = this.context;
    if (!context || !this.sfx) return;

    const now = context.currentTime;
    [262, 330, 392].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now + index * 0.07);
      gain.gain.setValueAtTime(0.0001, now + index * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.05, now + 0.08 + index * 0.07);
      gain.gain.setTargetAtTime(0.0001, now + 0.42 + index * 0.07, 0.22);
      oscillator.connect(gain);
      gain.connect(this.sfx!);
      oscillator.start(now + index * 0.07);
      oscillator.stop(now + 1.1);
    });
  }

  playConsequenceReveal() {
    const context = this.context;
    if (!context || !this.sfx) return;

    const now = context.currentTime;
    const swell = context.createOscillator();
    const swellGain = context.createGain();
    swell.type = "sine";
    swell.frequency.setValueAtTime(82, now);
    swell.frequency.exponentialRampToValueAtTime(123, now + 1.1);
    swellGain.gain.setValueAtTime(0.0001, now);
    swellGain.gain.exponentialRampToValueAtTime(0.055, now + 0.45);
    swellGain.gain.setTargetAtTime(0.0001, now + 1.15, 0.45);
    swell.connect(swellGain);
    swellGain.connect(this.sfx);
    swell.start(now);
    swell.stop(now + 2.8);

    [330, 494].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now + 0.5 + index * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.045, now + 0.64 + index * 0.12);
      gain.gain.setTargetAtTime(0.0001, now + 1.05 + index * 0.12, 0.3);
      oscillator.connect(gain);
      gain.connect(this.sfx!);
      oscillator.start(now + 0.5 + index * 0.12);
      oscillator.stop(now + 2.2);
    });
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

  /** A field on the boarding pass just got its tick. Two rising notes, small
   *  enough to fire three times in a row without becoming a fanfare. */
  playFieldComplete() {
    const context = this.context;
    if (!context || !this.sfx) return;

    const sfx = this.sfx;
    const now = context.currentTime;
    [523, 784].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, now + index * 0.06);
      gain.gain.setValueAtTime(0.0001, now + index * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.038, now + 0.03 + index * 0.06);
      gain.gain.setTargetAtTime(0.0001, now + 0.14 + index * 0.06, 0.09);
      oscillator.connect(gain);
      gain.connect(sfx);
      oscillator.start(now + index * 0.06);
      oscillator.stop(now + 0.6);
    });
  }

  /** The split-flap turning over. Deliberately near-silent: it fires many times
   *  during the counter, so it has to sit under the ambience, not on top. */
  playYearTick() {
    const context = this.context;
    if (!context || !this.sfx) return;

    const now = context.currentTime;
    const source = context.createBufferSource();
    source.buffer = createNoiseBuffer(context, 0.05);
    const filter = context.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(2400, now);
    filter.Q.value = 1.6;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.016, now);
    gain.gain.setTargetAtTime(0.0001, now + 0.012, 0.016);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfx);
    source.start(now);
    source.stop(now + 0.06);
  }

  /** The year lands on 2046 — the one moment the counter is allowed to be loud. */
  playYearLanded() {
    const context = this.context;
    if (!context || !this.sfx) return;

    const sfx = this.sfx;
    const now = context.currentTime;

    const thump = context.createOscillator();
    const thumpGain = context.createGain();
    thump.type = "sine";
    thump.frequency.setValueAtTime(150, now);
    thump.frequency.exponentialRampToValueAtTime(62, now + 0.34);
    thumpGain.gain.setValueAtTime(0.0001, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.11, now + 0.02);
    thumpGain.gain.setTargetAtTime(0.0001, now + 0.1, 0.16);
    thump.connect(thumpGain);
    thumpGain.connect(sfx);
    thump.start(now);
    thump.stop(now + 0.9);

    [392, 587, 784].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(frequency, now + 0.04);
      gain.gain.setValueAtTime(0.0001, now + 0.04 + index * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.05, now + 0.12 + index * 0.03);
      gain.gain.setTargetAtTime(0.0001, now + 0.4 + index * 0.05, 0.3);
      oscillator.connect(gain);
      gain.connect(sfx);
      oscillator.start(now + 0.04 + index * 0.03);
      oscillator.stop(now + 1.9);
    });
  }

  /** The destination card stamps in — a papery thunk, not a chime. */
  playArrivalStamp() {
    const context = this.context;
    if (!context || !this.sfx) return;

    const sfx = this.sfx;
    const now = context.currentTime;
    const source = context.createBufferSource();
    source.buffer = createNoiseBuffer(context, 0.16);
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(900, now);
    filter.frequency.exponentialRampToValueAtTime(220, now + 0.14);
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.075, now);
    gain.gain.setTargetAtTime(0.0001, now + 0.03, 0.05);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(sfx);
    source.start(now);
    source.stop(now + 0.2);

    const body = context.createOscillator();
    const bodyGain = context.createGain();
    body.type = "sine";
    body.frequency.setValueAtTime(196, now);
    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.045, now + 0.03);
    bodyGain.gain.setTargetAtTime(0.0001, now + 0.1, 0.12);
    body.connect(bodyGain);
    bodyGain.connect(sfx);
    body.start(now);
    body.stop(now + 0.7);
  }

  /** The final report resolves. The lowest, longest cue in the app — it should
   *  feel like the journey settling rather than another notification. */
  playReportReveal() {
    const context = this.context;
    if (!context || !this.sfx) return;

    const sfx = this.sfx;
    const now = context.currentTime;
    [131, 196, 262, 330].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.0001, now + index * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.05 / (index * 0.5 + 1), now + 0.7 + index * 0.16);
      gain.gain.setTargetAtTime(0.0001, now + 1.9 + index * 0.14, 0.7);
      oscillator.connect(gain);
      gain.connect(sfx);
      oscillator.start(now + index * 0.16);
      oscillator.stop(now + 4.4);
    });
  }


  /**
   * The time-travel score.
   *
   * Twenty years pass while this plays, and the old bed for it was a single
   * filtered pad — pleasant, but it made a jump across two decades sound like a
   * progress spinner. This is written as a piece instead: an E minor drone that
   * a triad settles onto, a sweep climbing three octaves across the whole
   * journey, and a heartbeat that starts slower than a resting pulse and
   * accelerates. Everything opens as it goes, so the longer the generation takes
   * the more tension there is when the year finally lands.
   *
   * Tuned to E so it sits with the 82 Hz (E2) scan pad rather than beating
   * against it.
   */
  startTimeTravelScore() {
    const context = this.context;
    if (!context || !this.ambience || this.scoreNodes.length > 0) return;

    const now = context.currentTime;
    const bus = context.createGain();
    bus.gain.setValueAtTime(0.0001, now);
    bus.gain.exponentialRampToValueAtTime(0.9, now + 3.5);
    bus.connect(this.ambience);
    this.scoreGain = bus;

    const keep = (node: ManagedNode | undefined) => {
      if (node) this.scoreNodes.push(node);
    };

    // Sub drone — E1 and its fifth, the floor the whole thing stands on.
    [
      { frequency: 41.2, gain: 0.15, type: "sine" as OscillatorType },
      { frequency: 61.74, gain: 0.07, type: "triangle" as OscillatorType },
    ].forEach((layer) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = layer.type;
      oscillator.frequency.value = layer.frequency;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(layer.gain, now + 4);
      oscillator.connect(gain);
      gain.connect(bus);
      oscillator.start(now);
      keep(oscillator);
    });

    // Minor triad, arriving one note at a time so the chord assembles rather
    // than switching on. The filter opens across 26s: dark at departure, bright
    // and strained by the time the counter is near 2046.
    const chordFilter = context.createBiquadFilter();
    chordFilter.type = "lowpass";
    chordFilter.frequency.setValueAtTime(320, now);
    chordFilter.frequency.exponentialRampToValueAtTime(2400, now + 26);
    chordFilter.Q.value = 1.6;
    chordFilter.connect(bus);

    [
      { frequency: 164.81, gain: 0.05, at: 0 },
      { frequency: 196.0, gain: 0.038, at: 3.2 },
      { frequency: 246.94, gain: 0.03, at: 7.5 },
    ].forEach((note) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sawtooth";
      oscillator.frequency.value = note.frequency;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.setValueAtTime(0.0001, now + note.at);
      gain.gain.exponentialRampToValueAtTime(note.gain, now + note.at + 3.4);
      oscillator.connect(gain);
      gain.connect(chordFilter);
      oscillator.start(now);
      keep(oscillator);
    });

    // The climb: three octaves over 30s, narrow-banded so it reads as rising
    // pressure rather than as a note.
    const sweep = context.createOscillator();
    const sweepBand = context.createBiquadFilter();
    const sweepGain = context.createGain();
    sweep.type = "sawtooth";
    sweep.frequency.setValueAtTime(82.41, now);
    sweep.frequency.exponentialRampToValueAtTime(659.25, now + 30);
    sweepBand.type = "bandpass";
    sweepBand.frequency.value = 900;
    sweepBand.Q.value = 3.2;
    sweepGain.gain.setValueAtTime(0.0001, now);
    sweepGain.gain.exponentialRampToValueAtTime(0.05, now + 12);
    sweep.connect(sweepBand);
    sweepBand.connect(sweepGain);
    sweepGain.connect(bus);
    sweep.start(now);
    keep(sweep);

    // Air moving past — a wide, slow-breathing noise bed under the chord.
    const air = context.createBufferSource();
    const airFilter = context.createBiquadFilter();
    const airGain = context.createGain();
    air.buffer = createNoiseBuffer(context, 4);
    air.loop = true;
    airFilter.type = "bandpass";
    airFilter.frequency.setValueAtTime(240, now);
    airFilter.frequency.exponentialRampToValueAtTime(1600, now + 28);
    airFilter.Q.value = 0.7;
    airGain.gain.setValueAtTime(0.0001, now);
    airGain.gain.exponentialRampToValueAtTime(0.05, now + 8);
    air.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(bus);
    air.start(now);
    keep(air);

    this.startScoreHeartbeat();
  }

  /** Low timpani-like hits that speed up from 0.75 Hz towards 2.4 Hz. Scheduled
   *  one at a time so the interval can shrink between beats. */
  private startScoreHeartbeat() {
    let beat = 0;
    const strike = () => {
      const context = this.context;
      const bus = this.scoreGain;
      if (!context || !bus) return;

      const now = context.currentTime;
      const thud = context.createOscillator();
      const gain = context.createGain();
      const intensity = Math.min(1, beat / 26);
      thud.type = "sine";
      thud.frequency.setValueAtTime(96 + intensity * 34, now);
      thud.frequency.exponentialRampToValueAtTime(41.2, now + 0.42);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.1 + intensity * 0.12, now + 0.012);
      gain.gain.setTargetAtTime(0.0001, now + 0.06, 0.13);
      thud.connect(gain);
      gain.connect(bus);
      thud.start(now);
      thud.stop(now + 0.7);

      beat += 1;
      const delay = Math.max(420, 1340 - beat * 34);
      this.scoreHeartbeat = window.setTimeout(strike, delay);
    };
    strike();
  }

  stopTimeTravelScore() {
    const context = this.context;
    if (this.scoreHeartbeat !== undefined) {
      window.clearTimeout(this.scoreHeartbeat);
      this.scoreHeartbeat = undefined;
    }
    if (!context || this.scoreNodes.length === 0) return;

    const now = context.currentTime;
    const bus = this.scoreGain;
    if (bus) {
      bus.gain.cancelScheduledValues(now);
      bus.gain.setValueAtTime(bus.gain.value, now);
      bus.gain.setTargetAtTime(0.0001, now, 0.5);
    }
    const nodes = this.scoreNodes;
    this.scoreNodes = [];
    this.scoreGain = undefined;
    window.setTimeout(() => {
      nodes.forEach((node) => {
        node.stop?.();
        node.disconnect();
      });
      bus?.disconnect();
    }, 1900);
  }

  /**
   * The idle drone under the landing page: a slow D-minor pad with no pulse and
   * no melody, so nothing in it ever asks to be listened to. Two detuned layers
   * beat against each other roughly every 12 seconds, and a lowpass drifts open
   * and shut on a 45-second cycle — that drift is the only thing that moves,
   * which is what keeps a static chord from turning into a hum.
   *
   * Sits deliberately below the field recording (which runs at 0.16): the
   * recording carries the place, the drone only carries the scale of it.
   */
  startAmbientDrone() {
    const context = this.context;
    if (!context || !this.ambience || this.droneNodes.length > 0) return;

    const now = context.currentTime;
    const group = context.createGain();
    group.gain.setValueAtTime(0.0001, now);
    group.gain.exponentialRampToValueAtTime(0.16, now + 6);
    group.connect(this.ambience);

    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    filter.Q.value = 0.7;
    filter.connect(group);

    // The drift: one very slow LFO opening the filter from ~200 to ~640 Hz.
    const drift = context.createOscillator();
    const driftDepth = context.createGain();
    drift.type = "sine";
    drift.frequency.value = 1 / 45;
    driftDepth.gain.value = 220;
    drift.connect(driftDepth);
    driftDepth.connect(filter.frequency);
    drift.start(now);

    const nodes: ManagedNode[] = [drift as ManagedNode];

    // D1 sub, D2, A2 fifth, D3, and a barely-there F3 to make it minor.
    const layers: Array<[number, number, OscillatorType]> = [
      [36.7, 0.5, "sine"],
      [73.4, 0.34, "sine"],
      [73.9, 0.2, "sine"],
      [110, 0.22, "sine"],
      [146.8, 0.14, "triangle"],
      [174.6, 0.07, "sine"],
    ];

    layers.forEach(([frequency, level, type]) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = type;
      oscillator.frequency.value = frequency;
      gain.gain.value = level;
      oscillator.connect(gain);
      gain.connect(filter);
      oscillator.start(now);
      nodes.push(oscillator as ManagedNode);
    });

    // A breath of filtered air so the pad is not purely synthetic.
    const air = context.createBufferSource();
    const airFilter = context.createBiquadFilter();
    const airGain = context.createGain();
    air.buffer = createNoiseBuffer(context, 4);
    air.loop = true;
    airFilter.type = "lowpass";
    airFilter.frequency.value = 900;
    airGain.gain.value = 0.035;
    air.connect(airFilter);
    airFilter.connect(airGain);
    airGain.connect(group);
    air.start(now);
    nodes.push(air as ManagedNode);

    this.droneGain = group;
    this.droneNodes = nodes;
    this.scheduleDroneBell();
  }

  /** A single distant tone every 24-48 seconds. Sparse enough that it reads as
   *  an event in the world rather than as a rhythm. */
  private scheduleDroneBell() {
    const delay = 24000 + Math.random() * 24000;
    this.droneBellTimer = window.setTimeout(() => {
      const context = this.context;
      const group = this.droneGain;
      if (!context || !group) return;

      const now = context.currentTime;
      const frequency = [293.7, 440, 587.3][Math.floor(Math.random() * 3)];
      [frequency, frequency * 2.01].forEach((partial, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = "triangle";
        oscillator.frequency.value = partial;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.045 / (index + 1) ** 2, now + 1.6);
        gain.gain.setTargetAtTime(0.0001, now + 2.2, 2.4);
        oscillator.connect(gain);
        gain.connect(group);
        oscillator.start(now);
        oscillator.stop(now + 12);
      });

      this.scheduleDroneBell();
    }, delay);
  }

  stopAmbientDrone() {
    const context = this.context;
    if (this.droneBellTimer) {
      window.clearTimeout(this.droneBellTimer);
      this.droneBellTimer = undefined;
    }
    if (!context || this.droneNodes.length === 0) return;

    const now = context.currentTime;
    const group = this.droneGain;
    if (group) {
      group.gain.cancelScheduledValues(now);
      group.gain.setValueAtTime(group.gain.value, now);
      group.gain.setTargetAtTime(0.0001, now, 1.1);
    }
    const nodes = this.droneNodes;
    this.droneNodes = [];
    this.droneGain = undefined;
    window.setTimeout(() => {
      nodes.forEach((node) => {
        node.stop?.();
        node.disconnect();
      });
      group?.disconnect();
    }, 4200);
  }

  /** Language toggle — the smallest sound in the set. */
  playToggle() {
    this.playSoftTone(660, 0.03, 0.12, "square");
  }
}

export const worldSound = new WorldSoundEngine();
