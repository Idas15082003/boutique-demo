// ============================================================================
// AAROHI BOUTIQUE - STANDALONE INTERACTIVE E-COMMERCE & DELIVERY ENGINE
// Uses browser LocalStorage so orders placed on index.html immediately show up
// in admin.html and track.html just by double-clicking the files!
// ============================================================================

const DEFAULT_PRODUCTS = [
    {
        id: "kurti-001",
        title: "Handloom Cotton Embroidered Anarkali Set",
        category: "Anarkali",
        price: 1499,
        originalPrice: 2199,
        description: "Pure breathable Mulmul cotton Anarkali set with intricate thread work on the yoke and sleeves. Comes with matching cotton pants and a 2.25m dupatta.",
        images: [
            "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80"
        ],
        variants: [
            { size: "S", stock: 4 },
            { size: "M", stock: 8 },
            { size: "L", stock: 0 },
            { size: "XL", stock: 2 },
            { size: "XXL", stock: 5 }
        ]
    },
    {
        id: "saree-002",
        title: "Banarasi Tissue Silk Zari Border Saree",
        category: "Sarees",
        price: 2299,
        originalPrice: 3499,
        description: "Lightweight festive tissue silk saree with rich Banarasi zari weave border and unstitched brocade blouse piece.",
        images: [
            "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=800&q=80"
        ],
        variants: [
            { size: "Free Size", stock: 10 }
        ]
    },
    {
        id: "kurti-003",
        title: "Jaipuri Block Print Straight Kurta Pant Set",
        category: "Kurtis",
        price: 999,
        originalPrice: 1499,
        description: " Everyday comfort 60x60 cambric cotton straight fit kurta with afghani pants and lace detailing.",
        images: [
            "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80"
        ],
        variants: [
            { size: "S", stock: 3 },
            { size: "M", stock: 5 },
            { size: "L", stock: 6 },
            { size: "XL", stock: 4 }
        ]
    },
    {
        id: "coord-004",
        title: "Indigo Muslin Printed Festive Co-ord Set",
        category: "Coord",
        price: 1350,
        originalPrice: 1999,
        description: "Trendy collar neck muslin silk top and matching palazzos with pocket.",
        images: [
            "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80"
        ],
        variants: [
            { size: "M", stock: 4 },
            { size: "L", stock: 3 },
            { size: "XL", stock: 2 }
        ]
    }
];

const DEFAULT_ORDERS = [
    {
        orderId: "#ORD-1001",
        customerName: "Sneha Chatterjee",
        phone: "9876543210",
        city: "Kolkata, West Bengal",
        pincode: "700032",
        address: "Flat 4B, Lake Gardens, Near Lords More",
        itemTitle: "Handloom Cotton Embroidered Anarkali Set",
        size: "M",
        amount: 1499,
        paymentMode: "PREPAID",
        courier: "Delhivery Surface",
        awb: "DLV78291044",
        expectedDate: "In 2 Days",
        stepIndex: 2 // 0: Placed, 1: Packed, 2: In Transit, 3: Out for Delivery, 4: Delivered
    },
    {
        orderId: "#ORD-1002",
        customerName: "Riya Sen",
        phone: "9123456780",
        city: "Durgapur, West Bengal",
        pincode: "713216",
        address: "Sector 2A, Bidhannagar",
        itemTitle: "Banarasi Tissue Silk Zari Border Saree",
        size: "Free Size",
        amount: 2369,
        paymentMode: "COD",
        courier: "BlueDart Express",
        awb: "BD99201148",
        expectedDate: "In 4 Days",
        stepIndex: 0
    }
];

const DELIVERY_STAGES = [
    { title: "Order Confirmed", location: "Online Storefront" },
    { title: "Packed & AWB Label Generated", location: "Boutique Dispatch Hub" },
    { title: "In Transit via Courier", location: "Regional Sorting Hub" },
    { title: "Out for Delivery", location: "Local Delivery Center" },
    { title: "Delivered to Customer", location: "Handed over to consignee" }
];

// --- Storage Helpers ---
function getProducts() {
    const saved = localStorage.getItem("boutique_products");
    if (!saved) {
        localStorage.setItem("boutique_products", JSON.stringify(DEFAULT_PRODUCTS));
        return DEFAULT_PRODUCTS;
    }
    return JSON.parse(saved);
}

function getOrders() {
    const saved = localStorage.getItem("boutique_orders");
    if (!saved) {
        localStorage.setItem("boutique_orders", JSON.stringify(DEFAULT_ORDERS));
        return DEFAULT_ORDERS;
    }
    return JSON.parse(saved);
}

