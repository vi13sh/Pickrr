// Selectors
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const currentHexes = document.querySelectorAll(".color h2");
const sliders = document.querySelectorAll("input[type='range']");
const copyContainer = document.querySelector(".copy-container");
const adjustBtns = document.querySelectorAll(".adjust");
const lockBtns = document.querySelectorAll(".lock");
const clearLibrary = document.querySelector(".clear");
const closeAdjustments = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
let initialColors;
let savedPalettes = [];

//Event listeners
generateBtn.addEventListener("click", randomColor);
sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});
colorDivs.forEach((div, index) => {
  div.addEventListener("input", () => {
    updateTextUI(index);
  });
});
currentHexes.forEach((hex) => {
  const helpText = document.createElement("p");
  helpText.innerText = "copy hexCode";
  hex.addEventListener("click", () => {
    copyToClipborad(hex);
    //console.log(hex.innerText);
  });
  hex.addEventListener("mouseover", () => {
    helpText.style.opacity = "1";
  });
  hex.addEventListener("mouseleave", () => {
    helpText.style.opacity = "0";
  });

  hex.parentElement.appendChild(helpText);
});
copyContainer.addEventListener("transitionend", () => {
  const popupBox = copyContainer.children[0];
  copyContainer.classList.remove("active");
  popupBox.classList.remove("active");
});
adjustBtns.forEach((adjustBtn, index) => {
  const helpText = document.createElement("p");
  helpText.innerText = "adjust color";
  adjustBtn.parentElement.appendChild(helpText);
  adjustBtn.addEventListener("mouseover", () => {
    helpText.style.opacity = "1";
  });
  adjustBtn.addEventListener("mouseleave", () => {
    helpText.style.opacity = "0";
  });
  adjustBtn.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});
closeAdjustments.forEach((close, index) => {
  close.addEventListener("click", () => {
    closeAdjustmentBtn(index);
  });
});

lockBtns.forEach((lockBtn, index) => {
  const helpText = document.createElement("p");

  lockBtn.parentElement.appendChild(helpText);
  lockBtn.addEventListener("mouseover", () => {
    if (lockBtn.children[0].classList.contains("fa-lock")) {
      helpText.innerText = "unlock color";
    } else {
      helpText.innerText = "lock color";
    }
    helpText.style.opacity = "1";
  });
  lockBtn.addEventListener("mouseleave", () => {
    helpText.style.opacity = "0";
  });
  lockBtn.addEventListener("click", () => {
    if (lockBtn.children[0].classList.contains("fa-lock")) {
      helpText.innerText = "lock color";
    } else {
      helpText.innerText = "unlock color";
    }
    toggleLock(index);
  });
});
clearLibrary.addEventListener("click", () => {
  localStorage.clear();
  const customPalettes = document.querySelectorAll(".custom-palette");
  const saafHogya = document.querySelector(".saaf-hogya");
  saafHogya.play();
  customPalettes.forEach((customPalette) => {
    customPalette.remove();
  });
  clearLibrary.style.background = "#e23939";
  clearLibrary.style.transition = "0.1s ease";
  setTimeout(function () {
    clearLibrary.style.background = "rgb(31, 33, 63)";
  }, 100);
});
// functions

function generateHex() {
  const hash = chroma.random();
  return hash;
}

