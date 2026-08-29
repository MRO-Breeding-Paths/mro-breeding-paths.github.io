function PageLoaded() {
    LoadMonsterList();
    LoadBreedingRules();
    LoadMonsterWeightings();

    // Populate the breeding rules
    PopulateMonsterList();

    let monster = monsters.find(m => m.name.toLowerCase() === breedingRules[0].child.toLowerCase());
    PopulateBreedingPath(monster);

    let btn = document.getElementById("loadButton");
    btn.classList.add("hidden");
}

function ClearBreedingPathSection() {
    let pathSection = document.getElementById("breedingPath");
    if (!pathSection) { return; }

    while (pathSection.lastElementChild) {
        if (pathSection.lastElementChild.id === "aboutSection") {
            if (pathSection.children.length === 1) { break; }
            continue;
        }
        pathSection.removeChild(pathSection.lastElementChild);
    }
}

let showAbout = false;
function About() {
    ClearBreedingPathSection();
    ToggleAboutSectionVisibility();
}

function ToggleAboutSectionVisibility(show) {
    let aboutSection = document.getElementById("aboutSection");
    if (!aboutSection) { return; }

    if (show == null) {
        showAbout = !showAbout;
    } else {
        showAbout = show;
    }

    if (showAbout) {
        aboutSection.classList.remove("hidden");
    }
    else {
        aboutSection.classList.add("hidden");
    }
}

function PopulateMonsterList() {
    let mons = document.getElementById("monsterList");
    if (!mons) { return; }

    for (let i = 0; i < breedingRules.length; i++) {
        let rule = breedingRules[i];
        let btn = document.createElement("button");

        let monster = monsters.find(m => m.name.toLowerCase() === breedingRules[i].child.toLowerCase());
        btn.onclick = function() { PopulateBreedingPath(monster, rule); };

        let monDiv = buildMonsterDiv(monster);

        if (!rule.confirmed) {
            monDiv.classList.add("unconfirmedMonster");
        }

        btn.dataset.monster = monster.name;
        btn.dataset.type1 = monster.type1;
        btn.dataset.type2 = monster.type2;

        btn.appendChild(monDiv);
        mons.appendChild(btn);
    }
}

function PopulateBreedingPath(monster, rule) {
    let pathSection = document.getElementById("breedingPath");
    if (!pathSection) { return; }

    ClearBreedingPathSection();
    ToggleAboutSectionVisibility(false);

    if (!rule) { rule = breedingRules.find(r => r.child.toLowerCase() === monster.firstForm.toLowerCase()); }
    if (!rule) { return; }

    if (!rule.confirmed) {
        let unconfirmedDiv = document.createElement("div");
        unconfirmedDiv.classList.add("unconfirmed");
        unconfirmedDiv.innerText = "UNCONFIRMED";
        pathSection.appendChild(unconfirmedDiv);
    }

    let ruleDivs = GetBreedingRuleDiv(0, monster, rule);

    ruleDivs.sort((a, b) => a.level - b.level);

    let currentLevel = 0;
    for (let i = 0; i < ruleDivs.length; i++) {
        if (ruleDivs[i]) {
            if (ruleDivs[i].level > currentLevel) {
                currentLevel = ruleDivs[i].level;

                let divider = document.createElement("hr");
                divider.classList.add("solid");
                pathSection.appendChild(divider);
            }

            pathSection.appendChild(ruleDivs[i].div);
        }
    }
}

function GetWildSpawnDiv(level, monster) {
    let wildSpawnDiv = document.createElement("div");
    wildSpawnDiv.classList.add("wildSpawn");

    let firstForm = monsters.find(m => m.name.toLowerCase() === monster.firstForm.toLowerCase());
    if (!firstForm) { return; }

    let mapNameDiv = document.createElement("div");
    let monDiv = buildMonsterDiv(firstForm, null, function() {
        let monDivHeight = getHeight(monDiv);
        mapNameDiv.style.height = monDivHeight.toString() + "px";
    });
    wildSpawnDiv.appendChild(monDiv);

    let arrowDiv = BuildWildSpawnArrowDiv();

    wildSpawnDiv.appendChild(arrowDiv);

    let maps = monsterWeightings.filter(m => m.id === firstForm.id);
    if (!maps) { return; }

    mapNameDiv.classList.add("list");
    let list = document.createElement("ul");
    for (let i = 0; i < maps.length; i++) {
        let listItem = document.createElement("li");
        listItem.innerText = maps[i].mapName;
        list.appendChild(listItem);
    }

    let monDivHeight = getHeight(monDiv);
    mapNameDiv.style.height = monDivHeight.toString() + "px";

    mapNameDiv.appendChild(list);
    wildSpawnDiv.appendChild(mapNameDiv);

    if (firstForm.id !== monster.id) {
        let childMutatedDiv = buildMonsterDiv(monster);

        wildSpawnDiv.appendChild(BuildArrowDiv());
        wildSpawnDiv.appendChild(childMutatedDiv);
    }

    let divs = [];
    divs.push({ level: level, div: wildSpawnDiv });
    return divs;
}

