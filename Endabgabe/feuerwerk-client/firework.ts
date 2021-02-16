
namespace feuerwerk {

  //global canvasrendering
  export let crc2: CanvasRenderingContext2D;
  //global canvas element
  export let canvas: HTMLCanvasElement;
  //alle Raketen
  let rockets: Rocket[] = [];
  //alle Raketenobjekte
  let allRockets: RocketObject[] = [];
  export let allScatters: Scatter[] = [];

  // dom elements for typescript 
  let addButton: HTMLButtonElement;
  let testButton: HTMLButtonElement;
  let rocketName: HTMLInputElement;
  let colorSlider: HTMLInputElement;
  let secondColorSlider: HTMLInputElement;
  let sizeSlider: HTMLInputElement;
  let speedSlider: HTMLInputElement;
  let colorOutput: HTMLSpanElement;
  let secondColorOutput: HTMLSpanElement;
  let sizeOutput: HTMLSpanElement;
  let speedOutput: HTMLSpanElement;

  let rocketTable: HTMLElement;
  // server calls
  let client: Client;

  // erstes add event page load
  window.addEventListener("load", onPageLoad);

  
  function onPageLoad() {
    // cneuen client erstellen 
    client = new Client();

    //initialisiere dom elements
    colorSlider = document.getElementById("colorSlider") as HTMLInputElement;
    secondColorSlider = document.getElementById("secondColorSlider") as HTMLInputElement;
    rocketName = document.getElementById("rocketName") as HTMLInputElement;
    speedSlider = document.getElementById("speedSlider") as HTMLInputElement;
    sizeSlider = document.getElementById("sizeSlider") as HTMLInputElement;

    colorOutput = document.getElementById("colorOutput");
    colorOutput.innerHTML = colorSlider.value;

    secondColorOutput = document.getElementById("secondColorOutput");
    secondColorOutput.innerHTML = secondColorSlider.value;

    sizeOutput = document.getElementById("sizeOutput");
    sizeOutput.innerHTML = sizeSlider.value;

    speedOutput = document.getElementById("speedOutput");
    speedOutput.innerHTML = speedSlider.value;

    rocketTable = document.getElementById("rocketBody") as HTMLElement;

    // anzeigen von values im html dokument
    colorSlider.oninput = function (event: Event): void {
      let target = event.target as HTMLInputElement;
      colorOutput.innerHTML = target.value;
    }
     // anzeigen von values im html dokument
    secondColorSlider.oninput = function (event: Event): void {
      let target = event.target as HTMLInputElement;
      secondColorOutput.innerHTML = target.value;
    }
     // anzeigen von values im html dokument
    speedSlider.oninput = function (event: Event): void {
      let target = event.target as HTMLInputElement;
      speedOutput.innerHTML = target.value;
    }
     // anzeigen von values im html dokument
    sizeSlider.oninput = function (event: Event): void {
      let target = event.target as HTMLInputElement;
      sizeOutput.innerHTML = target.value;
    }
    //buttons
    addButton = document.getElementById("addRocket") as HTMLButtonElement;
    testButton = document.getElementById("testRocket") as HTMLButtonElement;
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    //dont do anything if no canvas available
    if (!canvas)
      return;

    // click events hinzufügen
    canvas.addEventListener("mousedown", startRakete);
    addButton.addEventListener("click", postRocket);
    testButton.addEventListener("click", testRocket);

    crc2 = <CanvasRenderingContext2D>canvas.getContext("2d")
    // canvas style hinzufügen
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    // danach internal size zu match schicken
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    //hintergrund vom canvas festlegen
    setBackground();
    // auf der seite werden alle raketen vom database laden
    getAllRockets();
    //animation wird in einer schleife gestartet
    setInterval(gameLoop, 16);

  }

  function startRakete(event: MouseEvent): void {
    //a x position wird generiert, wo raketen starten
    for (let i = 0; i < allRockets.length; i++) {
      launchFrom(Math.random() * canvas.width * 2 / 3 + canvas.width / 6, allRockets[i]);
    }
  }

  // alle values vom html einholen und neue raktenobjekte gestalten und zu anderen funktionen abgegeben 
  function testRocket(): void {
    let testRocket: RocketObject = {
      name: rocketName.value,
      color: Number.parseInt(colorSlider.value),
      secondColor: Number.parseInt(secondColorSlider.value),
      size: Number.parseFloat(sizeSlider.value),
      speed: Number.parseInt(speedSlider.value)
    }
    launchFrom(Math.random() * canvas.width * 2 / 3 + canvas.width / 6, testRocket);
  }
  // die objekte werden getestet und gelaunched
  function testSavedRocket(rocketobject: RocketObject): void {
     
    launchFrom(Math.random() * canvas.width * 2 / 3 + canvas.width / 6, rocketobject);
  }

