const themeToggle = document.querySelector(".theme-toggle")
const promptInput = document.querySelector(".prompt-input")
const promptForm = document.querySelector(".prompt-form")
const promptBtn = document.querySelector(".prompt-btn")
const gridGallery = document.querySelector(".gallery-grid")
const modelSelect = document.getElementById("model-select")
const countSelect = document.getElementById("count-select")
const ratioSelect = document.getElementById("ratio-select")

// const API_KEY = "";

const examplePrompts =[
    "A magic forest with glowing plants and fairy homes among gaint mushrooms",
    "A vast fantasy landscape at sunset with floating islands, waterfalls cascading from the sky, and a glowing crystal tower in the distance, in the style of a high-fantasy painting.",
    "A bustling cyberpunk city at night, filled with neon lights, flying cars, rainy streets, and people wearing futuristic outfits, inspired by Blade Runner.",
    "An ancient Roman marketplace during the day, with merchants, togas, marble columns, and people bartering goods, illustrated in a realistic historical style.",
    "A post-apocalyptic desert wasteland with abandoned vehicles, makeshift shelters, and a lone wanderer wearing a gas mask, under an orange sky.",
    "A cartoon-style baby elephant wearing glasses and a tiny backpack, standing in front of a jungle school with colorful flowers around.",
    "A cluttered steampunk inventor’s workshop filled with brass gears, steam-powered machines, and an old scientist with goggles sketching blueprints.",
    "A team of astronauts exploring a vibrant alien planet with strange glowing plants, floating rocks, and two suns in the sky, in ultra-realistic 3D render style.",
    "A group of stylish young adults posing on a city street corner, dressed in trendy modern urban fashion, with graffiti walls and a food truck behind them.",

]


// light and dark mode
const toggleTheme =()=>{
 const isDarkTheme = document.body.classList.toggle("dark-theme");
 localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
 themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
}


const getImageDimensions = (aspectRatio, baseSize = 512) => {
    const [width, height] =aspectRatio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(width * height);

    let calculateWidth = Math.round(width * scaleFactor);
    let calculateHeight = Math.round(height * scaleFactor);

       // ensure dimensions are multiplies of 16 AI model requirement
    calculateWidth = Math.floor(calculateWidth / 16) * 16;
    calculateHeight = Math.floor(calculateHeight / 16) * 16;

    return { width: calculateWidth, height: calculateHeight};
}

const updateImageCard = (imgIndex, imgUrl) => {
    const imgCard = document.getElementById(`img-card-${imgIndex}`);
    if(!imgCard) returrn;

    imgCard.classList.remove("loading");
    imgCard.innerHTML =`<img src="${imgUrl}"  class="result-img" alt="test" >
                 <div class="img-overlay">
                    <a href="${imgUrl}" class="img-download-btn" download="${Date.now()}.png">
                        <i class="fa-solid fa-download"></i>
                    </a>
                 </div>`;
}

//request to hugging face for the API to create image
const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
  const MODEL_URL =`https://router.huggingface.co/hf-inference/models/${selectedModel}`;
  const {width, height} = getImageDimensions(aspectRatio);

  const imagePromises = Array.from({length: imageCount}, async(_, i) =>{

    try{
     const response = await fetch(MODEL_URL,{
      headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "x-use-cache": "false",
      },
      method: "POST",
      body: JSON.stringify({
          inputs: promptText,
          parameters: {width, height},
      }),
     });
    
    if(!response.ok) throw new Error((await response.json())?.error);


    // convert response into an image url and update image card
     const result = await response.blob();
    console.log(result);
    updateImageCard(i, URL.createObjectURL(result));
    } catch(error){
      console.log(error);
    }
}) 

await Promise.allSettled(imagePromises);
}; 



const CreateImageCards = (selectedModel, imageCount, aspectRatio, promptText) =>{
    gridGallery.innerHTML = "";

    for(let i = 0; i< imageCount; i++){
     gridGallery.innerHTML += `<div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}">
                <div class="status-container">
                    <div class="spinner"></div>
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p class="status-text">Generating...</p>
                </div>
            </div>`

    }
    generateImages(selectedModel, imageCount, aspectRatio, promptText);
};


const handleFormSubmit = (e) =>{
  e.preventDefault();

  const selectedModel = modelSelect.value;
  const imageCount = parseInt(countSelect.value) || 1;
  const aspectRatio = ratioSelect.value || "1/1";
  const promptText = promptInput.value.trim();

  CreateImageCards( selectedModel, imageCount, aspectRatio, promptText);
}

//for taking prompt
promptBtn.addEventListener("click", ()=>{
    const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value = prompt;
    promptInput.focus();
    // promptForm.dispatchEvent(new Event('submit'));
});

promptForm.addEventListener("submit", handleFormSubmit);


themeToggle.addEventListener("click", toggleTheme);
