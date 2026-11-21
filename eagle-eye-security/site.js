const scenarios = {
  camera: {
    icon: '#camera',
    title: 'Stigla je dostava.',
    description: 'Pogledaj prilaz dok je dostavljač još ispred kapije.',
    action: 'Pogledaj kameru',
    result: ['Otvoren je prikaz prilaza.', 'Na telefonu možeš da proveriš ko je ispred kapije ako je sistem podešen za daljinski pregled.']
  },
  intercom: {
    icon: '#phone',
    title: 'Neko zvoni na ulazu.',
    description: 'Razgovaraš sa posetiocem pre nego što ga pustiš unutra.',
    action: 'Odgovori na poziv',
    result: ['Razgovor je uspostavljen.', 'Možeš da pitaš posetioca koga traži pre otvaranja vrata.']
  },
  tag: {
    icon: '#lock',
    title: 'Vraćaš se kući.',
    description: 'Prisloni tag na čitač pored pešačkog ulaza.',
    action: 'Prisloni tag',
    result: ['Tag je prepoznat.', 'Čitač je prihvatio registrovani tag i otključao pešački ulaz.']
  },
  remote: {
    icon: '#key',
    title: 'Stižeš autom.',
    description: 'Koristi programirani daljinac za automatsku kapiju.',
    action: 'Pritisni daljinac',
    result: ['Komanda je primljena.', 'Kapija se otvara i možeš da uđeš bez izlaska iz auta.']
  }
};

const entry = document.querySelector('.entry-view');
const options = [...document.querySelectorAll('.demo-options button')];
const marker = document.querySelector('.device-marker use');
const title = document.querySelector('#device-title');
const description = document.querySelector('#device-description');
const action = document.querySelector('.demo-action');

function showScenario(device, complete = false) {
  const scenario = scenarios[device];
  entry.dataset.device = device;
  entry.classList.toggle('activated', complete);
  marker.setAttribute('href', scenario.icon);
  for (const option of options) {
    option.setAttribute('aria-pressed', String(option.dataset.device === device));
  }
  title.textContent = complete ? scenario.result[0] : scenario.title;
  description.textContent = complete ? scenario.result[1] : scenario.description;
  action.textContent = complete ? 'Probaj ponovo' : scenario.action;
}

for (const option of options) {
  option.addEventListener('click', () => showScenario(option.dataset.device));
}
action.addEventListener('click', () => {
  showScenario(entry.dataset.device, !entry.classList.contains('activated'));
});
