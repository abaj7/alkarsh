import { createClient } from '@supabase/supabase-js';
import "./style.css";

// Create a single Supabase client
const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL, 
    import.meta.env.VITE_SUPABASE_KEY
);

// Function to fetch images and render them
async function fetchImages() {
    try {
        const { data, error } = await supabase.storage.from("image-uploads").list("img");

        if (error) throw error;
        if (!data) return console.log("No images found.");

        // Default sort by newest
        let sortedData = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        // Set the select dropdown to "new"
        document.getElementById("sort").value = "new";

        // Select element for sorting
        document.getElementById("sort").addEventListener("change", function () {
            const selectValue = this.value;
            sortedData.sort((a, b) => 
                selectValue === "new"
                    ? new Date(b.created_at) - new Date(a.created_at)
                    : new Date(a.created_at) - new Date(b.created_at)
            );
            renderImages(sortedData);
        });

        // Initial render
        renderImages(sortedData);
    } catch (error) {
        console.error("Error fetching images:", error);
    }
}

// Function to render images
function renderImages(imageData) {
    const imageList = document.getElementById("img-card");
    imageList.innerHTML = "";

    imageData.forEach(value => {
        let imgUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/image-uploads/img/${value.name}`;

        // Create elements properly
        const div = document.createElement("div");
        div.className = "bg-gray-700 rounded-lg shadow p-2 overflow-hidden hover:shadow-xl transition-shadow duration-300";

        const imgLink = document.createElement("a");
        imgLink.href = imgUrl;
        imgLink.target = "_blank";
        imgLink.rel = "noopener noreferrer";

        const img = document.createElement("img");
        img.src = imgUrl;
        img.alt = "تم تعبئة الكرش بنجاح";
        img.className = "w-full h-48 object-contain rounded";

        imgLink.appendChild(img);

        const textDiv = document.createElement("div");
        textDiv.className = "text-center mt-2 py-3";

        const link = document.createElement("a");
        link.href = "#";
        link.className = "bg-gradient-to-l from-emerald-400 to-cyan-400 text-gray-800 px-4 py-2 rounded hover:from-emerald-500 hover:to-cyan-500";
        link.innerText = "تحميل";

        link.onclick = (event) => {
            event.preventDefault();
            downloadImage(imgUrl, value.name);
        };

        textDiv.appendChild(link);
        div.appendChild(imgLink);
        div.appendChild(textDiv);
        imageList.appendChild(div);
    });
}

// Function to download image
async function downloadImage(imgUrl, fileName) {
    try {
        const response = await fetch(imgUrl);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = objectUrl;
        link.download = fileName || "image.jpg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(objectUrl);
    } catch (error) {
        console.error("Download failed:", error);
    }
}

// Fetch images on page load
fetchImages();
