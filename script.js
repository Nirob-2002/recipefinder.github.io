let allMeals = [];
let currentPage = 1;
let perPage = 6;
// Favorite data will now save the entire Meal object
let favoriteMeals = JSON.parse(localStorage.getItem("fav")) || [];

// Recipe Search
function searchRecipe() {
    const q = document.getElementById("searchInput").value.trim();
    if (q === "") {
        document.getElementById("result").innerHTML = "<p style='text-align:center;'>Please enter a meal name to search.</p>";
        allMeals = [];
        renderPagination();
        return;
    }
    
    // Search recipe using The MealDB API
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${q}`)
        .then(r => r.json())
        .then(d => {
            allMeals = d.meals || [];
            currentPage = 1;
            renderPage();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            document.getElementById("result").innerHTML = "<p style='text-align:center; color:red;'>Failed to load data.</p>";
        });
}

// Function to extract ingredients and measures
function getIngredients(meal) {
    let list = '';
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== '') {
            list += `<li>${measure} - ${ingredient}</li>`;
        }
    }
    return list;
}

// Default search on page load and adding instant search listener
window.onload = function() {
    const searchInput = document.getElementById("searchInput");
    searchInput.value = 'chicken'; // Default search query: 'chicken'
    searchRecipe();
    loadFavorites();
    
    // Instant Search functionality
    searchInput.addEventListener('input', () => {
        // Debouncing can be added here for performance, but for simplicity, we call searchRecipe directly.
        searchRecipe();
    });
};

// Render current page recipes
function renderPage() {
    const start = (currentPage - 1) * perPage;
    const pageMeals = allMeals.slice(start, start + perPage);
    let out = "";
    
    if (pageMeals.length === 0) {
        out = "<p style='text-align:center;'>No recipes found matching your search.</p>";
    } else {
        pageMeals.forEach(m => {
            // Saving the entire Meal object data as a data-attribute
            const mealData = JSON.stringify(m).replace(/"/g, '&quot;');
            out += `<div class='card' data-meal='${mealData}'>
                <img src='${m.strMealThumb}' alt='${m.strMeal}'>
                <div class='card-content'>
                    <h3>${m.strMeal}</h3>
                    <button class='details-btn' onclick='showPopupFromElement(this)'>Details</button>
                    <button class='fav-btn' onclick='addFav(this)'>❤️ Favorite</button>
                </div>
            </div>`;
        });
    }

    document.getElementById("result").innerHTML = out;
    renderPagination();
}

// Create pagination buttons
function renderPagination() {
    const totalPages = Math.ceil(allMeals.length / perPage);
    let p = "";
    for (let i = 1; i <= totalPages; i++) {
        p += `<button onclick='gotoPage(${i})' ${i === currentPage ? 'style="background-color:#ff6f61;"' : ''}>${i}</button>`;
    }
    document.getElementById("pagination").innerHTML = p;
}

// Change page
function gotoPage(n) {
    currentPage = n;
    renderPage();
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to the top after moving to a new page
}

// Function to build and show the popup content
function showPopup(meal) {
    const ingredientsHtml = getIngredients(meal);

    document.getElementById("popup-body").innerHTML =
        `<h2>${meal.strMeal}</h2>
         <img src='${meal.strMealThumb}' alt='${meal.strMeal} image'>
         <p><b>Category:</b> ${meal.strCategory}</p>
         <p><b>Area:</b> ${meal.strArea}</p>
         
         <h3>Ingredients:</h3>
         <ul class="ingredients-list">${ingredientsHtml}</ul>

         <h3>Instructions:</h3>
         <p>${meal.strInstructions}</p>
         <a href="${meal.strYoutube}" target="_blank" style="display:${meal.strYoutube ? 'block' : 'none'}; margin-top:15px; color:#ff6f61;">Watch on YouTube 🎥</a>
        `;
    document.getElementById("popup").style.display = "block";
}

// Show popup from search/fav card element
function showPopupFromElement(element) {
    const card = element.closest('.card');
    const mealDataString = card.getAttribute('data-meal');
    const m = JSON.parse(mealDataString.replace(/&quot;/g, '"')); // Decode and parse
    showPopup(m);
}

// Close popup
function closePopup() {
    document.getElementById("popup").style.display = "none";
}

// Add to favorites
function addFav(button) {
    const card = button.closest('.card');
    const mealDataString = card.getAttribute('data-meal');
    const meal = JSON.parse(mealDataString.replace(/&quot;/g, '"')); // Decode and parse
    
    // Check for duplicate
    if (!favoriteMeals.some(fav => fav.idMeal === meal.idMeal)) {
        favoriteMeals.push(meal);
        localStorage.setItem("fav", JSON.stringify(favoriteMeals));
        alert(`${meal.strMeal} has been added to your favorites!`);
        loadFavorites();
    } else {
        alert(`${meal.strMeal} is already in your favorites!`);
    }
}

// Load and display favorites
function loadFavorites() {
    favoriteMeals = JSON.parse(localStorage.getItem("fav")) || [];
    let out = "";
    
    if (favoriteMeals.length === 0) {
        out = "<p class='no-fav-msg' style='text-align:center;'>Your favorite recipes will appear here.</p>";
    } else {
        favoriteMeals.forEach(m => {
            // Entire Meal object data saved as a data-attribute for favorites details
            const mealData = JSON.stringify(m).replace(/"/g, '&quot;');
            out += `<div class='card fav-card' data-meal='${mealData}'>
                <img src='${m.strMealThumb}' alt='${m.strMeal}' style='height: 100px;'>
                <div class='card-content'>
                    <h3 style='font-size: 1em;'>${m.strMeal}</h3>
                    <button class='details-btn' onclick='showPopupFromElement(this)' style='padding:5px 10px;'>Details</button>
                    <button class='fav-btn' onclick='removeFav(${m.idMeal})' style='background: #333; padding:5px 10px;'>🗑️</button>
                </div>
            </div>`;
        });
    }

    document.getElementById("favorites").innerHTML = out;
}

// Remove recipe from favorites
function removeFav(id) {
    favoriteMeals = favoriteMeals.filter(meal => meal.idMeal != id);
    localStorage.setItem("fav", JSON.stringify(favoriteMeals));
    alert("Recipe removed from favorites.");
    loadFavorites();
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle("dark");
}