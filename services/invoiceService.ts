import { api, InvoiceRequest, TicketRequest } from './api';
import { Alert } from 'react-native';

/**
 * Service for generating electronic invoices and tickets
 * This centralizes the invoice/ticket generation logic so it can be shared
 * between different components like Factura-Electronica.tsx and Quick.tsx
 */

/**
 * Generate an electronic invoice
 * @param invoiceData - The invoice data to submit
 * @returns A promise with the invoice response or null if an error occurred
 */
export async function generateInvoice(invoiceData: InvoiceRequest) {
  try {
    console.log('Beginning generateInvoice in invoiceService');
    
    // Validate invoice data
    if (!validateInvoiceData(invoiceData)) {
      console.log('Invoice data validation failed');
      return null;
    }
    
    console.log('Invoice data passed validation');
    
    // Call the API to create the invoice
    console.log('Calling api.createInvoice with data:', JSON.stringify(invoiceData, null, 2));
    const response = await api.createInvoice(invoiceData);
    
    // Log success and return response
    console.log('Invoice created successfully:', JSON.stringify(response, null, 2));
    return response;
  } catch (error) {
    // Handle errors
    console.error('Error in generateInvoice:', error);
    
    let errorMessage = 'Ocurrió un error al intentar generar la factura. Por favor, intente nuevamente.';
    
    if (error instanceof Error) {
      errorMessage = `Error al generar factura: ${error.message}`;
      console.error('Error details:', error.stack);
    } else {
      console.error('Unknown error type:', error);
    }
    
    // Show error alert
    Alert.alert(
      'Error al generar factura',
      errorMessage,
      [{ text: 'OK' }]
    );
    
    // Rethrow the error for the component to handle
    throw error;
  }
}

/**
 * Generate an electronic ticket (boleta)
 * @param ticketData - The ticket data to submit
 * @returns A promise with the ticket response or null if an error occurred
 */
export async function generateTicket(ticketData: TicketRequest) {
  try {
    console.log('Beginning generateTicket in invoiceService');
    
    // Validate ticket data
    if (!validateTicketData(ticketData)) {
      console.log('Ticket data validation failed');
      return null;
    }
    
    console.log('Ticket data passed validation');
    
    // Call the API to create the ticket
    console.log('Calling api.createTicket with data:', JSON.stringify(ticketData, null, 2));
    const response = await api.createTicket(ticketData);
    
    // Log success and return response
    console.log('Ticket created successfully. Response:', JSON.stringify(response, null, 2));
    
    // Check if the response has details property and it's not an array before returning
    if (response.details === undefined || !Array.isArray(response.details)) {
      // If details is missing or not an array, create a safe default
      console.log('Response details property is missing or not an array. Creating safe default.');
      response.details = [];
    }
    
    return response;
  } catch (error) {
    // Enhanced error handling with detailed logging
    console.error('Error in generateTicket:', error);
    
    let errorMessage = 'Ocurrió un error al intentar generar la boleta. Por favor, intente nuevamente.';
    
    // Extract more detailed error information if available
    if (error instanceof Error) {
      errorMessage = `Error al generar boleta: ${error.message}`;
      console.error('Error stack:', error.stack);
    } else {
      console.error('Unknown error type:', error);
    }
    
    // Show error alert with the specific error message from the API if available
    Alert.alert(
      'Error al generar boleta',
      errorMessage,
      [{ text: 'OK' }]
    );
    
    // Rethrow the error for the component to handle
    throw error;
  }
}

/**
 * Validate invoice data before submission
 * @param invoiceData - The invoice data to validate
 * @returns Boolean indicating if the data is valid
 */
function validateInvoiceData(invoiceData: InvoiceRequest): boolean {
  console.log('Validating invoice data');
  
  // Check if client is provided
  if (!invoiceData.client || !invoiceData.client.code || !invoiceData.client.name) {
    Alert.alert('Error', 'Debe seleccionar un cliente válido para generar la factura');
    console.log('Validation failed: Missing client data');
    return false;
  }
  
  // Check if details are provided and not empty
  if (!invoiceData.details || invoiceData.details.length === 0) {
    Alert.alert('Error', 'Debe agregar al menos un producto a la factura');
    console.log('Validation failed: No products in details');
    return false;
  }
  
  // Check date
  if (!invoiceData.date) {
    Alert.alert('Error', 'La fecha de emisión es requerida');
    console.log('Validation failed: Missing date');
    return false;
  }
  
  console.log('Invoice data validation passed');
  return true;
}

/**
 * Validate ticket data before submission
 * @param ticketData - The ticket data to validate
 * @returns Boolean indicating if the data is valid
 */
function validateTicketData(ticketRequest: TicketRequest): boolean {
  console.log('Validating ticket data');
  
  // Check if details are provided and not empty
  if (!ticketRequest.details || ticketRequest.details.length === 0) {
    Alert.alert('Error', 'Debe agregar al menos un producto a la boleta');
    console.log('Validation failed: No products in details');
    return false;
  }
  
  // Check ticket type
  if (!ticketRequest.ticketType || !ticketRequest.ticketType.code) {
    Alert.alert('Error', 'El tipo de boleta es requerido');
    console.log('Validation failed: Missing ticket type');
    return false;
  }
  
  // Check date
  if (!ticketRequest.date) {
    Alert.alert('Error', 'La fecha de emisión es requerida');
    console.log('Validation failed: Missing date');
    return false;
  }
  
  console.log('Ticket data validation passed');
  return true;
}

