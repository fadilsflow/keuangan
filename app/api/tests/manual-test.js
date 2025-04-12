/**
 * Manual Transaction Test
 * 
 * This file provides helpers for manual testing of the transaction creation
 * functionality with organizationId and userId.
 * 
 * To use in the browser console:
 * 1. Copy this entire file
 * 2. Paste in browser console when on the transaction create page
 * 3. Call testCreateTransaction() to run a test
 */

// Configuration
const API_URL = '/api/transactions';

// Test transaction data
const testTransaction = {
  date: new Date().toISOString().split('T')[0],
  description: 'Test transaction with organizationId and userId',
  category: 'Test Category',
  relatedParty: 'Test Party',
  amountTotal: 100,
  type: 'pemasukan',
  items: [
    {
      name: 'Test Item',
      itemPrice: 100,
      quantity: 1,
    }
  ]
};

// Function to create transaction
async function createTransaction(data) {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(`Error: ${result.error}`);
    }
    
    return result;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

// Test function
async function testCreateTransaction() {
  console.log('Testing transaction creation with organizationId and userId...');
  console.log('Test data:', testTransaction);
  
  try {
    const result = await createTransaction(testTransaction);
    console.log('✅ Transaction created successfully!');
    console.log('Transaction ID:', result.transaction.id);
    console.log('Organization ID:', result.transaction.organizationId);
    console.log('User ID:', result.transaction.userId);
    console.log('Full result:', result);
    return result;
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Export the test function so it can be used in the console
window.testCreateTransaction = testCreateTransaction;

console.log('Transaction test helper loaded. Call testCreateTransaction() to run a test.'); 