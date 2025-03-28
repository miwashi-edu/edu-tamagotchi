const MAXPETS = 4;
const CANVAS_WIDTH = 256;
const CANVAS_HEIGHT = 256;
let petCount = 0;

window.addEventListener('DOMContentLoaded', () => {
    const speciesSelect = document.getElementById('species-select');
    Tamagotchi.speciesList.forEach(species => {
        const option = document.createElement('option');
        option.value = species;
        option.textContent = species[0].toUpperCase() + species.slice(1);
        speciesSelect.appendChild(option);
    });
});

document.getElementById('add-btn').addEventListener('click', () => {
    if (petCount >= MAXPETS) return;

    const species = document.getElementById('species-select').value;
    addTamagotchi(species);
    petCount++;
});

function addTamagotchi(species) {
    const container = document.getElementById('container');

    const petDiv = createPetWrapper();
    const statsDiv = createStatsDiv();
    const canvas = createCanvas(petCount);
    const ctx = canvas.getContext('2d');
    const btnRow = createButtonRow();
    const logToggleBtn = createLogToggleButton();
    const logDiv = createLogDiv();

    petDiv.appendChild(statsDiv);
    petDiv.appendChild(canvas);
    petDiv.appendChild(btnRow);
    petDiv.appendChild(logToggleBtn);
    petDiv.appendChild(logDiv);
    container.appendChild(petDiv);

    const pet = new Tamagotchi(`Pet ${petCount + 1}`, species, ctx, logDiv);

    const buttons = {
        feed: createActionButton('Feed', pet.feed.bind(pet)),
        play: createActionButton('Play', pet.play.bind(pet)),
        pet: createActionButton('Pet', pet.pet.bind(pet)),
    };

    hookButtons(buttons, pet, statsDiv);
    btnRow.append(buttons.feed, buttons.play, buttons.pet);

    setInterval(() => updateStats(statsDiv, pet), 1000);
}

function createPetWrapper() {
    const div = document.createElement('div');
    div.className = 'pet';
    return div;
}

function createStatsDiv() {
    const div = document.createElement('div');
    div.className = 'stats';
    div.textContent = 'Loading...';
    return div;
}

function createCanvas(id) {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    canvas.id = `tamagotchi-${id}`;
    return canvas;
}

function createButtonRow() {
    const row = document.createElement('div');
    row.className = 'btn-row';
    return row;
}

function createActionButton(label, actionFn) {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.actionFn = actionFn;
    return btn;
}

function hookButtons(buttons, pet, statsDiv) {
    const all = Object.values(buttons);

    for (const btn of all) {
        btn.onclick = async () => {
            setButtonsEnabled(all, false);
            console.log(await btn.actionFn());
            await updateStats(statsDiv, pet);
            setButtonsEnabled(all, true);
        };
    }
}

function setButtonsEnabled(buttons, enabled) {
    buttons.forEach(btn => btn.disabled = !enabled);
}

async function updateStats(statsDiv, pet) {
    const stats = await pet.status();
    statsDiv.innerText = `
Name: ${stats.name}
Species: ${stats.species}
Hunger: ${stats.hunger.toFixed(1)}
Happiness: ${stats.happiness.toFixed(1)}
Age: ${stats.age}
Alive: ${stats.alive ? 'Yes' : 'No'}
`.trim();
}

function createLogToggleButton() {
    const btn = document.createElement('button');
    btn.textContent = 'Toggle Log';
    btn.className = 'log-toggle';
    btn.onclick = () => {
        const log = btn.nextElementSibling;
        log.style.display = (log.style.display === 'none' ? 'block' : 'none');
    };
    return btn;
}

function createLogDiv() {
    const div = document.createElement('div');
    div.className = 'log';
    div.style.display = 'none';
    return div;
}
