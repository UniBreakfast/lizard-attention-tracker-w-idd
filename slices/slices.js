let slice0

function prepareSlices() {
  slice0 = sliceList.first().change('remove')

  sliceList.append(...keys(ls).filter(key => key.startsWith('slice '))
    .map(slice => slice0.copy().change('first', {innerText: slice})))
}

function gotoSlice(label) {
  slice = label
  goto('table')
}
