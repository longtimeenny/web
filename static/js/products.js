import { API_URL } from './config.js';

async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/api/models`);
        const products = await response.json();
        
        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = '';
        
        products.forEach(product => {
            const column = document.createElement('div');
            column.className = 'col-md-4 col-lg-3 mb-4';
            
            const hasImage = product.image_url && product.image_url !== 'null';
            const imageUrl = hasImage ? product.image_url : '/static/images/no-image.png';
            
            column.innerHTML = `
                <div class="card h-100 product-card">
                    <div class="product-image-container">
                        <img src="${imageUrl}" 
                             class="card-img-top product-image" 
                             alt="${product.model_number}"
                             onclick="showImageModal('${imageUrl}', '${product.model_number}')"
                             style="cursor: pointer;">
                        ${!hasImage ? "" : ''}
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">موديل: ${product.model_number}</h5>
                        <button onclick="showProductDetails('${product.model_number}')" class="btn btn-primary w-100">
                            عرض التفاصيل
                        </button>
                    </div>
                </div>
            `;
            
            productsGrid.appendChild(column);
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function showImageModal(imageUrl, modelNumber) {
    const modalHtml = `
        <div class="modal fade" id="imageModal" tabindex="-1">
            <div class="modal-dialog modal-lg modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">موديل: ${modelNumber}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <img src="${imageUrl}" class="img-fluid" alt="${modelNumber}">
                    </div>
                </div>
            </div>
        </div>
    `;

    // إزالة أي نافذة منبثقة سابقة
    const oldModal = document.getElementById('imageModal');
    if (oldModal) {
        oldModal.remove();
    }

    // إضافة النافذة المنبثقة الجديدة
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // عرض النافذة المنبثقة
    const modal = new bootstrap.Modal(document.getElementById('imageModal'));
    modal.show();
}

async function showProductDetails(modelNumber) {
    try {
        const response = await fetch(`${API_URL}/api/models/${modelNumber}`);
        const product = await response.json();
        
        document.getElementById('modalModelNumber').textContent = `موديل: ${product.model_number}`;
        document.getElementById('modalImage').src = product.image_url;
        
        const colorsDiv = document.getElementById('modalColors');
        colorsDiv.innerHTML = '';
        
        Object.entries(product.colors).forEach(([color, sizes]) => {
            const colorSection = document.createElement('div');
            colorSection.className = 'mb-3';
            
            let sizesHtml = '<ul class="list-group">';
            Object.entries(sizes).forEach(([size, quantity]) => {
                const available = quantity > 0;
                sizesHtml += `
                    <li class="list-group-item d-flex justify-content-between align-items-center ${available ? '' : 'text-muted'}">
                        ${size}
                        <span class="badge bg-${available ? 'primary' : 'secondary'} rounded-pill">
                            ${quantity} قطعة
                        </span>
                    </li>
                `;
            });
            sizesHtml += '</ul>';
            
            colorSection.innerHTML = `
                <h6 class="mb-2">${color}</h6>
                ${sizesHtml}
            `;
            
            colorsDiv.appendChild(colorSection);
        });
        
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    } catch (error) {
        console.error('Error loading product details:', error);
    }
}

// تحميل المنتجات عند فتح الصفحة
document.addEventListener('DOMContentLoaded', loadProducts);