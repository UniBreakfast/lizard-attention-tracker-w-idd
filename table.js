

let row0


function prepareTable() {

  newSliceBtn.onclick = startNewSlice
  saveSliceBtn.onclick = saveSlice

  onkeydown = e => {
    if (e.code=='KeyS' && e.ctrlKey) saveSlice(), e.preventDefault()
    if (e.code=='KeyN' && e.altKey) startNewSlice()
  }

  table.onmousemove = trapMouseMove
  table.onclick = e => {
    if (e.target.className=='trap') trapMouseClick(e)
    else if (e.target.tagName=='TH') sortTableBy(e.target)
  }

  row0 = table.rows[1]
  row0.remove()

  loadLastSlice()
}






function buildTableRow([needs, subject, gets]=['','','']) {
  const row = row0.cloneNode(true),
    [needScale, subjField, getScale] = row.cells
  subjField.innerText = subject
  subjField.oninput = handleSubjectInput
  needScale.dataset.value = needs || ''
  getScale.dataset.value = gets || ''
  row.style.setProperty('--needs-width', needs+'0%')
  row.style.setProperty('--gets-width', gets+'0%')
  return row
}

function loadSubjListToTable(subjList, {tBodies}) {
  tBodies[0].innerHTML = ''
  tBodies[0].append(...subjList.map(buildTableRow), buildTableRow())
}

function formSubjListFromTable({tBodies: [{rows}]}) {
  return [...rows].map(({ cells: [
    {dataset: {value: needs}}, {innerText: subject}, {dataset: {value: gets}}
  ] }) => [+needs, subject.trim(), +gets]).filter(subj => subj[1])
}

function subjListStringify(subjList) {
  return subjList.map(subj => Object.values(subj).join('|')).join('_')
}

function subjLineParse(str) {
  return str.split('_').map(str => str.split('|'))
    .map(([needs, subject, gets]) => [+needs, subject.trim(), +gets])
}

function generateSliceLabel() {
  const datetime = new Date,
    year = datetime.getFullYear(),
    month = String(datetime.getMonth()+1).padStart(2, 0),
    day = String(datetime.getDate()).padStart(2, 0),
    date = [year, month, day].join('_'),
    slicesToday = Object.keys(localStorage)
      .filter(key => key.startsWith('slice_'+date)).sort((a, b) => a<b? 1 : -1),
    letter = !slicesToday[0]? 'a' :
      String.fromCharCode(slicesToday[0].slice(-1).charCodeAt() + 1)
  return ['slice', date, letter].join('_')
}

function loadLastSlice(noValues) {
  const sliceKeys = Object.keys(localStorage)
    .filter(key => key.startsWith('slice_')).sort((a, b) => a<b? 1 : -1)
  const subjList = sliceKeys[0]? subjLineParse(localStorage[sliceKeys[0]]) : []
  sliceLabel.innerText = sliceKeys[0] || generateSliceLabel()
  if (noValues) subjList.forEach(subj => subj[0] = subj[2] = 1)
  loadSubjListToTable(subjList, table)
}

function startNewSlice() {
  loadLastSlice('empty')
  sliceLabel.innerText = generateSliceLabel()
}

function saveSlice() {
  localStorage[sliceLabel.innerText] =
    subjListStringify(formSubjListFromTable(table))
  loadLastSlice()
}

function trapMouseMove(e) {
  if (e.target.className == 'trap') {
    const [trap, scale, row] = e.path
    let part = Math.ceil(e.offsetX/trap.clientWidth * 10) || 1
    if (scale.classList.contains('needs'))  part = 11-part
    scale.dataset.hoverValue = part
    row.style.setProperty('--hover-width', part+'0%')
  }
}

function trapMouseClick(e) {
  const [trap, scale, row] = e.path
  let part = Math.ceil(e.offsetX/trap.clientWidth * 10) || 1
  if (scale.classList.contains('needs')) {
    scale.dataset.value = 11-part
    row.style.setProperty('--needs-width', 11-part+'0%')
  } else {
    scale.dataset.value = part
    row.style.setProperty('--gets-width', part+'0%')
  }
}

function sortTableBy(header) {
  if (header.dataset.sort=='desc') header.dataset.sort = 'asc'
  else {
    const prev = header.parentNode.querySelector('[data-sort]')
    if (prev) delete prev.dataset.sort
    header.dataset.sort = 'desc'
  }
  const tbody = header.parentNode.parentNode.nextElementSibling,
    rows = [...tbody.rows],
    col = header.cellIndex,
    sorter = col!=1
      ? (a, b) => b.cells[col].dataset.value - a.cells[col].dataset.value
      : (a, b) =>
        Math.abs(b.cells[0].dataset.value - b.cells[2].dataset.value) -
        Math.abs(a.cells[0].dataset.value - a.cells[2].dataset.value)
  rows.sort(sorter)
  if (header.dataset.sort=='asc') rows.reverse()
  tbody.append(...rows,...rows.filter(row => !row.cells[1].innerText))
}

function handleSubjectInput({ target }) {
  const tbody = target.parentNode.parentNode
  if ([...tbody.rows].every(row => row.cells[1].innerText))
    tbody.append(buildTableRow())
}
