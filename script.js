// loadLastSlice()
onload =()=> {
  loadLastSlice()
}


newSliceBtn.onclick = startNewSlice
saveSliceBtn.onclick = saveSlice

onkeydown = e => {
  if (e.code == 'KeyS' && e.ctrlKey) saveSlice(), e.preventDefault()
  if (e.code == 'KeyN' && e.altKey) startNewSlice()
}

table.onmousemove = trapMouseMove
table.onclick = e => {
  if (e.target.className == 'trap') trapMouseClick(e)
  else if (e.target.tagName == 'TH') sortTableBy(e.target)
}

const row0 = table.rows[1]
row0.remove()

function buildTableRow([needs, name, gets]=['','','']) {
  const row = row0.cloneNode(true),
       [left, middle, right] = row.cells
  middle.innerText = name
  middle.oninput = handlePoaNameInput
  left.dataset.value = needs || ''
  right.dataset.value = gets || ''
  row.style.setProperty('--needs-width', needs+'0%')
  row.style.setProperty('--gets-width', gets+'0%')
  return row
}

function loadPoaListToTable(poaList, {tBodies}) {
  tBodies[0].innerHTML = ''
  tBodies[0].append(...poaList.map(buildTableRow), buildTableRow())
}

function formPoaListFromTable({tBodies: [{rows}]}) {
  return [...rows].map(({cells: [
    {dataset: {value: needs}}, {innerText: name}, {dataset: {value: gets}}
  ]})=> [+needs, name.trim(), +gets]).filter(poa => poa[1])
}

function poaStringify(poaList) {
  return poaList.map(poa => Object.values(poa).join('|')).join('_')
}

function poaParse(str) {
  return str.split('_').map(str => str.split('|'))
    .map(([needs, name, gets])=> [+needs, name.trim(), +gets])
}

function generateSliceLabel() {
  const datetime = new Date,
        year = datetime.getFullYear(),
        month = String(datetime.getMonth()+1).padStart(2, 0),
        day = String(datetime.getDate()).padStart(2, 0),
        date = [year, month, day].join('_'),
        slicesToday = Object.keys(localStorage)
          .filter(key => key.startsWith('slice_'+date))
          .sort((a, b)=> a<b? 1 : -1),
        letter = slicesToday[0]
          ? String.fromCharCode(slicesToday[0].slice(-1).charCodeAt() + 1)
          : 'a'
  return ['slice', date, letter].join('_')
}

function loadLastSlice(noValues) {
  const sliceKeys = Object.keys(localStorage)
    .filter(key => key.startsWith('slice_')).sort((a, b)=> a<b? 1 : -1)
  const poaList = sliceKeys[0]? poaParse(localStorage[sliceKeys[0]]) : []
  sliceLabel.innerText = sliceKeys[0] || generateSliceLabel()
  if (noValues) poaList.forEach(poa => poa[0] = poa[2] = 1)
  loadPoaListToTable(poaList, table)
}

function startNewSlice() {
  loadLastSlice('empty')
  sliceLabel.innerText = generateSliceLabel()
}

function saveSlice() {
  localStorage[sliceLabel.innerText] = poaStringify(formPoaListFromTable(table))
  loadLastSlice()
}

function trapMouseMove(e) {
  if (e.target.className == 'trap') {
    const [trap, scale, row] = e.path
    let part = Math.ceil(e.offsetX / trap.clientWidth * 10) || 1
    if (scale.classList.contains('needs'))
      part = 11 - part
    scale.dataset.hoverValue = part
    row.style.setProperty('--hover-width', part + '0%')
  }
}

function trapMouseClick(e) {
  const [trap, scale, row] = e.path
  let part = Math.ceil(e.offsetX/trap.clientWidth*10) || 1
  if (scale.classList.contains('needs')) {
    scale.dataset.value = 11 - part
    row.style.setProperty('--needs-width', 11-part+'0%')
  } else {
    scale.dataset.value = part
    row.style.setProperty('--gets-width', part+'0%')
  }
}

function sortTableBy(header) {
  if (header.dataset.sort)
    header.dataset.sort = header.dataset.sort=='asc'? 'desc' : 'asc'
  else {
    [...header.parentNode.cells].forEach(th => delete th.dataset.sort)
    header.dataset.sort = 'asc'
  }
  const tbody = header.parentNode.parentNode.nextElementSibling,
        rows = [...tbody.rows],
        col = header.cellIndex

  const sorter = col!=1
          ? (a, b)=> a.cells[col].dataset.value - b.cells[col].dataset.value
          : (a, b)=>
            Math.abs(a.cells[0].dataset.value - a.cells[2].dataset.value) -
            Math.abs(b.cells[0].dataset.value - b.cells[2].dataset.value)
  rows.sort(sorter)
  if (header.dataset.sort == 'desc') rows.reverse()
  tbody.append(...rows, ...rows.filter(row => !row.cells[1].innerText))
}

function handlePoaNameInput({target}) {
  const tbody = target.parentNode.parentNode
  if ([...tbody.rows].every(row => row.cells[1].innerText))
    tbody.append(buildTableRow())
}
