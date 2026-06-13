const categories = [
  { key: "wildlife", label: "Wildlife" },
  { key: "city", label: "City" },
  { key: "product", label: "Product" },
  { key: "portrait", label: "Portrait" },
];
const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];
const localFallbackPhotos = [
  { category: "wildlife", label: "Wildlife", src: "assets/photos/wildlife/IMG_7302.jpg", title: "IMG 7302" },
  { category: "wildlife", label: "Wildlife", src: "assets/photos/wildlife/IMG_7303.jpg", title: "IMG 7303" },
  { category: "wildlife", label: "Wildlife", src: "assets/photos/wildlife/IMG_7503%20COPY_EXTENSION.JPG", title: "IMG 7503 Copy Extension" },
  { category: "wildlife", label: "Wildlife", src: "assets/photos/wildlife/IMG_9496%20copy.JPG", title: "IMG 9496 Copy" },
  { category: "city", label: "City", src: "assets/photos/city/city-01.jpg", title: "City 01" },
  { category: "city", label: "City", src: "assets/photos/city/city-02.jpg", title: "City 02" },
  { category: "city", label: "City", src: "assets/photos/city/IMG_8381-2.jpg", title: "IMG 8381 2" },
  { category: "city", label: "City", src: "assets/photos/city/IMG_8393-2.jpg", title: "IMG 8393 2" },
  { category: "product", label: "Product", src: "assets/photos/product/9b976ad3-f166-417e-9869-d515a1e8250c.jpg", title: "Product 01" },
  { category: "product", label: "Product", src: "assets/photos/product/d04c4890-bd12-4a2b-856b-fcc73724b2aa.jpg", title: "Product 02" },
  { category: "product", label: "Product", src: "assets/photos/product/e30630e3-0221-4481-98db-b309155cad64.jpg", title: "Product 03" },
  { category: "portrait", label: "Portrait", src: "assets/photos/portrait/IMG_8614.jpg", title: "IMG 8614" },
  { category: "portrait", label: "Portrait", src: "assets/photos/portrait/IMG_8627.jpg", title: "IMG 8627" },
];
const filterButtons = document.querySelectorAll(".filter-button");
const galleryGrid = document.querySelector("[data-gallery-grid]");
const galleryStatus = document.querySelector("[data-gallery-status]");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector("p");
const lightboxClose = document.querySelector(".lightbox-close");

const getTitleFromFilename = (filename) =>
  filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const isImageFile = (filename) =>
  imageExtensions.some((extension) => filename.toLowerCase().endsWith(extension));

const getGithubRepo = () => {
  const { hostname, pathname } = window.location;

  if (!hostname.endsWith("github.io")) {
    return null;
  }

  const owner = hostname.replace(".github.io", "");
  const repoFromPath = pathname.split("/").filter(Boolean)[0];
  const repo = repoFromPath || `${owner}.github.io`;

  return { owner, repo };
};

const loadGithubFolder = async (category) => {
  const repo = getGithubRepo();

  if (!repo) {
    return [];
  }

  const apiUrl = `https://api.github.com/repos/${repo.owner}/${repo.repo}/contents/assets/photos/${category.key}`;
  const response = await fetch(apiUrl);

  if (!response.ok) {
    return [];
  }

  const files = await response.json();

  return files
    .filter((file) => file.type === "file" && isImageFile(file.name))
    .map((file) => ({
      category: category.key,
      label: category.label,
      src: `assets/photos/${category.key}/${encodeURIComponent(file.name)}`,
      title: getTitleFromFilename(file.name),
    }));
};

const loadLocalFolder = async (category) => {
  const folderUrl = `assets/photos/${category.key}/`;
  const response = await fetch(folderUrl);

  if (!response.ok) {
    return [];
  }

  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");

  return [...doc.querySelectorAll("a")]
    .map((link) => new URL(link.getAttribute("href"), new URL(folderUrl, window.location.href)))
    .filter((url) => isImageFile(decodeURIComponent(url.pathname)))
    .map((url) => {
      const filename = decodeURIComponent(url.pathname.split("/").pop());

      return {
        category: category.key,
        label: category.label,
        src: url.href,
        title: getTitleFromFilename(filename),
      };
    });
};

const createPhotoCard = (photo, index) => {
  const card = document.createElement("button");
  card.className = "photo-card";
  card.type = "button";
  card.dataset.category = photo.category;
  card.dataset.title = photo.title;
  card.dataset.src = photo.src;

  if (index % 5 === 0) {
    card.classList.add("tall");
  } else if (index % 3 === 0) {
    card.classList.add("wide");
  }

  const image = document.createElement("img");
  image.src = photo.src;
  image.alt = `${photo.label} photo: ${photo.title}`;
  image.loading = "lazy";
  image.addEventListener("error", () => {
    console.warn(`Could not load image: ${photo.src}`);
  });

  const label = document.createElement("span");
  label.textContent = photo.label;

  card.append(image, label);
  card.addEventListener("click", () => openLightbox(photo));

  return card;
};

const renderGallery = (photos) => {
  galleryGrid.replaceChildren();
  photos.forEach((photo, index) => galleryGrid.append(createPhotoCard(photo, index)));

  if (photos.length === 0) {
    galleryStatus.textContent = "Add photos inside assets/photos/city, wildlife, product, or portrait.";
    return;
  }

  galleryStatus.textContent = "";
};

const loadPhotos = async () => {
  try {
    const folderLoader = getGithubRepo() ? loadGithubFolder : loadLocalFolder;
    const groupedPhotos = await Promise.all(categories.map(folderLoader));
    const folderPhotos = groupedPhotos.flat();
    renderGallery(folderPhotos.length > 0 ? folderPhotos : localFallbackPhotos);
  } catch {
    renderGallery(localFallbackPhotos);
  }
};

const getCurrentFilter = () => document.querySelector(".filter-button.active")?.dataset.filter || "all";

const applyFilter = (filter) => {
  document.querySelectorAll(".photo-card").forEach((card) => {
    const shouldShow = filter === "all" || card.dataset.category === filter;
    card.classList.toggle("hidden", !shouldShow);
  });
};

const openLightbox = (photo) => {
  lightboxImage.src = photo.src;
  lightboxImage.alt = photo.title;
  lightboxCaption.textContent = photo.title;
  lightbox.hidden = false;
  lightboxClose.focus();
};

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    applyFilter(filter);
  });
});

const closeLightbox = () => {
  lightbox.hidden = true;
  lightboxImage.src = "";
};

lightboxClose.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !lightbox.hidden) {
    closeLightbox();
  }
});

loadPhotos().then(() => applyFilter(getCurrentFilter()));
