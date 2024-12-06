let isLoading = false;

function loadMoreContent() {
    if (isLoading) return;

    isLoading = true;
    fetch('/path-to-more-content')  
        .then(response => response.json())  
        .then(json => {
            

            json.map(item => {
                let html_elem = `<div class='more-content'><p>${item}</p></div>`
                document.getElementById('scrollable-content-inner').insertAdjacentHTML('beforeend', html_elem)
            })
            isLoading = false;
        })
        .catch(error => {
            console.error('Error loading more content:', error)
            isLoading = false;
        });
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
    

    const scrollable = document.getElementById('scrollable-content');
    const scrollHeight = scrollable.scrollHeight;
    const scrollTop = window.scrollY;
    const clientHeight = window.innerHeight;
    
    
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight * 100;
    
    
    if (scrollPercentage >= 75) {
        loadMoreContent();
    }
}, 150);

const options = {
    root: document.getElementById('scrollable-content'), 
    rootMargin: '0px 0px 50% 0px', 
    threshold: 0
};

const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !isLoading) {
        loadMoreContent();
    }
}, options);


const sentinel = document.createElement('div');
document.getElementById('scrollable-content').appendChild(sentinel);
window.addEventListener('scroll', throttle(handleScroll, 150), { passive: true });
observer.observe(sentinel);