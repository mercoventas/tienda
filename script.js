// ============================================
// CONFIGURACIÓN Y CONSTANTES
// ============================================

// Claves para localStorage
const STORAGE_KEYS = {
    PRODUCTS: 'ferreteria_products',
    CART: 'ferreteria_cart',
    CATEGORIES: 'ferreteria_categories',
    WHATSAPP: 'ferreteria_whatsapp',
    SETTINGS: 'ferreteria_settings'
};

// Categorías por defecto
const DEFAULT_CATEGORIES = [
    { id: 1, name: 'Herramientas', description: 'Herramientas manuales y eléctricas', productCount: 0 },
    { id: 2, name: 'Electricidad', description: 'Materiales eléctricos y cables', productCount: 0 },
    { id: 3, name: 'Fontanería', description: 'Tuberías, llaves y accesorios', productCount: 0 },
    { id: 4, name: 'Pintura', description: 'Pinturas, brochas y rodillos', productCount: 0 },
    { id: 5, name: 'Jardín', description: 'Herramientas y productos para jardinería', productCount: 0 },
    { id: 6, name: 'Seguridad', description: 'Equipos de protección personal', productCount: 0 },
    { id: 7, name: 'Materiales de construcción', description: 'Cemento, ladrillos, arena', productCount: 0 }
];

// Productos por defecto (solo si no hay productos guardados)
const DEFAULT_PRODUCTS = [
    {
        id: 1,
        name: "Taladro Percutor 800W",
        description: "Taladro percutor profesional con potencia de 800W, ideal para concreto y madera.",
        price: 89.99,
        priceTiers: {
            base: 89.99,
            tier1: 85.99,
            tier2: 80.99,
            tier3: 75.99,
            tier4: 70.99
        },
        category: "herramientas",
        image: "img/products/taladro.jpg",
        stock: 15,
        featured: true
    },
    {
        id: 2,
        name: "Juego de Destornilladores",
        description: "Set de 20 destornilladores profesionales con puntas intercambiables.",
        price: 24.99,
        priceTiers: {
            base: 24.99,
            tier1: 23.99,
            tier2: 22.49,
            tier3: 20.99,
            tier4: 19.49
        },
        category: "herramientas",
        image: "img/products/destornilladores.jpg",
        stock: 42,
        featured: true
    },
    {
        id: 3,
        name: "Cable Eléctrico 12/2",
        description: "Cable eléctrico calibre 12/2, 100 pies, para instalaciones residenciales.",
        price: 65.50,
        priceTiers: {
            base: 65.50,
            tier1: 62.50,
            tier2: 59.50,
            tier3: 56.50,
            tier4: 53.50
        },
        category: "electricidad",
        image: "img/products/cable.jpg",
        stock: 28,
        featured: false
    }
];

// ============================================
// VARIABLES GLOBALES
// ============================================

let products = [];
let cart = [];
let categories = [];
let currentCategory = 'all';
let currentSearchTerm = '';
let whatsappNumber = "15551234567";

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    loadAllData();
    initUI();
    updateUI();
    startDataSync();
});

// ============================================
// FUNCIONES DE CARGA Y GUARDADO
// ============================================

// Cargar todos los datos del localStorage
function loadAllData() {
    // Cargar productos
    const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (savedProducts) {
        try {
            products = JSON.parse(savedProducts);
            if (!Array.isArray(products)) products = DEFAULT_PRODUCTS;
        } catch (e) {
            console.error('Error al cargar productos:', e);
            products = DEFAULT_PRODUCTS;
        }
    } else {
        products = DEFAULT_PRODUCTS;
        saveProductsToLocalStorage();
    }
    
    // Cargar carrito
    const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            if (!Array.isArray(cart)) cart = [];
        } catch (e) {
            console.error('Error al cargar carrito:', e);
            cart = [];
        }
    }
    
    // Cargar categorías
    const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (savedCategories) {
        try {
            categories = JSON.parse(savedCategories);
            if (!Array.isArray(categories)) categories = DEFAULT_CATEGORIES;
        } catch (e) {
            console.error('Error al cargar categorías:', e);
            categories = DEFAULT_CATEGORIES;
        }
    } else {
        categories = DEFAULT_CATEGORIES;
        saveCategoriesToLocalStorage();
    }
    
    // Cargar número de WhatsApp
    const savedWhatsapp = localStorage.getItem(STORAGE_KEYS.WHATSAPP);
    if (savedWhatsapp) {
        whatsappNumber = savedWhatsapp;
    }
    
    // Actualizar contadores de categorías
    updateCategoryProductCount();
}

