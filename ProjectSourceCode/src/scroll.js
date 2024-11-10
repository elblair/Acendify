function loadMoreContent() {
    fetch('/path-to-more-content')  // Request to the server to load more content
        .then(response => response.text())  // Expecting the HTML returned by the server
        .then(html => {
            // Append the returned HTML to the scrollable content container
            document.getElementById('scrollable-content').innerHTML += html;
        })
        .catch(error => console.error('Error loading more content:', error));
}

// Detect scroll event
window.addEventListener('scroll', function() {
    var scrollableContent = document.getElementById('scrollable-content');
    var hasReachedBottom = scrollableContent.getBoundingClientRect().bottom <= window.innerHeight;

    if (hasReachedBottom) {
        loadMoreContent();  // Call the function when the user reaches the bottom
    }
});