function saveOrders(orders) {
    localStorage.setItem("boutique_orders", JSON.stringify(orders));
}

// --- Active State on Storefront ---
let currentProduct = getProducts()[0];
let selectedSize = currentProduct.variants[0].size;
let currentPaymentMode = "PREPAID";

// ============================================================================
// 1. STOREFRONT LOGIC (index.html)
// ============================================================================
function renderFeaturedProduct() {
    if (!document.getElementById("productTitle")) return;

    document.getElementById("mainProductImg").src = currentProduct.images[0];
    document.getElementById("productTitle").textContent = currentProduct.title;
    document.getElementById("productPrice").textContent = "₹" + currentProduct.price;
    document.getElementById("productOriginalPrice").textContent = "₹" + currentProduct.originalPrice;
    document.getElementById("productDesc").textContent = currentProduct.description;

    // Thumbnails
    const thumbContainer = document.getElementById("thumbnailContainer");
    thumbContainer.innerHTML = currentProduct.images.map((img, i) => `
        <button onclick="changeMainImage('${img}')" class="w-16 h-20 rounded-xl overflow-hidden border-2 border-rose-600 flex-shrink-0">
            <img src="${img}" class="w-full h-full object-cover">
        </button>
    `).join("");

    // Select first available size if current isn't valid
    const availableVar = currentProduct.variants.find(v => v.stock > 0) || currentProduct.variants[0];
    if (!currentProduct.variants.some(v => v.size === selectedSize && v.stock > 0)) {
        selectedSize = availableVar.size;
    }
    document.getElementById("selectedSizeLabel").textContent = selectedSize;

    // Render Size Buttons
    const sizeContainer = document.getElementById("sizeButtonsContainer");
    sizeContainer.innerHTML = currentProduct.variants.map(v => {
        const out = v.stock === 0;
        const active = v.size === selectedSize;
        return `
            <button ${out ? "disabled" : ""} onclick="selectSize('${v.size}')"
                class="px-4 h-11 rounded-xl font-bold text-sm border transition ${
                    out ? "bg-gray-100 text-gray-400 border-gray-200 line-through cursor-not-allowed" :
                    active ? "bg-rose-600 text-white border-rose-600 shadow" :
                    "bg-white text-gray-800 border-gray-300 hover:border-rose-600"
                }">
                ${v.size}
            </button>
        `;
    }).join("");

    // Low stock indicator
    const currVarObj = currentProduct.variants.find(v => v.size === selectedSize);
    const lowStockEl = document.getElementById("lowStockWarning");
    if (currVarObj && currVarObj.stock > 0 && currVarObj.stock <= 3) {
        lowStockEl.textContent = `🔥 Hurry! Only ${currVarObj.stock} pieces left in size ${selectedSize}`;
        lowStockEl.classList.remove("hidden");
    } else {
        lowStockEl.classList.add("hidden");
    }

    // WhatsApp link
    const waText = encodeURIComponent(`Hi! I want to order *${currentProduct.title}* in Size *${selectedSize}* (Price: ₹${currentProduct.price})`);
    document.getElementById("whatsappOrderLink").href = `https://wa.me/919876543210?text=${waText}`;

    updateCartDrawerInfo();
}

function changeMainImage(src) {
    document.getElementById("mainProductImg").src = src;
}

function selectSize(size) {
    selectedSize = size;
    renderFeaturedProduct();
}

function renderCatalog(filterCat = "All") {
    const grid = document.getElementById("catalogGrid");
    if (!grid) return;

    const products = getProducts().filter(p => filterCat === "All" || p.category === filterCat);
    grid.innerHTML = products.map(p => `
        <div onclick="loadProductIntoView('${p.id}')" class="bg-white rounded-2xl border border-gray-200 overflow-hidden cursor-pointer group hover:shadow-md transition">
            <div class="aspect-[3/4] bg-gray-100 overflow-hidden relative">
                <img src="${p.images[0]}" class="w-full h-full object-cover group-hover:scale-105 transition duration-300">
                <span class="absolute bottom-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    ${p.category}
                </span>
            </div>
            <div class="p-3">
                <h4 class="text-xs font-bold text-gray-900 line-clamp-1">${p.title}</h4>
                <div class="flex items-baseline gap-2 mt-1">
                    <span class="text-sm font-extrabold text-rose-600">₹${p.price}</span>
                    <span class="text-xs text-gray-400 line-through">₹${p.originalPrice}</span>
                </div>
            </div>
        </div>
    `).join("");
}

function filterCategory(cat) {
    renderCatalog(cat);
    document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });
}

