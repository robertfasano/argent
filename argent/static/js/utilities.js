import axios from 'axios'
import { defaultMemoize } from 'reselect'

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

const createMemoizeArray = (array) => {
  const memArray = defaultMemoize((...array) => array)
  return (array) => memArray.apply(null, array)
}

export function memoizeArray (selectorCreator) {
  return selectorCreator(createMemoizeArray())
}
