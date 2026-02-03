// Test the cart flow integration with backend routes
// This tests the implementation:
// 1. POST /cart/init - Initialize cart
// 2. POST /cart/add-list - Add multiple items
// 3. POST /cart/validate - Validate cart

const baseUrl = 'http://localhost:5000';

// Step 1: Initialize cart
async function testInitCart() {
  console.log('Testing /cart/init...');
  const response = await fetch(`${baseUrl}/cart/init`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  console.log('Cart initialized:', data);
  return data.cart_id;
}

// Step 2: Add a list of items
async function testAddList(cartId) {
  console.log('Testing /cart/add-list...');
  const items = [
    { id: 1, quantity: 1 },  // Dafalgan (size: 2)
    { id: 3, quantity: 1 },  // Nurofen (size: 1)
    { id: 8, quantity: 2 },  // Doliprane (size: 2)
  ];
  
  const response = await fetch(`${baseUrl}/cart/add-list`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cart_id: cartId,
      items: items
    })
  });
  const data = await response.json();
  console.log('Items added:', data);
  return data;
}

// Step 3: Validate cart
async function testValidateCart(cartId) {
  console.log('Testing /cart/validate...');
  const response = await fetch(`${baseUrl}/cart/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cart_id: cartId })
  });
  const data = await response.json();
  console.log('Cart validated:', data);
  return data;
}

// Run all tests
async function runTests() {
  try {
    const cartId = await testInitCart();
    const addResult = await testAddList(cartId);
    const validateResult = await testValidateCart(cartId);
    console.log('\n=== TEST COMPLETE ===');
    console.log('Cart ID:', cartId);
    console.log('Final cart:', validateResult);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Uncomment to run tests:
// runTests();

export { testInitCart, testAddList, testValidateCart };
