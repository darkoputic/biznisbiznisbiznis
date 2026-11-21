const treatments = {
  wash: { title:'Pranje', description:'Kompletno osveženje, spolja i iznutra.', prices:{hatch:'1.500',sedan:'1.700',wagon:'1.900',crossover:'2.200',midsuv:'2.500',largesuv:'2.800'}, includes:['Ručno pranje u više etapa','Pranje potkrila, felni i guma','Pranje uvala vrata','Usisavanje kompletnog enterijera','Brisanje svih površina i stakala','Dresing plastike i guma'],note:'' },
  detail: { title:'Detailing',description:'Dubinska nega enterijera uz kompletno ručno pranje eksterijera.',prices:{hatch:'12.000',sedan:'14.000',wagon:'16.000',crossover:null,midsuv:'18.000',largesuv:'18.000'},includes:['Temeljno usisavanje svih površina','Dubinsko pranje sedišta i tepiha','Hemijsko čišćenje neba i tapacirunga','Detaljno čišćenje table i prekidača','Ventilacioni otvori i dezinfekcija klime','Pregrade, kasete i pod gepeka','Stakla, eksterijer, felne i potkrila','Dresing plastike i guma'],note:'' },
  polish: { title:'Poliranje',description:'Temeljna priprema laka, mašinsko poliranje i završna zaštita.',prices:{hatch:'24.000–40.000',sedan:'29.000–47.000',wagon:'35.000–53.000',crossover:'35.000–53.000',midsuv:'40.000–59.000',largesuv:'40.000–59.000'},includes:['Ručno pranje u više etapa','Hemijska dekontaminacija laka','Fizička dekontaminacija glinom','Poliranje u dva ili više prelaza','Poliranje svetlosnih grupa','Keramička zaštita do 6 meseci'],note:'Viša cena uključuje šmirglanje laka P1500/P2000/P3000 i poliranje u dva prelaza.' }
};
let selectedTreatment='wash';
const vehicle=document.querySelector('#vehicle');
function updateTreatment(key){
  selectedTreatment=key;
  const t=treatments[key],price=t.prices[vehicle.value];
  document.querySelectorAll('[data-tab]').forEach(tab=>{const active=tab.dataset.tab===key;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});
  document.querySelector('#treatment-panel').setAttribute('aria-labelledby','tab-'+key);
  document.querySelector('#treatment-title').textContent=t.title;
  const priceNode=document.querySelector('#price');priceNode.replaceChildren();
  const strong=document.createElement('strong');strong.textContent=price??'Po dogovoru';priceNode.append(strong);
  if(price){const unit=document.createElement('span');unit.textContent='RSD';priceNode.append(unit);}
  document.querySelector('#treatment-description').textContent=t.description;
  const list=document.querySelector('#treatment-includes');list.replaceChildren(...t.includes.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
  let note=t.note;
  if(vehicle.value==='crossover')note=key==='detail'?'Cena detailinga za krosover / pik-ap nije posebno navedena. Potrebna je potvrda cene.':key==='polish'?note+' Prikazana cena važi za krosover. Za pik-ap je potrebna potvrda cene.':'';
  document.querySelector('#price-note').textContent=note;
}
vehicle.addEventListener('change',()=>updateTreatment(selectedTreatment));
document.querySelectorAll('[data-tab]').forEach((tab,index,tabs)=>{
  tab.addEventListener('click',()=>updateTreatment(tab.dataset.tab));
  tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();tabs[next].focus();updateTreatment(tabs[next].dataset.tab);});
});
document.querySelectorAll('[data-service]').forEach(link=>link.addEventListener('click',()=>updateTreatment(link.dataset.service)));
document.querySelector('#year').textContent=new Date().getFullYear();
updateTreatment(selectedTreatment);
if(document.modelContext?.registerTool){
  const lifecycle=new AbortController();
  try{Promise.resolve(document.modelContext.registerTool({name:'configure_vehicle_treatment',title:'Izaberi Venom tretman',description:'Select a vehicle class and treatment. Update the visible service prices and treatment details, without making a booking.',inputSchema:{type:'object',properties:{vehicle:{type:'string',enum:['hatch','sedan','wagon','crossover','midsuv','largesuv']},treatment:{type:'string',enum:['wash','detail','polish']}},required:['vehicle','treatment'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||!['hatch','sedan','wagon','crossover','midsuv','largesuv'].includes(input.vehicle)||!Object.hasOwn(treatments,input.treatment))throw new Error('Invalid vehicle or treatment');vehicle.value=input.vehicle;updateTreatment(input.treatment);return {vehicle:input.vehicle,treatment:treatments[input.treatment].title,price:treatments[input.treatment].prices[input.vehicle],currency:'RSD',note:document.querySelector('#price-note').textContent};}},{signal:lifecycle.signal})).catch(()=>{});}catch{}
  window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}