// Guardar productos en localStorage
function saveProductsToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
        console.error('Error al guardar productos:', e);
        showNotification('Error al guardar productos', 'error');
    }
}

// Guardar carrito en localStorage
function saveCartToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
    } catch (e) {
        console.error('Error al guardar carrito:', e);
        showNotification('Error al guardar carrito', 'error');
    }
}

// Guardar categorías en localStorage
function saveCategoriesToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
        console.error('Error al guardar categorías:', e);
        showNotification('Error al guardar categorías', 'error');
    }
}

// Guardar número de WhatsApp
function saveWhatsappToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.WHATSAPP, whatsappNumber);
    } catch (e) {
        console.error('Error al guardar número de WhatsApp:', e);
        showNotification('Error al guardar configuración', 'error');
    }
}

// Actualizar contador de productos por categoría
function updateCategoryProductCount() {
    // Reiniciar contadores
    categories.forEach(cat => cat.productCount = 0);
    
    // Contar productos por categoría
    products.forEach(product => {
        const category = categories.find(cat => cat.name.toLowerCase() === product.category);
        if (category) {
            category.productCount++;
        } else {
            // Si la categoría no existe, agregarla
            const newCategory = {
                id: categories.length + 1,
                name: product.category.charAt(0).toUpperCase() + product.category.slice(1),
                description: `Productos de ${product.category}`,
                productCount: 1
            };
            categories.push(newCategory);
        }
    });
    
    saveCategoriesToLocalStorage();
}

// ============================================
// INICIALIZACIÓN DE INTERFAZ
// ============================================

function initUI() {
    // Menú móvil
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    
    mobileMenuToggle.addEventListener('click', openMobileMenu);
    closeSidebar.addEventListener('click', closeMobileMenu);
    sidebarOverlay.addEventListener('click', closeMobileMenu);
    
    // Carrito móvil
    const mobileCartToggle = document.getElementById('mobileCartToggle');
    const closeMobileCart = document.getElementById('closeMobileCart');
    const closeDesktopCart = document.getElementById('closeDesktopCart');
    
    mobileCartToggle.addEventListener('click', openMobileCart);
    closeMobileCart.addEventListener('click', closeMobileCartModal);
    closeDesktopCart.addEventListener('click', () => {
        document.getElementById('desktopCart').style.display = 'none';
    });
    
    // Botones de checkout
    const checkoutBtn = document.getElementById('checkoutBtn');
    const mobileCheckoutBtn = document.getElementById('mobileCheckoutBtn');
    
    checkoutBtn.addEventListener('click', sendOrderViaWhatsApp);
    mobileCheckoutBtn.addEventListener('click', sendOrderViaWhatsApp);
    
    // Botones para vaciar carrito
    const clearCartBtn = document.getElementById('clearCartBtn');
    const mobileClearCartBtn = document.getElementById('mobileClearCartBtn');
    
    clearCartBtn.addEventListener('click', clearCart);
    mobileClearCartBtn.addEventListener('click', clearCart);
    
    // Búsqueda
    const searchInput = document.getElementById('searchInput');
    const mobileSearch = document.getElementById('mobileSearch');
    
    searchInput.addEventListener('input', function(e) {
        currentSearchTerm = e.target.value;
        filterProducts();
        showAutocomplete(currentSearchTerm);
    });
    
    mobileSearch.addEventListener('input', function(e) {
        currentSearchTerm = e.target.value;
        filterProducts();
    });
    
    // Mostrar sidebar en desktop
    if (window.innerWidth >= 992) {
        document.getElementById('desktopSidebar').style.display = 'block';
        document.getElementById('desktopCart').style.display = 'flex';
    }
    
    // Redimensionamiento de ventana
    window.addEventListener('resize', handleResize);
}

