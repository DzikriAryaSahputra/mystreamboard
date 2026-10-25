import fs from 'fs';
import path from 'path';

// Helper to create valid WAV buffer from raw 16-bit PCM samples
function createWavBuffer(samples, sampleRate = 44100) {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);

  // fmt chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // subchunk1 size
  buffer.writeUInt16LE(1, 20);  // PCM format
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // bits per sample

  // data chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  // write PCM samples
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.floor(s * 32767), offset);
    offset += 2;
  }

  return buffer;
}

/**
 * Generate built-in sound effects
 */
export function generateDefaultSounds(soundsDir) {
  if (!fs.existsSync(soundsDir)) {
    fs.mkdirSync(soundsDir, { recursive: true });
  }

  const sampleRate = 44100;

  // 1. Airhorn (Brap-brap-brap synth)
  const airhornPath = path.join(soundsDir, 'airhorn.wav');
  if (!fs.existsSync(airhornPath)) {
    const duration = 1.2;
    const samples = new Float32Array(Math.floor(sampleRate * duration));
    const freqs = [466.16, 466.16, 520.0, 520.0, 622.25]; // brassy chords
    for (let i = 0; i < samples.length; i++) {
      const t = i / sampleRate;
      let val = 0;
      // Staccato bursts
      const burst = Math.sin(t * 18 * Math.PI) > 0.1 ? 1 : 0.2;
      for (const f of freqs) {
        val += Math.sin(2 * Math.PI * f * t) * 0.25;
        val += (Math.random() * 2 - 1) * 0.05; // slight brass grit
      }
      const envelope = Math.max(0, 1 - (t / duration));
      samples[i] = val * burst * envelope * 0.9;
    }
    fs.writeFileSync(airhornPath, createWavBuffer(samples, sampleRate));
  }

  // 2. Rimshot / Ba-Dum-Tss
  const rimshotPath = path.join(soundsDir, 'rimshot.wav');
  if (!fs.existsSync(rimshotPath)) {
    const duration = 1.0;
    const samples = new Float32Array(Math.floor(sampleRate * duration));
    for (let i = 0; i < samples.length; i++) {
      const t = i / sampleRate;
      let val = 0;
      // "Ba" at 0.0s
      if (t < 0.15) {
        const tb = t;
        val += Math.sin(2 * Math.PI * (160 - tb * 400) * tb) * Math.exp(-tb * 20);
      }
      // "Dum" at 0.2s
      if (t >= 0.2 && t < 0.4) {
        const td = t - 0.2;
        val += Math.sin(2 * Math.PI * (140 - td * 350) * td) * Math.exp(-td * 22);
      }
      // "Tss" (cymbal crash) at 0.45s
      if (t >= 0.45) {
        const tc = t - 0.45;
        const noise = (Math.random() * 2 - 1);
        val += noise * Math.exp(-tc * 7) * 0.8;
      }
      samples[i] = val;
    }
    fs.writeFileSync(rimshotPath, createWavBuffer(samples, sampleRate));
  }

  // 3. Victory Fanfare / Level Up
  const victoryPath = path.join(soundsDir, 'victory.wav');
  if (!fs.existsSync(victoryPath)) {
    const duration = 1.4;
    const samples = new Float32Array(Math.floor(sampleRate * duration));
    const notes = [
      { f: 523.25, start: 0.0, end: 0.15 }, // C5
      { f: 659.25, start: 0.15, end: 0.3 }, // E5
      { f: 783.99, start: 0.3, end: 0.45 }, // G5
      { f: 1046.50, start: 0.45, end: 1.3 } // C6 (long)
    ];
    for (let i = 0; i < samples.length; i++) {
      const t = i / sampleRate;
      let val = 0;
      for (const n of notes) {
        if (t >= n.start && t < n.end) {
          const tn = t - n.start;
          const env = Math.exp(-tn * 2.5);
          val += Math.sin(2 * Math.PI * n.f * t) * env;
          val += Math.sin(4 * Math.PI * n.f * t) * env * 0.3; // harmonic
        }
      }
      samples[i] = val * 0.7;
    }
    fs.writeFileSync(victoryPath, createWavBuffer(samples, sampleRate));
  }

  // 4. Dramatic Boom / Vine Boom
  const boomPath = path.join(soundsDir, 'boom.wav');
  if (!fs.existsSync(boomPath)) {
    const duration = 1.5;
    const samples = new Float32Array(Math.floor(sampleRate * duration));
    for (let i = 0; i < samples.length; i++) {
      const t = i / sampleRate;
      const freq = Math.max(30, 90 - t * 40);
      const bass = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 2.2);
      const impact = (Math.random() * 2 - 1) * Math.exp(-t * 18);
      samples[i] = (bass * 0.8 + impact * 0.4);
    }
    fs.writeFileSync(boomPath, createWavBuffer(samples, sampleRate));
  }

  // 5. Applause / Cheering
  const applausePath = path.join(soundsDir, 'applause.wav');
  if (!fs.existsSync(applausePath)) {
    const duration = 2.0;
    const samples = new Float32Array(Math.floor(sampleRate * duration));
    for (let i = 0; i < samples.length; i++) {
      const t = i / sampleRate;
      const noise = (Math.random() * 2 - 1);
      // Envelope with fade in and fade out
      const env = Math.sin((t / duration) * Math.PI);
      // Clapping clusters
      const clapMod = Math.abs(Math.sin(t * 30 * Math.PI)) > 0.4 ? 1.4 : 0.6;
      samples[i] = noise * env * clapMod * 0.6;
    }
    fs.writeFileSync(applausePath, createWavBuffer(samples, sampleRate));
  }
}
