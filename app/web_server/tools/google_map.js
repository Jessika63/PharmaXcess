function generateGoogleMapsLink(coordsA, coordsB) {
    const {latA, lngA} = coordsA
    const {latB, lngB} = coordsB

    console.log(latA, latB, lngA, lngB)
    return `https://www.google.com/maps/dir/${latA},${lngA}/${latB},${lngB}`
}

module.exports = { generateGoogleMapsLink }