function randomColor() {
  generateBtn.style.background = "rgb(100 105 186)";
  generateBtn.style.transition = "0.1s ease";
  setTimeout(function () {
    generateBtn.style.background = "rgb(31, 33, 63)";
  }, 100);
  // Initial colors
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const randomColor = generateHex();
    if (div.classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }
    //push initial colors to the array

    // Add the bg color and change hexText
    div.style.background = randomColor;
    hexText.innerText = randomColor;
    //check for contrast
    checkTextContrast(randomColor, hexText);
    // Colorize sliders
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    // check for control btn contrast
    const icons = div.querySelectorAll(".controls button");
    for (icon of icons) {
      checkTextContrast(randomColor, icon);
    }

    colorizeSlider(randomColor, hue, brightness, saturation);
  });
  // setting input thumb location
  resetInputs();
}
function resetInputs() {
  const sliders = document.querySelectorAll(".sliders input");
  sliders.forEach((slider) => {
    if (slider.name == "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      slider.value = chroma(hueColor).get("hsl.h");
    }
    if (slider.name == "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-brightness")];
      slider.value = chroma(brightColor).get("hsl.l");
    }
    if (slider.name == "saturation") {
      const brightColor = initialColors[slider.getAttribute("data-sat")];
      slider.value = chroma(brightColor).get("hsl.s");
    }
  });
}
function colorizeSlider(color, hue, brightness, saturation) {
  // scale saturation
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);
  // scale brightness
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  //update input color
  //saturation
  saturation.style.background = `linear-gradient(to right,${scaleSat(
    0
  )}, ${scaleSat(1)})`;
  //brightness
  brightness.style.background = `linear-gradient(to right,${scaleBright(
    0
  )},${scaleBright(0.5)}, ${scaleBright(1)})`;
  //hue
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}
function hslControls(e) {
  index =
    e.target.getAttribute("data-hue") ||
    e.target.getAttribute("data-brightness") ||
    e.target.getAttribute("data-sat");

  let sliders = e.target.parentElement.querySelectorAll("input[type='range']");
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];

  let color = chroma(bgColor)
    .set("hsl.h", hue.value)
    .set("hsl.l", brightness.value)
    .set("hsl.s", saturation.value);
  colorDivs[index].style.background = color;

  //set input color
  colorizeSlider(color, hue, brightness, saturation);
}
function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  textHex.innerText = color.hex();
  // check contrast of text
  checkTextContrast(color, textHex);
  // check contrast of icons
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}
function copyToClipborad(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select(); // select() method selects all the text in a <textarea> element or in an <input> element that includes a text field.
  document.execCommand("copy"); // copy text to clipboard
  document.body.removeChild(el);
  //popup
  const popupBox = copyContainer.children[0];
  copyContainer.classList.add("active");
  popupBox.classList.add("active");
}
function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle("active");
}
function closeAdjustmentBtn(index) {
  sliderContainers[index].classList.remove("active");
}

function toggleLock(index) {
  console.log(index);
  colorDivs[index].classList.toggle("locked");
  lockBtns[index].classList.toggle("active");
  if (lockBtns[index].children[0].classList.contains("fa-lock-open")) {
    lockBtns[index].children[0].classList.remove("fa-lock-open");
    lockBtns[index].children[0].classList.add("fa-lock");
  } else {
    lockBtns[index].children[0].classList.remove("fa-lock");
    lockBtns[index].children[0].classList.add("fa-lock-open");
  }
}
randomColor();
//implement save to palette and Local storage stuff
const saveContainer = document.querySelector(".save-container");
const savePopup = document.querySelector(".save-popup");
const closeSave = document.querySelector(".close-save");
const submitSave = document.querySelector(".submit-save");
const saveBtn = document.querySelector(".save");
const saveInput = document.querySelector(".save-name");
const libraryBtn = document.querySelector(".library");
const libraryContainer = document.querySelector(".library-container");
const closeLibraryBtn = document.querySelector(".close-library");

saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libraryBtn.addEventListener("click", openLibrary);
closeLibraryBtn.addEventListener("click", closeLibrary);

saveContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("save-container")) {
    saveContainer.classList.remove("active");
  }
});
libraryContainer.addEventListener("click", (e) => {
  if (e.target.classList.contains("library-container")) {
    libraryContainer.classList.remove("active");
  }
});

