// Konfigurasi Google Apps Script
// Ganti dengan URL Web App dari Google Apps Script Anda
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwTWlnI0Tqi7nv4LcOjIRo3UfgiziqnSg4X22SyVPbGFRIIqagyWYy1nDcNoNzjgzxWAg/exec';

// =====================
// CART STATE
// =====================
let cart = []; // { name, price, qty }

function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartCount = document.getElementById('cartCount');
    const cartCountNav = document.getElementById('cartCountNav');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0);

    // Badge
    if (totalQty > 0) {
        cartCount.textContent = totalQty;
        cartCount.classList.remove('hidden');
        cartCountNav.textContent = totalQty;
        cartCountNav.classList.remove('hidden');
        const mob = document.getElementById('cartCountMobile');
        if (mob) { mob.textContent = totalQty; mob.classList.remove('hidden'); }
        checkoutBtn.disabled = false;
    } else {
        cartCount.classList.add('hidden');
        cartCountNav.classList.add('hidden');
        const mob = document.getElementById('cartCountMobile');
        if (mob) mob.classList.add('hidden');
        checkoutBtn.disabled = true;
    }

    cartTotal.textContent = formatPrice(totalPrice);

    // Render items
    cartItems.innerHTML = '';
    if (cart.length === 0) {
        cartItems.innerHTML = '<p id="cartEmpty" class="text-center text-gray-400 mt-8"><i class="fas fa-shopping-basket text-4xl mb-3 block"></i>Keranjang masih kosong</p>';
        return;
    }

    cart.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between bg-orange-50 rounded-lg p-3';
        div.innerHTML = `
            <div class="flex-1">
                <p class="font-semibold text-gray-800 text-sm">${item.name}</p>
                <p class="text-orange-600 text-sm">${formatPrice(item.price)}</p>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="changeQty(${idx}, -1)" class="w-7 h-7 bg-orange-200 rounded-full text-orange-700 font-bold hover:bg-orange-300 transition">-</button>
                <span class="w-5 text-center font-bold">${item.qty}</span>
                <button onclick="changeQty(${idx}, 1)" class="w-7 h-7 bg-orange-600 rounded-full text-white font-bold hover:bg-orange-700 transition">+</button>
            </div>
        `;
        cartItems.appendChild(div);
    });
}

function addToCart(name, price) {
    const existing = cart.find(i => i.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, price, qty: 1 });
    }
    updateCartUI();
    showToast(`${name} ditambahkan ke keranjang`, 'bg-orange-600');
}

function changeQty(idx, delta) {
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    updateCartUI();
}

function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    const isOpen = !sidebar.classList.contains('translate-x-full');
    if (isOpen) {
        sidebar.classList.add('translate-x-full');
        overlay.classList.add('hidden');
    } else {
        sidebar.classList.remove('translate-x-full');
        overlay.classList.remove('hidden');
    }
}

// =====================
// ORDER MODAL
// =====================
function openOrderModal() {
    const summary = document.getElementById('orderSummary');
    const totalEl = document.getElementById('orderTotalModal');
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

    summary.innerHTML = cart.map(i =>
        `<div class="flex justify-between"><span>${i.name} x${i.qty}</span><span>${formatPrice(i.price * i.qty)}</span></div>`
    ).join('');
    totalEl.textContent = formatPrice(total);

    document.getElementById('orderModal').classList.remove('hidden');
    toggleCart(); // tutup cart sidebar
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.add('hidden');
}

