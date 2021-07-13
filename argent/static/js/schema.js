// This file contains representations of the default syntax for storing RTIO states and sequences
import { merge } from 'lodash'

export const TTL = false

export const DAC = { mode: 'setpoint', setpoint: '', ramp: { start: '', stop: '', steps: 10 } }

export const DDS = {
  frequency: { mode: 'setpoint', setpoint: '', ramp: { start: '', stop: '', steps: 10 } },
  attenuation: { mode: 'setpoint', setpoint: '', ramp: { start: '', stop: '', steps: 10 } },
  enable: false
}

export const ADC = { enable: false, variables: {}, delay: '0 s', samples: 1, duration: '1 s' }

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
    duration: '1 s',
    ttl: {},
    dac: {},
    dds: {},
    adc: {}
  }
  for (const channel of Object.keys(channels.TTL)) {
    defaultTimestep.ttl[channel] = TTL
  }

  for (const board of Object.keys(channels.DAC)) {
    defaultTimestep.dac[board] = {}
    for (const ch of Object.keys(channels.DAC[board])) {
      defaultTimestep.dac[board][ch] = DAC
    }
  }

  for (const ch of Object.keys(channels.DDS)) {
    defaultTimestep.dds[ch] = DDS
  }

  for (const board of Object.keys(channels.ADC)) {
    defaultTimestep.adc[board] = ADC
  }

  return defaultTimestep
}

export default function defaultSequence (channels) {
  return [defaultTimestep(channels)]
}