function getHeight(element)
{
    element = element.cloneNode(true);
    element.style.visibility = "hidden";
    document.body.appendChild(element);
    var height = element.offsetHeight + 20;
    document.body.removeChild(element);
    element.style.visibility = "visible";
    return height;
}

function GetBreedingRuleDiv(level, monster, rule) {
    if (!monster) { return; }

    let rules = [];
    if (!rule) { rule = breedingRules.find(r => r.child.toLowerCase() === monster.firstForm.toLowerCase()); }
    if (rule) {

        let ruleDiv = document.createElement("div");
        ruleDiv.className = "breeding-rule";

        let father = monsters.find(m => m.name === rule.father);
        let mother = monsters.find(m => m.name === rule.mother);
        let child  = monsters.find(m => m.name === rule.child);

        let fatherDiv;
        let motherDiv;
        if (rule.ruleType === "match") {
            let nieggRule = father.name.toLowerCase().includes("niegg") || mother.name.toLowerCase().includes("niegg")

            fatherDiv = buildMonsterDiv(father, nieggRule ? "both" : "male");
            motherDiv = buildMonsterDiv(mother, nieggRule ? "both" : "female");
        }
        else {
            fatherDiv = buildTypeParentDiv(rule.father, "male");
            motherDiv = buildTypeParentDiv(rule.mother, "female");
        }
        let childDiv = buildMonsterDiv(child);

        ruleDiv.appendChild(fatherDiv);
        ruleDiv.appendChild(BuildPlusDiv());
        ruleDiv.appendChild(motherDiv);
        ruleDiv.appendChild(BuildEqualsDiv());
        ruleDiv.appendChild(childDiv);

        if (child.name.toLowerCase() !== monster.name.toLowerCase()) {
            let childMutatedDiv = buildMonsterDiv(monster);

            ruleDiv.appendChild(BuildArrowDiv());
            ruleDiv.appendChild(childMutatedDiv);
        }

        let fatherRuleDiv = GetBreedingRuleDiv(level + 1, father);
        let motherRuleDiv = GetBreedingRuleDiv(level + 1, mother);

        if (ruleDiv) { rules.push({ level: level, div: ruleDiv }); }
        if (fatherRuleDiv) { fatherRuleDiv.forEach(r => rules.push(r)); }
        if (motherRuleDiv) { motherRuleDiv.forEach(r => rules.push(r)); }
    }

    let wildSpawn = monsterWeightings.find(w => w.name.toLowerCase() === monster.firstForm.toLowerCase());
    if (wildSpawn) {
        let spawnDivs =  GetWildSpawnDiv(level, monster);
        spawnDivs.forEach(div => rules.push({level: div.level, div: div.div}));
    }

    return rules;
}

