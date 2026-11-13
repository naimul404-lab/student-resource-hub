const searchInput = document.querySelector('#searchInput');
const subjectFilter = document.querySelector('#subjectFilter');
const difficultyFilter = document.querySelector('#difficultyFilter');
const typeFilter = document.querySelector('#typeFilter');
const clearFilters = document.querySelector('#clearFilters');
const resultsSummary = document.querySelector('#resultsSummary');
const resourcesGrid = document.querySelector('#resourcesGrid');

function addText(parent, tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function renderResources(resources) {
  resourcesGrid.replaceChildren();
  resultsSummary.textContent = `${resources.length} resource${resources.length === 1 ? '' : 's'} found`;

  if (resources.length === 0) {
    addText(resourcesGrid, 'div', 'empty-state', 'No resources match your search. Try changing or clearing the filters.');
    return;
  }

  for (const resource of resources) {
    const card = document.createElement('article');
    card.className = 'resource-card';
    const top = document.createElement('div');
    top.className = 'resource-top';
    addText(top, 'span', 'resource-type', resource.type);
    addText(top, 'span', 'meta-pill', resource.difficulty);
    card.append(top);
    addText(card, 'h3', '', resource.title);
    const metadata = document.createElement('div');
    metadata.className = 'resource-meta';
    addText(metadata, 'span', 'meta-pill', resource.subject);
    card.append(metadata);
    addText(card, 'p', '', resource.description);

    if (resource.tags.length) {
      const tags = document.createElement('div');
      tags.className = 'resource-tags';
      for (const tag of resource.tags) addText(tags, 'span', '', tag);
      card.append(tags);
    }

    const link = addText(card, 'a', 'resource-link', 'Visit resource');
    link.href = resource.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    card.append(link);
    resourcesGrid.append(card);
  }
}

function updateSubjectOptions(resources) {
  const selected = subjectFilter.value;
  const subjects = [...new Set(resources.map((resource) => resource.subject))].sort((a, b) => a.localeCompare(b));
  subjectFilter.replaceChildren(new Option('All subjects', 'all'));
  for (const subject of subjects) subjectFilter.add(new Option(subject, subject));
  subjectFilter.value = subjects.includes(selected) ? selected : 'all';
}

async function loadResources() {
  const params = new URLSearchParams();
  if (searchInput.value.trim()) params.set('q', searchInput.value.trim());
  if (subjectFilter.value !== 'all') params.set('subject', subjectFilter.value);
  if (difficultyFilter.value !== 'all') params.set('difficulty', difficultyFilter.value);
  if (typeFilter.value !== 'all') params.set('type', typeFilter.value);

  resultsSummary.textContent = 'Loading resources…';
  try {
    const response = await fetch(`/api/resources?${params}`);
    if (!response.ok) throw new Error('The server could not load resources.');
    const { data } = await response.json();
    updateSubjectOptions(data);
    renderResources(data);
  } catch (error) {
    resultsSummary.textContent = 'Could not load resources.';
    resourcesGrid.replaceChildren();
    addText(resourcesGrid, 'div', 'empty-state', `${error.message} Please refresh or try again later.`);
  }
}

let searchTimeout;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(loadResources, 180);
});
for (const filter of [subjectFilter, difficultyFilter, typeFilter]) filter.addEventListener('change', loadResources);
clearFilters.addEventListener('click', () => {
  searchInput.value = '';
  subjectFilter.value = 'all';
  difficultyFilter.value = 'all';
  typeFilter.value = 'all';
  loadResources();
});

loadResources();
