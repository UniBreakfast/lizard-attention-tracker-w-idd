const routes = {
  home: {
    title: "Lizard Attention Tracker",
    htmlFile: 'home.html',
    cssFile: 'home.css',
  },
  table: {
    title: "LAT Attention Table",
    htmlFile: 'table.html',
    cssFiles: ['numscale.css', 'table.css'],
    js: "prepareTable()",
    jsFile: 'table.js',
  },
  slices: {
    title: "LAT Attention Slices",
    htmlFile: 'slices.html',
    cssFile: 'slices.css',
    js: "prepareSlices()",
    jsFile: 'slices.js',
  },
}