function buildMonsterDiv(monster, gender, imgLoaded) {
    let monDiv = document.createElement("div");
    monDiv.className = "monster";

    let spriteDiv = document.createElement("div");
    spriteDiv.className = "sprite";

    let spriteImg = document.createElement("img");
    spriteImg.src = "sprites/dpmfa" + ("000" + monster.id).slice(-3) + ".png";
    spriteImg.onload = imgLoaded;
    spriteDiv.appendChild(spriteImg);

    let typeDiv = buildTypeDiv(monster.type1 + "/" + monster.type2);

    let nameDiv = document.createElement("div");
    nameDiv.className = "name";
    nameDiv.innerHTML = monster.name;

    monDiv.appendChild(spriteDiv);

    let wildSpawn = monsterWeightings.find(w => w.name === monster.firstForm);
    if (wildSpawn) {
        let grassImg = document.createElement("img");
        grassImg.src = "sprites/grass.png";
        grassImg.className = "grass";
        spriteDiv.appendChild(grassImg);
    }

    monDiv.appendChild(nameDiv);

    if (gender) {
        let genderDiv = document.createElement("div");
        if (gender === "both") {
            let maleDiv = document.createElement("div");
            let femaleDiv = document.createElement("div");
            maleDiv.innerHTML = "<img src=\"sprites/male.png\" alt=\"" + monster.type1 + "\" />";
            femaleDiv.innerHTML = "<img src=\"sprites/female.png\" alt=\"" + monster.type1 + "\" />";
            genderDiv.className = "types";
            maleDiv.className = "type";
            femaleDiv.className = "type";
            genderDiv.appendChild(maleDiv);
            genderDiv.appendChild(femaleDiv);
        }
        else {
            genderDiv.innerHTML = "<img src=\"sprites/" + gender.toLowerCase() + ".png\" alt=\"" + monster.type1 + "\" />";
        }
        monDiv.appendChild(genderDiv);
    }

    monDiv.appendChild(typeDiv);

    return monDiv;
}

function buildTypeParentDiv(type, gender) {
    let monDiv = document.createElement("div");
    monDiv.className = "monster";

    let typeDiv = buildTypeDiv(type);
    let genderDiv = document.createElement("div");
    genderDiv.innerHTML = "<img src=\"sprites/" + gender.toLowerCase() + ".png\" alt=\"" + gender + "\" />";

    monDiv.appendChild(genderDiv);
    monDiv.appendChild(typeDiv);

    return monDiv;
}

function buildTypeDiv(types) {
    let typeArr = types.split("/");
    let type1 = typeArr[0];
    let type2 = typeArr[1];

    let typeDiv = document.createElement("div");
    let type1Div = document.createElement("div");
    let type2Div = document.createElement("div");
    typeDiv.className = "types";
    type1Div.className = "type";
    type2Div.className = "type";
    type1Div.innerHTML = "<img src=\"sprites/element-" + type1.toLowerCase() + ".png\" alt=\"" + type1 + "\" />";
    type2Div.innerHTML = "<img src=\"sprites/element-" + type2.toLowerCase() + ".png\" alt=\"" + type2 + "\" />";
    typeDiv.appendChild(type1Div);
    typeDiv.appendChild(type2Div);

    return typeDiv;
}

function filterMonsterList(evt) {
    let searchString = evt.target.value.toLowerCase();

    let mons = document.getElementsByClassName("monster-list")[0];
    let btns = mons.getElementsByTagName("button");
    if (!btns) { return; }

    for (let i = 0; i < btns.length; i++) {
        let monElement = btns[i];

        let name = monElement.dataset.monster;
        let type1 = monElement.dataset.type1;
        let type2 = monElement.dataset.type2;

        if (!name.toLowerCase().includes(searchString) &&
            !type1.toLowerCase().includes(searchString) &&
            !type2.toLowerCase().includes(searchString)) {
            monElement.classList.add("hidden");
        }
        else {
            monElement.classList.remove("hidden");
        }
    }
}

function BuildPlusDiv() {
    let plusDiv = document.createElement("div");
    plusDiv.style = "display: inline-flex; align-items: center; margin: 5px; font-size: xx-large";
    plusDiv.innerHTML = "+";

    return plusDiv;
}

function BuildEqualsDiv() {
    let equalDiv = document.createElement("div");
    equalDiv.style = "display: inline-flex; align-items: center; margin: 5px; font-size: xx-large";
    equalDiv.innerHTML = "=";

    return equalDiv;
}

function BuildArrowDiv() {
    let arrowImg = document.createElement("img");
    arrowImg.src = "sprites/mutate_arrow.png";
    arrowImg.alt = "wild spawn";
    arrowImg.classList.add("sprite");
    arrowImg.classList.add("arrow");

    return arrowImg;
}

function BuildWildSpawnArrowDiv() {
    let arrowImg = document.createElement("img");
    arrowImg.src = "sprites/wild_spawn_arrow.png";
    arrowImg.alt = "wild spawn";
    arrowImg.classList.add("sprite");
    arrowImg.classList.add("arrow");

    return arrowImg;
}