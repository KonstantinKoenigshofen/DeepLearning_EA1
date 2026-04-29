//
// MODELL
//
let classifier;
let modelLoaded = false;

async function loadModel() {
  classifier = await ml5.imageClassifier('MobileNet');
  modelLoaded = true;
  console.log("Modell geladen");

  classifyAllImages();
}

async function classifyUserImage() {
  if (!modelLoaded) {
    alert("Modell lädt...");
    return;
  }

  if (!preview.src) {
    alert("Bitte zuerst ein Bild hochladen!");
    return;
  }

  const results = await classifier.classify(preview);

  displayChart(results, "chartUser");
}

async function classifyImage(imgId, chartId) {
  const img = document.getElementById(imgId);

  if (!img) {
    console.error("Bild nicht gefunden:", imgId);
    return;
  }

  // warten falls Bild noch lädt
  if (!img.complete) {
    img.onload = async () => {
      const results = await classifier.classify(img);
      displayChart(results, chartId);
    };
  } else {
    const results = await classifier.classify(img);
    displayChart(results, chartId);
  }
}

function classifyAllImages() {
  classifyImage("Papagei", "chartPapagei");
  classifyImage("Pizza", "chartPizza");
  classifyImage("Zug", "chartZug");
  classifyImage("Heckenbraunelle", "chartHeckenbraunelle");
  classifyImage("Löwenzahn", "chartLöwenzahn");
  classifyImage("Hausratte", "chartHausratte");
}

function displayChart(results, chartId) {
  const canvas = document.getElementById(chartId);

  if (!canvas) {
    console.error("Canvas nicht gefunden:", chartId);
    return;
  }

  const ctx = canvas.getContext("2d");

  const labels = results.map(r => r.label);
  const data = results.map(r => (r.confidence * 100).toFixed(2));

  // alten Chart zerstören
  if (canvas.chart) {
    canvas.chart.destroy();
  }

  canvas.chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Confidence (%)',
        data: data
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          max: 100
        },
        x: {
          ticks: {
            // Verhinder, dass die Namen schräg dargestellt werden
            maxRotation: 0,
            minRotation: 0,
            // Labels kürzen
            callback: function(value, index) {
              const label = labels[index];
              const maxLength = 12;
              return label.length > maxLength
                ? label.substring(0, maxLength) + '...'
                : label;
            }
          }
        }
      },
      // Anzeigen aller Namen im Tooltip
      plugins: {
        tooltip: {
          callbacks: {
            title: function(tooltipItems) {
              return labels[tooltipItems[0].dataIndex];
            }
          }
        }
      }
    }
  });
}





//
// DRAGNDROP
//
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("upload");
const preview = document.getElementById("preview");

// Klick auf Dropzone → öffnet Datei-Auswahl
dropzone.addEventListener("click", () => fileInput.click());

// Datei ausgewählt
fileInput.addEventListener("change", handleFile);

// Drag over
dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("dragover");
});

// Drag leave
dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("dragover");
});

// Drop
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("dragover");

  const file = e.dataTransfer.files[0];
  displayImage(file);
});

function handleFile(e) {
  const file = e.target.files[0];
  displayImage(file);
}

// Bild anzeigen
function displayImage(file) {
  if (!["image/png", "image/jpeg"].includes(file.type)) {
    alert("Bitte nur PNG oder JPG hochladen!");
    return;
  }

  const reader = new FileReader();

  reader.onload = (event) => {
    preview.src = event.target.result;

    // Warten bis Bild geladen ist
    preview.onload = () => {
      classifyUserImage();
    };
  };

  reader.readAsDataURL(file);
}



// Modell einmal beim Start der Seite laden
loadModel();