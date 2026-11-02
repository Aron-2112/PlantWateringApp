(function () {
  "use strict";

  const STORAGE_KEY = "sproutPlants";
  const storage = {
    get: function (key, fallback) {
      try {
        const saved = localStorage.getItem(key);
        return saved === null ? fallback : JSON.parse(saved);
      } catch (error) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        // The garden still works for this visit if browser storage is unavailable.
      }
    }
  };

  function dateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
  }

  function shiftDate(value, days) {
    const date = new Date(value + "T12:00:00");
    date.setDate(date.getDate() + days);
    return dateString(date);
  }

  const today = dateString(new Date());
  const starterPlants = STARTER_PLANTS.map(function (plant) {
    return {
      id: plant.id,
      name: plant.name,
      typeId: plant.typeId,
      interval: plant.interval,
      location: plant.location,
      lastWatered: shiftDate(today, plant.lastWateredOffset)
    };
  });
  const savedPlants = storage.get(STORAGE_KEY, null);
  let plants = Array.isArray(savedPlants) ? savedPlants : starterPlants;

  const plantGrid = document.getElementById("plant-grid");
  const dueList = document.getElementById("due-list");
  const plantFilter = document.getElementById("plant-filter");
  const plantType = document.getElementById("plant-type");
  const plantForm = document.getElementById("plant-form");
  const customWrap = document.getElementById("custom-species-wrap");
  const customSpecies = document.getElementById("custom-species");
  const carePreview = document.getElementById("care-preview");
  const intervalInput = document.getElementById("watering-interval");

  document.getElementById("today-label").textContent = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(new Date());

  function getType(plant) {
    return PLANT_TYPES.find(function (type) { return type.id === plant.typeId; });
  }

  function typeName(plant) {
    const type = getType(plant);
    return type ? type.name : (plant.customSpecies || "Other plant");
  }

  function nextWatering(plant) {
    return shiftDate(plant.lastWatered, Number(plant.interval));
  }

  function daysUntil(date) {
    const target = new Date(date + "T12:00:00");
    const current = new Date(today + "T12:00:00");
    return Math.round((target - current) / 86400000);
  }

  function dueLabel(days) {
    if (days < 0) return "Overdue by " + Math.abs(days) + (Math.abs(days) === 1 ? " day" : " days");
    if (days === 0) return "Due today";
    if (days === 1) return "Due tomorrow";
    return "Due in " + days + " days";
  }

  function savePlants() {
    storage.set(STORAGE_KEY, plants);
  }

  function makeTask(plant) {
    const days = daysUntil(nextWatering(plant));
    const row = document.createElement("article");
    row.className = "task-row";

    const marker = document.createElement("span");
    marker.className = "task-marker";
    marker.setAttribute("aria-hidden", "true");

    const details = document.createElement("div");
    details.className = "task-details";
    const name = document.createElement("h3");
    name.textContent = plant.name;
    const meta = document.createElement("p");
    meta.textContent = typeName(plant) + (plant.location ? " · " + plant.location : "");
    details.append(name, meta);

    const status = document.createElement("span");
    status.className = "due-status" + (days < 0 ? " overdue" : "");
    status.textContent = dueLabel(days);

    const button = document.createElement("button");
    button.type = "button";
    button.className = "button water-button";
    button.textContent = "Watered";
    button.setAttribute("aria-label", "Mark " + plant.name + " as watered today");
    button.addEventListener("click", function () {
      plant.lastWatered = today;
      savePlants();
      render();
    });

    row.append(marker, details, status, button);
    return row;
  }

  function makePlantCard(plant) {
    const type = getType(plant);
    const days = daysUntil(nextWatering(plant));
    const card = document.createElement("article");
    card.className = "plant-card";

    const top = document.createElement("div");
    top.className = "plant-card-top";
    const marker = document.createElement("span");
    marker.className = "plant-marker";
    marker.setAttribute("aria-hidden", "true");
    const status = document.createElement("span");
    status.className = "plant-status" + (days <= 0 ? " status-due" : "");
    status.textContent = dueLabel(days);
    top.append(marker, status);

    const title = document.createElement("h3");
    title.textContent = plant.name;
    const meta = document.createElement("p");
    meta.className = "plant-meta";
    meta.textContent = typeName(plant) + (plant.location ? " · " + plant.location : "");

    const interval = document.createElement("p");
    interval.className = "interval-summary";
    interval.textContent = "Water every " + plant.interval + " days";

    const tip = document.createElement("p");
    tip.className = "plant-tip";
    tip.textContent = type ? type.tip : "Check the soil before watering and adjust to your plant's needs.";

    const care = document.createElement("details");
    care.className = "care-editor";
    const summary = document.createElement("summary");
    summary.textContent = "Adjust schedule";
    const form = document.createElement("form");
    form.className = "inline-form";
    const label = document.createElement("label");
    const inputId = "interval-" + plant.id;
    label.setAttribute("for", inputId);
    label.textContent = "Water every";
    const input = document.createElement("input");
    input.id = inputId;
    input.type = "number";
    input.min = "1";
    input.max = "60";
    input.value = plant.interval;
    input.required = true;
    const daysLabel = document.createElement("span");
    daysLabel.textContent = "days";
    const saveButton = document.createElement("button");
    saveButton.type = "submit";
    saveButton.className = "text-button";
    saveButton.textContent = "Save";
    form.append(label, input, daysLabel, saveButton);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      plant.interval = Number(input.value);
      savePlants();
      render();
    });
    care.append(summary, form);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "remove-button";
    remove.textContent = "Remove plant";
    remove.addEventListener("click", function () {
      plants = plants.filter(function (item) { return item.id !== plant.id; });
      savePlants();
      render();
    });

    card.append(top, title, meta, interval, tip, care, remove);
    return card;
  }

  function populateOptions() {
    PLANT_TYPES.forEach(function (type) {
      const option = document.createElement("option");
      option.value = type.id;
      option.textContent = type.name;
      plantType.appendChild(option);
    });
    const customOption = document.createElement("option");
    customOption.value = "custom";
    customOption.textContent = "Something else";
    plantType.appendChild(customOption);

    PLANT_TYPES.forEach(function (type) {
      const option = document.createElement("option");
      option.value = type.id;
      option.textContent = type.name;
      plantFilter.appendChild(option);
    });
    const customFilter = document.createElement("option");
    customFilter.value = "custom";
    customFilter.textContent = "Custom plants";
    plantFilter.appendChild(customFilter);
  }

  function updateCarePreview() {
    const selected = plantType.value;
    customWrap.hidden = selected !== "custom";
    customSpecies.required = selected === "custom";
    const type = PLANT_TYPES.find(function (item) { return item.id === selected; });
    if (type) {
      intervalInput.value = type.days;
      carePreview.replaceChildren();
      const mark = document.createElement("span");
      mark.className = "care-preview-mark";
      mark.setAttribute("aria-hidden", "true");
      const copy = document.createElement("p");
      copy.textContent = type.light + ". " + type.tip;
      carePreview.append(mark, copy);
    } else if (selected === "custom") {
      intervalInput.value = "7";
      carePreview.replaceChildren();
      const mark = document.createElement("span");
      mark.className = "care-preview-mark";
      mark.setAttribute("aria-hidden", "true");
      const copy = document.createElement("p");
      copy.textContent = "Start with a weekly reminder and adjust after checking the soil.";
      carePreview.append(mark, copy);
    } else {
      carePreview.textContent = "Choose a plant type to see its starting care notes.";
    }
  }

  function render() {
    const duePlants = plants.filter(function (plant) {
      return daysUntil(nextWatering(plant)) <= 0;
    });
    document.getElementById("due-count").textContent = duePlants.length;
    document.getElementById("plant-count").textContent = plants.length;
    dueList.replaceChildren.apply(dueList, duePlants.map(makeTask));
    document.getElementById("due-empty").hidden = duePlants.length > 0;

    const filter = plantFilter.value;
    const visiblePlants = plants.filter(function (plant) {
      return filter === "all" || plant.typeId === filter;
    });
    plantGrid.replaceChildren.apply(plantGrid, visiblePlants.map(makePlantCard));
    document.getElementById("garden-empty").hidden = plants.length > 0;
    plantGrid.hidden = plants.length === 0;
  }

  function showView() {
    const requested = (window.location.hash || "#garden").slice(1);
    const current = requested === "add-plant" ? "add-plant" : "garden";
    document.querySelectorAll("[data-view]").forEach(function (view) {
      view.hidden = view.id !== current;
    });
    document.querySelectorAll("nav a").forEach(function (link) {
      if (link.getAttribute("href") === "#" + current) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
    window.scrollTo(0, 0);
  }

  plantType.addEventListener("change", updateCarePreview);
  plantFilter.addEventListener("change", render);
  window.addEventListener("hashchange", showView);
  plantForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(plantForm);
    const typeId = formData.get("type");
    plants.unshift({
      id: "plant-" + Date.now(),
      name: formData.get("name").trim(),
      typeId: typeId === "custom" ? "custom" : typeId,
      customSpecies: typeId === "custom" ? formData.get("customSpecies").trim() : "",
      interval: Number(formData.get("interval")),
      location: formData.get("location").trim(),
      lastWatered: today
    });
    savePlants();
    plantForm.reset();
    customWrap.hidden = true;
    customSpecies.required = false;
    intervalInput.value = "7";
    carePreview.textContent = "Choose a plant type to see its starting care notes.";
    plantFilter.value = "all";
    render();
    window.location.hash = "#garden";
  });

  populateOptions();
  render();
  showView();
})();