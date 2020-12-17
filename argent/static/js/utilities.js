import axios from 'axios'

export function get (url, callback) {
  console.log('GET', url)
  const resp = axios.get(url)
  if (typeof(callback) != 'undefined') {
    resp.then((response)=> {
      callback(response.data)
    })
  }

}

export function post(url, payload={}, callback=(response)=>null) {
  console.log('POST', url, payload)
  const resp = axios.post(url, payload)

  if (typeof(callback) != 'undefined') {
    resp.then((response) => callback(response.data))
  }
}

export function unflatten(sequence) {
  // convert a sequence to unflattened form with redundant elements removed
  const unflattened = []
  for (var i = 0; i < sequence.duration.length; ++i){
    let timestep = {
                      duration: sequence.duration[i],
                      ttl: {},
                      dac: {},
                      dds: {},
                      adc: {}
                    }
    for (const [ttl_ch, ttl_sequence] of Object.entries(sequence.ttl)) {
      timestep.ttl[ttl_ch] = ttl_sequence[i]['state']
    }

    for (const [dac_ch, dac_sequence] of Object.entries(sequence.dac)) {
      let voltage = dac_sequence[i]
      if (voltage.mode == 'constant' & voltage.setpoint != '') {
        timestep.dac[dac_ch] = {mode: voltage.mode, setpoint: voltage.setpoint}
      }
      else if (voltage.mode == 'ramp') {
        if (voltage.start != '' & voltage.stop != '') {
          timestep.dac[dac_ch] = {mode: voltage.mode, start: voltage.start, stop: voltage.stop}
        }
      }
    }

    for (const [dds_ch, dds_sequence] of Object.entries(sequence.dds)) {
      timestep.dds[dds_ch] = {on: dds_sequence[i].on}

      let freq = dds_sequence[i].frequency
      if (freq.mode == 'constant' & freq.setpoint != '') {
          timestep.dds[dds_ch].frequency = {mode: freq.mode, setpoint: freq.setpoint}
      }
      else if (freq.mode == 'ramp') {
        if (freq.start != '' & freq.stop != '') {
          timestep.dds[dds_ch].frequency = {mode: freq.mode, start: freq.start, stop: freq.stop}
        }
      }

      let att = dds_sequence[i].attenuation
      if (att.mode == 'constant' & att.setpoint != '') {
        timestep.dds[dds_ch].attenuation = {mode: att.mode, setpoint: att.setpoint}
      }
      else if (att.mode == 'ramp') {
        if (att.start != '' & att.stop != '') {
          timestep.dds[dds_ch].attenuation = {mode: att.mode, start: att.start, stop: att.stop}
        }
      }
    }

    for (const [adc_ch, adc_sequence] of Object.entries(sequence.adc)) {
      if (adc_sequence[i].on) {
        if (adc_sequence[i].samples != '' & adc_sequence[i].variable != '') {
          timestep.adc[adc_ch] = {samples: adc_sequence[i].samples,
                                  variable: adc_sequence[i].variable}
        }

      }
    }

    unflattened.push(timestep)
  }
  return unflattened
}
