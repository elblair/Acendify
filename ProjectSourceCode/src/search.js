async function fetchUsers() {
    const response = await fetch('/api/users'); //need to update with actual API
    const users = await response.json();
    return users;
}

const searchInput = document.getElementById('searchInput');
const userList = document.getElementById('userList');

function renderUsers(filteredUsers) {
userList.innerHTML = '';
users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user.username;
    userList.appendChild(li);
});
}

searchInput.addEventListener('input', async () => {
    const searchTerm = searchInput.value.toLowerCase();
    const users = await fetchUsers();
    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm)
);
renderUsers(filteredUsers);
});

// Fetch and render the initial user list
(async () => {
    const users = await fetchUsers();
    renderUsers(users);
})();
