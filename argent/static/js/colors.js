// Conversions between hex and RGB taken from Tim Down's
// answer to StackOverflow question 5623838
function componentToHex (c) {
  const hex = c.toString(16)
  return hex.length === 1 ? '0' + hex : hex
}

export function rgbToHex (r, g, b) {
  return '#' + componentToHex(r) + componentToHex(g) + componentToHex(b)
}

export function hexToRgb (hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null
}

export function gradient (color1, color2, min, max, value) {
  // Linearly interpolates between a pair of hexadecimal colors
  // in RGB space
  color1 = hexToRgb(color1)
  color2 = hexToRgb(color2)
  const r = parseInt(color1.r + (color2.r - color1.r) * value / (max - min))
  const g = parseInt(color1.g + (color2.g - color1.g) * value / (max - min))
  const b = parseInt(color1.b + (color2.b - color1.b) * value / (max - min))
  return rgbToHex(r, g, b)
}
