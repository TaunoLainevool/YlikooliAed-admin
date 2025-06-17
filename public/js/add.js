document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('quizForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitBtn');
        const successMessage = document.getElementById('successMessage');
        const errorMessage = document.getElementById('errorMessage');
        
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';
        
        const formData = new FormData(e.target);
        const quizData = Object.fromEntries(formData.entries());
        
        try {
            const response = await fetch('/api/quizzes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(quizData)
            });
            
            if (response.ok) {
                const result = await response.json();
                successMessage.textContent = 'Küsimus lisatud!';
                successMessage.style.display = 'block';
                e.target.reset();
                
                window.scrollTo(0, 0);
            } else {
                throw new Error('Viga küsimuse salvestamisel');
            }
        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = 'Viga küsimuse salvestamisel, palun proovi uuesti';
            errorMessage.style.display = 'block';
            window.scrollTo(0, 0);
        } finally {

            submitBtn.disabled = false;
            submitBtn.textContent = 'Loo küsimus';
        }
    });
});