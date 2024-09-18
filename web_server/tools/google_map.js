function generateGoogleMapsLink(coordsA, coordsB) {
    const [latA, lngA] = coordsA;
    const [latB, lngB] = coordsB;
    
    return `https://www.google.com/maps/dir/${latA},${lngA}/${latB},${lngB}`;
}