// =====================
// SUBMIT ORDER
// =====================
async function submitOrder(e) {
    e.preventDefault();

    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const type = document.getElementById('orderType').value;
    const note = document.getElementById('orderNote').value.trim();
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

    const orderData = {
        action: 'order',
        name,
        phone,
        type,
        note,
        items: cart.map(i => `${i.name} x${i.qty}`).join(', '),
        total
    };

    // Loading state
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitSpinner = document.getElementById('submitSpinner');
    submitBtn.disabled = true;
    submitText.textContent = 'Mengirim...';
    submitSpinner.classList.remove('hidden');

    try {
        if (APPS_SCRIPT_URL === 'YOUR_WEB_APP_URL') {
            // Simulasi jika belum dikonfigurasi
            await new Promise(r => setTimeout(r, 1000));
            throw new Error('Apps Script URL belum dikonfigurasi');
        }

        await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });

        // Sukses
        cart = [];
        updateCartUI();
        closeOrderModal();
        document.getElementById('orderForm').reset();
        showToast('Pesanan berhasil dikirim! Kami akan segera memproses.', 'bg-green-600', 4000);

    } catch (err) {
        console.error(err);
        showToast('Gagal mengirim pesanan. Coba lagi.', 'bg-red-600', 3000);
    } finally {
        submitBtn.disabled = false;
        submitText.textContent = 'Konfirmasi Pesanan';
        submitSpinner.classList.add('hidden');
    }
}

// =====================
// TOAST NOTIFICATION
// =====================
function showToast(msg, colorClass = 'bg-green-600', duration = 2500) {
    const toast = document.getElementById('successToast');
    const toastMsg = document.getElementById('toastMsg');
    toast.className = `fixed top-6 left-1/2 -translate-x-1/2 ${colorClass} text-white px-6 py-3 rounded-full shadow-lg z-50 transition`;
    toastMsg.textContent = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), duration);
}

// Fungsi untuk format harga
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price);
}

// Fungsi untuk membuat card menu
function createMenuCard(item) {
    const card = document.createElement('div');
    card.className = 'menu-card bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition flex flex-col reveal';

    card.innerHTML = `
        <div class="relative overflow-hidden">
            <img src="${item.image && item.image.trim() ? item.image.trim() : 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&q=80'}"
                 alt="${item.name}"
                 class="card-img w-full h-36 md:h-52 object-cover">
            ${item.isAvailable === 'Tidak' ? '<div class="absolute inset-0 bg-black/60 flex items-center justify-center"><span class="bg-white/20 backdrop-blur text-white font-bold text-sm px-4 py-1.5 rounded-full border border-white/30">Habis</span></div>' : ''}
            <div class="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/20 to-transparent"></div>
        </div>
        <div class="p-3 md:p-5 flex flex-col flex-1">
            <h3 class="font-display text-sm md:text-lg text-gray-800 mb-1 leading-tight">${item.name}</h3>
            <p class="text-gray-400 text-xs md:text-sm mb-3 line-clamp-2 flex-1 leading-relaxed">${item.description}</p>
            <div class="flex items-center justify-between gap-2 mt-auto pt-3 border-t border-gray-100">
                <div>
                    <p class="text-xs text-gray-400 leading-none mb-0.5">Harga</p>
                    <span class="text-sm md:text-base font-bold text-amber-600">${formatPrice(item.price)}</span>
                </div>
                ${item.isAvailable !== 'Tidak' ?
                    `<button onclick="addToCart('${item.name.replace(/'/g, "\\'")}', ${item.price})"
                        class="bg-amber-400 text-red-900 px-3 md:px-4 py-2 rounded-xl hover:bg-amber-300 transition text-xs md:text-sm font-semibold shrink-0 shadow-sm">
                        <i class="fas fa-plus md:mr-1"></i><span class="hidden md:inline">Tambah</span>
                    </button>` :
                    '<span class="text-xs text-gray-400 bg-gray-100 px-3 py-2 rounded-xl">Habis</span>'
                }
            </div>
        </div>
    `;

    return card;
}

