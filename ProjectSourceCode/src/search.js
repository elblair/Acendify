const userCardTemplate = document.querySelector("[data-user-template]");
const userCardContainer = document.querySelector("[data-user-cards-container]");
const searchInput = document.querySelector("[data-search]");

let users = [];

searchInput.addEventListener("input", e =>{
    const value = e.target.value.toLowerCase()
    users.forEach(user =>{
        const isVisible = 
            user.name.toLowerCase().includes(value) || 
            user.email.toLowerCase().includes(value)
        user.element.classList.toggle("hide", !isVisible)
    })
});

fetch("https://jsonplaceholder.typicode.com")
.then(res => res.json())
.then(data =>{
    users = data.map(user => {
        const card = userCardTemplate.content.cloneNode(true).children[0];
        const header = card.querySelector("[data-header]");
        const body = card.querySelector("[data-body]");
        header.textContent = user.name;
        body.textContent = user.email;
        userCardContainer.append(card);
        console.log(user);
        return {name: user.name, email: user.email, element: card};
    });
})

// async function searchUsers(searchTerm) {
//     try {
//       // Fetch from API with the search term
//       const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchTerm)}`);
      
//       if (!response.ok) {
//         throw new Error(`HTTP error ${response.status}`);
//       }
      
//       const results = await response.json();
//       return results;
//     } catch (error) {
//       console.error('Error searching users:', error);
//       return [];
//     }
//   }
  
//   const searchInput = document.getElementById('searchInput');
//   const searchResults = document.getElementById('searchResults');
  
//   function renderResults(results) {
//     searchResults.innerHTML = ''; // Clear previous results
  
//     // Check if results is empty
//     if (results.length === 0) {
//       const noResultsMessage = document.createElement('p');
//       noResultsMessage.textContent = 'No results found.';
//       searchResults.appendChild(noResultsMessage);
//       return;
//     }
  
//     // Check if we have an exact match (could be a full profile)
//     const exactMatch = results.find(result => 
//       result.username.toLowerCase() === searchTerm.toLowerCase()
//     );
  
//     if (exactMatch) {
//       // Render full profile for exact match
//       renderFullProfile(exactMatch);
//     } else {
//       // Render search results list
//       results.forEach(result => {
//         const resultItem = document.createElement('div');
//         resultItem.classList.add('search-result');
        
//         resultItem.innerHTML = `
//           <h3>${result.username}</h3>
//           <p>Email: ${result.email}</p>
//           <button onclick="viewProfile(${result.id})">View Profile</button>
//         `;
        
//         searchResults.appendChild(resultItem);
//       });
//     }
//   }
  
//   function renderFullProfile(profile) {
//     searchResults.innerHTML = `
//       <div class="full-profile">
//         <h2>${profile.username}'s Profile</h2>
//         <p>Full Name: ${profile.fullName}</p>
//         <p>Email: ${profile.email}</p>
//         <p>Join Date: ${profile.createdAt}</p>
//         <!-- Add more profile details as needed -->
//       </div>
//     `;
//   }
  
//   function viewProfile(userId) {
//     // Navigate to full profile page or load profile details
//     window.location.href = `/profile/${userId}`;
//   }
  
//   searchInput.addEventListener('input', async () => {
//     const searchTerm = searchInput.value.trim();
    
//     // Only search if there's a meaningful search term
//     if (searchTerm.length > 2) {
//       const results = await searchUsers(searchTerm);
//       renderResults(results);
//     } else {
//       searchResults.innerHTML = ''; // Clear results for short searches
//     }
//   });

//   const testSearchScenarios = async () => {
//     const scenarios = [
//       '',             // Empty string
//       'a',            // Too short
//       'john',         // Partial username
//       'johndoe',      // Full username
//       'john@',        // Partial email
//       '@example.com', // Email domain
//       'Doe'           // Partial full name
//     ];
  
//     for (let query of scenarios) {
//       console.log(`Testing search query: "${query}"`);
//       const results = await User.findAll({
//         where: {
//           [Op.or]: [
//             { username: { [Op.iLike]: `%${query}%` } },
//             { email: { [Op.iLike]: `%${query}%` } },
//             { fullName: { [Op.iLike]: `%${query}%` } }
//           ]
//         },
//         limit: 10
//       });
  
//       console.log(`Results for "${query}":`, results.length);
//     }
//   };
  
//   // Call this function to run comprehensive tests
//   testSearchScenarios();

//   // In your seeds or setup script
// async function createTestUsers() {
//     await User.bulkCreate([
//       { 
//         username: 'johndoe', 
//         email: 'john@example.com', 
//         fullName: 'John Doe' 
//       },
//       { 
//         username: 'janedoe', 
//         email: 'jane@example.com', 
//         fullName: 'Jane Doe' 
//       },
//       // Add more test users
//     ]);
//   }