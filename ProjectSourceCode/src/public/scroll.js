function loadMoreContent() {
    fetch('/path-to-more-content')  // Request to the server to load more content
        .then(response => response.json())  // Expecting the HTML returned by the server
        .then(json => {
            // Append the returned HTML to the scrollable content container

            json.contentListFromArray.map(item => {
                document.getElementById('scrollable-content-inner').insertAdjacentHTML('beforeend', item)
            })
            
        })
        .catch(error => console.error('Error loading more content:', error));
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

const handleScroll = throttle(() => {
    //if (isLoading) return;

    const scrollable = document.getElementById('scrollable-content');
    const scrollHeight = scrollable.scrollHeight;
    const scrollTop = window.scrollY;
    const clientHeight = window.innerHeight;
    
    // Calculate how far through the content we've scrolled (as a percentage)
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight * 100;
    
    // Check if we're 75% of the way through
    if (scrollPercentage >= 75) {
        loadMoreContent();
    }
}, 150);

const options = {
    root: document.getElementById('scrollable-content'), // viewport
    rootMargin: '25%', // trigger when sentinel is 25% from bottom
    threshold: 0
};

const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
        loadMoreContent();
    }
}, options);

// Place this sentinel element 75% down your content
const sentinel = document.createElement('div');
document.getElementById('scrollable-content').appendChild(sentinel);
observer.observe(sentinel);