import { API_URL } from './config.js';

async function loadModels() {
    try {
        const response = await fetch(`${API_URL}/api/models`);
        const models = await response.json();
        
        const modelsList = document.getElementById('modelsList');
        modelsList.innerHTML = '';
        
        models.forEach(model => {
            const row = document.createElement('tr');
            const imageUrl = model.image_url || '/static/images/no-image.png';
            
            row.innerHTML = `
                <td>${model.model_number}</td>
                <td>
                    <img src="${imageUrl}" 
                         alt="صورة المنتج" 
                         width="50"
                         class="model-image"
                         onclick="window.showImageModal('${imageUrl}', '${model.model_number}')"
                         style="cursor: pointer;">
                </td>
                <td>
                    <div class="btn-group">
                        <a href="/admin/edit/${model.model_number}" class="btn btn-info btn-sm">
                            <i class="fas fa-edit"></i>
                            تعديل
                        </a>
                        <button onclick="window.deleteModel('${model.model_number}')" class="btn btn-danger btn-sm">
                            <i class="fas fa-trash"></i>
                            حذف
                        </button>
                    </div>
                </td>
            `;
            
            modelsList.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading models:', error);
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

async function deleteModel(modelNumber) {
    if (confirm('هل أنت متأكد من حذف هذا الموديل؟')) {
        try {
            const response = await fetch(`${API_URL}/api/models/${modelNumber}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                loadModels();
            } else {
                alert('حدث خطأ أثناء حذف الموديل');
            }
        } catch (error) {
            console.error('Error deleting model:', error);
            alert('حدث خطأ أثناء حذف الموديل');
        }
    }
}

function collectFormData() {
    const colors = {};
    document.querySelectorAll('.color-entry').forEach(colorEntry => {
        const colorName = colorEntry.querySelector('.color-name').value;
        const sizes = {};
        
        colorEntry.querySelectorAll('.size-entry').forEach(sizeEntry => {
            const [sizeInput, quantityInput] = sizeEntry.querySelectorAll('input');
            sizes[sizeInput.value] = parseInt(quantityInput.value);
        });
        
        colors[colorName] = sizes;
    });
    
    return colors;
}

function addColor() {
    const colorContainer = document.getElementById('colorContainer');
    colorContainer.appendChild(createColorEntry());
}

function createColorEntry(color = '', sizes = {}) {
    const div = document.createElement('div');
    div.className = 'color-entry mb-3';
    
    div.innerHTML = `
        <div class="card">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="flex-grow-1 me-2">
                        <label class="form-label">اللون:</label>
                        <input type="text" class="form-control color-name" value="${color}" required>
                    </div>
                    <button type="button" class="btn btn-danger" onclick="window.removeColor(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="sizes-container">
                    ${Object.entries(sizes).map(([size, quantity]) => 
                        createSizeEntry(size, quantity)
                    ).join('')}
                </div>
                <button type="button" class="btn btn-info btn-sm" onclick="window.addSize(this)">
                    <i class="fas fa-plus me-1"></i>
                    إضافة مقاس
                </button>
            </div>
        </div>
    `;
    
    return div;
}

function createSizeEntry(size = '', quantity = '') {
    return `
        <div class="size-entry d-flex gap-2 mb-2">
            <input type="text" class="form-control" placeholder="المقاس" value="${size}" required>
            <input type="number" class="form-control" placeholder="الكمية" min="0" value="${quantity}" required>
            <button type="button" class="btn btn-danger" onclick="window.removeSize(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
}

function addSize(button) {
    const sizesContainer = button.previousElementSibling;
    sizesContainer.insertAdjacentHTML('beforeend', createSizeEntry());
}

function removeColor(button) {
    button.closest('.color-entry').remove();
}

function removeSize(button) {
    button.closest('.size-entry').remove();
}

async function handleSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData();
    const modelNumber = document.getElementById('modelNumber').value;
    const modelImage = document.getElementById('modelImage');
    const colors = collectFormData();
    
    formData.append('model_number', modelNumber);
    formData.append('colors', JSON.stringify(colors));
    
    if (modelImage.files.length > 0) {
        formData.append('image', modelImage.files[0]);
    }
    
    try {
        const response = await fetch(`${API_URL}/api/models`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            event.target.reset();
            loadModels();
            // إضافة لون افتراضي بعد إعادة تعيين النموذج
            const colorContainer = document.getElementById('colorContainer');
            colorContainer.innerHTML = '';
            colorContainer.appendChild(createColorEntry());
        } else {
            alert('حدث خطأ أثناء إضافة الموديل');
        }
    } catch (error) {
        console.error('Error adding model:', error);
        alert('حدث خطأ أثناء إضافة الموديل');
    }
}

// تصدير الدوال للاستخدام في HTML
window.showImageModal = showImageModal;
window.deleteModel = deleteModel;
window.addColor = addColor;
window.removeColor = removeColor;
window.addSize = addSize;
window.removeSize = removeSize;

// إعداد النموذج عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadModels();
    const form = document.getElementById('addModelForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
});