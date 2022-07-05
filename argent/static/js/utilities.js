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

export const arrayShallowEqual = function (arr1, arr2) {
  let isEqual = true
  for (const i in arr1) {
    if (arr1[i] !== arr2[i]) isEqual = false
  }
  return isEqual
}

export const isArrayEqual = function (x, y) {
  if (x.length !== y.length) return false

  let isEqual = true
  for (const i in x) {
    if (x[i].setpoint !== y[i].setpoint) isEqual = false
    if (x[i].ramp.start !== y[i].ramp.start) isEqual = false
    if (x[i].ramp.stop !== y[i].ramp.stop) isEqual = false
    if (x[i].ramp.steps !== y[i].ramp.steps) isEqual = false
    if (x[i].mode !== y[i].mode) isEqual = false
    if (!arrayShallowEqual(x[i].spline.points, y[i].spline.points)) isEqual = false
    if ((x[i].spline.steps) !== (y[i].spline.steps)) isEqual = false
  }

  return isEqual
}