// ============================================
// FUNCIONES DE INTERFAZ
// ============================================

function openMobileMenu() {
    document.getElementById('mobileSidebar').classList.add('active');
    document.getElementById('sidebarOverlay').classList.add('active');
}

function closeMobileMenu() {
    document.getElementById('mobileSidebar').classList.remove('active');
    document.getElementById('sidebarOverlay').classList.remove('active');
}

function openMobileCart() {
    document.getElementById('mobileCartModal').style.display = 'flex';
    updateMobileCart();
}

function closeMobileCartModal() {
    document.getElementById('mobileCartModal').style.display = 'none';
}

function handleResize() {
    if (window.innerWidth >= 992) {
        document.getElementById('desktopSidebar').style.display = 'block';
        document.getElementById('desktopCart').style.display = 'flex';
    } else {
        document.getElementById('desktopSidebar').style.display = 'none';
        document.getElementById('desktopCart').style.display = 'none';
    }
}

// ============================================
// ACTUALIZACIÓN DE INTERFAZ
// ============================================

function updateUI() {
    updateCategoriesUI();
    filterProducts();
    updateCart();
}

// Actualizar lista de categorías
function updateCategoriesUI() {
    const desktopList = document.getElementById('desktopCategoryList');
    const mobileList = document.getElementById('mobileCategoryList');
    
    if (desktopList) {
        desktopList.innerHTML = '';
        
        // Agregar "Todos los productos"
        const allItem = document.createElement('li');
        allItem.innerHTML = `<a href="#" class="${currentCategory === 'all' ? 'active' : ''}" data-category="all">Todos los productos (${products.length})</a>`;
        desktopList.appendChild(allItem);
        
        // Agregar cada categoría
        categories.forEach(category => {
            if (category.productCount > 0 || category.name.toLowerCase() === 'all') {
                const li = document.createElement('li');
                li.innerHTML = `<a href="#" class="${currentCategory === category.name.toLowerCase() ? 'active' : ''}" data-category="${category.name.toLowerCase()}">${category.name} (${category.productCount})</a>`;
                desktopList.appendChild(li);
            }
        });
        
        // Event listeners para categorías desktop
        const desktopLinks = desktopList.querySelectorAll('a');
        desktopLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const category = this.getAttribute('data-category');
                selectCategory(category);
                desktopLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
    
    if (mobileList) {
        mobileList.innerHTML = '';
        
        // Agregar "Todos los productos"
        const allMobileItem = document.createElement('li');
        allMobileItem.innerHTML = `<a href="#" data-category="all">Todos los productos</a>`;
        mobileList.appendChild(allMobileItem);
        
        // Agregar cada categoría
        categories.forEach(category => {
            if (category.productCount > 0 || category.name.toLowerCase() === 'all') {
                const li = document.createElement('li');
                li.innerHTML = `<a href="#" data-category="${category.name.toLowerCase()}">${category.name}</a>`;
                mobileList.appendChild(li);
            }
        });
        
        // Event listeners para categorías móviles
        const mobileLinks = mobileList.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const category = this.getAttribute('data-category');
                selectCategory(category);
                closeMobileMenu();
            });
        });
    }
}

// Seleccionar categoría
function selectCategory(category) {
    currentCategory = category;
    const categoryName = getCategoryName(category);
    document.getElementById('categoryTitle').textContent = categoryName;
    filterProducts();
}

// Obtener nombre legible de categoría
function getCategoryName(categoryId) {
    if (categoryId === 'all') return 'Todos los productos';
    
    const category = categories.find(cat => cat.name.toLowerCase() === categoryId);
    return category ? category.name : categoryId;
}

