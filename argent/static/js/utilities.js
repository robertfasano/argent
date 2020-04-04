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
