// ============================================
// CONFIGURACIÓN Y CONSTANTES
// ============================================

// Claves para localStorage (deben coincidir con script.js)
const STORAGE_KEYS = {
    PRODUCTS: 'ferreteria_products',
    CART: 'ferreteria_cart',
    CATEGORIES: 'ferreteria_categories',
    WHATSAPP: 'ferreteria_whatsapp',
    SETTINGS: 'ferreteria_settings'
};

// Variables globales
let adminProducts = [];
let categories = [];
let whatsappNumber = "1 555 1234567";
let currentProductId = null;
let currentCategoryId = null;
let confirmAction = null;
let confirmCallback = null;

// Elementos del DOM (se inicializan en initAdminUI)
let productModal, categoryModal, confirmModal, successModal;

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    loadAdminData();
    initAdminUI();
    showSection('dashboard');
    updateDashboardStats();
    loadProductsTable();
    loadCategoriesGrid();
    loadSystemInfo();
});

// ============================================
// CARGA Y GUARDADO DE DATOS
// ============================================

function loadAdminData() {
    // Cargar productos
    const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (savedProducts) {
        try {
            adminProducts = JSON.parse(savedProducts);
            if (!Array.isArray(adminProducts)) {
                adminProducts = getDefaultProducts();
            }
        } catch (e) {
            console.error('Error al cargar productos:', e);
            adminProducts = getDefaultProducts();
        }
    } else {
        adminProducts = getDefaultProducts();
        saveAdminData();
    }
    
    // Cargar categorías
    const savedCategories = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (savedCategories) {
        try {
            categories = JSON.parse(savedCategories);
            if (!Array.isArray(categories)) {
                categories = getDefaultCategories();
            }
        } catch (e) {
            console.error('Error al cargar categorías:', e);
            categories = getDefaultCategories();
        }
    } else {
        categories = getDefaultCategories();
        saveAdminData();
    }
    
    // Cargar número de WhatsApp
    const savedWhatsapp = localStorage.getItem(STORAGE_KEYS.WHATSAPP);
    if (savedWhatsapp) {
        whatsappNumber = savedWhatsapp;
    }
    
    // Actualizar contadores de categorías
    updateCategoryProductCount();
}

function saveAdminData() {
    try {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(adminProducts));
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
        localStorage.setItem(STORAGE_KEYS.WHATSAPP, whatsappNumber);
        
        // Disparar evento de storage para sincronizar con la tienda
        window.dispatchEvent(new StorageEvent('storage', {
            key: STORAGE_KEYS.PRODUCTS,
            newValue: JSON.stringify(adminProducts)
        }));
        
        window.dispatchEvent(new StorageEvent('storage', {
            key: STORAGE_KEYS.CATEGORIES,
            newValue: JSON.stringify(categories)
        }));
        
        return true;
    } catch (e) {
        console.error('Error al guardar datos:', e);
        showNotification('Error al guardar datos', 'error');
        return false;
    }
}

function getDefaultProducts() {
    return [
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
            featured: true,
            createdAt: new Date().toISOString()
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
            featured: true,
            createdAt: new Date().toISOString()
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
            featured: false,
            createdAt: new Date().toISOString()
        }
    ];
}

function getDefaultCategories() {
    return [
        { id: 1, name: 'Herramientas', description: 'Herramientas manuales y eléctricas', productCount: 0, icon: 'fas fa-tools' },
        { id: 2, name: 'Electricidad', description: 'Materiales eléctricos y cables', productCount: 0, icon: 'fas fa-bolt' },
        { id: 3, name: 'Fontanería', description: 'Tuberías, llaves y accesorios', productCount: 0, icon: 'fas fa-faucet' },
        { id: 4, name: 'Pintura', description: 'Pinturas, brochas y rodillos', productCount: 0, icon: 'fas fa-paint-roller' },
        { id: 5, name: 'Jardín', description: 'Herramientas y productos para jardinería', productCount: 0, icon: 'fas fa-leaf' },
        { id: 6, name: 'Seguridad', description: 'Equipos de protección personal', productCount: 0, icon: 'fas fa-hard-hat' },
        { id: 7, name: 'Materiales de construcción', description: 'Cemento, ladrillos, arena', productCount: 0, icon: 'fas fa-cubes' }
    ];
}

function updateCategoryProductCount() {
    // Reiniciar contadores
    categories.forEach(cat => cat.productCount = 0);
    
    // Contar productos por categoría
    adminProducts.forEach(product => {
        const category = categories.find(cat => cat.name.toLowerCase() === product.category);
        if (category) {
            category.productCount++;
        } else {
            // Si la categoría no existe, agregarla
            const newCategory = {
                id: categories.length + 1,
                name: product.category.charAt(0).toUpperCase() + product.category.slice(1),
                description: `Productos de ${product.category}`,
                productCount: 1,
                icon: 'fas fa-tag'
            };
            categories.push(newCategory);
        }
    });
    
    // Guardar categorías actualizadas
    saveAdminData();
}

