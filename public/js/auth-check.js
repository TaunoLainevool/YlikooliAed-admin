async function checkAuthentication() {
    try {
        const response = await fetch('/api/profile');

        if (!response.ok) {
            window.location.href = '/';
            return false;
        }

        const data = await response.json();
        console.log('Authenticated user:', data.username);
        return true;

    } catch (error) {
        console.error('Authentication check failed:', error);
        window.location.href = '/';
        return false;
    }
}

async function authenticatedFetch(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        if (response.status === 401) {
            // Session expired, redirect to login
            alert('Sessioon aegus. Palun logi uuesti sisse.');
            window.location.href = '/';
            return null;
        }

        return response;

    } catch (error) {
        console.error('Authenticated fetch failed:', error);
        throw error;
    }
}

function logout() {
    fetch('/api/logout', { method: 'POST' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = '/';
            }
        })
        .catch(error => {
            console.error('Logout failed:', error);
            // Force redirect even if logout request fails
            window.location.href = '/';
        });
}

document.addEventListener('DOMContentLoaded', () => {
    // Only check authentication if we're not on login or register pages
    const currentPath = window.location.pathname;
    const publicPaths = ['/', '/register'];

    if (!publicPaths.includes(currentPath)) {
        checkAuthentication();
    }
});