function loadProductIntoView(prodId) {
    const found = getProducts().find(p => p.id === prodId);
    if (found) {
        currentProduct = found;
        selectedSize = found.variants[0].size;
        renderFeaturedProduct();
        document.getElementById("featured").scrollIntoView({ behavior: "smooth" });
    }
}

function checkPincodeService(e) {
    e.preventDefault();
    const pin = document.getElementById("pincodeInput").value.trim();
    const resBox = document.getElementById("deliveryResult");
    if (pin.length !== 6) {
        resBox.innerHTML = `<p class="text-rose-600 font-bold">Please enter a valid 6-digit Indian Pincode.</p>`;
        resBox.classList.remove("hidden");
        return;
    }
    resBox.innerHTML = `
        <p class="text-green-700 font-bold">✓ Express Delivery available for Pincode ${pin} (Est: 3–5 Days)</p>
        <p class="text-gray-600">✓ Cash on Delivery (COD) & Free UPI Shipping supported via Delhivery / BlueDart</p>
    `;
    resBox.classList.remove("hidden");
}

function toggleSizeChart(show) {
    const modal = document.getElementById("sizeChartModal");
    if (show) {
        modal.classList.remove("hidden");
        modal.classList.add("flex");
    } else {
        modal.classList.add("hidden");
        modal.classList.remove("flex");
    }
}

// --- Cart & 1-Step Guest Checkout ---
function toggleCart(open) {
    const drawer = document.getElementById("cartDrawer");
    if (!drawer) return;
    updateCartDrawerInfo();
    if (open) {
        drawer.classList.remove("hidden");
        drawer.classList.add("flex");
    } else {
        drawer.classList.add("hidden");
        drawer.classList.remove("flex");
    }
}

function buyNowCurrentProduct() {
    toggleCart(true);
}

function setPaymentMethod(mode) {
    currentPaymentMode = mode;
    document.getElementById("radioPrepaid").checked = (mode === "PREPAID");
    document.getElementById("radioCod").checked = (mode === "COD");

    document.getElementById("lblPrepaid").className = mode === "PREPAID"
        ? "flex items-center justify-between p-3 border border-rose-600 bg-rose-50/40 rounded-xl cursor-pointer"
        : "flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer";

    document.getElementById("lblCod").className = mode === "COD"
        ? "flex items-center justify-between p-3 border border-rose-600 bg-rose-50/40 rounded-xl cursor-pointer"
        : "flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer";

    updateCartDrawerInfo();
}

function updateCartDrawerInfo() {
    if (!document.getElementById("cartItemTitle")) return;
    document.getElementById("cartItemImg").src = currentProduct.images[0];
    document.getElementById("cartItemTitle").textContent = currentProduct.title;
    document.getElementById("cartItemSize").textContent = selectedSize;
    document.getElementById("cartItemPrice").textContent = "₹" + currentProduct.price;

    const prepaidTotal = currentProduct.price;
    const codTotal = currentProduct.price + 70;
    const finalAmount = currentPaymentMode === "PREPAID" ? prepaidTotal : codTotal;

    document.getElementById("prepaidPriceLabel").textContent = "₹" + prepaidTotal;
    document.getElementById("codPriceLabel").textContent = "₹" + codTotal;
    document.getElementById("finalPayableLabel").textContent = "₹" + finalAmount;
    document.getElementById("submitOrderBtn").textContent = currentPaymentMode === "PREPAID"
        ? `Pay ₹${finalAmount} via UPI & Place Order`
        : `Confirm COD Order (₹${finalAmount})`;
}

async function autoFillCityState(pin) {
    const cleanPin = pin.replace(/\D/g, "");
    document.getElementById("custPincode").value = cleanPin;
    if (cleanPin.length === 6) {
        try {
            const res = await fetch(`https://api.postalpincode.in/pincode/${cleanPin}`);
            const data = await res.json();
            if (data && data[0] && data[0].Status === "Success") {
                const po = data[0].PostOffice[0];
                document.getElementById("custCity").value = `${po.District}, ${po.State}`;
            }
        } catch (err) {
            // Fallback if offline
            if (!document.getElementById("custCity").value) {
                document.getElementById("custCity").value = "Kolkata, West Bengal";
            }
        }
    }
}

