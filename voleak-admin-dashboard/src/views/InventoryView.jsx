import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuthRole } from '../context/AuthRoleContext';
import {
  fetchProducts,
  fetchBranchStock,
  fetchStockMovements,
  fetchCooperatorStock,
  addLocalProduct,
  updateLocalProduct,
  deleteLocalProduct,
  addLocalBranchStock,
  updateLocalBranchStock,
  deleteLocalBranchStock,
  addLocalCooperatorStock,
  updateLocalCooperatorStock,
  deleteLocalCooperatorStock,
  addLocalStockMovement,
  seedTopSportsTextileToSupabase,
  TOP_SPORTS_TEXTILE_PRODUCTS,
  TOP_SPORTS_TEXTILE_BRANCH_STOCK,
  TOP_SPORTS_TEXTILE_MOVEMENTS,
  TOP_SPORTS_TEXTILE_COOP_STOCK,
} from '../lib/supabaseClient';
import {
  Boxes,
  Package,
  Warehouse,
  Store,
  AlertTriangle,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Search,
  ArrowRightLeft,
  SlidersHorizontal,
  Download,
  Barcode,
  Layers,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Plus,
  Minus,
  RefreshCw,
  Eye,
  DollarSign,
  ShieldCheck,
  Building2,
  Truck,
  Sparkles,
  QrCode,
  FileSpreadsheet,
  Check,
  Tag,
  MapPin,
  Info,
  Upload,
  Image as ImageIcon,
  FileUp,
  Camera,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InventoryView({
  products = [],
  setProducts,
  branchStock = [],
  setBranchStock,
  stockMovements = [],
  setStockMovements,
  cooperatorStock = [],
  setCooperatorStock,
  operators = [],
  cooperators = [],
  onRefresh,
}) {
  const { t } = useLanguage();
  const { isAdmin, isManager, selectedBranchId, currentUser } = useAuthRole();

  // Navigation & View States
  const [activeTab, setActiveTab] = useState('branch'); // 'branch', 'catalog'
  const [searchVal, setSearchVal] = useState('');
  const [selectedHubFilter, setSelectedHubFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [healthFilter, setHealthFilter] = useState('all'); // 'all', 'healthy', 'low', 'out'
  const [catalogViewMode, setCatalogViewMode] = useState('grid'); // 'grid', 'table'
  const [toastMessage, setToastMessage] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncDatabase = async () => {
    setIsSyncing(true);
    try {
      const [freshProducts, freshStock, freshMovements, freshCoop] = await Promise.all([
        fetchProducts(),
        fetchBranchStock(),
        fetchStockMovements(),
        fetchCooperatorStock(),
      ]);
      setProducts(freshProducts || []);
      setBranchStock(freshStock || []);
      setStockMovements(freshMovements || []);
      setCooperatorStock(freshCoop || []);
      if (onRefresh) {
        await onRefresh();
      }
      showToast(`⚡ Synced with Supabase: ${freshProducts?.length || 0} Products, ${freshStock?.length || 0} Stock records.`);
    } catch (err) {
      console.warn('Sync error', err);
      showToast('⚠️ Sync failed. Please verify Supabase connection.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleResetTopSportsTextile = async () => {
    if (!window.confirm('Do you want to reload and sync the complete Top Sports Textile (TST Group) product catalog?')) {
      return;
    }
    setIsSyncing(true);
    try {
      const resetProds = await seedTopSportsTextileToSupabase();
      setProducts(resetProds || []);
      setBranchStock(TOP_SPORTS_TEXTILE_BRANCH_STOCK);
      setStockMovements(TOP_SPORTS_TEXTILE_MOVEMENTS);
      setCooperatorStock(TOP_SPORTS_TEXTILE_COOP_STOCK);
      if (onRefresh) {
        await onRefresh();
      }
      showToast('🏆 Top Sports Textile (TST Group) Catalog & Categories Loaded Successfully!');
    } catch (err) {
      console.warn('Reset error', err);
      showToast('⚠️ Reset error. Fallback catalog loaded.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Modals for CRUD
  // 1. Product CRUD
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProductConfirm, setDeleteProductConfirm] = useState(null);

  // 2. Branch Stock CRUD
  const [stockDetailModal, setStockDetailModal] = useState(null);
  const [assignStockModalOpen, setAssignStockModalOpen] = useState(false);
  const [editBranchStockModal, setEditBranchStockModal] = useState(null);
  const [deleteStockConfirm, setDeleteStockConfirm] = useState(null);

  // 3. Quick Operations (Restock, Transfer, Adjust)
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);

  // 4. Cooperator Consignment CRUD
  const [coopStockModalOpen, setCoopStockModalOpen] = useState(false);
  const [editingCoopStock, setEditingCoopStock] = useState(null);
  const [deleteCoopStockConfirm, setDeleteCoopStockConfirm] = useState(null);

  // 5. Barcode Modal
  const [barcodeModalItem, setBarcodeModalItem] = useState(null);

  // Form States
  const [productForm, setProductForm] = useState({
    name: '',
    sku: '',
    barcode: '',
    category: 'Functional Performance Fabrics (ក្រណាត់មុខងារពិសេស)',
    unit: 'Roll (50m)',
    default_price: 185.0,
    cost_price: 120.0,
    min_stock_alert: 15,
    warehouse_location: 'Fabric Bay A-1',
    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80',
    description: '',
    initial_hub_id: 'op-1',
    initial_stock_qty: 50,
  });

  const [assignStockForm, setAssignStockForm] = useState({
    product_id: '',
    branch_id: 'op-1',
    on_hand_quantity: 50,
    reserved_quantity: 0,
    warehouse_location: 'Rack A-01',
  });

  const [editStockForm, setEditStockForm] = useState({
    id: '',
    product_id: '',
    branch_id: '',
    on_hand_quantity: 0,
    reserved_quantity: 0,
    warehouse_location: '',
  });

  const [coopStockForm, setCoopStockForm] = useState({
    cooperator_id: '',
    product_id: '',
    quantity: 50,
    unit: 'Roll (50m)',
  });

  const [restockForm, setRestockForm] = useState({
    product_id: '',
    branch_id: 'op-1',
    quantity: 50,
    unit_cost: 0,
    reference_no: '',
    supplier_name: 'Top Sports Textile Factory Mill',
    notes: '',
  });

  const [transferForm, setTransferForm] = useState({
    product_id: '',
    from_branch_id: 'op-1',
    to_branch_id: 'op-2',
    quantity: 20,
    waybill_ref: '',
    driver_name: 'Lead Haul Driver',
    notes: 'Inter-hub rebalance dispatch',
  });

  const [adjustForm, setAdjustForm] = useState({
    product_id: '',
    branch_id: 'op-1',
    adjustment_type: 'correction',
    quantity_delta: 0,
    reason: '',
  });

  // Hub / Operator List
  const defaultHubs = [
    { id: 'op-1', name: 'Phnom Penh Central Freight Hub', province: 'Phnom Penh' },
    { id: 'op-2', name: 'Sihanoukville Autonomous Port Depot', province: 'Preah Sihanouk' },
    { id: 'op-3', name: 'Bavet Border Special Economic Zone Terminal', province: 'Svay Rieng' },
    { id: 'op-4', name: 'Poipet SEZ Cargo Depot', province: 'Banteay Meanchey' },
    { id: 'op-5', name: 'Siem Reap Regional Freight Center', province: 'Siem Reap' },
  ];
  const hubs = operators && operators.length > 0 ? operators : defaultHubs;

  const categories = [
    'All Categories',
    'Functional Performance Fabrics (ក្រណាត់មុខងារពិសេស)',
    'Knitted Fabrics (ក្រណាត់ត្បាញយឺត)',
    'Spandex & Elastane Blends (ក្រណាត់អេឡាស្ទីន)',
    'Activewear & Training Tops (អាវកីឡា និងអាវហ្វឹកហាត់)',
    'Sport Bottoms (ខោកីឡា)',
    'Outerwear (អាវក្រៅកីឡា)',
  ];

  // Helper Toast
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper Finders
  const getProduct = (productId) => products.find((p) => p.id === productId) || {};
  const getHub = (hubId) => hubs.find((h) => h.id === hubId) || { name: 'Central Hub', province: 'Phnom Penh' };

  // Calculate KPIs
  const kpiStats = useMemo(() => {
    const totalSkus = products.length;
    let totalUnitsOnHand = 0;
    let totalValuation = 0;
    let lowStockCount = 0;

    const uniqueCategories = new Set(products.map((p) => p.category).filter(Boolean));
    const activeCategoryCount = uniqueCategories.size;

    const uniqueHubs = new Set(branchStock.map((bs) => bs.branch_id).filter(Boolean));
    const activeHubCount = uniqueHubs.size || (hubs?.length || 0);

    branchStock.forEach((bs) => {
      totalUnitsOnHand += bs.on_hand_quantity || 0;
      const prod = getProduct(bs.product_id);
      const cost = prod.cost_price || prod.default_price || 0;
      totalValuation += (bs.on_hand_quantity || 0) * cost;

      const available = Math.max(0, (bs.on_hand_quantity || 0) - (bs.reserved_quantity || 0));
      const minAlert = prod.min_stock_alert || 10;
      if (available <= minAlert) {
        lowStockCount++;
      }
    });

    return {
      totalSkus,
      totalUnitsOnHand,
      totalValuation,
      lowStockCount,
      activeCategoryCount,
      activeHubCount,
    };
  }, [products, branchStock, hubs]);

  // Filtered Hub Stock
  const filteredBranchStock = useMemo(() => {
    return branchStock.filter((bs) => {
      const prod = getProduct(bs.product_id);
      const hub = getHub(bs.branch_id);

      const matchesSearch =
        (prod.name && prod.name.toLowerCase().includes(searchVal.toLowerCase())) ||
        (prod.sku && prod.sku.toLowerCase().includes(searchVal.toLowerCase())) ||
        (prod.barcode && prod.barcode.toLowerCase().includes(searchVal.toLowerCase())) ||
        (hub.name && hub.name.toLowerCase().includes(searchVal.toLowerCase()));

      const matchesHub = selectedHubFilter === 'all' || bs.branch_id === selectedHubFilter;
      const matchesCategory =
        selectedCategoryFilter === 'all' ||
        selectedCategoryFilter === 'All Categories' ||
        prod.category === selectedCategoryFilter;

      const available = Math.max(0, (bs.on_hand_quantity || 0) - (bs.reserved_quantity || 0));
      const minAlert = prod.min_stock_alert || 10;
      let matchesHealth = true;
      if (healthFilter === 'healthy') matchesHealth = available > minAlert;
      else if (healthFilter === 'low') matchesHealth = available <= minAlert && available > 0;
      else if (healthFilter === 'out') matchesHealth = available === 0;

      return matchesSearch && matchesHub && matchesCategory && matchesHealth;
    });
  }, [branchStock, products, hubs, searchVal, selectedHubFilter, selectedCategoryFilter, healthFilter]);

  // Filtered Products Catalog
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchVal.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchVal.toLowerCase()) ||
        (p.barcode && p.barcode.toLowerCase().includes(searchVal.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(searchVal.toLowerCase()));

      const matchesCategory =
        selectedCategoryFilter === 'all' ||
        selectedCategoryFilter === 'All Categories' ||
        p.category === selectedCategoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, searchVal, selectedCategoryFilter]);

  // Filtered Movements
  const filteredMovements = useMemo(() => {
    return stockMovements.filter((m) => {
      const prod = getProduct(m.product_id);
      return (
        (prod.name && prod.name.toLowerCase().includes(searchVal.toLowerCase())) ||
        (m.reference_no && m.reference_no.toLowerCase().includes(searchVal.toLowerCase())) ||
        (m.reason && m.reason.toLowerCase().includes(searchVal.toLowerCase())) ||
        (m.operator_name && m.operator_name.toLowerCase().includes(searchVal.toLowerCase()))
      );
    });
  }, [stockMovements, products, searchVal]);

  // Filtered Cooperator Stock
  const filteredCoopStock = useMemo(() => {
    return cooperatorStock.filter((cs) => {
      const prod = getProduct(cs.product_id);
      const coop = cooperators.find((c) => c.id === cs.cooperator_id) || {};
      return (
        (prod.name && prod.name.toLowerCase().includes(searchVal.toLowerCase())) ||
        (coop.name && coop.name.toLowerCase().includes(searchVal.toLowerCase())) ||
        (coop.factory_name && coop.factory_name.toLowerCase().includes(searchVal.toLowerCase()))
      );
    });
  }, [cooperatorStock, products, cooperators, searchVal]);

  const [imageSourceMode, setImageSourceMode] = useState('file'); // 'file' | 'url' | 'presets'
  const [dragOverImage, setDragOverImage] = useState(false);

  const cargoImagePresets = [
    { label: 'Moisture Wicking Fabric', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80' },
    { label: 'Anti-UV Performance Knit', url: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=600&q=80' },
    { label: 'Anti-Bacterial Silver-Ion', url: 'https://images.unsplash.com/photo-1528458876861-544fd1761a91?auto=format&fit=crop&w=600&q=80' },
    { label: 'Single Jersey Knit', url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80' },
    { label: 'Double Jersey Heavy Knit', url: 'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=600&q=80' },
    { label: 'Interlock Smooth Double', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80' },
    { label: 'Rib Knit Collar Trims', url: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=600&q=80' },
    { label: 'Piqué & Mesh Honeycomb', url: 'https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&w=600&q=80' },
    { label: 'French Terry & Fleece', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80' },
    { label: '4-Way Poly-Spandex', url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80' },
    { label: 'Nylon-Spandex Yoga Blend', url: 'https://images.unsplash.com/photo-1574634534894-89d7576c8259?auto=format&fit=crop&w=600&q=80' },
    { label: 'Cotton-Spandex Stretch', url: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=600&q=80' },
    { label: 'Running Tees & Activewear', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80' },
    { label: 'Pro Soccer Team Jerseys', url: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=600&q=80' },
    { label: 'Athletic Basketball Jerseys', url: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?auto=format&fit=crop&w=600&q=80' },
    { label: 'Performance Sports Polo', url: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=600&q=80' },
    { label: 'Compression Leggings', url: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?auto=format&fit=crop&w=600&q=80' },
    { label: 'Performance Workout Shorts', url: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=600&q=80' },
    { label: 'Warm-Up Joggers & Track Pants', url: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=600&q=80' },
    { label: 'Long-Sleeve Compression Tops', url: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=600&q=80' },
    { label: 'Sports Hoodies & Fleece', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80' },
    { label: 'Warm-Up Tracksuit Jackets', url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80' },
  ];

  const processImageFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP, SVG, GIF).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB limit. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setProductForm((prev) => ({
        ...prev,
        image_url: event.target.result,
      }));
      showToast(`📸 Imported product image: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleImageDrop = (e) => {
    e.preventDefault();
    setDragOverImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  // ==========================================
  // CRUD 1: PRODUCT CATALOG HANDLERS
  // ==========================================
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setImageSourceMode('file');
    setProductForm({
      name: '',
      sku: `VK-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`,
      barcode: `${Math.floor(Math.random() * 900000000000 + 100000000000)}`,
      category: 'Packaging & Logistics',
      unit: 'Pallet',
      default_price: 35.0,
      cost_price: 22.0,
      min_stock_alert: 20,
      warehouse_location: 'Dock 1 - Aisle A-01',
      image_url: '',
      description: 'Factory-grade logistics cargo item.',
      initial_hub_id: hubs[0]?.id || 'op-1',
      initial_stock_qty: 40,
    });
    setProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setImageSourceMode(prod.image_url?.startsWith('data:') ? 'file' : prod.image_url ? 'url' : 'file');
    setProductForm({
      name: prod.name,
      sku: prod.sku,
      barcode: prod.barcode || '',
      category: prod.category || 'Packaging & Logistics',
      unit: prod.unit || 'Pallet',
      default_price: prod.default_price || 0,
      cost_price: prod.cost_price || 0,
      min_stock_alert: prod.min_stock_alert || 10,
      warehouse_location: prod.warehouse_location || 'Aisle A-1',
      image_url: prod.image_url || '',
      description: prod.description || '',
      initial_hub_id: 'op-1',
      initial_stock_qty: 0,
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (editingProduct) {
      // Update (U)
      const updates = {
        name: productForm.name,
        sku: productForm.sku,
        barcode: productForm.barcode,
        category: productForm.category,
        unit: productForm.unit,
        default_price: parseFloat(productForm.default_price) || 0,
        cost_price: parseFloat(productForm.cost_price) || 0,
        min_stock_alert: parseInt(productForm.min_stock_alert) || 10,
        warehouse_location: productForm.warehouse_location,
        image_url: productForm.image_url,
        description: productForm.description,
      };

      await updateLocalProduct(editingProduct.id, updates);

      setProducts((prev) =>
        prev.map((p) => (p.id === editingProduct.id ? { ...p, ...updates } : p))
      );
      showToast(`Updated product: ${productForm.name}`);
    } else {
      // Create (C)
      const newProdPayload = {
        name: productForm.name,
        sku: productForm.sku,
        barcode: productForm.barcode,
        category: productForm.category,
        unit: productForm.unit,
        default_price: parseFloat(productForm.default_price) || 0,
        cost_price: parseFloat(productForm.cost_price) || 0,
        min_stock_alert: parseInt(productForm.min_stock_alert) || 10,
        warehouse_location: productForm.warehouse_location,
        image_url: productForm.image_url,
        description: productForm.description,
      };

      const createdProduct = await addLocalProduct(newProdPayload);
      setProducts((prev) => [createdProduct, ...prev]);

      // If initial stock specified, assign to hub
      if (productForm.initial_stock_qty > 0) {
        const stockPayload = {
          branch_id: productForm.initial_hub_id,
          product_id: createdProduct.id,
          on_hand_quantity: parseInt(productForm.initial_stock_qty),
          reserved_quantity: 0,
          warehouse_location: productForm.warehouse_location,
        };
        const createdStock = await addLocalBranchStock(stockPayload);
        setBranchStock((prev) => [createdStock, ...prev]);

        // Log movement
        const movementPayload = {
          movement_type: 'inbound',
          product_id: createdProduct.id,
          branch_id: productForm.initial_hub_id,
          to_branch_id: null,
          quantity: parseInt(productForm.initial_stock_qty),
          operator_name: currentUser?.name || 'Managing Director',
          reference_no: `INIT-${createdProduct.sku}`,
          reason: 'Initial catalog stock intake',
        };
        const createdMovement = await addLocalStockMovement(movementPayload);
        setStockMovements((prev) => [createdMovement, ...prev]);
      }
      showToast(`Created new product SKU: ${createdProduct.sku}`);
    }
    setProductModalOpen(false);
  };

  const handleConfirmDeleteProduct = async () => {
    if (!deleteProductConfirm) return;
    const prodId = deleteProductConfirm.id;
    await deleteLocalProduct(prodId);

    setProducts((prev) => prev.filter((p) => p.id !== prodId));
    setBranchStock((prev) => prev.filter((bs) => bs.product_id !== prodId));
    showToast(`Deleted product: ${deleteProductConfirm.name}`);
    setDeleteProductConfirm(null);
  };

  // ==========================================
  // CRUD 2: BRANCH STOCK INVENTORY HANDLERS
  // ==========================================
  const handleOpenAssignStock = () => {
    setAssignStockForm({
      product_id: products[0]?.id || '',
      branch_id: hubs[0]?.id || 'op-1',
      on_hand_quantity: 50,
      reserved_quantity: 0,
      warehouse_location: 'Bay A-01',
    });
    setAssignStockModalOpen(true);
  };

  const handleSaveAssignStock = async (e) => {
    e.preventDefault();
    const existing = branchStock.find(
      (bs) => bs.product_id === assignStockForm.product_id && bs.branch_id === assignStockForm.branch_id
    );

    if (existing) {
      // Update existing
      const newOnHand = existing.on_hand_quantity + parseInt(assignStockForm.on_hand_quantity);
      await updateLocalBranchStock(existing.id, {
        on_hand_quantity: newOnHand,
        warehouse_location: assignStockForm.warehouse_location,
      });

      setBranchStock((prev) =>
        prev.map((bs) =>
          bs.id === existing.id
            ? { ...bs, on_hand_quantity: newOnHand, warehouse_location: assignStockForm.warehouse_location }
            : bs
        )
      );
      showToast('Added stock quantity to existing hub allocation.');
    } else {
      // Create new branch stock record
      const payload = {
        branch_id: assignStockForm.branch_id,
        product_id: assignStockForm.product_id,
        on_hand_quantity: parseInt(assignStockForm.on_hand_quantity) || 0,
        reserved_quantity: parseInt(assignStockForm.reserved_quantity) || 0,
        warehouse_location: assignStockForm.warehouse_location,
      };
      const created = await addLocalBranchStock(payload);
      setBranchStock((prev) => [created, ...prev]);
      showToast('Assigned product stock to warehouse hub.');
    }

    setAssignStockModalOpen(false);
  };

  const handleOpenEditBranchStock = (bs) => {
    setEditBranchStockModal(bs);
    setEditStockForm({
      id: bs.id,
      product_id: bs.product_id,
      branch_id: bs.branch_id,
      on_hand_quantity: bs.on_hand_quantity,
      reserved_quantity: bs.reserved_quantity,
      warehouse_location: bs.warehouse_location || 'General Dock',
    });
  };

  const handleSaveEditBranchStock = async (e) => {
    e.preventDefault();
    if (!editBranchStockModal) return;

    const updates = {
      on_hand_quantity: parseInt(editStockForm.on_hand_quantity) || 0,
      reserved_quantity: parseInt(editStockForm.reserved_quantity) || 0,
      warehouse_location: editStockForm.warehouse_location,
    };

    await updateLocalBranchStock(editBranchStockModal.id, updates);

    setBranchStock((prev) =>
      prev.map((bs) => (bs.id === editBranchStockModal.id ? { ...bs, ...updates } : bs))
    );

    showToast('Updated hub stock allocation.');
    setEditBranchStockModal(null);
  };

  const handleConfirmDeleteBranchStock = async () => {
    if (!deleteStockConfirm) return;
    await deleteLocalBranchStock(deleteStockConfirm.id);

    setBranchStock((prev) => prev.filter((bs) => bs.id !== deleteStockConfirm.id));
    showToast('Removed stock record from hub.');
    setDeleteStockConfirm(null);
  };

  // ==========================================
  // CRUD 3: COOPERATOR CONSIGNMENT HANDLERS
  // ==========================================
  const handleOpenAddCoopStock = () => {
    setEditingCoopStock(null);
    setCoopStockForm({
      cooperator_id: cooperators[0]?.id || 'cop-1',
      product_id: products[0]?.id || '',
      quantity: 50,
      unit: products[0]?.unit || 'Pallet',
    });
    setCoopStockModalOpen(true);
  };

  const handleOpenEditCoopStock = (cs) => {
    setEditingCoopStock(cs);
    setCoopStockForm({
      cooperator_id: cs.cooperator_id,
      product_id: cs.product_id,
      quantity: cs.quantity,
      unit: cs.unit || 'Pallet',
    });
    setCoopStockModalOpen(true);
  };

  const handleSaveCoopStock = async (e) => {
    e.preventDefault();
    if (editingCoopStock) {
      const updates = {
        quantity: parseInt(coopStockForm.quantity) || 0,
        unit: coopStockForm.unit,
        last_verified: new Date().toISOString(),
      };
      await updateLocalCooperatorStock(editingCoopStock.id, updates);

      setCooperatorStock((prev) =>
        prev.map((cs) => (cs.id === editingCoopStock.id ? { ...cs, ...updates } : cs))
      );
      showToast('Updated partner consignment stock.');
    } else {
      const payload = {
        cooperator_id: coopStockForm.cooperator_id,
        product_id: coopStockForm.product_id,
        quantity: parseInt(coopStockForm.quantity) || 0,
        unit: coopStockForm.unit,
      };
      const created = await addLocalCooperatorStock(payload);
      setCooperatorStock((prev) => [created, ...prev]);
      showToast('Added partner consignment stock.');
    }
    setCoopStockModalOpen(false);
  };

  const handleConfirmDeleteCoopStock = async () => {
    if (!deleteCoopStockConfirm) return;
    await deleteLocalCooperatorStock(deleteCoopStockConfirm.id);

    setCooperatorStock((prev) => prev.filter((cs) => cs.id !== deleteCoopStockConfirm.id));
    showToast('Removed consignment stock record.');
    setDeleteCoopStockConfirm(null);
  };

  // ==========================================
  // QUICK ACTIONS: RESTOCK, TRANSFER, ADJUST
  // ==========================================
  const handleOpenRestock = (productId = '', branchId = 'op-1') => {
    const prod = getProduct(productId || (products[0]?.id || ''));
    setRestockForm({
      product_id: productId || (products[0]?.id || ''),
      branch_id: branchId || 'op-1',
      quantity: 50,
      unit_cost: prod.cost_price || 20,
      reference_no: `PO-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000 + 1000)}`,
      supplier_name: 'Factory Direct Supply Corp',
      notes: 'Scheduled factory stock intake',
    });
    setRestockModalOpen(true);
  };

  const handleExecuteRestock = async (e) => {
    e.preventDefault();
    const qty = parseInt(restockForm.quantity) || 0;
    if (qty <= 0) return;

    // Update or Insert branch stock
    const exists = branchStock.find(
      (bs) => bs.product_id === restockForm.product_id && bs.branch_id === restockForm.branch_id
    );

    if (exists) {
      const newOnHand = exists.on_hand_quantity + qty;
      await updateLocalBranchStock(exists.id, { on_hand_quantity: newOnHand });
      setBranchStock((prev) =>
        prev.map((bs) => (bs.id === exists.id ? { ...bs, on_hand_quantity: newOnHand } : bs))
      );
    } else {
      const created = await addLocalBranchStock({
        branch_id: restockForm.branch_id,
        product_id: restockForm.product_id,
        on_hand_quantity: qty,
        reserved_quantity: 0,
      });
      setBranchStock((prev) => [created, ...prev]);
    }

    // Add movement log
    const newMovement = await addLocalStockMovement({
      movement_type: 'inbound',
      product_id: restockForm.product_id,
      branch_id: restockForm.branch_id,
      to_branch_id: null,
      quantity: qty,
      operator_name: currentUser?.name || 'Managing Director',
      reference_no: restockForm.reference_no,
      reason: restockForm.notes || `Inbound shipment from ${restockForm.supplier_name}`,
    });
    setStockMovements((prev) => [newMovement, ...prev]);

    showToast(`Restocked +${qty} units successfully.`);
    setRestockModalOpen(false);
  };

  const handleOpenTransfer = (productId = '', fromBranchId = 'op-1') => {
    setTransferForm({
      product_id: productId || (products[0]?.id || ''),
      from_branch_id: fromBranchId || 'op-1',
      to_branch_id: fromBranchId === 'op-1' ? 'op-2' : 'op-1',
      quantity: 15,
      waybill_ref: `TR-${Math.floor(Math.random() * 9000 + 1000)}`,
      driver_name: 'Lead Heavy Haul Driver',
      notes: 'Inter-hub rebalance for regional customer demand',
    });
    setTransferModalOpen(true);
  };

  const handleExecuteTransfer = async (e) => {
    e.preventDefault();
    const qty = parseInt(transferForm.quantity) || 0;
    if (qty <= 0 || transferForm.from_branch_id === transferForm.to_branch_id) return;

    const sourceStock = branchStock.find(
      (bs) => bs.product_id === transferForm.product_id && bs.branch_id === transferForm.from_branch_id
    );
    const available = sourceStock
      ? Math.max(0, sourceStock.on_hand_quantity - sourceStock.reserved_quantity)
      : 0;

    if (qty > available) {
      alert(`Cannot transfer ${qty} units. Only ${available} available at source hub.`);
      return;
    }

    // Decrement source & increment destination
    const newSourceQty = Math.max(0, sourceStock.on_hand_quantity - qty);
    await updateLocalBranchStock(sourceStock.id, { on_hand_quantity: newSourceQty });

    const destExists = branchStock.find(
      (bs) => bs.product_id === transferForm.product_id && bs.branch_id === transferForm.to_branch_id
    );

    let updatedDest;
    if (destExists) {
      const newDestQty = destExists.on_hand_quantity + qty;
      await updateLocalBranchStock(destExists.id, { on_hand_quantity: newDestQty });
      updatedDest = { ...destExists, on_hand_quantity: newDestQty };
    } else {
      updatedDest = await addLocalBranchStock({
        branch_id: transferForm.to_branch_id,
        product_id: transferForm.product_id,
        on_hand_quantity: qty,
        reserved_quantity: 0,
      });
    }

    setBranchStock((prev) => {
      let next = prev.map((bs) =>
        bs.id === sourceStock.id ? { ...bs, on_hand_quantity: newSourceQty } : bs
      );
      if (destExists) {
        next = next.map((bs) => (bs.id === destExists.id ? updatedDest : bs));
      } else {
        next.push(updatedDest);
      }
      return next;
    });

    const newMovement = await addLocalStockMovement({
      movement_type: 'transfer',
      product_id: transferForm.product_id,
      branch_id: transferForm.from_branch_id,
      to_branch_id: transferForm.to_branch_id,
      quantity: qty,
      operator_name: currentUser?.name || 'Managing Director',
      reference_no: transferForm.waybill_ref,
      reason: transferForm.notes || 'Inter-hub freight transfer',
    });
    setStockMovements((prev) => [newMovement, ...prev]);

    showToast(`Transferred ${qty} units to ${getHub(transferForm.to_branch_id).name}.`);
    setTransferModalOpen(false);
  };

  const handleOpenAdjust = (productId = '', branchId = 'op-1') => {
    setAdjustForm({
      product_id: productId || (products[0]?.id || ''),
      branch_id: branchId || 'op-1',
      adjustment_type: 'correction',
      quantity_delta: 0,
      reason: '',
    });
    setAdjustModalOpen(true);
  };

  const handleExecuteAdjust = async (e) => {
    e.preventDefault();
    const delta = parseInt(adjustForm.quantity_delta) || 0;
    if (delta === 0) return;

    const targetStock = branchStock.find(
      (bs) => bs.product_id === adjustForm.product_id && bs.branch_id === adjustForm.branch_id
    );

    if (targetStock) {
      const newOnHand = Math.max(0, targetStock.on_hand_quantity + delta);
      await updateLocalBranchStock(targetStock.id, { on_hand_quantity: newOnHand });

      setBranchStock((prev) =>
        prev.map((bs) => (bs.id === targetStock.id ? { ...bs, on_hand_quantity: newOnHand } : bs))
      );
    }

    const newMovement = await addLocalStockMovement({
      movement_type: 'adjustment',
      product_id: adjustForm.product_id,
      branch_id: adjustForm.branch_id,
      to_branch_id: null,
      quantity: delta,
      operator_name: currentUser?.name || 'Managing Director',
      reference_no: `AUD-${Date.now().toString().slice(-6)}`,
      reason: adjustForm.reason || `Audit adjustment: ${adjustForm.adjustment_type}`,
    });
    setStockMovements((prev) => [newMovement, ...prev]);

    showToast(`Stock adjustment applied (${delta > 0 ? `+${delta}` : delta}).`);
    setAdjustModalOpen(false);
  };

  // Export CSV
  const handleExportCsv = () => {
    const headers = ['Product Name', 'SKU', 'Barcode', 'Category', 'Unit', 'Hub/Branch', 'On-Hand', 'Reserved', 'Available', 'Unit Price ($)', 'Valuation ($)'];
    const rows = filteredBranchStock.map((bs) => {
      const prod = getProduct(bs.product_id);
      const hub = getHub(bs.branch_id);
      const available = Math.max(0, bs.on_hand_quantity - bs.reserved_quantity);
      const val = (bs.on_hand_quantity * (prod.cost_price || prod.default_price || 0)).toFixed(2);
      return [
        `"${prod.name || 'Item'}"`,
        `"${prod.sku || ''}"`,
        `"${prod.barcode || ''}"`,
        `"${prod.category || ''}"`,
        `"${prod.unit || ''}"`,
        `"${hub.name || ''}"`,
        bs.on_hand_quantity,
        bs.reserved_quantity,
        available,
        (prod.default_price || 0).toFixed(2),
        val,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `voleak_express_inventory_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 shadow-2xl flex items-center gap-2.5 text-xs font-extrabold border border-amber-500/30"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-slate-950" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg shadow-amber-500/25">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {t('inventoryTitle')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('inventorySubtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">

          {activeTab === 'catalog' && (
            <button
              onClick={handleOpenAddProduct}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-sm shadow-amber-500/25 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Package className="w-4 h-4" />
              <span>{t('addProductBtn')}</span>
            </button>
          )}

          <button
            onClick={() => handleOpenRestock()}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('quickRestockBtn')}</span>
          </button>

          <button
            onClick={handleSyncDatabase}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            title="Fetch and sync live database records from Supabase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : 'text-emerald-400'}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Live DB'}</span>
          </button>

          <button
            onClick={handleResetTopSportsTextile}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            title="Load & sync full Top Sports Textile (TST Group) product catalog"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
            <span>Top Sports Textile Catalog</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
            title={t('exportCsvBtn')}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('kpiTotalSkus')}</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {kpiStats.totalSkus}
              </h3>
              <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> {kpiStats.activeCategoryCount} Active {kpiStats.activeCategoryCount === 1 ? 'Category' : 'Categories'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('kpiTotalUnits')}</p>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {kpiStats.totalUnitsOnHand.toLocaleString()}
              </h3>
              <span className="text-[11px] font-bold text-sky-500 flex items-center gap-1 mt-1">
                <Building2 className="w-3.5 h-3.5" /> Across {kpiStats.activeHubCount} {kpiStats.activeHubCount === 1 ? 'Logistics Hub' : 'Logistics Hubs'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('kpiTotalValuation')}</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                ${kpiStats.totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <span className="text-[11px] font-semibold text-slate-400 mt-1 block">
                Warehouse inventory asset value
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t('kpiLowStockAlerts')}</p>
              <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                {kpiStats.lowStockCount}
              </h3>
              <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1 mt-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Threshold triggered
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Tab Navigation & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          <button
            onClick={() => setActiveTab('branch')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'branch'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Warehouse className="w-4 h-4" />
            <span>{t('tabBranchStock')}</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{t('tabCatalog')}</span>
          </button>
        </div>

        {/* Search & Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              placeholder={t('search')}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Hub Dropdown (For Branch tab) */}
          {activeTab === 'branch' && (
            <select
              value={selectedHubFilter}
              onChange={(e) => setSelectedHubFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="all">{t('filterAllHubs')}</option>
              {hubs.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          )}

          {/* Category Dropdown */}
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Health Filter (For Branch tab) */}
          {activeTab === 'branch' && (
            <select
              value={healthFilter}
              onChange={(e) => setHealthFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              <option value="all">{t('filterAllHealth')}</option>
              <option value="healthy">{t('stockHealthy')}</option>
              <option value="low">{t('stockLow')}</option>
              <option value="out">{t('stockOut')}</option>
            </select>
          )}
        </div>
      </div>

      {/* --- TAB 1: HUB & BRANCH STOCK (WITH FULL CRUD) --- */}
      {activeTab === 'branch' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">{t('thProductName')}</th>
                  <th className="py-3.5 px-4">{t('thSku')}</th>
                  <th className="py-3.5 px-4">{t('thBranch')}</th>
                  <th className="py-3.5 px-4 text-right">{t('thOnHand')}</th>
                  <th className="py-3.5 px-4 text-right">{t('thReserved')}</th>
                  <th className="py-3.5 px-4 text-right">{t('thAvailable')}</th>
                  <th className="py-3.5 px-4 text-center">{t('thHealthStatus')}</th>
                  <th className="py-3.5 px-4 text-right">Operations & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredBranchStock.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-400">
                      No stock records found. Click "+ Assign Stock to Hub" to add an inventory record.
                    </td>
                  </tr>
                ) : (
                  filteredBranchStock.map((bs) => {
                    const prod = getProduct(bs.product_id);
                    const hub = getHub(bs.branch_id);
                    const available = Math.max(0, bs.on_hand_quantity - bs.reserved_quantity);
                    const minAlert = prod.min_stock_alert || 10;
                    const isOut = available === 0;
                    const isLow = available <= minAlert && !isOut;

                    return (
                      <tr
                        key={bs.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Product info (Read detail on click) */}
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image_url}
                              alt={prod.name}
                              className="w-12 h-12 rounded-xl object-cover object-center ring-1 ring-slate-200 dark:ring-slate-700 shrink-0 bg-slate-100 dark:bg-slate-800 shadow-sm"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80';
                              }}
                            />
                            <div>
                              <button
                                onClick={() => setStockDetailModal(bs)}
                                className="text-left font-bold text-slate-900 dark:text-white hover:text-amber-500 transition-colors line-clamp-1"
                              >
                                {prod.name || 'Consignment Item'}
                              </button>
                              <div className="text-[11px] text-slate-400 font-normal flex items-center gap-2">
                                <span className="text-amber-500 font-semibold">{prod.category}</span>
                                <span>•</span>
                                <span>Unit: {prod.unit}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* SKU & Barcode */}
                        <td className="py-3.5 px-4 font-mono font-bold">
                          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                            <span>{prod.sku}</span>
                            <button
                              onClick={() => setBarcodeModalItem(prod)}
                              className="p-1 rounded hover:bg-amber-500/10"
                              title="Inspect Barcode"
                            >
                              <Barcode className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">{prod.barcode}</div>
                        </td>

                        {/* Branch / Hub */}
                        <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-sky-500" />
                            <span>{hub.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{hub.province}</span>
                        </td>

                        {/* On-Hand */}
                        <td className="py-3.5 px-4 text-right font-extrabold text-slate-900 dark:text-white text-sm">
                          {bs.on_hand_quantity.toLocaleString()}
                        </td>

                        {/* Reserved */}
                        <td className="py-3.5 px-4 text-right font-bold text-amber-500">
                          {bs.reserved_quantity.toLocaleString()}
                        </td>

                        {/* Available */}
                        <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                          {available.toLocaleString()}
                        </td>

                        {/* Health Status */}
                        <td className="py-3.5 px-4 text-center">
                          {isOut ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                              <XCircle className="w-3 h-3" />
                              {t('stockOut')}
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                              <AlertTriangle className="w-3 h-3" />
                              {t('stockLow')} ({available} / min {minAlert})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              {t('stockHealthy')}
                            </span>
                          )}
                        </td>

                        {/* Full Operations & CRUD Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Read / Detail Modal */}
                            <button
                              onClick={() => setStockDetailModal(bs)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all"
                              title="View Full Stock Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick Restock */}
                            <button
                              onClick={() => handleOpenRestock(bs.product_id, bs.branch_id)}
                              className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white font-bold text-[11px] transition-all"
                              title="Restock Inbound"
                            >
                              + Restock
                            </button>

                            {/* Update (Edit) Stock Record */}
                            <button
                              onClick={() => handleOpenEditBranchStock(bs)}
                              className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-all"
                              title="Edit Stock Allocation"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Stock Record */}
                            <button
                              onClick={() => setDeleteStockConfirm(bs)}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                              title="Delete from Hub"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: PRODUCT CATALOG MANAGEMENT (CRUD) --- */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Showing {filteredProducts.length} items in factory catalog
            </span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                onClick={() => setCatalogViewMode('grid')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  catalogViewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setCatalogViewMode('table')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  catalogViewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-amber-500 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Table
              </button>
            </div>
          </div>

          {catalogViewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((prod) => {
                const margin = prod.default_price > 0 && prod.cost_price > 0
                  ? (((prod.default_price - prod.cost_price) / prod.default_price) * 100).toFixed(0)
                  : 0;

                return (
                  <motion.div
                    key={prod.id}
                    whileHover={{ y: -3 }}
                    className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Image & Badges */}
                      <div className="relative rounded-xl overflow-hidden aspect-video mb-3 bg-slate-100 dark:bg-slate-800">
                        <img
                          src={prod.image_url}
                          alt={prod.name}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-black/60 text-white backdrop-blur-sm">
                          {prod.category}
                        </div>
                        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-500 text-white">
                          Unit: {prod.unit}
                        </div>
                      </div>

                      {/* Product Title */}
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">
                        {prod.name}
                      </h4>
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-600 dark:text-amber-400 mt-1">
                        <span>{prod.sku}</span>
                        <span className="text-slate-400 text-[11px]">Barcode: {prod.barcode}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1.5">
                        {prod.description}
                      </p>
                    </div>

                    {/* Price & Actions Bottom */}
                    <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Selling Price</span>
                          <div className="text-base font-black text-slate-900 dark:text-white">
                            ${prod.default_price.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-bold">Cost / Margin</span>
                          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            ${prod.cost_price.toFixed(2)} ({margin}% margin)
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[11px] text-slate-400">
                          Min Alert: <strong className="text-slate-700 dark:text-slate-200">{prod.min_stock_alert}</strong>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setBarcodeModalItem(prod)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-500 hover:text-white transition-all"
                            title="Barcode"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-500 hover:text-white transition-all"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteProductConfirm(prod)}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">{t('thProductName')}</th>
                      <th className="py-3.5 px-4">{t('thSku')}</th>
                      <th className="py-3.5 px-4">{t('thCategory')}</th>
                      <th className="py-3.5 px-4">{t('thUnit')}</th>
                      <th className="py-3.5 px-4 text-right">{t('thUnitPrice')}</th>
                      <th className="py-3.5 px-4 text-right">{t('thCostPrice')}</th>
                      <th className="py-3.5 px-4 text-right">{t('thMinAlert')}</th>
                      <th className="py-3.5 px-4 text-right">Location</th>
                      <th className="py-3.5 px-4 text-right">{t('thActions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={prod.image_url}
                              alt={prod.name}
                              className="w-10 h-10 rounded-lg object-cover object-center ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-100 dark:bg-slate-800 shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80';
                              }}
                            />
                            <span>{prod.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-amber-500">{prod.sku}</td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{prod.category}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">{prod.unit}</td>
                        <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                          ${prod.default_price.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                          ${prod.cost_price.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-amber-500">
                          {prod.min_stock_alert} units
                        </td>
                        <td className="py-3 px-4 text-right text-slate-500 font-mono text-[11px]">
                          {prod.warehouse_location || 'General'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => handleOpenEditProduct(prod)}
                              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-sky-500 hover:text-white text-slate-600 dark:text-slate-300 transition-all"
                              title="Edit Product"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteProductConfirm(prod)}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-all"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* ALL MODALS: CREATE, READ, UPDATE, DELETE & OPERATIONS */}
      {/* ======================================================== */}

      {/* --- MODAL: STOCK DETAILS (READ) --- */}
      <AnimatePresence>
        {stockDetailModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            >
              {(() => {
                const prod = getProduct(stockDetailModal.product_id);
                const hub = getHub(stockDetailModal.branch_id);
                const available = Math.max(0, stockDetailModal.on_hand_quantity - stockDetailModal.reserved_quantity);
                const totalValue = (stockDetailModal.on_hand_quantity * (prod.cost_price || prod.default_price || 0)).toFixed(2);

                return (
                  <>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        <Warehouse className="w-5 h-5 text-amber-500" />
                        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                          Warehouse Stock Dossier
                        </h3>
                      </div>
                      <button
                        onClick={() => setStockDetailModal(null)}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60">
                      <img
                        src={prod.image_url}
                        alt={prod.name}
                        className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                      />
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{prod.name}</h4>
                        <div className="text-xs font-mono text-amber-500 font-bold mt-0.5">SKU: {prod.sku}</div>
                        <div className="text-[11px] text-slate-400">Category: {prod.category}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 text-center">
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">On-Hand Stock</span>
                        <div className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                          {stockDetailModal.on_hand_quantity} {prod.unit}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Reserved Qty</span>
                        <div className="text-lg font-black text-amber-500 mt-0.5">
                          {stockDetailModal.reserved_quantity} {prod.unit}
                        </div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Available to Ship</span>
                        <div className="text-lg font-black text-emerald-500 mt-0.5">
                          {available} {prod.unit}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/30 p-3.5 rounded-xl border border-slate-200/50 dark:border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Logistics Hub:</span>
                        <strong className="text-slate-900 dark:text-white">{hub.name} ({hub.province})</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Warehouse Staging:</span>
                        <strong className="text-slate-900 dark:text-white">{stockDetailModal.warehouse_location || prod.warehouse_location || 'General Aisle'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Unit Cost & Selling Price:</span>
                        <strong className="text-slate-900 dark:text-white">${prod.cost_price?.toFixed(2)} (Cost) / ${prod.default_price?.toFixed(2)} (Sell)</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Hub Valuation:</span>
                        <strong className="text-emerald-600 dark:text-emerald-400 font-extrabold">${totalValue}</strong>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setStockDetailModal(null);
                          handleOpenEditBranchStock(stockDetailModal);
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-500/20"
                      >
                        Edit Stock Record
                      </button>
                      <button
                        onClick={() => setStockDetailModal(null)}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                      >
                        {t('close')}
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: ASSIGN STOCK TO HUB (CREATE) --- */}
      <AnimatePresence>
        {assignStockModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-amber-500">
                  <Warehouse className="w-5 h-5" />
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Assign Stock to Hub Warehouse
                  </h3>
                </div>
                <button
                  onClick={() => setAssignStockModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAssignStock} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Product SKU *
                  </label>
                  <select
                    value={assignStockForm.product_id}
                    onChange={(e) => setAssignStockForm({ ...assignStockForm, product_id: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Target Hub Warehouse *
                  </label>
                  <select
                    value={assignStockForm.branch_id}
                    onChange={(e) => setAssignStockForm({ ...assignStockForm, branch_id: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    {hubs.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      On-Hand Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={assignStockForm.on_hand_quantity}
                      onChange={(e) => setAssignStockForm({ ...assignStockForm, on_hand_quantity: e.target.value })}
                      className="w-full p-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Reserved Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={assignStockForm.reserved_quantity}
                      onChange={(e) => setAssignStockForm({ ...assignStockForm, reserved_quantity: e.target.value })}
                      className="w-full p-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Warehouse Shelf / Bay Location
                  </label>
                  <input
                    type="text"
                    value={assignStockForm.warehouse_location}
                    onChange={(e) => setAssignStockForm({ ...assignStockForm, warehouse_location: e.target.value })}
                    placeholder="e.g. Aisle 3, Rack B-02"
                    className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAssignStockModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/25"
                  >
                    Save Stock Allocation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: EDIT BRANCH STOCK (UPDATE) --- */}
      <AnimatePresence>
        {editBranchStockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-amber-500">
                  <Edit className="w-5 h-5" />
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Edit Hub Stock Numbers
                  </h3>
                </div>
                <button
                  onClick={() => setEditBranchStockModal(null)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEditBranchStock} className="space-y-3.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                  <div className="font-bold text-slate-900 dark:text-white">
                    {getProduct(editStockForm.product_id).name}
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    Hub: {getHub(editStockForm.branch_id).name}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      On-Hand Quantity *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={editStockForm.on_hand_quantity}
                      onChange={(e) => setEditStockForm({ ...editStockForm, on_hand_quantity: e.target.value })}
                      className="w-full p-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Reserved Quantity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editStockForm.reserved_quantity}
                      onChange={(e) => setEditStockForm({ ...editStockForm, reserved_quantity: e.target.value })}
                      className="w-full p-2 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Warehouse Shelf / Bay Location
                  </label>
                  <input
                    type="text"
                    value={editStockForm.warehouse_location}
                    onChange={(e) => setEditStockForm({ ...editStockForm, warehouse_location: e.target.value })}
                    className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditBranchStockModal(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/25"
                  >
                    Update Stock
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: DELETE STOCK CONFIRM (DELETE) --- */}
      <AnimatePresence>
        {deleteStockConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Delete Stock Allocation?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove this stock record from {getHub(deleteStockConfirm.branch_id).name}?
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => setDeleteStockConfirm(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleConfirmDeleteBranchStock}
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/25"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: DELETE PRODUCT CONFIRM (DELETE) --- */}
      <AnimatePresence>
        {deleteProductConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Delete Product SKU?
              </h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to remove <strong>{deleteProductConfirm.name}</strong> ({deleteProductConfirm.sku}) from the catalog?
              </p>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={() => setDeleteProductConfirm(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleConfirmDeleteProduct}
                  className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/25"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: ADD / EDIT PRODUCT (CREATE & UPDATE) --- */}
      <AnimatePresence>
        {productModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 my-8"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-amber-500">
                  <Package className="w-5 h-5" />
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {editingProduct ? 'Edit Catalog Product' : 'Add New Factory Product / Cargo SKU'}
                  </h3>
                </div>
                <button
                  onClick={() => setProductModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Product / Cargo Item Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="e.g. Industrial Garment Fabric Rolls"
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>

                  {/* SKU */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      SKU Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.sku}
                      onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                      className="w-full p-2.5 text-xs font-mono font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>

                  {/* Barcode */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Barcode (EAN-13 / UPC)
                    </label>
                    <input
                      type="text"
                      value={productForm.barcode}
                      onChange={(e) => setProductForm({ ...productForm, barcode: e.target.value })}
                      className="w-full p-2.5 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Category *
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      {categories.filter((c) => c !== 'All Categories').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {/* Unit */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Unit of Measure *
                    </label>
                    <select
                      value={productForm.unit}
                      onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    >
                      {['Pallet', 'Drum', 'Carton', 'Roll', 'Piece', 'Bag', 'Box', 'Set', 'Unit', 'Tonne'].map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  {/* Selling Price */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Selling Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      required
                      value={productForm.default_price}
                      onChange={(e) => setProductForm({ ...productForm, default_price: e.target.value })}
                      className="w-full p-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>

                  {/* Cost Price */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Cost Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      required
                      value={productForm.cost_price}
                      onChange={(e) => setProductForm({ ...productForm, cost_price: e.target.value })}
                      className="w-full p-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>

                  {/* Min Stock Alert */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Min Stock Alert Threshold
                    </label>
                    <input
                      type="number"
                      value={productForm.min_stock_alert}
                      onChange={(e) => setProductForm({ ...productForm, min_stock_alert: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>

                  {/* Warehouse Location */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Warehouse Staging Location
                    </label>
                    <input
                      type="text"
                      value={productForm.warehouse_location}
                      onChange={(e) => setProductForm({ ...productForm, warehouse_location: e.target.value })}
                      placeholder="e.g. Aisle A-04, Sector 1"
                      className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                    />
                  </div>

                  {/* Image Import & Upload Layer */}
                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-amber-500" />
                        <span>Product Image & Visual SKU</span>
                      </label>
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-[11px] font-bold">
                        <button
                          type="button"
                          onClick={() => setImageSourceMode('file')}
                          className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                            imageSourceMode === 'file'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <Upload className="w-3 h-3" />
                          <span>Import File</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageSourceMode('url')}
                          className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                            imageSourceMode === 'url'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <ImageIcon className="w-3 h-3" />
                          <span>Web URL</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageSourceMode('presets')}
                          className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                            imageSourceMode === 'presets'
                              ? 'bg-amber-500 text-white shadow-xs'
                              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Presets</span>
                        </button>
                      </div>
                    </div>

                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      id="product-image-file-upload"
                      accept="image/png, image/jpeg, image/jpg, image/webp, image/svg+xml, image/gif"
                      className="hidden"
                      onChange={handleImageFileUpload}
                    />

                    {/* 1. IMPORT FROM LOCAL FILE (DRAG & DROP / FILE PICKER) */}
                    {imageSourceMode === 'file' && (
                      <div>
                        {productForm.image_url ? (
                          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                            <div className="flex items-center gap-3">
                              <img
                                src={productForm.image_url}
                                alt="Uploaded Preview"
                                className="w-14 h-14 rounded-xl object-cover ring-2 ring-amber-500/40 shrink-0 bg-white"
                              />
                              <div>
                                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1 text-emerald-500">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Image Loaded & Ready</span>
                                </div>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                  {productForm.image_url.startsWith('data:')
                                    ? 'Local file converted to embedded base64 image data'
                                    : 'Active product image reference'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => document.getElementById('product-image-file-upload').click()}
                                className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs transition-all flex items-center gap-1"
                              >
                                <Upload className="w-3 h-3" />
                                <span>Change File</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setProductForm({ ...productForm, image_url: '' })}
                                className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-all"
                                title="Remove image"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDragOverImage(true);
                            }}
                            onDragLeave={() => setDragOverImage(false)}
                            onDrop={handleImageDrop}
                            onClick={() => document.getElementById('product-image-file-upload').click()}
                            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                              dragOverImage
                                ? 'border-amber-500 bg-amber-500/10 scale-[0.99]'
                                : 'border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 bg-slate-50/50 dark:bg-slate-800/30'
                            }`}
                          >
                            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center">
                              <FileUp className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                Click to browse or drag & drop product image file
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">
                                Supports PNG, JPG, JPEG, WEBP, SVG (Max 5MB)
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2. WEB URL INPUT */}
                    {imageSourceMode === 'url' && (
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={productForm.image_url}
                            onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                            placeholder="https://images.example.com/product-cargo.jpg"
                            className="flex-1 p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                          />
                          {productForm.image_url && (
                            <img
                              src={productForm.image_url}
                              alt="Preview"
                              className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0"
                              onError={(e) => (e.target.style.display = 'none')}
                            />
                          )}
                        </div>
                      </div>
                    )}

                    {/* 3. CARGO INDUSTRY PRESETS */}
                    {imageSourceMode === 'presets' && (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                        {cargoImagePresets.map((preset, idx) => {
                          const isSelected = productForm.image_url === preset.url;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setProductForm({ ...productForm, image_url: preset.url });
                                showToast(`Selected preset: ${preset.label}`);
                              }}
                              className={`p-1.5 rounded-xl border text-left transition-all flex flex-col items-center gap-1.5 ${
                                isSelected
                                  ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800'
                              }`}
                            >
                              <img
                                src={preset.url}
                                alt={preset.label}
                                className="w-full h-12 rounded-lg object-cover"
                              />
                              <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate w-full text-center">
                                {preset.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Initial Stock Intake (Only on creation) */}
                  {!editingProduct && (
                    <div className="sm:col-span-2 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-amber-700 dark:text-amber-400">
                          Initial Stocking Hub
                        </label>
                        <select
                          value={productForm.initial_hub_id}
                          onChange={(e) => setProductForm({ ...productForm, initial_hub_id: e.target.value })}
                          className="w-full mt-1 p-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-amber-500/30 text-slate-900 dark:text-white"
                        >
                          {hubs.map((h) => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-amber-700 dark:text-amber-400">
                          Initial Quantity On-Hand
                        </label>
                        <input
                          type="number"
                          value={productForm.initial_stock_qty}
                          onChange={(e) => setProductForm({ ...productForm, initial_stock_qty: e.target.value })}
                          className="w-full mt-1 p-2 text-xs rounded-lg bg-white dark:bg-slate-800 border border-amber-500/30 font-bold text-slate-900 dark:text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setProductModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/25"
                  >
                    {editingProduct ? 'Update Product' : 'Create Product SKU'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: QUICK INBOUND RESTOCK --- */}
      <AnimatePresence>
        {restockModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <PlusCircle className="w-5 h-5" />
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Inbound Warehouse Restock
                  </h3>
                </div>
                <button
                  onClick={() => setRestockModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleExecuteRestock} className="space-y-3.5">
                {/* Select Product */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Product / Consignment Item *
                  </label>
                  <select
                    value={restockForm.product_id}
                    onChange={(e) => setRestockForm({ ...restockForm, product_id: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Hub */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Target Receiving Hub *
                  </label>
                  <select
                    value={restockForm.branch_id}
                    onChange={(e) => setRestockForm({ ...restockForm, branch_id: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    {hubs.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Quantity to Receive *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={restockForm.quantity}
                    onChange={(e) => setRestockForm({ ...restockForm, quantity: e.target.value })}
                    className="w-full p-2.5 text-xs font-extrabold text-emerald-600 dark:text-emerald-400 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                {/* Ref & Supplier */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      PO / Invoice Ref
                    </label>
                    <input
                      type="text"
                      value={restockForm.reference_no}
                      onChange={(e) => setRestockForm({ ...restockForm, reference_no: e.target.value })}
                      className="w-full p-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Supplier / Plant
                    </label>
                    <input
                      type="text"
                      value={restockForm.supplier_name}
                      onChange={(e) => setRestockForm({ ...restockForm, supplier_name: e.target.value })}
                      className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setRestockModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25"
                  >
                    Confirm Inbound Restock
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: INTER-HUB TRANSFER --- */}
      <AnimatePresence>
        {transferModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                  <ArrowRightLeft className="w-5 h-5" />
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Inter-Hub Stock Transfer
                  </h3>
                </div>
                <button
                  onClick={() => setTransferModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleExecuteTransfer} className="space-y-3.5">
                {/* Product */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Product to Transfer *
                  </label>
                  <select
                    value={transferForm.product_id}
                    onChange={(e) => setTransferForm({ ...transferForm, product_id: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source & Destination Hub */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Origin Hub (Source) *
                    </label>
                    <select
                      value={transferForm.from_branch_id}
                      onChange={(e) => setTransferForm({ ...transferForm, from_branch_id: e.target.value })}
                      className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      {hubs.map((h) => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Destination Hub *
                    </label>
                    <select
                      value={transferForm.to_branch_id}
                      onChange={(e) => setTransferForm({ ...transferForm, to_branch_id: e.target.value })}
                      className="w-full p-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    >
                      {hubs.map((h) => (
                        <option key={h.id} value={h.id}>{h.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Transfer Quantity */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Quantity to Transfer *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={transferForm.quantity}
                    onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
                    className="w-full p-2.5 text-xs font-extrabold text-sky-600 dark:text-sky-400 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                  />
                </div>

                {/* Tracking Ref */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Waybill / Transfer Dispatch Code
                  </label>
                  <input
                    type="text"
                    value={transferForm.waybill_ref}
                    onChange={(e) => setTransferForm({ ...transferForm, waybill_ref: e.target.value })}
                    className="w-full p-2 text-xs font-mono rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setTransferModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md shadow-sky-600/25"
                  >
                    Dispatch Inter-Hub Transfer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: STOCK ADJUSTMENT --- */}
      <AnimatePresence>
        {adjustModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-amber-500">
                  <SlidersHorizontal className="w-5 h-5" />
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Stock Audit & Discrepancy Adjustment
                  </h3>
                </div>
                <button
                  onClick={() => setAdjustModalOpen(false)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleExecuteAdjust} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Product *
                  </label>
                  <select
                    value={adjustForm.product_id}
                    onChange={(e) => setAdjustForm({ ...adjustForm, product_id: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Warehouse / Hub *
                  </label>
                  <select
                    value={adjustForm.branch_id}
                    onChange={(e) => setAdjustForm({ ...adjustForm, branch_id: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    {hubs.map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Adjustment Delta (+ Increase / - Decrease) *
                  </label>
                  <input
                    type="number"
                    required
                    value={adjustForm.quantity_delta}
                    onChange={(e) => setAdjustForm({ ...adjustForm, quantity_delta: e.target.value })}
                    placeholder="e.g. -5 for damaged goods or +10 for found count"
                    className="w-full p-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    Reason & Audit Notes *
                  </label>
                  <textarea
                    required
                    rows="2"
                    value={adjustForm.reason}
                    onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                    placeholder="e.g. Physical inventory count correction, water damaged carton write-off..."
                    className="w-full p-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setAdjustModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/25"
                  >
                    Apply Adjustment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- MODAL: BARCODE & SKU QR INSPECTOR --- */}
      <AnimatePresence>
        {barcodeModalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-center space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Pallet Barcode Label
                </span>
                <button
                  onClick={() => setBarcodeModalItem(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {barcodeModalItem.name}
                </h4>
                <p className="text-xs font-mono font-bold text-amber-500 mt-0.5">
                  SKU: {barcodeModalItem.sku}
                </p>
              </div>

              {/* Barcode Graphic */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-black flex flex-col items-center justify-center space-y-2 shadow-inner">
                <div className="flex items-center gap-0.5 h-16 w-48 justify-center">
                  {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 2, 4, 2, 1, 3].map((w, i) => (
                    <div
                      key={i}
                      className="bg-black h-full"
                      style={{ width: `${w * 2}px` }}
                    />
                  ))}
                </div>
                <span className="font-mono text-xs tracking-widest font-black">
                  {barcodeModalItem.barcode || '884019283011'}
                </span>
              </div>

              <div className="text-xs text-slate-400 text-left space-y-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                <div>Category: <strong className="text-slate-700 dark:text-slate-200">{barcodeModalItem.category}</strong></div>
                <div>Location: <strong className="text-slate-700 dark:text-slate-200">{barcodeModalItem.warehouse_location || 'General Staging'}</strong></div>
                <div>Unit: <strong className="text-slate-700 dark:text-slate-200">{barcodeModalItem.unit}</strong></div>
              </div>

              <button
                onClick={() => {
                  window.print();
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/25 transition-all"
              >
                Print Pallet Label Sticker
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