// ============================================
// INICIALIZACIÓN DE INTERFAZ
// ============================================

function initAdminUI() {
    // Referencias a modales
    productModal = document.getElementById('productModal');
    categoryModal = document.getElementById('categoryModal');
    confirmModal = document.getElementById('confirmModal');
    successModal = document.getElementById('successModal');
    
    // Navegación
    const navLinks = document.querySelectorAll('.admin-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sectionId = this.getAttribute('href').substring(1);
            showSection(sectionId);
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Botón de cerrar sesión
    document.getElementById('logoutBtn').addEventListener('click', function() {
        showConfirmModal(
            'Cerrar sesión',
            '¿Está seguro que desea cerrar sesión? Será redirigido a la tienda.',
            () => {
                showNotification('Sesión cerrada. Redirigiendo...', 'info');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1500);
            }
        );
    });
    
    // Acciones rápidas
    const actionBtns = document.querySelectorAll('.quick-action-btn');
    actionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            handleQuickAction(action);
        });
    });
    
    // Botones principales
    document.getElementById('addProductBtn').addEventListener('click', () => openProductModal());
    document.getElementById('addCategoryBtn').addEventListener('click', () => openCategoryModal());
    document.getElementById('exportProducts').addEventListener('click', exportProducts);
    
    // Búsqueda
    document.getElementById('productSearch').addEventListener('input', function(e) {
        filterProductsTable(e.target.value);
    });
    
    document.getElementById('categorySearch').addEventListener('input', function(e) {
        filterCategoriesGrid(e.target.value);
    });
    
    // Configuración
    document.getElementById('saveWhatsapp').addEventListener('click', saveWhatsappNumber);
    document.getElementById('saveAppearance').addEventListener('click', saveAppearanceSettings);
    document.getElementById('logoUpload').addEventListener('change', handleLogoUpload);
    
    // Gestión de datos
    document.getElementById('backupData').addEventListener('click', backupData);
    document.getElementById('restoreData').addEventListener('click', restoreData);
    document.getElementById('resetData').addEventListener('click', resetAllData);
    
    // Modales de productos
    document.getElementById('closeProductModal').addEventListener('click', () => closeProductModal());
    document.getElementById('cancelProduct').addEventListener('click', () => closeProductModal());
    document.getElementById('saveProduct').addEventListener('click', saveProduct);
    document.getElementById('productImageUpload').addEventListener('change', handleProductImageUpload);
    
    // Modales de categorías
    document.getElementById('closeCategoryModal').addEventListener('click', () => closeCategoryModal());
    document.getElementById('cancelCategory').addEventListener('click', () => closeCategoryModal());
    document.getElementById('saveCategory').addEventListener('click', saveCategory);
    
    // Modales de confirmación
    document.getElementById('cancelConfirm').addEventListener('click', () => closeConfirmModal());
    document.getElementById('confirmAction').addEventListener('click', executeConfirmAction);
    document.getElementById('closeSuccessModal').addEventListener('click', () => closeSuccessModal());
    
    // Validación de precios en tiempo real
    const priceInputs = ['basePrice', 'priceTier1', 'priceTier2', 'priceTier3', 'priceTier4'];
    priceInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('change', validatePriceTiers);
        }
    });
}

// ============================================
// NAVEGACIÓN ENTRE SECCIONES
// ============================================

