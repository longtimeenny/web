document.getElementById('editModelForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    const modelImage = document.getElementById('modelImage');
    const currentColors = collectFormData();
    
    formData.append('colors', JSON.stringify(currentColors));
    
    // إضافة الصورة فقط إذا تم اختيار واحدة جديدة
    if (modelImage.files.length > 0) {
        formData.append('image', modelImage.files[0]);
    }
    
    try {
        const response = await fetch(`/api/models/${modelNumber}`, {
            method: 'PUT',
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            alert('تم حفظ التغييرات بنجاح');
            
            // تحديث الصورة المعروضة إذا تم تغييرها
            if (data.image_url) {
                document.getElementById('currentImage').src = data.image_url;
            }
            
            // الرجوع إلى صفحة الأدمن بعد ثانية
            setTimeout(() => {
                window.location.href = '/admin';
            }, 1000);
        } else {
            const data = await response.json();
            alert(data.error || 'حدث خطأ في حفظ التغييرات');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('حدث خطأ في حفظ التغييرات');
    }
});