// Filtrar productos
function filterProducts() {
    let filteredProducts = products;
    
    // Filtrar por categoría
    if (currentCategory !== 'all') {
        filteredProducts = filteredProducts.filter(product => 
            product.category === currentCategory
        );
    }
    
    // Filtrar por búsqueda
    if (currentSearchTerm.trim() !== '') {
        const searchTerm = currentSearchTerm.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            product.description.toLowerCase().includes(searchTerm)
        );
    }
    
    displayProducts(filteredProducts);
    updateProductsCount(filteredProducts.length);
}

// Mostrar productos
function displayProducts(productsToDisplay) {
    const productsList = document.getElementById('productsList');
    
    if (productsToDisplay.length === 0) {
        productsList.innerHTML = `
            <div class="no-products">
                <i class="fas fa-search"></i>
                <h3>No se encontraron productos</h3>
                <p>Intenta con otra categoría o término de búsqueda</p>
            </div>
        `;
        return;
    }
    
    productsList.innerHTML = '';
    
    productsToDisplay.forEach(product => {
        const cartItem = cart.find(item => item.id === product.id);
        const quantityInCart = cartItem ? cartItem.quantity : 0;
        const currentPrice = getProductPrice(product);
        const stock = product.stock || 0;
        const availableStock = stock - quantityInCart;
        
        // Determinar estado del stock
        let stockClass = 'out-of-stock';
        let stockText = 'Agotado';
        
        if (availableStock > 10) {
            stockClass = 'in-stock';
            stockText = `Disponible: ${availableStock}`;
        } else if (availableStock > 0) {
            stockClass = 'low-stock';
            stockText = `Últimas ${availableStock} unidades`;
        }
        
        const productElement = document.createElement('div');
        productElement.className = 'product-item';
        productElement.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='img/products/default.jpg'">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <span class="product-category">${getCategoryName(product.category)}</span>
                <div class="stock-info ${stockClass}">${stockText}</div>
                <div class="product-details">
                    <div class="product-price">${currentPrice.toFixed(2)} USD</div>
                    <div class="product-actions">
                        <div class="quantity-control">
                            <button class="quantity-btn minus" onclick="decreaseProductQuantity(${product.id})" ${availableStock <= 0 ? 'disabled' : ''}>-</button>
                            <span class="quantity-display" id="quantity-${product.id}">${quantityInCart}</span>
                            <button class="quantity-btn plus" onclick="increaseProductQuantity(${product.id})" ${availableStock <= 0 ? 'disabled' : ''}>+</button>
                        </div>
                        <button class="add-to-cart-btn ${quantityInCart > 0 ? 'added' : ''}" onclick="addToCart(${product.id})" ${availableStock <= 0 ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i>
                            ${quantityInCart > 0 ? 'Actualizar' : (availableStock <= 0 ? 'Agotado' : 'Agregar')}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        productsList.appendChild(productElement);
    });
}

// Actualizar contador de productos
function updateProductsCount(count) {
    const productsCount = document.getElementById('productsCount');
    if (count !== undefined) {
        productsCount.textContent = `${count} producto${count !== 1 ? 's' : ''}`;
    }
}

// ============================================
// FUNCIONES DEL CARRITO
// ============================================

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const stock = product.stock || 0;
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity >= stock) {
            showNotification(`No hay suficiente stock de ${product.name}`, 'error');
            return;
        }
        existingItem.quantity++;
    } else {
        if (stock <= 0) {
            showNotification(`${product.name} está agotado`, 'error');
            return;
        }
        cart.push({
            id: productId,
            name: product.name,
            price: getProductPrice(product),
            basePrice: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateCart();
    saveCartToLocalStorage();
    showNotification(`${product.name} agregado al carrito`, 'success');
}

function increaseProductQuantity(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const stock = product.stock || 0;
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity >= stock) {
            showNotification(`No hay suficiente stock de ${product.name}`, 'error');
            return;
        }
        existingItem.quantity++;
    } else {
        if (stock <= 0) {
            showNotification(`${product.name} está agotado`, 'error');
            return;
        }
        cart.push({
            id: productId,
            name: product.name,
            price: getProductPrice(product),
            basePrice: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    updateProductQuantityDisplay(productId);
    updateCart();
    saveCartToLocalStorage();
}

function decreaseProductQuantity(productId) {
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
        if (cart[existingItemIndex].quantity > 1) {
            cart[existingItemIndex].quantity--;
        } else {
            cart.splice(existingItemIndex, 1);
        }
        
        updateProductQuantityDisplay(productId);
        updateCart();
        saveCartToLocalStorage();
    }
}

function removeFromCart(productId) {
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
        const productName = cart[existingItemIndex].name;
        cart.splice(existingItemIndex, 1);
        updateProductQuantityDisplay(productId);
        updateCart();
        saveCartToLocalStorage();
        showNotification(`${productName} eliminado del carrito`, 'info');
    }
}

function updateCartQuantity(productId, newQuantity) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const stock = product.stock || 0;
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (newQuantity > stock) {
            showNotification(`Solo hay ${stock} unidades disponibles de ${product.name}`, 'error');
            return;
        }
        
        if (newQuantity > 0) {
            existingItem.quantity = newQuantity;
        } else {
            removeFromCart(productId);
            return;
        }
        
        updateProductQuantityDisplay(productId);
        updateCart();
        saveCartToLocalStorage();
    }
}

