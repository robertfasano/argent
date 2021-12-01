import axios from 'axios'

export function get (url, callback) {
  const resp = axios.get(url)
  if (typeof (callback) !== 'undefined') {
    resp.then((response) => {
      callback(response.data)
    })
  }
}

export function post (url, payload = {}, callback = (response) => null) {
  console.log('POST', url, payload)
  const resp = axios.post(url, payload)

  if (typeof (callback) !== 'undefined') {
    resp.then((response) => callback(response.data))
  }
}

export const isArrayEqual = function (x, y) {
  if (x.length !== y.length) return false

  let isEqual = true
  for (const i in x) {
    if (x[i].setpoint !== y[i].setpoint) isEqual = false
  }
  return isEqual
}