function placeCustomerOrder(e) {
    e.preventDefault();
    const orders = getOrders();
    const nextNum = 1001 + orders.length;
    const newOrderId = `#ORD-${nextNum}`;
    const finalAmt = currentPaymentMode === "PREPAID" ? currentProduct.price : currentProduct.price + 70;

    const newOrder = {
        orderId: newOrderId,
        customerName: document.getElementById("custName").value.trim(),
        phone: document.getElementById("custPhone").value.trim(),
        pincode: document.getElementById("custPincode").value.trim(),
        city: document.getElementById("custCity").value.trim() || "India",
        address: document.getElementById("custAddress").value.trim(),
        itemTitle: currentProduct.title,
        size: selectedSize,
        amount: finalAmt,
        paymentMode: currentPaymentMode,
        courier: "Delhivery Express",
        awb: "DLV" + Math.floor(10000000 + Math.random() * 90000000),
        expectedDate: "In 4 Days",
        stepIndex: 0
    };

    orders.unshift(newOrder);
    saveOrders(orders);

    toggleCart(false);
    // Redirect straight to tracking page with the new Order ID!
    window.location.href = `track.html?order=${encodeURIComponent(newOrderId)}`;
}

// ============================================================================
// 2. ORDER TRACKING PAGE LOGIC (track.html)
// ============================================================================
function handleOrderSearch(e) {
    e.preventDefault();
    const query = document.getElementById("trackSearchInput").value.trim();
    if (!query) return;
    renderTrackingCard(query);
}

function quickTrack(orderId) {
    document.getElementById("trackSearchInput").value = orderId;
    renderTrackingCard(orderId);
}

function renderTrackingCard(query) {
    const container = document.getElementById("trackingContainer");
    if (!container) return;

    const cleanQ = query.toLowerCase();
    const found = getOrders().find(
        o => o.orderId.toLowerCase() === cleanQ ||
             o.orderId.replace("#", "").toLowerCase() === cleanQ ||
             o.phone === cleanQ
    );

    if (!found) {
        container.innerHTML = `
            <div class="bg-white border border-rose-200 rounded-2xl p-6 text-center text-sm text-rose-700 font-semibold">
                No order found matching "${query}". Try <strong>#ORD-1001</strong> or place a test order from the Shop page!
            </div>
        `;
        return;
    }

    const stepsHtml = DELIVERY_STAGES.map((st, idx) => {
        const done = idx <= found.stepIndex;
        return `
            <div class="relative flex items-start gap-4">
                <div class="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                    done ? "bg-rose-600 text-white shadow" : "bg-gray-200 text-gray-500"
                }">
                    ${done ? "✓" : idx + 1}
                </div>
                <div class="flex-1 pb-5 border-b border-gray-100">
                    <h4 class="text-sm font-bold ${done ? "text-gray-900" : "text-gray-400"}">${st.title}</h4>
                    <p class="text-xs ${done ? "text-rose-600 font-semibold" : "text-gray-400"}">${st.location}</p>
                </div>
            </div>
        `;
    }).join("");

    container.innerHTML = `
        <div class="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div class="flex justify-between items-start border-b pb-4 mb-6">
                <div>
                    <span class="text-[11px] font-bold uppercase text-rose-600">${found.paymentMode} ORDER • ₹${found.amount}</span>
                    <h3 class="text-lg font-extrabold text-gray-900">${found.orderId} — ${found.customerName}</h3>
                    <p class="text-xs text-gray-600 mt-0.5">${found.itemTitle} (Size: <strong>${found.size}</strong>)</p>
                    <p class="text-xs text-gray-500 mt-1">Courier: <strong>${found.courier}</strong> | AWB: <span class="font-mono bg-gray-100 px-1.5 py-0.5 rounded">${found.awb}</span></p>
                </div>
                <span class="text-xs bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full">
                    Est: ${found.expectedDate}
                </span>
            </div>
            <div class="space-y-4">
                ${stepsHtml}
            </div>
        </div>
    `;
}

