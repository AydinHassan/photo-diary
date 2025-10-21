const pins = [
  { id: 1, name: 'Weißenkirchen', lat: 48.35, lng: 15.35 },
  { id: 2, name: 'Frohnleiten', lat: 47.38, lng: 15.33 },
  { id: 3, name: 'Traunkirchen', lat: 47.90, lng: 13.85 }
]

export default defineEventHandler(() => {
  return pins
})
