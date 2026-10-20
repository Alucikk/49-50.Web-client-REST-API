class PostServiceClient {
    constructor(baseUrl = 'http://localhost:5000') {
        this.baseUrl = baseUrl.replace(/\/$/, '');
    }
    async getPostings() {
        const response = await fetch(`${this.baseUrl}/postings`);
        if (!response.ok) throw new Error('Помилка отримання списку відправлень');
        return await response.json();
    }

    async getPostingById(id) {
        const response = await fetch(`${this.baseUrl}/postings/${id}`);
        if (!response.ok) throw new Error(`Відправлення з ID ${id} не знайдено`);
        return await response.json();
    }
    
    async createPosting(postingData) {
        const response = await fetch(`${this.baseUrl}/postings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postingData)
        });
        if (!response.ok) throw new Error('Помилка створення відправлення');
        return await response.json();
    }

    async updatePosting(id, postingData) {
        const response = await fetch(`${this.baseUrl}/postings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postingData)
        });
        if (!response.ok) throw new Error('Помилка оновлення відправлення');
        return await response.json();
    }

    async deletePosting(id) {
        const response = await fetch(`${this.baseUrl}/postings/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Помилка видалення відправлення');
    }

    async createContact(contactData) {
        const response = await fetch(`${this.baseUrl}/contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(contactData)
        });
        if (!response.ok) throw new Error('Помилка створення контакту');
        return await response.json();
    }

    async getContacts() {
        const response = await fetch(`${this.baseUrl}/contacts`);
        if (!response.ok) throw new Error('Помилка отримання списку контактів');
        return await response.json();
    }
}