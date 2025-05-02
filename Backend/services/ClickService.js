const handleClick = async () => {
    try {
        const response = await fetch('http://localhost:4444/api/v1/click', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.json();
    } catch (error) {
        console.error('Error handling click:', error);
        throw error;
    }
};

module.exports = {
    handleClick
};