function showSection(sectionId) {
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    const activeSection = document.getElementById(sectionId);
    if (activeSection) {
        activeSection.classList.add('active');
        
        // Actualizar contenido específico de la sección
        switch(sectionId) {
            case 'dashboard':
                updateDashboardStats();
                loadRecentProducts();
                break;
            case 'productos':
                loadProductsTable();
                break;
            case 'categorias':
                loadCategoriesGrid();
                break;
            case 'configuracion':
                loadConfiguration();
                loadSystemInfo();
                break;
        }
        
        // Scroll al inicio de la sección
        activeSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ============================================
// DASHBOARD Y ESTADÍSTICAS
// ============================================

function updateDashboardStats() {
    // Productos totales
    document.getElementById('totalProducts').textContent = adminProducts.length;
    
    // Categorías activas (con al menos un producto)
    const activeCategories = categories.filter(cat => cat.productCount > 0).length;
    document.getElementById('totalCategories').textContent = activeCategories;
    
    // Pedidos de hoy (simulado - en una app real vendría de una base de datos)
    const todayOrders = Math.floor(Math.random() * 15) + 5;
    document.getElementById('totalOrders').textContent = todayOrders;
    
    // Ingresos de hoy (simulado)
    const todayRevenue = (todayOrders * 75 + Math.random() * 200).toFixed(2);
    document.getElementById('totalRevenue').textContent = `$${todayRevenue}`;
    
    // Actualizar tendencias
    updateTrendIndicators();
}

function updateTrendIndicators() {
    // Estas serían tendencias reales en una aplicación con historial
    // Por ahora, usamos valores simulados
    const trends = {
        productTrend: Math.random() > 0.5 ? 'positive' : 'negative',
        categoryTrend: 'neutral',
        orderTrend: Math.random() > 0.3 ? 'positive' : 'negative',
        revenueTrend: Math.random() > 0.4 ? 'positive' : 'negative'
    };
    
    for (const [id, trend] of Object.entries(trends)) {
        const element = document.getElementById(id);
        if (element) {
            element.className = `stat-trend ${trend}`;
            const icon = element.querySelector('i');
            const span = element.querySelector('span');
            
            if (trend === 'positive') {
                icon.className = 'fas fa-arrow-up';
                span.textContent = `${(Math.random() * 20 + 5).toFixed(1)}%`;
            } else if (trend === 'negative') {
                icon.className = 'fas fa-arrow-down';
                span.textContent = `${(Math.random() * 15 + 2).toFixed(1)}%`;
            } else {
                icon.className = 'fas fa-minus';
                span.textContent = '0%';
            }
        }
    }
}

function loadRecentProducts() {
    const tableBody = document.querySelector('#recentProductsTable tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Ordenar productos por fecha de creación (más recientes primero)
    const recentProducts = [...adminProducts]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5);
    
    if (recentProducts.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" style="text-align: center; padding: 40px; color: #7f8c8d;">
                <i class="fas fa-box-open" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                <p>No hay productos registrados</p>
            </td>
        `;
        tableBody.appendChild(row);
        return;
    }
    
    recentProducts.forEach(product => {
        const category = categories.find(c => c.name.toLowerCase() === product.category);
        const categoryName = category ? category.name : product.category;
        
        // Determinar estado del stock
        let stockClass = 'stock-high';
        let stockText = 'Alto';
        
        if (!product.stock || product.stock <= 0) {
            stockClass = 'stock-out';
            stockText = 'Agotado';
        } else if (product.stock <= 10) {
            stockClass = 'stock-low';
            stockText = 'Bajo';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div style="display: flex; align-items: center;">
                    <img src="${product.image}" alt="${product.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px; margin-right: 10px;" onerror="this.src='img/products/default.jpg'">
                    <div>
                        <strong>${product.name}</strong>
                        ${product.featured ? '<span class="status-badge status-active" style="margin-left: 8px; font-size: 0.7rem;">Destacado</span>' : ''}
                    </div>
                </div>
            </td>
            <td>${categoryName}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>
                <span class="stock-badge ${stockClass}">${product.stock || 0}</span>
            </td>
            <td>
                <span class="status-badge ${stockClass === 'stock-out' ? 'status-inactive' : 'status-active'}">${stockText}</span>
            </td>
            <td>
                <button class="btn-edit" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// ============================================
// GESTIÓN DE PRODUCTOS
// ============================================

function loadProductsTable(searchTerm = '') {
    const tableBody = document.querySelector('#productsTable tbody');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    // Filtrar productos si hay término de búsqueda
    let filteredProducts = adminProducts;
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredProducts = adminProducts.filter(product => 
            product.name.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term)
        );
    }
    
    if (filteredProducts.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="8" style="text-align: center; padding: 40px; color: #7f8c8d;">
                <i class="fas fa-box-open" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                <p>${searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}</p>
                ${!searchTerm ? '<button class="btn-primary" onclick="openProductModal()" style="margin-top: 10px;"><i class="fas fa-plus"></i> Agregar primer producto</button>' : ''}
            </td>
        `;
        tableBody.appendChild(row);
        return;
    }
    
    filteredProducts.forEach(product => {
        const category = categories.find(c => c.name.toLowerCase() === product.category);
        const categoryName = category ? category.name : product.category;
        
        // Determinar estado del stock
        let stockClass = 'stock-high';
        let stockText = 'Alto';
        
        if (!product.stock || product.stock <= 0) {
            stockClass = 'stock-out';
            stockText = 'Agotado';
        } else if (product.stock <= 10) {
            stockClass = 'stock-low';
            stockText = 'Bajo';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${product.id}</td>
            <td class="product-image-cell">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='img/products/default.jpg'">
            </td>
            <td>
                <div>
                    <strong>${product.name}</strong>
                    ${product.featured ? '<span class="status-badge status-active" style="margin-left: 8px; font-size: 0.7rem;">Destacado</span>' : ''}
                </div>
                <small style="color: #7f8c8d; font-size: 0.85rem;">${product.description.substring(0, 50)}${product.description.length > 50 ? '...' : ''}</small>
            </td>
            <td>${categoryName}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td>
                <span class="stock-badge ${stockClass}">${product.stock || 0}</span>
            </td>
            <td>
                <span class="status-badge ${stockClass === 'stock-out' ? 'status-inactive' : 'status-active'}">${stockText}</span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-edit" onclick="editProduct(${product.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                    <button class="btn-view" onclick="viewProductInStore(${product.id})" title="Ver en tienda">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Actualizar paginación
    updateProductsPagination(filteredProducts.length);
}

function filterProductsTable(searchTerm) {
    loadProductsTable(searchTerm);
}

function updateProductsPagination(totalProducts) {
    const pagination = document.getElementById('productsPagination');
    if (!pagination) return;
    
    const itemsPerPage = 10;
    const totalPages = Math.ceil(totalProducts / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Botón anterior
    paginationHTML += '<button onclick="changeProductsPage(currentPage - 1)" disabled id="prevPage">Anterior</button>';
    
    // Páginas
    for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `<button onclick="changeProductsPage(${i})" class="${i === 1 ? 'active' : ''}">${i}</button>`;
    }
    
    // Botón siguiente
    paginationHTML += '<button onclick="changeProductsPage(currentPage + 1)" id="nextPage">Siguiente</button>';
    
    pagination.innerHTML = paginationHTML;
    
    // Variables de control
    window.currentPage = 1;
    window.totalPages = totalPages;
    
    // Actualizar estado de botones
    updatePaginationButtons();
}

function changeProductsPage(page) {
    if (page < 1 || page > window.totalPages) return;
    
    window.currentPage = page;
    
    // Actualizar botón activo
    const buttons = document.querySelectorAll('#productsPagination button');
    buttons.forEach((btn, index) => {
        if (index === page) { // índice 0 es "Anterior"
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Aquí cargaríamos los productos de la página específica
    // Por simplicidad, recargamos todos los productos
    loadProductsTable(document.getElementById('productSearch').value);
    updatePaginationButtons();
}

function updatePaginationButtons() {
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) {
        prevBtn.disabled = window.currentPage <= 1;
    }
    
    if (nextBtn) {
        nextBtn.disabled = window.currentPage >= window.totalPages;
    }
}

// ============================================
// MODALES DE PRODUCTOS
// ============================================

function openProductModal(productId = null) {
    currentProductId = productId;
    const title = document.getElementById('modalProductTitle');
    const form = document.getElementById('productForm');
    
    // Cargar categorías en el select
    const categorySelect = document.getElementById('productCategory');
    categorySelect.innerHTML = '<option value="">Seleccione una categoría</option>';
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.name.toLowerCase();
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
    
    if (productId) {
        // Modo edición
        title.textContent = 'Editar producto';
        const product = adminProducts.find(p => p.id === productId);
        
        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productDescription').value = product.description;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productStock').value = product.stock || 0;
            document.getElementById('productFeatured').checked = product.featured || false;
            document.getElementById('basePrice').value = product.price;
            
            // Precios por volumen
            if (product.priceTiers) {
                document.getElementById('priceTier1').value = product.priceTiers.tier1 || product.price;
                document.getElementById('priceTier2').value = product.priceTiers.tier2 || product.price;
                document.getElementById('priceTier3').value = product.priceTiers.tier3 || product.price;
                document.getElementById('priceTier4').value = product.priceTiers.tier4 || product.price;
            } else {
                // Si no hay precios por volumen, usar el precio base
                const basePrice = product.price;
                document.getElementById('priceTier1').value = basePrice;
                document.getElementById('priceTier2').value = basePrice;
                document.getElementById('priceTier3').value = basePrice;
                document.getElementById('priceTier4').value = basePrice;
            }
            
            // Vista previa de imagen
            const previewImage = document.getElementById('previewImage');
            const noImagePreview = document.getElementById('noImagePreview');
            
            if (product.image && product.image !== '') {
                previewImage.src = product.image;
                previewImage.style.display = 'block';
                noImagePreview.style.display = 'none';
            } else {
                previewImage.style.display = 'none';
                noImagePreview.style.display = 'flex';
            }
        }
    } else {
        // Modo creación
        title.textContent = 'Agregar nuevo producto';
        form.reset();
        
        document.getElementById('previewImage').style.display = 'none';
        document.getElementById('noImagePreview').style.display = 'flex';
        
        // Valores por defecto
        document.getElementById('productStock').value = 10;
        document.getElementById('productFeatured').checked = false;
        
        // Generar nuevo ID
        const newId = adminProducts.length > 0 ? Math.max(...adminProducts.map(p => p.id)) + 1 : 1;
        document.getElementById('productId').value = newId;
        
        // Precios por defecto
        document.getElementById('basePrice').value = '';
        document.getElementById('priceTier1').value = '';
        document.getElementById('priceTier2').value = '';
        document.getElementById('priceTier3').value = '';
        document.getElementById('priceTier4').value = '';
    }
    
    // Validar precios
    validatePriceTiers();
    
    // Mostrar modal
    productModal.style.display = 'flex';
}

function closeProductModal() {
    productModal.style.display = 'none';
    document.getElementById('productForm').reset();
}

function handleProductImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showNotification('Formato de archivo no válido. Use JPG, PNG, GIF o WebP.', 'error');
        return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
        showNotification('El archivo es demasiado grande. El tamaño máximo es 2MB.', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const previewImage = document.getElementById('previewImage');
        const noImagePreview = document.getElementById('noImagePreview');
        
        previewImage.src = e.target.result;
        previewImage.style.display = 'block';
        noImagePreview.style.display = 'none';
    };
    
    reader.readAsDataURL(file);
}

function validatePriceTiers() {
    const basePrice = parseFloat(document.getElementById('basePrice').value) || 0;
    const tier1 = parseFloat(document.getElementById('priceTier1').value) || 0;
    const tier2 = parseFloat(document.getElementById('priceTier2').value) || 0;
    const tier3 = parseFloat(document.getElementById('priceTier3').value) || 0;
    const tier4 = parseFloat(document.getElementById('priceTier4').value) || 0;
    
    const saveButton = document.getElementById('saveProduct');
    let isValid = true;
    let message = '';
    
    if (tier1 > basePrice) {
        isValid = false;
        message = 'El precio del nivel 2 no puede ser mayor al precio base.';
    } else if (tier2 > tier1) {
        isValid = false;
        message = 'El precio del nivel 3 no puede ser mayor al del nivel 2.';
    } else if (tier3 > tier2) {
        isValid = false;
        message = 'El precio del nivel 4 no puede ser mayor al del nivel 3.';
    } else if (tier4 > tier3) {
        isValid = false;
        message = 'El precio del nivel 5 no puede ser mayor al del nivel 4.';
    }
    
    if (!isValid) {
        saveButton.disabled = true;
        saveButton.title = message;
        showNotification(message, 'error');
    } else {
        saveButton.disabled = false;
        saveButton.title = '';
    }
    
    return isValid;
}

function saveProduct() {
    const form = document.getElementById('productForm');
    if (!form.checkValidity()) {
        showNotification('Por favor complete todos los campos obligatorios.', 'error');
        return;
    }
    
    if (!validatePriceTiers()) {
        return;
    }
    
    const productId = parseInt(document.getElementById('productId').value);
    const productName = document.getElementById('productName').value.trim();
    const productDescription = document.getElementById('productDescription').value.trim();
    const productCategory = document.getElementById('productCategory').value;
    const productStock = parseInt(document.getElementById('productStock').value);
    const productFeatured = document.getElementById('productFeatured').checked;
    const basePrice = parseFloat(document.getElementById('basePrice').value);
    
    const priceTier1 = parseFloat(document.getElementById('priceTier1').value) || basePrice;
    const priceTier2 = parseFloat(document.getElementById('priceTier2').value) || basePrice;
    const priceTier3 = parseFloat(document.getElementById('priceTier3').value) || basePrice;
    const priceTier4 = parseFloat(document.getElementById('priceTier4').value) || basePrice;
    
    const imagePreview = document.getElementById('previewImage');
    const productImage = imagePreview.style.display !== 'none' ? imagePreview.src : 'img/products/default.jpg';
    
    const productData = {
        id: productId,
        name: productName,
        description: productDescription,
        price: basePrice,
        priceTiers: {
            base: basePrice,
            tier1: priceTier1,
            tier2: priceTier2,
            tier3: priceTier3,
            tier4: priceTier4
        },
        category: productCategory,
        image: productImage,
        stock: productStock,
        featured: productFeatured,
        updatedAt: new Date().toISOString()
    };
    
    // Si es nuevo producto, agregar fecha de creación
    const existingIndex = adminProducts.findIndex(p => p.id === productId);
    if (existingIndex === -1) {
        productData.createdAt = new Date().toISOString();
    } else {
        productData.createdAt = adminProducts[existingIndex].createdAt || new Date().toISOString();
    }
    
    if (existingIndex !== -1) {
        // Actualizar producto existente
        adminProducts[existingIndex] = productData;
    } else {
        // Agregar nuevo producto
        adminProducts.push(productData);
    }
    
    // Actualizar contadores de categorías y guardar
    updateCategoryProductCount();
    
    if (saveAdminData()) {
        // Actualizar interfaz
        loadProductsTable();
        loadRecentProducts();
        updateDashboardStats();
        closeProductModal();
        
        showSuccessModal(
            productId === currentProductId ? 'Producto actualizado' : 'Producto creado',
            `El producto "${productName}" ha sido ${productId === currentProductId ? 'actualizado' : 'creado'} exitosamente y ya está disponible en la tienda.`
        );
    }
}

function editProduct(productId) {
    openProductModal(productId);
}

function deleteProduct(productId) {
    const product = adminProducts.find(p => p.id === productId);
    if (!product) return;
    
    showConfirmModal(
        'Eliminar producto',
        `¿Está seguro que desea eliminar el producto "${product.name}"? Esta acción no se puede deshacer y el producto desaparecerá de la tienda.`,
        () => {
            const index = adminProducts.findIndex(p => p.id === productId);
            if (index !== -1) {
                adminProducts.splice(index, 1);
                updateCategoryProductCount();
                
                if (saveAdminData()) {
                    loadProductsTable();
                    loadRecentProducts();
                    updateDashboardStats();
                    loadCategoriesGrid();
                    
                    showNotification('Producto eliminado correctamente', 'success');
                }
            }
        }
    );
}

function viewProductInStore(productId) {
    // En una implementación real, esto abriría la tienda en la página del producto
    showNotification('Esta función abriría la tienda para ver el producto', 'info');
}

// ============================================
// GESTIÓN DE CATEGORÍAS
// ============================================

function loadCategoriesGrid(searchTerm = '') {
    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    // Filtrar categorías si hay término de búsqueda
    let filteredCategories = categories;
    if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredCategories = categories.filter(category => 
            category.name.toLowerCase().includes(term) ||
            category.description.toLowerCase().includes(term)
        );
    }
    
    if (filteredCategories.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #7f8c8d;">
                <i class="fas fa-tags" style="font-size: 3rem; margin-bottom: 15px; display: block;"></i>
                <p>${searchTerm ? 'No se encontraron categorías' : 'No hay categorías registradas'}</p>
                ${!searchTerm ? '<button class="btn-primary" onclick="openCategoryModal()" style="margin-top: 10px;"><i class="fas fa-plus"></i> Agregar primera categoría</button>' : ''}
            </div>
        `;
        return;
    }
    
    filteredCategories.forEach(category => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        
        // Icono de la categoría
        const iconClass = category.icon || 'fas fa-tag';
        
        categoryCard.innerHTML = `
            <div class="category-header">
                <div class="category-title">
                    <h4><i class="${iconClass}"></i> ${category.name}</h4>
                    <span class="category-count">${category.productCount} productos</span>
                </div>
                <div class="category-actions">
                    <button onclick="editCategory(${category.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteCategory(${category.id})" title="Eliminar" ${category.productCount > 0 ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <p class="category-description">${category.description}</p>
            <div class="category-products">
                <small>${category.productCount > 0 ? `${category.productCount} productos asociados` : 'Sin productos'}</small>
            </div>
        `;
        
        grid.appendChild(categoryCard);
    });
}

function filterCategoriesGrid(searchTerm) {
    loadCategoriesGrid(searchTerm);
}

function openCategoryModal(categoryId = null) {
    currentCategoryId = categoryId;
    const title = document.getElementById('modalCategoryTitle');
    const form = document.getElementById('categoryForm');
    
    if (categoryId) {
        // Modo edición
        title.textContent = 'Editar categoría';
        const category = categories.find(c => c.id === categoryId);
        
        if (category) {
            document.getElementById('categoryId').value = category.id;
            document.getElementById('categoryName').value = category.name;
            document.getElementById('categoryDescription').value = category.description;
            document.getElementById('categoryIcon').value = category.icon || '';
        }
    } else {
        // Modo creación
        title.textContent = 'Agregar nueva categoría';
        form.reset();
        
        // Generar nuevo ID
        const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
        document.getElementById('categoryId').value = newId;
    }
    
    // Mostrar modal
    categoryModal.style.display = 'flex';
}

function closeCategoryModal() {
    categoryModal.style.display = 'none';
    document.getElementById('categoryForm').reset();
}

function saveCategory() {
    const categoryName = document.getElementById('categoryName').value.trim();
    if (!categoryName) {
        showNotification('Por favor ingrese un nombre para la categoría.', 'error');
        return;
    }
    
    const categoryId = parseInt(document.getElementById('categoryId').value);
    const categoryDescription = document.getElementById('categoryDescription').value.trim();
    const categoryIcon = document.getElementById('categoryIcon').value;
    
    const categoryData = {
        id: categoryId,
        name: categoryName,
        description: categoryDescription || `Categoría de ${categoryName}`,
        productCount: 0,
        icon: categoryIcon || 'fas fa-tag'
    };
    
    const existingIndex = categories.findIndex(c => c.id === categoryId);
    
    if (existingIndex !== -1) {
        // Actualizar categoría existente
        const oldCategoryName = categories[existingIndex].name.toLowerCase();
        categoryData.productCount = categories[existingIndex].productCount;
        categories[existingIndex] = categoryData;
        
        // Actualizar productos que usan la categoría antigua
        adminProducts.forEach(product => {
            if (product.category === oldCategoryName) {
                product.category = categoryName.toLowerCase();
            }
        });
    } else {
        // Agregar nueva categoría - verificar que no exista una con el mismo nombre
        const existingCategory = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
        if (existingCategory) {
            showNotification('Ya existe una categoría con ese nombre.', 'error');
            return;
        }
        
        categories.push(categoryData);
    }
    
    // Guardar cambios
    if (saveAdminData()) {
        // Actualizar interfaz
        loadCategoriesGrid();
        loadProductsTable();
        updateDashboardStats();
        closeCategoryModal();
        
        showSuccessModal(
            existingIndex !== -1 ? 'Categoría actualizada' : 'Categoría creada',
            `La categoría "${categoryName}" ha sido ${existingIndex !== -1 ? 'actualizada' : 'creada'} exitosamente.`
        );
    }
}

function editCategory(categoryId) {
    openCategoryModal(categoryId);
}

function deleteCategory(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    
    if (category.productCount > 0) {
        showNotification(`No se puede eliminar la categoría "${category.name}" porque tiene ${category.productCount} productos asociados. Reasigne los productos a otra categoría primero.`, 'error');
        return;
    }
    
    showConfirmModal(
        'Eliminar categoría',
        `¿Está seguro que desea eliminar la categoría "${category.name}"?`,
        () => {
            const index = categories.findIndex(c => c.id === categoryId);
            if (index !== -1) {
                categories.splice(index, 1);
                
                if (saveAdminData()) {
                    loadCategoriesGrid();
                    updateDashboardStats();
                    showNotification('Categoría eliminada correctamente', 'success');
                }
            }
        }
    );
}

// ============================================
// CONFIGURACIÓN
// ============================================

function loadConfiguration() {
    // Cargar número de WhatsApp
    document.getElementById('whatsappNumber').value = whatsappNumber;
    
    // Cargar logo actual
    document.getElementById('currentLogo').src = 'img/logo.png';
}

function loadSystemInfo() {
    // Contar productos almacenados
    document.getElementById('storedProductsCount').textContent = `${adminProducts.length} productos`;
    
    // Contar carritos activos (del localStorage)
    try {
        const savedCart = localStorage.getItem(STORAGE_KEYS.CART);
        const cart = savedCart ? JSON.parse(savedCart) : [];
        document.getElementById('activeCartsCount').textContent = `${cart.length} carritos`;
    } catch (e) {
        document.getElementById('activeCartsCount').textContent = '0 carritos';
    }
}

function saveWhatsappNumber() {
    const newNumber = document.getElementById('whatsappNumber').value.trim();
    
    if (!newNumber) {
        showNotification('Por favor ingrese un número de WhatsApp válido.', 'error');
        return;
    }
    
    whatsappNumber = newNumber;
    
    try {
        localStorage.setItem(STORAGE_KEYS.WHATSAPP, whatsappNumber);
        showNotification('Número de WhatsApp actualizado correctamente', 'success');
    } catch (e) {
        showNotification('Error al guardar el número de WhatsApp', 'error');
    }
}

function saveAppearanceSettings() {
    // En una implementación real, esto guardaría en localStorage
    showNotification('Configuración de apariencia guardada', 'success');
}

function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showNotification('Formato de archivo no válido. Use JPG, PNG, GIF o WebP.', 'error');
        return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
        showNotification('El archivo es demasiado grande. El tamaño máximo es 2MB.', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const logoImg = document.getElementById('currentLogo');
        logoImg.src = e.target.result;
        
        // En una aplicación real, aquí guardarías la imagen en localStorage o servidor
        showNotification('Logo actualizado. En una aplicación real, este archivo se guardaría.', 'info');
    };
    
    reader.readAsDataURL(file);
}

// ============================================
// GESTIÓN DE DATOS
// ============================================

function backupData() {
    const backup = {
        products: adminProducts,
        categories: categories,
        whatsapp: whatsappNumber,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    };
    
    const backupStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([backupStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `ferreteria-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    showNotification('Respaldo de datos generado y descargado', 'success');
}

function restoreData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const backup = JSON.parse(e.target.result);
                
                // Validar estructura del backup
                if (!backup.products || !backup.categories) {
                    throw new Error('Archivo de respaldo inválido');
                }
                
                showConfirmModal(
                    'Restaurar datos',
                    '¿Está seguro que desea restaurar los datos del respaldo? Esto sobrescribirá todos los datos actuales.',
                    () => {
                        adminProducts = backup.products;
                        categories = backup.categories;
                        whatsappNumber = backup.whatsapp || "1 555 1234567";
                        
                        if (saveAdminData()) {
                            // Actualizar toda la interfaz
                            loadProductsTable();
                            loadCategoriesGrid();
                            loadRecentProducts();
                            updateDashboardStats();
                            loadSystemInfo();
                            
                            showSuccessModal(
                                'Datos restaurados',
                                'Los datos han sido restaurados exitosamente desde el respaldo.'
                            );
                        }
                    }
                );
            } catch (error) {
                console.error('Error al restaurar datos:', error);
                showNotification('Error al restaurar datos: Archivo inválido o corrupto', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function resetAllData() {
    showConfirmModal(
        'Restablecer todos los datos',
        '¿Está SEGURO que desea restablecer TODOS los datos? Esto eliminará todos los productos, categorías y configuraciones. Esta acción NO se puede deshacer.',
        () => {
            // Restablecer a valores por defecto
            adminProducts = getDefaultProducts();
            categories = getDefaultCategories();
            whatsappNumber = "1 555 1234567";
            
            // Limpiar localStorage completamente
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            
            // Guardar datos por defecto
            if (saveAdminData()) {
                // Actualizar toda la interfaz
                loadProductsTable();
                loadCategoriesGrid();
                loadRecentProducts();
                updateDashboardStats();
                loadSystemInfo();
                loadConfiguration();
                
                showSuccessModal(
                    'Datos restablecidos',
                    'Todos los datos han sido restablecidos a los valores por defecto.'
                );
            }
        }
    );
}

function exportProducts() {
    const exportData = {
        products: adminProducts,
        exportDate: new Date().toISOString(),
        count: adminProducts.length
    };
    
    const exportStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([exportStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `productos-ferreteria-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    showNotification('Productos exportados exitosamente', 'success');
}

// ============================================
// ACCIONES RÁPIDAS
// ============================================

function handleQuickAction(action) {
    switch(action) {
        case 'add-product':
            openProductModal();
            break;
        case 'add-category':
            openCategoryModal();
            break;
        case 'change-logo':
            document.getElementById('logoUpload').click();
            break;
        case 'view-orders':
            showNotification('Esta función mostraría los pedidos recibidos', 'info');
            break;
        default:
            console.log('Acción no implementada:', action);
    }
}

// ============================================
// MODALES DE CONFIRMACIÓN Y ÉXITO
// ============================================

function showConfirmModal(title, message, callback) {
    confirmAction = title;
    confirmCallback = callback;
    
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    
    // Cambiar icono según el tipo de acción
    const confirmIcon = document.getElementById('confirmIcon');
    if (title.toLowerCase().includes('eliminar') || title.toLowerCase().includes('restablecer')) {
        confirmIcon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
    } else {
        confirmIcon.innerHTML = '<i class="fas fa-question-circle"></i>';
    }
    
    confirmModal.style.display = 'flex';
}

function closeConfirmModal() {
    confirmModal.style.display = 'none';
    confirmAction = null;
    confirmCallback = null;
}

function executeConfirmAction() {
    if (confirmCallback) {
        confirmCallback();
    }
    closeConfirmModal();
}

function showSuccessModal(title, message) {
    document.getElementById('successTitle').textContent = title;
    document.getElementById('successMessage').textContent = message;
    successModal.style.display = 'flex';
}

function closeSuccessModal() {
    successModal.style.display = 'none';
}

// ============================================
// NOTIFICACIONES
// ============================================

function showNotification(message, type = 'info') {
    // Eliminar notificaciones anteriores
    const existingNotifications = document.querySelectorAll('.admin-notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Crear nueva notificación
    const notification = document.createElement('div');
    notification.className = `admin-notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Estilos para la notificación
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Botón para cerrar
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
    
    // Cerrar automáticamente después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // Animaciones CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .notification-close {
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 1.2rem;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.3s;
        }
        
        .notification-close:hover {
            background-color: rgba(255, 255, 255, 0.2);
        }
    `;
    
    document.head.appendChild(style);
}

// ============================================
// SINCRONIZACIÓN CON LA TIENDA
// ============================================

// Escuchar cambios en el localStorage desde la tienda
window.addEventListener('storage', function(event) {
    if (event.key === STORAGE_KEYS.PRODUCTS) {
        // Los productos fueron actualizados desde la tienda
        const savedProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (savedProducts) {
            try {
                const newProducts = JSON.parse(savedProducts);
                if (JSON.stringify(adminProducts) !== JSON.stringify(newProducts)) {
                    adminProducts = newProducts;
                    updateCategoryProductCount();
                    
                    // Actualizar interfaz si estamos en una sección relacionada
                    if (document.querySelector('#dashboard.active') || document.querySelector('#productos.active')) {
                        loadProductsTable();
                        loadRecentProducts();
                        updateDashboardStats();
                    }
                    
                    if (document.querySelector('#categorias.active')) {
                        loadCategoriesGrid();
                    }
                    
                    showNotification('Productos sincronizados desde la tienda', 'info');
                }
            } catch (e) {
                console.error('Error al sincronizar productos:', e);
            }
        }
    }
});

// ============================================
// EXPORTAR FUNCIONES GLOBALES
// ============================================

// Exportar funciones que se llaman desde los onclick de HTML
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.viewProductInStore = viewProductInStore;
window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.changeProductsPage = changeProductsPage;