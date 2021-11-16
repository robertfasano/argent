// This file contains representations of the default syntax for storing RTIO states and sequences
import { merge } from 'lodash'

export const TTL = false

export const DAC = { mode: 'setpoint', setpoint: '', ramp: { start: '', stop: '', steps: 10 } }

export const DDS = {
  frequency: { mode: 'setpoint', setpoint: '', ramp: { start: '', stop: '', steps: 10 } },
  attenuation: { mode: 'setpoint', setpoint: '', ramp: { start: '', stop: '', steps: 10 } },
  enable: false
}

export const ADC = { enable: false, variables: {}, samples: 1, duration: 1 }

export const CAM = { enable: false, parameter: '', duration: 1, ROI: [[0, 1], [0, 1]] }

export function fill (sequence, channels) {
  // Fills in any missing data by deep-merging against the default sequence
  const defaultSchema = defaultSequence(channels)[0]
  const newSequence = []
  for (const i in sequence) {
    newSequence.push(merge({}, defaultSchema, sequence[i]))
  }
  return newSequence
}

export function defaultTimestep (channels) {
  const defaultTimestep = {
    duration: '1',
    label: '',
    ttl: {},
    dac: {},
    dds: {},
    adc: {},
    cam: {}
  }

  if (Object.keys(channels).includes('ttl')) {
    for (const channel of Object.keys(channels.ttl)) {
      defaultTimestep.ttl[channel] = TTL
    }
  }

  if (Object.keys(channels).includes('dac')) {
    for (const board of Object.keys(channels.dac)) {
      defaultTimestep.dac[board] = {}
      for (const ch of Object.keys(channels.dac[board])) {
        defaultTimestep.dac[board][ch] = DAC
      }
    }
  }

  if (Object.keys(channels).includes('dds')) {
    for (const ch of Object.keys(channels.dds)) {
      defaultTimestep.dds[ch] = DDS
    }
  }

  if (Object.keys(channels).includes('adc')) {
    for (const board of Object.keys(channels.adc)) {
      defaultTimestep.adc[board] = ADC
    }
  }

  if (Object.keys(channels).includes('cam')) {
    for (const board of Object.keys(channels.cam)) {
      defaultTimestep.cam[board] = CAM
    }
  }

  return defaultTimestep
}

export default function defaultSequence (channels) {
  return [defaultTimestep(channels)]
}