function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        cart = [];
        updateCart();
        saveCartToLocalStorage();
        showNotification('Carrito vaciado', 'info');
    }
}

function updateProductQuantityDisplay(productId) {
    const quantityDisplay = document.getElementById(`quantity-${productId}`);
    if (quantityDisplay) {
        const cartItem = cart.find(item => item.id === productId);
        quantityDisplay.textContent = cartItem ? cartItem.quantity : 0;
        
        const addToCartBtn = quantityDisplay.closest('.product-actions').querySelector('.add-to-cart-btn');
        if (cartItem && cartItem.quantity > 0) {
            addToCartBtn.classList.add('added');
            addToCartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Actualizar';
        } else {
            addToCartBtn.classList.remove('added');
            addToCartBtn.innerHTML = '<i class="fas fa-cart-plus"></i> Agregar';
        }
    }
}

// ============================================
// ACTUALIZACIÓN DEL CARRITO
// ============================================

function updateCart() {
    updateDesktopCart();
    updateMobileCart();
    updateCartCount();
    updatePriceTierDisplay();
    
    // Actualizar productos para reflejar cambios en stock
    displayProducts(products.filter(product => 
        (currentCategory === 'all' || product.category === currentCategory) &&
        (currentSearchTerm === '' || 
         product.name.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
         product.description.toLowerCase().includes(currentSearchTerm.toLowerCase()))
    ));
}

function updateDesktopCart() {
    const cartItems = document.getElementById('cartItems');
    const subtotalElement = document.getElementById('subtotal');
    const totalElement = document.getElementById('total');
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        subtotalElement.textContent = '0.00 USD';
        totalElement.textContent = '0.00 USD';
        return;
    }
    
    const subtotal = getCartSubtotal();
    const total = getCartTotal();
    
    subtotalElement.textContent = subtotal.toFixed(2) + ' USD';
    totalElement.textContent = total.toFixed(2) + ' USD';
    
    cartItems.innerHTML = '';
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return;
        
        const currentProductPrice = getProductPrice(product);
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='img/products/default.jpg'">
            </div>
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.name}</h4>
                <div class="cart-item-price">${currentProductPrice.toFixed(2)} USD c/u</div>
                <div class="cart-item-actions">
                    <div class="cart-quantity-control">
                        <button class="cart-quantity-btn minus" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span class="cart-quantity-display">${item.quantity}</span>
                        <button class="cart-quantity-btn plus" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-item-btn" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
        
        cartItems.appendChild(cartItemElement);
    });
}

