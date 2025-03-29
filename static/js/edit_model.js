import { API_URL } from './config.js';

let currentModel = null;
const modelNumber = window.location.pathname.split('/').pop();

async function loadModel() {
    try {
        const response = await fetch(`${API_URL}/api/models/${modelNumber}`);
        currentModel = await response.json();
        
        if (response.ok) {
            displayModelDetails(currentModel);
        } else {
            alert('لم يتم العثور على الموديل');
            window.location.href = '/admin';
        }
    } catch (error) {
        console.error('Error loading model:', error);
    }
}

function displayModelDetails(model) {
    document.getElementById('modelNumberTitle').textContent = model.model_number;
    
    const imageUrl = model.image_url || '/static/images/no-image.png';
    const currentImage = document.getElementById('currentImage');
    currentImage.src = imageUrl;
    currentImage.onclick = () => showImageModal(imageUrl);
    
    const colorContainer = document.getElementById('colorContainer');
    colorContainer.innerHTML = '';
    
    Object.entries(model.colors).forEach(([color, sizes], colorIndex) => {
        const colorEntry = createColorEntry(color, sizes, colorIndex);
        colorContainer.appendChild(colorEntry);
    });
}

function createColorEntry(color = '', sizes = {}, colorIndex) {
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
                    <button type="button" class="btn btn-danger" onclick="removeColor(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="sizes-container">
                    ${Object.entries(sizes).map(([size, quantity], sizeIndex) => `
                        <div class="size-entry d-flex gap-2 mb-2">
                            <input type="text" class="form-control" placeholder="المقاس" value="${size}" required>
                            <input type="number" class="form-control" placeholder="الكمية" min="0" value="${quantity}" required>
                            <button type="button" class="btn btn-danger" onclick="removeSize(this)">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button type="button" class="btn btn-info btn-sm" onclick="addSize(this)">
                    <i class="fas fa-plus me-1"></i>
                    إضافة مقاس
                </button>
            </div>
        </div>
    `;
    
    return div;
}

function addColor() {
    const colorContainer = document.getElementById('colorContainer');
    const colorEntry = createColorEntry();
    colorContainer.appendChild(colorEntry);
}

function removeColor(button) {
    button.closest('.color-entry').remove();
}

function addSize(button) {
    const sizesContainer = button.previousElementSibling;
    const sizeEntry = document.createElement('div');
    sizeEntry.className = 'size-entry d-flex gap-2 mb-2';
    sizeEntry.innerHTML = `
        <input type="text" class="form-control" placeholder="المقاس" required>
        <input type="number" class="form-control" placeholder="الكمية" min="0" required>
        <button type="button" class="btn btn-danger" onclick="removeSize(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    sizesContainer.appendChild(sizeEntry);
}

function removeSize(button) {
    button.closest('.size-entry').remove();
}

function showImageModal(imageUrl) {
    document.getElementById('modalImage').src = imageUrl;
    const modal = new bootstrap.Modal(document.getElementById('imageModal'));
    modal.show();
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

// معالجة تقديم النموذج
document.getElementById('editModelForm').addEventListener('submit', updateModel);

// تحميل بيانات الموديل عند فتح الصفحة
document.addEventListener('DOMContentLoaded', loadModel);