import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://aszvtzwtssmwbwxvjaai.supabase.co',
  'sb_publishable_i8OlbwcjkiE0tUdjxd8UkQ_LsM5lphr'
);

async function seed() {
  // Login as user
  const { data: auth, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'mf.iqhbal@gmail.com',
    password: 'password',
  });
  if (authErr) { console.error('Auth failed:', authErr.message); return; }
  const userId = auth.user.id;
  console.log('Logged in as:', userId);

  // Create project
  const { data: project, error: projErr } = await supabase.from('projects').insert({
    user_id: userId,
    name: 'Home Renovation',
    description: 'Full home renovation budget - kitchen, wiring, living room, bedrooms',
    status: 'active',
    currency: 'MYR',
  }).select().single();
  if (projErr) { console.error('Project error:', projErr); return; }
  console.log('Project created:', project.id);
  const pid = project.id;

  // ==================== BUDGET ITEMS ====================
  const budgetItems = [
    // RENOVATION
    { category: 'Renovation', item_name: 'Defect Check', estimate_amount: 500, actual_amount: null, priority: 1 },
    { category: 'Renovation', item_name: 'Kiblat', estimate_amount: 100, actual_amount: null, priority: 1 },
    { category: 'Renovation', item_name: 'TNB', estimate_amount: 100, actual_amount: null, priority: 1 },
    { category: 'Renovation', item_name: 'Maintenance', estimate_amount: 700, actual_amount: null, priority: 1 },
    { category: 'Renovation', item_name: 'Water Bills', estimate_amount: 100, actual_amount: null, priority: 1 },
    { category: 'Renovation', item_name: 'Mover', estimate_amount: 700, actual_amount: null, priority: 1 },
    { category: 'Renovation', item_name: 'Wiring', estimate_amount: 4000, actual_amount: null, priority: 1 },
    { category: 'Renovation', item_name: 'Plaster Ceiling', estimate_amount: 4000, actual_amount: null, priority: 1 },
    { category: 'Renovation', item_name: 'Fan', estimate_amount: 3000, actual_amount: 2922, priority: 1 },
    { category: 'Renovation', item_name: 'Aircond', estimate_amount: 4000, actual_amount: 3938, priority: 1 },
    { category: 'Renovation', item_name: 'Lighting', estimate_amount: 1000, actual_amount: null, priority: 1 },
    { category: 'Renovation', item_name: 'Painting', estimate_amount: 800, actual_amount: null, priority: 2 },
    { category: 'Renovation', item_name: 'Curtain', estimate_amount: 500, actual_amount: null, priority: 1 },
    { category: 'Renovation', item_name: 'Blind', estimate_amount: 1000, actual_amount: null, priority: 1 },
    { category: 'Renovation', item_name: 'CCTV', estimate_amount: 500, actual_amount: 481, priority: 3 },
    { category: 'Renovation', item_name: 'Tinted', estimate_amount: 200, actual_amount: null, priority: 1 },
    { category: 'Renovation', item_name: 'Grill', estimate_amount: 3000, actual_amount: null, priority: 1 },
    { category: 'Renovation', item_name: 'SPC Floor', estimate_amount: 5000, actual_amount: null, priority: 3 },
    // KITCHEN RENOVATION
    { category: 'Kitchen', item_name: 'Kitchen Cabinet', estimate_amount: 10000, actual_amount: null, priority: 2 },
    { category: 'Kitchen', item_name: 'Table Top', estimate_amount: 3000, actual_amount: null, priority: 1 },
    { category: 'Kitchen', item_name: 'Backsplash', estimate_amount: 1000, actual_amount: null, priority: 2 },
    { category: 'Kitchen', item_name: 'Plumbing', estimate_amount: 1000, actual_amount: null, priority: 1 },
    // KITCHEN APPLIANCE
    { category: 'Kitchen Appliance', item_name: 'Sink', estimate_amount: 1000, actual_amount: null, priority: 1 },
    { category: 'Kitchen Appliance', item_name: 'Stove', estimate_amount: 1000, actual_amount: null, priority: 1 },
    { category: 'Kitchen Appliance', item_name: 'Hood', estimate_amount: 1500, actual_amount: null, priority: 1 },
    { category: 'Kitchen Appliance', item_name: 'Food Waste Disposable', estimate_amount: 1300, actual_amount: null, priority: 1 },
    { category: 'Kitchen Appliance', item_name: 'Dishwasher', estimate_amount: 1300, actual_amount: null, priority: 3 },
    { category: 'Kitchen Appliance', item_name: 'Water Filter', estimate_amount: 70, actual_amount: null, priority: 1 },
    { category: 'Kitchen Appliance', item_name: 'Refrigerator', estimate_amount: 3000, actual_amount: null, priority: 3 },
    { category: 'Kitchen Appliance', item_name: 'Tjean', estimate_amount: 600, actual_amount: null, priority: 3 },
    // DINING ROOM
    { category: 'Dining Room', item_name: 'Peninsular Table', estimate_amount: 3000, actual_amount: null, priority: 2 },
    { category: 'Dining Room', item_name: 'Bar Stool', estimate_amount: 500, actual_amount: null, priority: 2 },
    { category: 'Dining Room', item_name: 'Dining Table', estimate_amount: 2000, actual_amount: null, priority: 3 },
    { category: 'Dining Room', item_name: 'Dining Chair', estimate_amount: 1000, actual_amount: null, priority: 3 },
    // LIVING ROOM
    { category: 'Living Room', item_name: 'Sofa', estimate_amount: 2000, actual_amount: null, priority: 3 },
    { category: 'Living Room', item_name: 'Carpet', estimate_amount: 100, actual_amount: null, priority: 3 },
    { category: 'Living Room', item_name: 'Cabinet TV', estimate_amount: 2500, actual_amount: null, priority: 3 },
    { category: 'Living Room', item_name: 'Coffee Table', estimate_amount: 200, actual_amount: null, priority: 3 },
    { category: 'Living Room', item_name: 'Bean Bag', estimate_amount: 100, actual_amount: null, priority: 3 },
    { category: 'Living Room', item_name: 'Green Plant', estimate_amount: 100, actual_amount: null, priority: 3 },
    { category: 'Living Room', item_name: 'Air Purifier', estimate_amount: 800, actual_amount: null, priority: 3 },
    // TOILET
    { category: 'Bathroom', item_name: 'Toilet Cabinet', estimate_amount: 300, actual_amount: null, priority: 1 },
    { category: 'Bathroom', item_name: 'Bidet', estimate_amount: 200, actual_amount: null, priority: 1 },
    { category: 'Bathroom', item_name: 'Water Heater', estimate_amount: 800, actual_amount: null, priority: 1 },
    // BEDROOM
    { category: 'Bedroom', item_name: 'Hydraulic Bed', estimate_amount: 4000, actual_amount: null, priority: 3 },
    { category: 'Bedroom', item_name: 'Wardrobe', estimate_amount: 6000, actual_amount: null, priority: 3 },
    { category: 'Bedroom', item_name: 'Projector', estimate_amount: 1000, actual_amount: null, priority: 3 },
    { category: 'Bedroom', item_name: 'Dressing Table', estimate_amount: 500, actual_amount: null, priority: 3 },
    { category: 'Bedroom', item_name: 'Mirror', estimate_amount: 200, actual_amount: null, priority: 3 },
  ];

  const { error: budgetErr } = await supabase.from('budget_items').insert(
    budgetItems.map(item => ({
      project_id: pid,
      user_id: userId,
      category: item.category,
      item_name: item.item_name,
      estimate_amount: item.estimate_amount,
      actual_amount: item.actual_amount,
      priority: item.priority,
    }))
  );
  console.log('Budget items:', budgetErr ? budgetErr.message : `${budgetItems.length} inserted`);

  // ==================== SUPPLIERS ====================
  const suppliersData = [
    { name: 'Kabinet Guru', phone: '011-56235404', products: 'Cabinet Dapur', notes: 'Kitchen', pricing: 'RM10,000 quote' },
    { name: 'Megatech', phone: '012-6884540', email: 'prokitchen11@yahoo.com', website: 'https://www.tiktok.com/@megatech', products: 'Dining Table, Stool', notes: '8 seater dining table' },
    { name: 'Taobao', products: 'Dining Chair, Sofa', notes: 'Online marketplace' },
    { name: 'Prism+', website: 'https://prismplus.my', products: 'Ceiling Fan', notes: 'For dining area + living room' },
    { name: 'Rezo (Shopee)', products: 'Ceiling Fan', notes: 'For 7 fans' },
  ];

  const { data: insertedSuppliers, error: supErr } = await supabase.from('suppliers').insert(
    suppliersData.map(s => ({ project_id: pid, user_id: userId, ...s }))
  ).select();
  console.log('Suppliers:', supErr ? supErr.message : `${suppliersData.length} inserted`);

  // ==================== CHECKLIST ====================
  const checklistData = [
    { title: 'Find your perfect Interior Design Firm', status: 'done', sort_order: 1 },
    { title: 'Layout Design', status: 'in_progress', sort_order: 2 },
    { title: 'Electrical System', status: 'not_started', sort_order: 3 },
    { title: 'Plumbing System', status: 'not_started', sort_order: 4 },
    { title: 'Living Room Design', status: 'not_started', sort_order: 5 },
    { title: 'Bathroom Design', status: 'not_started', sort_order: 6 },
    { title: 'Kitchen Design', status: 'not_started', sort_order: 7 },
    { title: 'Room Design', status: 'not_started', sort_order: 8 },
    { title: 'Gather favourite finishes, materials, products and appliances', status: 'not_started', sort_order: 9 },
    { title: 'Getting Quotes', status: 'not_started', sort_order: 10 },
    { title: 'Create a budget', status: 'not_started', sort_order: 11 },
    { title: 'Meet Interior Designers', status: 'not_started', sort_order: 12 },
    { title: 'Order Prime Cost Items', status: 'not_started', sort_order: 13, notes: 'Toilet, hand basins, sinks, taps, showers, baths etc' },
    { title: 'Housing & Development Board (HDB) Approval', status: 'not_started', sort_order: 14 },
    { title: 'Get A Final Quotes', status: 'not_started', sort_order: 15 },
    { title: 'Select an Interior Designer', status: 'not_started', sort_order: 16 },
    { title: 'Order Fittings And Appliances', status: 'not_started', sort_order: 17 },
    { title: 'Stay On Track', status: 'not_started', sort_order: 18 },
    { title: 'Defect Period', status: 'not_started', sort_order: 19 },
  ];

  const { error: checkErr } = await supabase.from('checklist_items').insert(
    checklistData.map(c => ({ project_id: pid, user_id: userId, ...c }))
  );
  console.log('Checklist:', checkErr ? checkErr.message : `${checklistData.length} inserted`);

  // ==================== WIRING PLANS ====================
  const wiringData = [
    // DAPUR
    { location: 'Dapur', machine: 'Dryer', plug_location: 'Lower Cabinet', plug_type: '13A Switch Socket', wiring_type: 'DB Box', quantity: 1, price_per_unit: 9, installation_price: 200, notes: 'NEW' },
    { location: 'Dapur', machine: 'Washing Machine', plug_location: 'Lower Cabinet', plug_type: '13A Switch Socket', wiring_type: 'DB Box', quantity: 1, price_per_unit: 9, installation_price: 200, notes: 'NEW' },
    { location: 'Dapur', machine: 'Refrigerator', plug_location: 'Cabinet Peti Ais', plug_type: '13A Switch Socket', wiring_type: 'DB Box', quantity: 1, price_per_unit: 9, installation_price: 200, notes: 'NEW' },
    { location: 'Dapur', machine: 'Hood', plug_location: 'Upper Cabinet', plug_type: '1 Gang', wiring_type: 'Looping', quantity: 1, price_per_unit: 8, installation_price: 50, notes: 'EXISTING - TO CHANGE POINT LOCATION' },
    { location: 'Dapur', machine: 'Coway', plug_location: 'Atas Cabinet Bawah', plug_type: '13A Switch Socket', wiring_type: 'Looping', quantity: 1, price_per_unit: 9, installation_price: 100, notes: 'EXISTING - LOOPING WITH HOOD IF POSSIBLE' },
    { location: 'Dapur', machine: 'Food Grinder', plug_location: 'Bawah Sinki', plug_type: '13A Switch Socket', wiring_type: null, quantity: 1, price_per_unit: 9, installation_price: 100, notes: 'NEW' },
    { location: 'Dapur', machine: 'Rice Cooker', plug_location: 'Cabinet Pull Out', plug_type: 'Power Trac Socket', wiring_type: 'DB Box', quantity: 1, price_per_unit: 158, installation_price: 200, notes: 'NEW' },
    { location: 'Dapur', machine: 'Air Fryer', plug_location: 'Cabinet Pull Out', plug_type: 'Power Trac Socket', wiring_type: null, quantity: 1, price_per_unit: 0, installation_price: 0 },
    { location: 'Dapur', machine: 'Blender', plug_location: 'Cabinet Pull Out', plug_type: 'Power Trac Socket', wiring_type: 'DB Box', quantity: 1, price_per_unit: 158, installation_price: 200, notes: 'NEW' },
    { location: 'Dapur', machine: 'Tjean', plug_location: 'Cabinet Pull Out', plug_type: 'Power Trac Socket', wiring_type: null, quantity: 1, price_per_unit: 0, installation_price: 0 },
    { location: 'Dapur', machine: 'Robot Vacuum', plug_location: 'Dalam Cabinet Bawah', plug_type: '13A Switch Socket', wiring_type: 'Looping', quantity: 1, price_per_unit: 9, installation_price: 100, notes: 'NEW' },
    { location: 'Dapur', machine: 'Kipas', plug_location: 'Wall', plug_type: '1 Gang 1 Way', wiring_type: 'Looping', quantity: 1, price_per_unit: 8, installation_price: 150, notes: 'NEW - LOOPING FROM LAMPU' },
    // LIVING ROOM
    { location: 'Living Room', machine: 'TV', plug_location: 'Cabinet TV', plug_type: '13A Switch Socket', wiring_type: null, quantity: 1, price_per_unit: 9, installation_price: 0, notes: 'EXISTING' },
    { location: 'Living Room', machine: 'Wifi', plug_location: 'Cabinet TV', plug_type: '13A Switch Socket', wiring_type: null, quantity: 1, price_per_unit: 9, installation_price: 0, notes: 'EXISTING' },
    { location: 'Living Room', machine: 'Speaker', plug_location: 'Cabinet TV', plug_type: '13A Switch Socket', wiring_type: 'Looping', quantity: 1, price_per_unit: 9, installation_price: 100, notes: 'NEW' },
    { location: 'Living Room', machine: 'PS5', plug_location: 'Cabinet TV', plug_type: '13A Switch Socket', wiring_type: null, quantity: 1, price_per_unit: 9, installation_price: 100, notes: 'NEW' },
    { location: 'Living Room', machine: 'Air Purifier', plug_location: 'Cabinet TV', plug_type: '13A Switch Socket', wiring_type: null, quantity: 1, price_per_unit: 9, installation_price: 100, notes: 'NEW' },
    { location: 'Living Room', machine: 'Add On Plug (Left)', plug_location: 'Behind Sofa Left', plug_type: '13A Switch Socket', wiring_type: 'Looping', quantity: 1, price_per_unit: 9, installation_price: 100, notes: 'NEW' },
    { location: 'Living Room', machine: 'Add On Plug (Right)', plug_location: 'Behind Sofa Right', plug_type: '13A Switch Socket', wiring_type: 'Looping', quantity: 1, price_per_unit: 9, installation_price: 100, notes: 'NEW' },
    { location: 'Living Room', machine: 'Doorbell', plug_location: null, plug_type: '1 Gang 1 Way', wiring_type: 'Looping', quantity: 1, price_per_unit: 0, installation_price: 40, notes: 'NEW' },
    // DINING ROOM
    { location: 'Dining Room', machine: 'Add On Plug', plug_location: 'Wall', plug_type: '13A Switch Socket', wiring_type: 'Looping', quantity: 1, price_per_unit: 9, installation_price: 100, notes: 'NEW' },
    // BEDROOM 1
    { location: 'Bedroom 1', machine: 'Add On Plug', plug_location: 'Wall', plug_type: '13A Switch Socket', wiring_type: 'Looping', quantity: 5, price_per_unit: 9, installation_price: 100, notes: 'NEW' },
    // TOILET
    { location: 'Toilet', machine: 'Water Heater Point', plug_location: 'Wall', plug_type: '13A Switch Socket', wiring_type: 'DB Box', quantity: 1, price_per_unit: 9, installation_price: 300, notes: 'NEW' },
  ];

  const { error: wireErr } = await supabase.from('wiring_plans').insert(
    wiringData.map(w => ({ project_id: pid, user_id: userId, ...w }))
  );
  console.log('Wiring:', wireErr ? wireErr.message : `${wiringData.length} inserted`);

  // ==================== COMPARISONS ====================
  // Sofa comparison from Compare Product sheet
  const { data: sofaComp } = await supabase.from('comparisons').insert({
    project_id: pid, user_id: userId,
    name: 'Sofa - Living Area',
    category: 'Living Room',
    item_type: 'Sofa',
  }).select().single();

  if (sofaComp) {
    const { error: compItemErr } = await supabase.from('comparison_items').insert([
      { comparison_id: sofaComp.id, user_id: userId, product_name: 'Cream style cat scratching fabric sofa', price: 1218.83, quantity: 1, transport_cost: 219.42, total_cost: 1438.25, link: 'https://item.taobao.com/item.htm?id=818438044585' },
      { comparison_id: sofaComp.id, user_id: userId, product_name: 'Home straight row cloud sofa', price: 992.82, quantity: 1, transport_cost: 414.14, total_cost: 1406.96, link: 'https://item.taobao.com/item.htm?id=859828548099' },
      { comparison_id: sofaComp.id, user_id: userId, product_name: 'Nordic wabi-sabi style fabric sofa', price: 1477.74, quantity: 1, transport_cost: 373.16, total_cost: 1850.90, link: 'https://item.taobao.com/item.htm?id=799896806932' },
    ]);
    console.log('Sofa comparison items:', compItemErr ? compItemErr.message : '3 inserted');
  }

  // Dining set comparison from Supplier sheet
  const { data: diningComp } = await supabase.from('comparisons').insert({
    project_id: pid, user_id: userId,
    name: 'Dining Set',
    category: 'Dining Room',
    item_type: 'Dining',
  }).select().single();

  if (diningComp) {
    const megatechSupplier = insertedSuppliers?.find(s => s.name === 'Megatech');
    const taobaoSupplier = insertedSuppliers?.find(s => s.name === 'Taobao');
    const { error: diningErr } = await supabase.from('comparison_items').insert([
      { comparison_id: diningComp.id, user_id: userId, product_name: 'Dining Table (Megatech)', price: 2600, quantity: 1, transport_cost: 0, total_cost: 2600, supplier_id: megatechSupplier?.id, remark: '8 seater' },
      { comparison_id: diningComp.id, user_id: userId, product_name: 'Stool (Megatech)', price: 180, quantity: 2, transport_cost: 0, total_cost: 360, supplier_id: megatechSupplier?.id },
      { comparison_id: diningComp.id, user_id: userId, product_name: 'Dining Chair (Taobao)', price: 110, quantity: 4, transport_cost: 356, total_cost: 796, supplier_id: taobaoSupplier?.id },
    ]);
    console.log('Dining comparison items:', diningErr ? diningErr.message : '3 inserted');
  }

  // Ceiling fan comparison
  const { data: fanComp } = await supabase.from('comparisons').insert({
    project_id: pid, user_id: userId,
    name: 'Ceiling Fan',
    category: 'Renovation',
    item_type: 'Fan',
  }).select().single();

  if (fanComp) {
    const prismSupplier = insertedSuppliers?.find(s => s.name === 'Prism+');
    const rezoSupplier = insertedSuppliers?.find(s => s.name.startsWith('Rezo'));
    const { error: fanErr } = await supabase.from('comparison_items').insert([
      { comparison_id: fanComp.id, user_id: userId, product_name: 'Prism+ Laguna Fan', price: 339, quantity: 2, transport_cost: 240, total_cost: 918, supplier_id: prismSupplier?.id, remark: 'For dining area + living room' },
      { comparison_id: fanComp.id, user_id: userId, product_name: 'Rezo Fan Bundle (7 fans)', price: 1933, quantity: 1, transport_cost: 0, total_cost: 1933, supplier_id: rezoSupplier?.id, remark: 'For 7 fans' },
    ]);
    console.log('Fan comparison items:', fanErr ? fanErr.message : '2 inserted');
  }

  console.log('\nSeed complete!');
}

seed();