// Fungsi untuk memuat data dari Google Apps Script
async function loadMenuFromSheets() {
    const loading = document.getElementById('loading');
    const menuGrid = document.getElementById('menuGrid');
    const error = document.getElementById('error');
    
    // Cek apakah URL sudah dikonfigurasi
    if (APPS_SCRIPT_URL === 'YOUR_WEB_APP_URL') {
        console.warn('Apps Script URL belum dikonfigurasi, menggunakan menu dummy');
        loading.classList.add('hidden');
        loadDummyMenu();
        return;
    }
    
    try {
        const response = await fetch(APPS_SCRIPT_URL);
        
        if (!response.ok) {
            throw new Error('Gagal mengambil data');
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Gagal memuat data');
        }
        
        const menuItems = result.data;
        
        // Tampilkan menu
        loading.classList.add('hidden');
        menuGrid.classList.remove('hidden');
        
        if (menuItems.length === 0) {
            error.classList.remove('hidden');
            error.innerHTML = `
                <i class="fas fa-info-circle text-4xl text-orange-600"></i>
                <p class="mt-4 text-gray-600">Belum ada menu tersedia</p>
            `;
            return;
        }
        
        menuItems.forEach(item => {
            const card = createMenuCard(item);
            menuGrid.appendChild(card);
        });
        
    } catch (err) {
        console.error('Error:', err);
        loading.classList.add('hidden');
        error.classList.remove('hidden');
        
        // Fallback: tampilkan menu dummy jika gagal load dari sheets
        loadDummyMenu();
    }
}

// Fungsi untuk memuat menu dummy (fallback)
function loadDummyMenu() {
    const menuGrid = document.getElementById('menuGrid');
    const error = document.getElementById('error');
    
    error.classList.add('hidden');
    menuGrid.classList.remove('hidden');
    
    const dummyMenu = [
        {
            name: 'Nasi Krawu Komplit',
            description: 'Nasi putih dengan daging sapi krawu, sambal terasi,telur dan serundeng',
            price: 25000,
            // Photo: Indonesian rice with beef and coconut flakes (Unsplash - free to use)
            image: 'https://foryourplate.id/wp-content/uploads/2025/05/Nasi-krawu.webp',
            isAvailable: 'Ya'
        },
        {
            name: 'Nasi Krawu Biasa',
            description: 'Nasi putih dengan daging sapi krawu dan sambal terasi',
            price: 20000,
            // Photo: Rice with beef dish (Unsplash - free to use)
            image: 'https://i.ytimg.com/vi/RqWZDGZVChg/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBp__aH-lDkQRgcXzlhIfvSU3UiMg',
            isAvailable: 'Ya'
        },
        {
            name: 'Nasi Krawu Jumbo',
            description: 'Porsi besar dengan daging sapi krawu extra, sambal, dan serundeng',
            price: 35000,
            // Photo: Large rice plate with meat (Unsplash - free to use)
            image: 'https://javanologi.uns.ac.id/wp-content/uploads/sites/26/2023/04/Resep-Nasi-Krawu-Khas-Gresik-Jawa-Timur-min-min.jpg',
            isAvailable: 'Ya'
        },
        {
            name: 'kerupuk',
            description: 'Kerupuk ikan',
            price: 5000,
            // Photo: Beef satay skewers (Unsplash - free to use)
            image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRV32luA9MRhVSg3OZOYZO01L5RyHDPEWxgHQ&s',
            isAvailable: 'Ya'
        },
        {
            name: 'Es Teh Manis',
            description: 'Teh manis dingin segar',
            price: 5000,
            // Photo: Iced tea glass (Unsplash - free to use)
            image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80',
            isAvailable: 'Ya'
        },
        {
            name: 'Es Jeruk',
            description: 'Jeruk peras segar dengan es',
            price: 8000,
            // Photo: Fresh orange juice with ice (Unsplash - free to use)
            image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=600&q=80',
            isAvailable: 'Ya'
        }
    ];
    
    dummyMenu.forEach(item => {
        const card = createMenuCard(item);
        menuGrid.appendChild(card);
    });
}

// Toggle mobile menu
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const icon = document.getElementById('menuIcon');
    menu.classList.toggle('hidden');
    icon.className = menu.classList.contains('hidden') ? 'fas fa-bars text-xl' : 'fas fa-times text-xl';
}

// Smooth scroll untuk navigasi
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Load menu saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    loadMenuFromSheets();

    // Scroll reveal
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(el => {
            if (el.isIntersecting) { el.target.classList.add('visible'); }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // Re-observe after menu loads (dynamic cards)
    const menuGrid = document.getElementById('menuGrid');
    const mutObs = new MutationObserver(() => {
        menuGrid.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
    });
    mutObs.observe(menuGrid, { childList: true });
});
