import { API_URL } from './config.js';

let currentModel = null;

async function searchModel() {
    const modelNumber = document.getElementById('modelSearch').value;
    if (!modelNumber) return;

    try {
        const response = await fetch(`${API_URL}/api/models/${modelNumber}`);
        const data = await response.json();
        
        if (response.ok) {
            currentModel = data;
            displayProductDetails(data);
        } else {
            alert('لم يتم العثور على الموديل');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ في البحث');
    }
}

function displayProductDetails(model) {
    document.getElementById('productDetails').style.display = 'block';
    document.getElementById('modelNumber').textContent = `الموديل: ${model.model_number}`;
    
    const imageUrl = model.image_url || '/static/images/no-image.png';
    const productImage = document.getElementById('productImage');
    productImage.src = imageUrl;
    productImage.style.cursor = 'pointer';
    productImage.onclick = () => showImageModal(imageUrl, model.model_number);

    const colorSelect = document.getElementById('colorSelect');
    colorSelect.innerHTML = '<option value="">اختر اللون</option>';
    
    Object.keys(model.colors).forEach(color => {
        const option = document.createElement('option');
        option.value = color;
        option.textContent = color;
        colorSelect.appendChild(option);
    });

    document.getElementById('sizeSelect').innerHTML = '<option value="">اختر المقاس</option>';
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

function updateSizes() {
    const colorSelect = document.getElementById('colorSelect');
    const sizeSelect = document.getElementById('sizeSelect');
    const selectedColor = colorSelect.value;

    sizeSelect.innerHTML = '<option value="">اختر المقاس</option>';
    
    if (selectedColor && currentModel) {
        const sizes = currentModel.colors[selectedColor];
        Object.entries(sizes).forEach(([size, quantity]) => {
            if (quantity > 0) {
                const option = document.createElement('option');
                option.value = size;
                option.textContent = `${size} (${quantity} متوفر)`;
                sizeSelect.appendChild(option);
            }
        });
    }
}

async function purchase() {
    const modelNumber = currentModel.model_number;
    const color = document.getElementById('colorSelect').value;
    const size = document.getElementById('sizeSelect').value;

    if (!modelNumber || !color || !size) {
        alert('الرجاء اختيار اللون والمقاس');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/purchase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model_number: modelNumber,
                color: color,
                size: size
            })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert('تم البيع بنجاح');
            // Refresh product details to show updated quantities
            searchModel();
        } else {
            alert(data.error || 'حدث خطأ في عملية البيع');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ في عملية البيع');
    }
}