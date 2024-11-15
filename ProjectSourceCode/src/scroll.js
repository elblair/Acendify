function loadMoreContent() {
    fetch('/path-to-more-content')
      .then(response => response.text())
      .then(html => {
        document.getElementById('scrollable-content').innerHTML += html;
      })
      .catch(error => console.error('Error loading more content:', error));
  }
  
  window.addEventListener('scroll', function() {
    var scrollableContent = document.getElementById('scrollable-content');
    var hasReachedBottom = scrollableContent.getBoundingClientRect().bottom <= window.innerHeight;
  
    if (hasReachedBottom) {
      loadMoreContent(); // Call the function to load more content when reaching the bottom
    }
  });
  