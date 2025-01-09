// Get query string
const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
});
let channel_title = 'activity-efz52cmnw4o';

// Are.na's base API url
const api = 'https://api.are.na/v2/channels/';

// Get grid element from index.html
const thumbs_el = document.querySelector('#thumbs');

// Create loading indicator
const loadingEl = document.createElement('div');
loadingEl.id = 'loading';
loadingEl.style.position = 'fixed';
loadingEl.style.top = '50%';
loadingEl.style.left = '50%';
loadingEl.style.transform = 'translate(-50%, -50%)';
loadingEl.innerHTML = 'loading activity...';
document.body.appendChild(loadingEl);

let allImages = [];
let uniqueUrls = new Set();

// Function to fetch a page of contents
async function fetchPage(page = 1, per = 100) {
    try {
        const response = await fetch(`${api}${channel_title}/contents?page=${page}&per=${per}&direction=desc`, {
            method: 'GET',
            headers: { 'Cache-Control': 'no-cache' }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching page:', error);
        return null;
    }
}

// Add these new functions and variables
const PADDING = 50; // Minimum distance from edges
const FADE_DURATION = 2000; // 2 seconds fade in/out
const DISPLAY_DURATION = 8000; // 8 seconds display time

function getRandomPosition() {
    const maxWidth = window.innerWidth - (PADDING * 2) - 300;
    const maxHeight = window.innerHeight - (PADDING * 2) - 300;
    return {
        x: PADDING + Math.random() * maxWidth,
        y: PADDING + Math.random() * maxHeight
    };
}

// Add shuffle function to randomize image order
function shuffleArray(array) {
    let currentIndex = array.length;
    while (currentIndex > 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = 
        [array[randomIndex], array[currentIndex]];
    }
    return array;
}

let imageQueue = []; // Will hold our shuffled images

function showFloatingImage() {
    if (allImages.length === 0) return;

    // If queue is empty, reshuffle all images
    if (imageQueue.length === 0) {
        imageQueue = [...allImages];
        shuffleArray(imageQueue);
        console.log('Reshuffled image queue');
    }

    // Take the next image from the queue
    const nextImage = imageQueue.pop();
    const imageUrl = nextImage.image.display.url;
    const imageTitle = nextImage.title || 'Untitled';
    
    // Create link element
    const linkElement = document.createElement('a');
    linkElement.href = `https://www.are.na/block/${nextImage.id}`;
    linkElement.target = '_blank';
    linkElement.style.position = 'absolute';
    
    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imgElement.classList.add('floating-image');
    
    const pos = getRandomPosition();
    linkElement.style.left = `${pos.x}px`;
    linkElement.style.top = `${pos.y}px`;
    
    // Append image to link, then link to body
    linkElement.appendChild(imgElement);
    document.body.appendChild(linkElement);

    // Update caption
    const captionEl = document.querySelector('#caption');
    captionEl.textContent = imageTitle;
    captionEl.style.opacity = '0';

    // Fade in image and caption
    setTimeout(() => {
        imgElement.style.opacity = '1';
        captionEl.style.opacity = '1';
    }, 100);

    // Start fade out
    setTimeout(() => {
        imgElement.style.opacity = '0';
        captionEl.style.opacity = '0';
        // Remove element after fade out
        setTimeout(() => {
            linkElement.remove();  // Remove link element instead of image
        }, FADE_DURATION);
    }, DISPLAY_DURATION);

    // Queue next image
    setTimeout(showFloatingImage, 4000); // Start new image every 4 seconds
}

// Main function to fetch all contents
async function fetchAllContents() {
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
        const data = await fetchPage(page, 20);
        if (!data) break;
        
        data.contents.forEach(block => {
            if (block.class == 'Image' && !uniqueUrls.has(block.image.display.url)) {
                uniqueUrls.add(block.image.display.url);
                allImages.push(block);
            }
        });
        
        hasMore = data.contents.length === 20;
        page++;
    }
    
    // Hide loading element when done
    loadingEl.style.display = 'none';
    console.log(`Loaded ${allImages.length} unique images`);
    
    // Start the screensaver
    showFloatingImage();
}

// Start fetching contents
fetchAllContents();