function updateMobileCart() {
    const mobileCartItems = document.getElementById('mobileCartItems');
    const mobileSubtotalElement = document.getElementById('mobileSubtotal');
    const mobileTotalElement = document.getElementById('mobileTotal');
    
    if (cart.length === 0) {
        mobileCartItems.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Tu carrito está vacío</p>
            </div>
        `;
        mobileSubtotalElement.textContent = '0.00 USD';
        mobileTotalElement.textContent = '0.00 USD';
        return;
    }
    
    const subtotal = getCartSubtotal();
    const total = getCartTotal();
    
    mobileSubtotalElement.textContent = subtotal.toFixed(2) + ' USD';
    mobileTotalElement.textContent = total.toFixed(2) + ' USD';
    
    mobileCartItems.innerHTML = '';
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (!product) return;
        
        const currentProductPrice = getProductPrice(product);
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='img/products/default.jpg'">
            </div>
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.name}</h4>
                <div class="cart-item-price">${currentProductPrice.toFixed(2)} USD c/u</div>
                <div class="cart-item-actions">
                    <div class="cart-quantity-control">
                        <button class="cart-quantity-btn minus" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span class="cart-quantity-display">${item.quantity}</span>
                        <button class="cart-quantity-btn plus" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-item-btn" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        
        mobileCartItems.appendChild(cartItemElement);
    });
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(element => {
        element.textContent = count;
    });
}

// ============================================
// CÁLCULOS DE PRECIOS
// ============================================

function getProductPrice(product) {
    const totalCartValue = getCartSubtotal();
    
    if (totalCartValue >= 3000) {
        return product.priceTiers.tier4 || product.price;
    } else if (totalCartValue >= 1000) {
        return product.priceTiers.tier3 || product.price;
    } else if (totalCartValue >= 500) {
        return product.priceTiers.tier2 || product.price;
    } else if (totalCartValue >= 200) {
        return product.priceTiers.tier1 || product.price;
    } else {
        return product.priceTiers.base || product.price;
    }
}

function getCartSubtotal() {
    let subtotal = 0;
    
    cart.forEach(item => {
        const product = products.find(p => p.id === item.id);
        if (product) {
            subtotal += getProductPrice(product) * item.quantity;
        }
    });
    
    return subtotal;
}

function getCartTotal() {
    // En este caso, el total es igual al subtotal (sin impuestos ni envío)
    return getCartSubtotal();
}

function updatePriceTierDisplay() {
    const total = getCartSubtotal();
    
    let currentTier = "Precio base";
    let currentTierDescription = "Menos de 200 USD";
    
    if (total >= 3000) {
        currentTier = "Precio corporativo";
        currentTierDescription = "Más de 3000 USD";
    } else if (total >= 1000) {
        currentTier = "Precio especial";
        currentTierDescription = "Más de 1000 USD";
    } else if (total >= 500) {
        currentTier = "Precio mayorista";
        currentTierDescription = "Más de 500 USD";
    } else if (total >= 200) {
        currentTier = "Precio reducido";
        currentTierDescription = "Más de 200 USD";
    }
    
    document.getElementById('currentTier').textContent = currentTier;
    document.getElementById('mobileCurrentTier').textContent = currentTier;
    
    // Actualizar descripciones de niveles de precio
    const tierElements = {
        'tier1': 'Precio base',
        'tier2': 'Precio reducido',
        'tier3': 'Precio mayorista',
        'tier4': 'Precio especial',
        'tier5': 'Precio corporativo'
    };
    
    for (const [id, text] of Object.entries(tierElements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = text;
        }
    }
}

// ============================================
// AUTOBÚSQUEDA Y WHATSAPP
// ============================================

function showAutocomplete(searchTerm) {
    const autocompleteResults = document.getElementById('autocompleteResults');
    
    if (searchTerm.trim() === '') {
        autocompleteResults.style.display = 'none';
        return;
    }
    
    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
    
    if (filteredProducts.length === 0) {
        autocompleteResults.style.display = 'none';
        return;
    }
    
    autocompleteResults.innerHTML = '';
    filteredProducts.forEach(product => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = product.name;
        item.addEventListener('click', function() {
            document.getElementById('searchInput').value = product.name;
            currentSearchTerm = product.name;
            filterProducts();
            autocompleteResults.style.display = 'none';
        });
        autocompleteResults.appendChild(item);
    });
    
    autocompleteResults.style.display = 'block';
}

function sendOrderViaWhatsApp() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío', 'error');
        return;
    }
    
    // Obtener número de WhatsApp
    const cleanNumber = whatsappNumber.replace(/\D/g, '');
    
    if (!cleanNumber) {
        showNotification('Número de WhatsApp no configurado', 'error');
        return;
    }
    
    const total = getCartTotal();
    const date = new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let message = `*NUEVO PEDIDO - Ferretería Online*\n`;
    message += `Fecha: ${date}\n`;
    message += `\n*Detalles del pedido:*\n`;
    message += `========================\n\n`;
    
    cart.forEach((item, index) => {
        const product = products.find(p => p.id === item.id);
        const price = product ? getProductPrice(product) : 0;
        const itemTotal = price * item.quantity;
        
        message += `${index + 1}. *${item.name}*\n`;
        message += `   Cantidad: ${item.quantity}\n`;
        message += `   Precio: ${price.toFixed(2)} USD c/u\n`;
        message += `   Subtotal: ${itemTotal.toFixed(2)} USD\n\n`;
    });
    
    message += `========================\n`;
    message += `*TOTAL A PAGAR: ${total.toFixed(2)} USD*\n\n`;
    message += `¡Gracias por tu pedido!`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    
    // Abrir en nueva pestaña
    window.open(whatsappURL, '_blank');
    
    // Cerrar modales
    closeMobileCartModal();
    document.getElementById('desktopCart').style.display = 'none';
    
    showNotification('Pedido enviado a WhatsApp', 'success');
}

// ============================================
// NOTIFICACIONES Y UTILIDADES
// ============================================

function showNotification(message, type = 'info') {
    // Eliminar notificaciones anteriores
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Crear nueva notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Eliminar después de 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 3000);
}

// ============================================
// SINCRONIZACIÓN DE DATOS
// ============================================

function startDataSync() {
    // Escuchar cambios en localStorage desde otras pestañas
    window.addEventListener('storage', function(event) {
        if (event.key === STORAGE_KEYS.PRODUCTS) {
            const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
            if (savedProducts) {
                try {
                    const newProducts = JSON.parse(savedProducts);
                    if (JSON.stringify(products) !== JSON.stringify(newProducts)) {
                        products = newProducts;
                        updateCategoryProductCount();
                        updateUI();
                        showNotification('Productos actualizados', 'info');
                    }
                } catch (e) {
                    console.error('Error al sincronizar productos:', e);
                }
            }
        }
        
        if (event.key === STORAGE_KEYS.CATEGORIES) {
            const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
            if (savedCategories) {
                try {
                    const newCategories = JSON.parse(savedCategories);
                    if (JSON.stringify(categories) !== JSON.stringify(newCategories)) {
                        categories = newCategories;
                        updateUI();
                    }
                } catch (e) {
                    console.error('Error al sincronizar categorías:', e);
                }
            }
        }
    });
    
    // Verificar cambios periódicamente (fallback para algunos navegadores)
    setInterval(() => {
        const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (savedProducts) {
            try {
                const newProducts = JSON.parse(savedProducts);
                if (JSON.stringify(products) !== JSON.stringify(newProducts)) {
                    products = newProducts;
                    updateCategoryProductCount();
                    updateUI();
                }
            } catch (e) {
                console.error('Error en verificación periódica de productos:', e);
            }
        }
    }, 2000);
}

// ============================================
// EXPORTAR FUNCIONES PARA HTML
// ============================================

// Exportar funciones que se llaman desde los onclick de HTML
window.addToCart = addToCart;
window.increaseProductQuantity = increaseProductQuantity;
window.decreaseProductQuantity = decreaseProductQuantity;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;

// ============================================
// INICIALIZACIÓN DE DATOS POR PRIMERA VEZ
// ============================================

// Asegurarse de que haya datos iniciales si el localStorage está vacío
if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    saveProductsToLocalStorage();
    saveCategoriesToLocalStorage();
    saveWhatsappToLocalStorage();
}