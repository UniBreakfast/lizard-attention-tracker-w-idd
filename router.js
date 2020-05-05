const sections = root.querySelectorAll(".route")
sections.forEach(s => s.onclick = e => push(e.target.id))

function select_tab(id) {
  sections.forEach(item => item.classList.remove('selected'));
  window[id].classList.add('selected');
}
function load_content(id) {
  content.innerHTML = 'Content loading for /'+id+'...'
}
function push(id) {
  select_tab(id);
  document.title = id;
  load_content(id);
  history.pushState({ id }, id, '/'+id);
}

onpopstate = e => {
  select_tab(e.state.id);
  load_content(e.state.id);
};


function goto(page, title) {
  doc.title = title || page
  router[page]();
  history.pushState({ id }, id, '/'+id);
}

const router = {
  home()
}