  function testSelectedRocket(event: Event): void {
    // das geklickte Element einholen
    let target = event.currentTarget as HTMLAnchorElement;
    //index einholen, nach reihenfolge die angeklickt wurde
    //2
    let index = Number.parseInt(target.getAttribute("data-index"))
    //raketen werden von der liste eingeholt und ins index geladen
    let selectedRocket: RocketObject = allRockets[index]
    //test
    testSavedRocket(selectedRocket)
  }

  
  async function deleteSelectedRocket(event: Event) {
   // das geklickte Element einholen
    let target = event.currentTarget as HTMLAnchorElement;
    //index einholen, nach reihenfolge die angeklickt wurde
    let index = Number.parseInt(target.getAttribute("data-index"))
    //raketen werden von der liste eingeholt und ins index geladen
    let selectedRocket: RocketObject = allRockets[index]
    // drakete wird von der liste gelöscht
    await client.deleteRocket(selectedRocket._id);
    // raketen neu laden, bis sie gelöscht sind
    getAllRockets();

  }
  
  //veröffentliche die raketen von position x und füge neue racketen von raketenobjekt
  function launchFrom(posX: number, rocketObj: RocketObject): void {

    // position der rakete festlegen
    let pos: Vector = { x: posX, y: canvas.height };
    // neue rakete wird erstellt
    let rocket = new Rocket(pos, rocketObj);
    
    rocket.vel.y = Math.random() * -3 - 4;
    rocket.vel.x = Math.random() * 3 - 3;

    rockets.push(rocket);
  }

  function gameLoop(): void {

    setBackground();
    let queueRockets: Rocket[] = [];
    for (var i = 0; i < rockets.length; i++) {
      // update und render
      rockets[i].animate();

      //explode in the upper 80% of screen 
      
      if (rockets[i].pos.y < canvas.height * 0.2) {
        allScatters.push(...rockets[i].startRakete());
        // wenn die voraussetzungen nicht stimmen, dann rakete wird überschrieben
      } else {
        queueRockets.push(rockets[i]);
      }
    }
    rockets = queueRockets;
    //explosion
    for (var i = 0; i < allScatters.length; i++) {
      allScatters[i].animate();
     
      ;
    }
  }
  // alle raketen vom server holen
  async function getAllRockets() {
    allRockets = await client.getAllRockets()
    printRockets()
  }
  //raketen werden gezeichnet
  function printRockets() {

    let rows = allRockets;
    //wie viele in einer reihe
    var cols = ["_id","name","size","color","secondColor","speed"]

    var headerRow = '';
    var bodyRows = '';

    for (let i = 0; i < rows.length; i++) {
      let row: any = rows[i];
      
      //für jede rakete wird ein tr table erstellt
      bodyRows += '<tr>';
      //cols = ["name", "siuze", "color"...]
      for (let j = 0; j < cols.length; j++) {
        let colName = cols[j];
        //füge elements row[colName] = id value, name value, etc. hinzu
        bodyRows += '<td>' + row[colName] + '</td>';
      }
      // nach jeder reihe wird action button ausgelöst
      bodyRows += `<td>
      <a class="edit" data-index="${i}" title="Select" data-toggle="tooltip"><i class="fa fa-check"></i></a>
      <a class="delete"  data-index="${i}" title="Delete" data-toggle="tooltip"><i class="material-icons">&#xE872;</i></a>
      </td>`
      // schließen der table row
      bodyRows += '</tr>';
    }

    rocketTable.innerHTML = bodyRows;
    let editElements = document.getElementsByClassName("edit");
    for (let i = 0; i < editElements.length; i++) {
      editElements[i].addEventListener("click", testSelectedRocket);
    }

    let deleteElements = document.getElementsByClassName("delete");
    for (let i = 0; i < deleteElements.length; i++) {
      deleteElements[i].addEventListener("click", deleteSelectedRocket);
    }

  }


  async function postRocket(): Promise<RocketObject> {
    let testRocket: RocketObject = {
      name: rocketName.value,
      color: Number.parseInt(colorSlider.value),
      secondColor: Number.parseInt(secondColorSlider.value),
      size: Number.parseFloat(sizeSlider.value),
      speed: Number.parseInt(speedSlider.value)
    }
    let posted: RocketObject = await client.postRocket(testRocket)
    allRockets = await client.getAllRockets();
    getAllRockets()
    console.log(posted)
    return posted;
  }

  function setBackground(): void {

    crc2.save();
    crc2.fillStyle = "rgba(0, 0, 0, 0.15)";
    crc2.fillRect(0, 0, canvas.width, canvas.height);
    

  }

}