// ============================================================================
// 3. SHOP OWNER ADMIN PANEL LOGIC (admin.html)
// ============================================================================
function renderAdminDashboard() {
    const listEl = document.getElementById("adminOrdersList");
    if (!listEl) return;

    const orders = getOrders();
    document.getElementById("statTotalOrders").textContent = orders.length;
    document.getElementById("statPendingOrders").textContent = orders.filter(o => o.stepIndex <= 1).length;
    document.getElementById("statShippedOrders").textContent = orders.filter(o => o.stepIndex >= 2).length;

    listEl.innerHTML = orders.map((o, idx) => `
        <div class="border border-gray-200 rounded-2xl p-4 bg-gray-50/60 flex flex-col md:flex-row justify-between gap-4">
            <div class="space-y-1">
                <div class="flex items-center gap-2">
                    <span class="font-extrabold text-sm text-gray-900">${o.orderId}</span>
                    <span class="text-[10px] font-extrabold px-2 py-0.5 rounded ${
                        o.paymentMode === "PREPAID" ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                    }">${o.paymentMode} • ₹${o.amount}</span>
                    <span class="text-xs text-gray-500 font-mono">AWB: ${o.awb}</span>
                </div>
                <p class="text-sm font-bold text-rose-600">${o.itemTitle} (Size: ${o.size})</p>
                <p class="text-xs text-gray-700"><strong>Customer:</strong> ${o.customerName} (${o.phone})</p>
                <p class="text-xs text-gray-500"><strong>Address:</strong> ${o.address}, ${o.city} - ${o.pincode}</p>
            </div>

            <div class="flex flex-col justify-between items-end gap-2 min-w-[210px]">
                <div class="w-full">
                    <label class="text-[10px] font-bold uppercase text-gray-500 block mb-1">Update Delivery Stage:</label>
                    <select onchange="updateOrderStage(${idx}, this.value)" class="w-full text-xs font-bold border border-gray-300 rounded-xl px-2.5 py-2 bg-white">
                        ${DELIVERY_STAGES.map((st, sIdx) => `
                            <option value="${sIdx}" ${o.stepIndex === sIdx ? "selected" : ""}>
                                ${sIdx + 1}. ${st.title}
                            </option>
                        `).join("")}
                    </select>
                </div>
                <div class="flex gap-2 w-full">
                    <button onclick="openShippingLabel(${idx})" class="flex-1 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl">
                        🖨️ Print Label
                    </button>
                    <a href="track.html?order=${encodeURIComponent(o.orderId)}" class="px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl">
                        View Track
                    </a>
                </div>
            </div>
        </div>
    `).join("");
}

function updateOrderStage(orderIdx, newStep) {
    const orders = getOrders();
    orders[orderIdx].stepIndex = parseInt(newStep, 10);
    saveOrders(orders);
    renderAdminDashboard();
}

function openShippingLabel(orderIdx) {
    const o = getOrders()[orderIdx];
    document.getElementById("lblCourierName").textContent = o.courier;
    document.getElementById("lblPayType").textContent = o.paymentMode;
    document.getElementById("lblCustName").textContent = o.customerName;
    document.getElementById("lblCustAddress").textContent = `${o.address}, ${o.city} - ${o.pincode}`;
    document.getElementById("lblCustPhone").textContent = `Phone: +91 ${o.phone}`;
    document.getElementById("lblItemName").textContent = `${o.itemTitle} (Size: ${o.size})`;
    document.getElementById("lblAmount").textContent = o.paymentMode === "COD" ? `₹${o.amount} (Collect Cash)` : "₹0 (Prepaid)";
    document.getElementById("lblAwb").textContent = `AWB: ${o.awb}`;

    const modal = document.getElementById("labelModal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
}

function closeLabelModal() {
    const modal = document.getElementById("labelModal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
}

function handleAddProduct(e) {
    e.preventDefault();
    const products = getProducts();
    const newProd = {
        id: "prod-" + Date.now(),
        title: document.getElementById("newProdTitle").value.trim(),
        price: parseInt(document.getElementById("newProdPrice").value, 10),
        originalPrice: parseInt(document.getElementById("newProdMrp").value, 10),
        category: document.getElementById("newProdCat").value,
        description: "Newly uploaded boutique collection piece. Ready to ship across India.",
        images: [document.getElementById("newProdImg").value.trim() || DEFAULT_PRODUCTS[0].images[0]],
        variants: [
            { size: "S", stock: 5 },
            { size: "M", stock: 5 },
            { size: "L", stock: 5 },
            { size: "XL", stock: 5 }
        ]
    };
    products.unshift(newProd);
    localStorage.setItem("boutique_products", JSON.stringify(products));
    alert("Outfit added! Opening storefront to view it.");
    window.location.href = "index.html";
}

// --- Initialize on Page Load ---
window.addEventListener("DOMContentLoaded", () => {
    if (window.lucide) lucide.createIcons();
    renderFeaturedProduct();
    renderCatalog("All");
    renderAdminDashboard();

    // Auto-load order on track.html if passed in URL (?order=#ORD-1001)
    const params = new URLSearchParams(window.location.search);
    const orderParam = params.get("order");
    if (orderParam && document.getElementById("trackSearchInput")) {
        document.getElementById("trackSearchInput").value = orderParam;
        renderTrackingCard(orderParam);
    } else if (document.getElementById("trackingContainer")) {
        renderTrackingCard("#ORD-1001");
    }
});
