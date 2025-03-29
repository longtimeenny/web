import { API_URL } from './config.js';

async function loadSales() {
    try {
        const response = await fetch(`${API_URL}/api/sales`);
        const sales = await response.json();
        const salesTable = document.getElementById('salesTable');
        salesTable.innerHTML = '';
        
        sales.reverse().forEach(sale => {
            const row = document.createElement('tr');
            const imageUrl = sale.image_url || '/static/images/no-image.png';
            row.innerHTML = `
                <td>${sale.id}</td>
                <td>${sale.date}</td>
                <td>
                    <img src="${imageUrl}" 
                         alt="صورة المنتج" 
                         class="sale-image" 
                         width="50"
                         onclick="showImageModal('${imageUrl}', '${sale.model_number}')"
                         style="cursor: pointer;">
                </td>
                <td>${sale.model_number}</td>
                <td>${sale.color}</td>
                <td>${sale.size}</td>
            `;
            salesTable.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading sales:', error);
    }
}

// تحميل المبيعات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', loadSales);