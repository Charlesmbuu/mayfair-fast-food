import os

# Define the folder structure and files
structure = {
    "src": {
        "components": {
            "Layout": ["Header.jsx", "Layout.jsx"],
            "Menu": ["MenuPage.jsx", "MenuCategory.jsx", "MenuItem.jsx"],
            "Cart": ["ShoppingCart.jsx", "CartItem.jsx", "CartSummary.jsx"],
            "Checkout": ["CheckoutPage.jsx"]
        },
        "context": ["CartContext.jsx"],
        "hooks": ["useApi.jsx"],
        "services": ["api.js"],
        "utils": ["constants.js"],
        "": ["App.jsx"]  # files directly under src/
    }
}

def create_structure(base_path, struct):
    for folder, content in struct.items():
        folder_path = os.path.join(base_path, folder)
        
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)
            print(f"Created folder: {folder_path}")
        
        if isinstance(content, dict):
            # Nested folders
            create_structure(folder_path, content)
        elif isinstance(content, list):
            # Files in this folder
            for file in content:
                file_path = os.path.join(folder_path, file)
                with open(file_path, "w") as f:
                    f.write("")  # Create an empty file
                print(f"Created file: {file_path}")

if __name__ == "__main__":
    base = "."  # Current directory
    create_structure(base, structure)
    print("\nProject structure created successfully!")
