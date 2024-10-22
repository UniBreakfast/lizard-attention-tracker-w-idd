
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

  window['slice']? loadSlice(slice) : loadLastSlice()
}

function buildTableRow([needs, subject, gets]=['','','']) {
  const row = row0.copy(),  [needScale, subjField, getScale] = row.cells
  subjField.txt(subject).oninput = handleSubjectInput
  needScale.dataset.value = needs || ''
  getScale.dataset.value = gets || ''
  row.style.setProperty('--needs-width', needs+'0%')
  row.style.setProperty('--gets-width', gets+'0%')
  return row
}

function loadSubjListToTable(subjList, {tBodies}) {
  tBodies[0].htm().append(...subjList.map(buildTableRow), buildTableRow())
}

function formSubjListFromTable({tBodies: [{rows}]}) {
  return [...rows].map(({ cells: [
    {dataset: {value: needs}}, {innerText: subject}, {dataset: {value: gets}}
  ] }) => [+needs, subject.trim(), +gets]).filter(subj => subj[1])
}

function subjListStringify(subjList) {
  return subjList.map(subj => values(subj).join('|')).join('_')
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
    date = [year, month, day].join('-'),
    slicesToday = keys(ls).filter(key => key.startsWith('slice '+date))
      .sort((a, b) => a<b? 1 : -1),
    letter = !slicesToday[0]? 'a' :
      String.fromCharCode(slicesToday[0].slice(-1).charCodeAt() + 1)
  return ['slice', date, letter].join(' ')
}

function loadSlice(label) {
  const subjList = subjLineParse(ls[label])
  sliceLabel.txt(label)
  loadSubjListToTable(subjList, table)
}

function loadLastSlice(noValues) {
  const sliceKeys = keys(ls)
    .filter(key => key.startsWith('slice ')).sort((a, b) => a<b? 1 : -1)
  const subjList = sliceKeys[0]? subjLineParse(ls[sliceKeys[0]]) : []
  sliceLabel.txt(sliceKeys[0] || generateSliceLabel())
  if (noValues) subjList.forEach(subj => subj[0] = subj[2] = 1)
  loadSubjListToTable(subjList, table)

  console.log(calcMindfulness(subjList))
}

function startNewSlice() {
  slice = ''
  loadLastSlice('empty')
  sliceLabel.txt(generateSliceLabel())
}

function saveSlice() {
  ls[sliceLabel.innerText] = subjListStringify(formSubjListFromTable(table))
  window['slice']? loadSlice(slice) : loadLastSlice()
}

function trapMouseMove(e) {
  if (e.target.className == 'trap') {
    const [trap, scale, row] = e.composedPath()
    let part = ceil(e.offsetX/trap.clientWidth * 10) || 1
    if (scale.classList.contains('needs'))  part = 11-part
    scale.dataset.hoverValue = part
    row.style.setProperty('--hover-width', part+'0%')
  }
}

function trapMouseClick(e) {
  const [trap, scale, row] = e.composedPath()
  let part = ceil(e.offsetX/trap.clientWidth * 10) || 1
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
    const prev = header.parent().querySelector('[data-sort]')
    if (prev) delete prev.dataset.sort
    header.dataset.sort = 'desc'
  }
  const tbody = header.parent('thead').next(),
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

function calcMindfulness(subjList) {
  return subjList.reduce(([max, lost], [needs, _, gets]) =>
    [max + (needs>5? needs-1 : 10-needs), lost + Math.abs(gets - needs)], [0,0])
      .reduce((max, lost)=> (max-lost)/max * 100 | 0)
}
