const places = [
  { id: 1, name: 'Weißenkirchen', description: 'Test', tags : ['Not shot yet', 'Easy'], lat: 48.35, lng: 15.35 },
  { id: 2, name: 'Frohnleiten', description: 'Test', tags : ['One', 'Two'], lat: 47.38, lng: 15.33 },
  { id: 3, name: 'Traunkirchen', description: 'Test', tags : ['One', 'Two'], lat: 47.90, lng: 13.85 }
]

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')

  return places.find((place) => place.id === parseInt(id));
})
