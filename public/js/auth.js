if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            console.log(response);
            const result = await response.json();
            const messageDiv = document.getElementById('message');
            
            if (result.success) {
                messageDiv.className = 'success';
                messageDiv.textContent = 'Logimine õnnestus! Suunan...';
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                messageDiv.className = 'error';
                messageDiv.textContent = result.error || 'Login failed';
            }
        } catch (error) {
            document.getElementById('message').className = 'error';
            document.getElementById('message').textContent = 'Logimine ebaõnnestus, proovi uuesti.';
        }
    });
}

if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        if (data.password.length < 6) {
            document.getElementById('message').className = 'error';
            document.getElementById('message').textContent = 'Parool peab olema minmaalselt 6 tähte..';
            return;
        }
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            const messageDiv = document.getElementById('message');
            
            if (result.success) {
                messageDiv.className = 'success';
                messageDiv.textContent = 'Registeerimine õnnestus! suunan...';
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                messageDiv.className = 'error';
                messageDiv.textContent = result.error || 'Registeerimine ebaõnnestus.';
            }
        } catch (error) {
            document.getElementById('message').className = 'error';
            document.getElementById('message').textContent = 'Tehniline viga, proovi uuesti.';
        }
    });
}