from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
import requests
from datetime import datetime

app = Flask(__name__)
# تكوين CORS للسماح بالطلبات من GitHub Pages
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://*.github.io", "http://localhost:*"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type"]
    }
})

# ملفات التخزين
USERS_FILE = 'users.json'
INVENTORY_FILE = 'inventory.json'
SALES_FILE = 'sales.json'

# ImgBB API configuration
IMGBB_API_KEY = os.getenv('IMGBB_API_KEY')
IMGBB_API_URL = 'https://api.imgbb.com/1/upload'

# Load inventory from JSON file
def load_inventory():
    try:
        if os.path.exists(INVENTORY_FILE):
            with open(INVENTORY_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {}
    except Exception as e:
        print(f"Error loading inventory: {e}")
        return {}

# Save inventory to JSON file
def save_inventory(inventory_data):
    try:
        with open(INVENTORY_FILE, 'w', encoding='utf-8') as f:
            json.dump(inventory_data, f, ensure_ascii=False, indent=4)
    except Exception as e:
        print(f"Error saving inventory: {e}")

# Load sales from file
def load_sales():
    try:
        if os.path.exists(SALES_FILE):
            with open(SALES_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except Exception as e:
        print(f"Error loading sales: {e}")
        return []

# Save sales to file
def save_sales(sales_data):
    try:
        with open(SALES_FILE, 'w', encoding='utf-8') as f:
            json.dump(sales_data, f, ensure_ascii=False, indent=4)
    except Exception as e:
        print(f"Error saving sales: {e}")

# تهيئة المخزون والمبيعات
inventory = load_inventory()
sales = load_sales()

@app.route('/api/models', methods=['GET'])
def get_all_models():
    return jsonify(list(inventory.values()))

@app.route('/api/models/<model_number>', methods=['GET'])
def get_model(model_number):
    if model_number in inventory:
        return jsonify(inventory[model_number])
    return jsonify({'error': 'Model not found'}), 404

@app.route('/api/models', methods=['POST'])
def add_model():
    data = request.form
    model_number = data.get('model_number')
    if not model_number:
        return jsonify({'error': 'Model number is required'}), 400

    image_url = None
    # Handle image upload if provided
    if 'image' in request.files and request.files['image'].filename:
        image = request.files['image']
        files = {'image': image.read()}
        payload = {'key': IMGBB_API_KEY}
        
        try:
            response = requests.post(IMGBB_API_URL, files=files, data=payload)
            if response.status_code == 200:
                image_url = response.json()['data']['url']
        except Exception as e:
            print(f"Error uploading image: {e}")
    
    # Create inventory entry
    inventory[model_number] = {
        'model_number': model_number,
        'image_url': image_url,
        'colors': json.loads(data.get('colors', '{}')),
    }
    
    # Save to JSON file
    save_inventory(inventory)
    
    return jsonify(inventory[model_number]), 201

@app.route('/api/models/<model_number>', methods=['PUT'])
def update_model(model_number):
    if model_number not in inventory:
        return jsonify({'error': 'Model not found'}), 404

    data = request.form
    model = inventory[model_number]
    
    # Handle image upload if provided
    if 'image' in request.files and request.files['image'].filename:
        image = request.files['image']
        files = {'image': image.read()}
        payload = {'key': IMGBB_API_KEY}
        
        try:
            response = requests.post(IMGBB_API_URL, files=files, data=payload)
            if response.status_code == 200:
                model['image_url'] = response.json()['data']['url']
        except Exception as e:
            print(f"Error uploading image: {e}")
    
    # Update colors and quantities
    model['colors'] = json.loads(data.get('colors', '{}'))
    
    # Save changes
    save_inventory(inventory)
    
    return jsonify(model)

@app.route('/api/models/<model_number>', methods=['DELETE'])
def delete_model(model_number):
    if model_number in inventory:
        del inventory[model_number]
        # Save changes to JSON file
        save_inventory(inventory)
        return jsonify({'message': 'Model deleted successfully'})
    return jsonify({'error': 'Model not found'}), 404

@app.route('/api/purchase', methods=['POST'])
def make_purchase():
    data = request.json
    model_number = data.get('model_number')
    color = data.get('color')
    size = data.get('size')
    
    if not all([model_number, color, size]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    if model_number not in inventory:
        return jsonify({'error': 'Model not found'}), 404
    
    model = inventory[model_number]
    if color not in model['colors']:
        return jsonify({'error': 'Color not found'}), 404
    
    if size not in model['colors'][color]:
        return jsonify({'error': 'Size not found'}), 404
    
    if model['colors'][color][size] <= 0:
        return jsonify({'error': 'Out of stock'}), 400
    
    # تحديث المخزون
    model['colors'][color][size] -= 1
    save_inventory(inventory)
    
    # تسجيل عملية البيع
    sale = {
        'id': len(sales) + 1,
        'date': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        'model_number': model_number,
        'color': color,
        'size': size,
        'image_url': model['image_url']
    }
    sales.append(sale)
    save_sales(sales)
    
    return jsonify({'message': 'Purchase successful'})

if __name__ == '__main__':
    app.run(debug=True, port=5001)