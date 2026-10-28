import { describe, it, expect } from 'vitest';
import { CAR_EQ_PRESETS } from '../components/car/CarEqualizerModal';

describe('Car Equalizer Presets & Tuning Logic', () => {
  it('contains all 6 required automotive presets', () => {
    const presetNames = CAR_EQ_PRESETS.map((p) => p.name);
    expect(presetNames).toContain('Normal');
    expect(presetNames).toContain('Rock');
    expect(presetNames).toContain('Pop');
    expect(presetNames).toContain('Jazz');
    expect(presetNames).toContain('Classical');
    expect(presetNames).toContain('Bass Boost');
  });

  it('verifies each preset has exactly 5 bands', () => {
    CAR_EQ_PRESETS.forEach((preset) => {
      expect(preset.gains.length).toBe(5);
    });
  });

  it('ensures gains are within safe dB boundaries (-12 to +12 dB)', () => {
    CAR_EQ_PRESETS.forEach((preset) => {
      preset.gains.forEach((gain) => {
        expect(gain).toBeGreaterThanOrEqual(-12);
        expect(gain).toBeLessThanOrEqual(12);
      });
    });
  });

  it('Normal preset is flat (all zeros)', () => {
    const normal = CAR_EQ_PRESETS.find((p) => p.name === 'Normal');
    expect(normal).toBeDefined();
    expect(normal?.gains).toEqual([0, 0, 0, 0, 0]);
    expect(normal?.bassBoost).toBe(0);
  });

  it('Bass Boost preset enhances sub & low frequencies and sub-woofer gain', () => {
    const bass = CAR_EQ_PRESETS.find((p) => p.name === 'Bass Boost');
    expect(bass).toBeDefined();
    expect(bass!.gains[0]).toBeGreaterThanOrEqual(6); // 60Hz boosted
    expect(bass!.bassBoost).toBeGreaterThanOrEqual(6);
  });
});