function openPalette() {
  saveContainer.classList.add("active");
  savePopup.classList.add("active");
}
function closePalette() {
  saveContainer.classList.remove("active");
  savePopup.classList.remove("active");
}
function openLibrary() {
  libraryContainer.classList.add("active");
  libraryContainer.children[0].classList.add("active");
}
function closeLibrary() {
  libraryContainer.classList.remove("active");
  libraryContainer.children[0].classList.remove("active");
}
function savePalette(e) {
  saveContainer.classList.remove("active");
  savePopup.classList.remove("active");
  const name = saveInput.value;
  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });
  // Generate object
  let paletteNo = savedPalettes.length;
  const paletteObj = { name: name, colors: colors, no: paletteNo };
  savedPalettes.push(paletteObj);
  saveInput.value = "";
  //save to local storage
  saveToLocal(paletteObj);
  //generate palette for library
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObj.colors.forEach((smallColor) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.background = smallColor;
    preview.appendChild(smallDiv);
  });
  // select button
  const paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObj.no);
  paletteBtn.innerText = "Select";
  // remove button
  const removePaletteBtn = document.createElement("button");
  removePaletteBtn.classList.add("remove-palette-btn");
  removePaletteBtn.classList.add(paletteObj.no);
  removePaletteBtn.innerText = "Remove";
  //Attach event listner to the remove button
  removePaletteBtn.addEventListener("click", (e) => {
    e.target.parentElement.remove();
  });

  //Attach event listner to the select button
  paletteBtn.addEventListener("click", (e) => {
    closeLibrary();
    const paletteIndex = e.target.classList[1]; // selecting second class of i.e index of btn
    initialColors = [];
    savedPalettes[paletteIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      const text = colorDivs[index].children[0];
      checkTextContrast(color, text);
      updateTextUI(index);
    });
    resetInputs();
  });

  //Append to library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  palette.appendChild(removePaletteBtn);

  libraryContainer.children[0].appendChild(palette);
}
function saveToLocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem("palettes") == null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }
  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function getLocal() {
  if (localStorage.getItem("palettes") === null) {
    let localPalettes = [];
  } else {
    const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
    // console.log(paletteObjects);
    paletteObjects.forEach((paletteObj) => {
      //generate palette for library
      const palette = document.createElement("div");
      palette.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = paletteObj.name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      paletteObj.colors.forEach((smallColor) => {
        const smallDiv = document.createElement("div");
        smallDiv.style.background = smallColor;
        preview.appendChild(smallDiv);
      });
      const paletteBtn = document.createElement("button");
      paletteBtn.classList.add("pick-palette-btn");
      paletteBtn.classList.add(paletteObj.no);
      paletteBtn.innerText = "Select";
      // remove button
      const removePaletteBtn = document.createElement("button");
      removePaletteBtn.classList.add("remove-palette-btn");
      removePaletteBtn.classList.add(paletteObj.no);
      removePaletteBtn.innerText = "Remove";
      //Attach event listner to the remove button
      removePaletteBtn.addEventListener("click", (e) => {
        e.target.parentElement.remove();
        //removing from local storage
        removeLocalObj(e);
      });

      //Attach event listner to the select button
      const smallColors = [];
      paletteBtn.addEventListener("click", (e) => {
        let smallColorsdivs = [...e.target.previousSibling.children];
        smallColorsdivs.forEach((smallColorDiv) => {
          smallColors.push(smallColorDiv.style.background);
        });

        //console.log(smallColorsArray);
        closeLibrary();
        initialColors = [];
        smallColors.forEach((color, index) => {
          initialColors.push(color);
          colorDivs[index].style.backgroundColor = color;
          const text = colorDivs[index].children[0];
          checkTextContrast(color, text);
          updateTextUI(index);
        });
        resetInputs();
      });

      //Append to library
      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      palette.appendChild(removePaletteBtn);
      libraryContainer.children[0].appendChild(palette);
    });
  }
}
function removeLocalObj(e) {
  const removeObjName = e.target.parentElement.firstElementChild.innerText;
  const paletteObjects = JSON.parse(localStorage.getItem("palettes"));
  paletteObjects.forEach((paletteObj, index) => {
    if (paletteObj.name == removeObjName) {
      paletteObjects.splice(index, 1);
    }
  });
  localStorage.clear();
  paletteObjects.forEach((paletteObj, index) => {
    saveToLocal(paletteObj);
  });
  console.log(paletteObjects);
}
getLocal();