/**
 * Format invoice data from component state to API request format
 * This helper function can standardize the data format between different components
 * 
 * @param clientData - Client data from component state
 * @param productsData - Products data from component state
 * @param options - Additional options like payment method, date, etc.
 * @returns Formatted invoice request object
 */
export function formatInvoiceData(
  clientData: any,
  productsData: any[],
  options: {
    date?: string;
    paymentMethod?: string;
    paymentCondition?: string;
    currency?: string;
    hasTaxes?: boolean;
  } = {}
): InvoiceRequest {
  // Default values
  const date = options.date || new Date().toISOString().split('T')[0];
  const currency = options.currency || 'CLP';
  const hasTaxes = options.hasTaxes !== undefined ? options.hasTaxes : true;
  
  // Format client data
  const client = {
    code: clientData.code || clientData.rut,
    name: clientData.name,
    address: clientData.address,
    municipality: clientData.municipality?.name,
    line: clientData.line || 'Empresa'
  };
  
  // Format product details
  const details = productsData.map((product, index) => ({
    position: index + 1,
    product: {
      code: product.code || product.id?.toString() || `PROD${index + 1}`,
      name: product.name,
      price: product.price,
      unit: product.unit ? { code: product.unit.code || 'UN' } : { code: 'UN' },
      category: product.category ? {
        id: product.category.id,
        code: product.category.code,
        name: product.category.name,
        otherTax: product.category.otherTax || product.additionalTax ? {
          id: product.category.otherTax?.id || 1,
          code: product.category.otherTax?.code || 'TAX',
          name: product.category.otherTax?.name || product.additionalTax?.name || 'Impuesto',
          percent: product.category.otherTax?.percent || (product.additionalTax?.rate * 100) || 0
        } : undefined
      } : undefined
    },
    quantity: product.quantity || 1,
    description: product.description
  }));
  
  // Log the formatted details for debugging
  console.log('Formatted invoice details:', JSON.stringify(details, null, 2));
  
  // Construct the invoice request
  const invoiceRequest: InvoiceRequest = {
    currency,
    hasTaxes,
    client,
    date,
    details
  };
  
  // Add payment method and condition if provided
  if (options.paymentMethod) {
    invoiceRequest.paymentMethod = options.paymentMethod;
  }
  
  if (options.paymentCondition) {
    invoiceRequest.paymentCondition = options.paymentCondition;
  }
  
  return invoiceRequest;
}

/**
 * Format ticket data from component state to API request format
 * 
 * @param clientData - Client data from component state (optional for boletas)
 * @param productsData - Products data from component state
 * @param options - Additional options
 * @returns Formatted ticket request object
 */
export function formatTicketData(
  clientData: any | null,
  productsData: any[],
  options: {
    date?: string;
    ticketTypeCode?: string;
    paymentMethod?: string;
    paymentCondition?: string;
    netAmounts?: boolean;
    hasTaxes?: boolean;
  } = {}
): TicketRequest {
  console.log('Formatting ticket data with options:', options);
  
  // Default values
  const date = options.date || new Date().toISOString().split('T')[0];
  const ticketTypeCode = options.ticketTypeCode || '3';  // Default code for Boleta Electrónica
  const netAmounts = options.netAmounts !== undefined ? options.netAmounts : false;
  const hasTaxes = options.hasTaxes !== undefined ? options.hasTaxes : true;
  
  // Format product details
  const details = productsData.map((product, index) => ({
    position: index + 1,
    product: {
      code: product.code || product.id?.toString() || `PROD${index + 1}`,
      name: product.name,
      price: product.price,
      unit: product.unit ? { code: product.unit.code || 'UN' } : { code: 'UN' },
      category: product.category ? {
        id: product.category.id || 1,
        code: product.category.code || 'CAT',
        name: product.category.name || 'Categoría',
        otherTax: product.category.otherTax || product.additionalTax ? {
          id: product.category.otherTax?.id || 1,
          code: product.category.otherTax?.code || 'TAX',
          name: product.category.otherTax?.name || product.additionalTax?.name || 'Impuesto',
          percent: product.category.otherTax?.percent || (product.additionalTax?.rate * 100) || 0
        } : undefined
      } : undefined
    },
    quantity: product.quantity || 1,
    description: product.description
  }));
  
  // Log the formatted details for debugging
  console.log('Formatted ticket details:', JSON.stringify(details, null, 2));
  
  // Construct the ticket request
  const ticketRequest: TicketRequest = {
    netAmounts,
    hasTaxes,
    ticketType: {
      code: ticketTypeCode
    },
    date,
    details
  };
  
  // Add client if provided (optional for boletas)
  if (clientData) {
    ticketRequest.client = {
      code: clientData.code || clientData.rut || '66666666-6',
      name: clientData.name || 'Cliente Final',
      address: clientData.address,
      municipality: clientData.municipality?.name
    };
  } else {
    // Add default client for boletas
    ticketRequest.client = {
      code: '66666666-6',
      name: 'Cliente Final'
    };
  }
  
  // Add payment method and condition if provided
  if (options.paymentMethod) {
    ticketRequest.paymentMethod = options.paymentMethod;
  }
  
  if (options.paymentCondition) {
    ticketRequest.paymentCondition = options.paymentCondition;
  }
  
  console.log('Final formatted ticket request:', JSON.stringify(ticketRequest, null, 2));
  return ticketRequest;
}