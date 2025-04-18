import { Platform } from 'react-native';
import { checkBluetoothPermissions, requestBluetoothPermissions } from './permissions';

// Define interface for BluetoothPrinterService
interface PrinterDevice {
  id: string;
  name: string;
  address?: string;
  class?: number;
  rssi?: number;
}

// Class to handle Bluetooth printer connections
class BluetoothPrinterService {
  private static instance: BluetoothPrinterService;
  private BluetoothSerial: any = null;
  private isConnected: boolean = false;
  private currentPrinter: PrinterDevice | null = null;
  
  private constructor() {
    // Do not attempt to load the Bluetooth module on web
    if (Platform.OS !== 'web') {
      // For Expo managed workflow, create a mock implementation
      console.log('Creating mock Bluetooth service implementation for Expo');
      this.createMockImplementation();
    }
  }
  
  private createMockImplementation() {
    // Create a mock implementation for demo purposes
    this.BluetoothSerial = {
      isEnabled: async () => true,
      enable: async () => true,
      list: async () => {
        return [
          {
            id: 'mock-woosim-id',
            name: 'Woosim WSP-i450',
            address: '00:11:22:33:44:55'
          },
          {
            id: 'mock-star-id',
            name: 'Star SM-T300i',
            address: '55:44:33:22:11:00'
          }
        ];
      },
      discoverUnpairedDevices: async () => {},
      listUnpaired: async () => {
        return [
          {
            id: 'mock-woosim-unpaired-id',
            name: 'Woosim WSP-i450 (New)',
            address: '66:77:88:99:00:11'
          }
        ];
      },
      cancelDiscovery: async () => {},
      pairDevice: async (id: string) => {},
      connect: async (id: string) => {
        this.isConnected = true;
        this.currentPrinter = {
          id,
          name: id.includes('woosim') ? 'Woosim WSP-i450' : 'Star SM-T300i'
        };
        return true;
      },
      disconnect: async () => {
        this.isConnected = false;
        this.currentPrinter = null;
        return true;
      },
      write: async (text: string) => true
    };
  }
  
  // Singleton pattern to ensure only one instance
  public static getInstance(): BluetoothPrinterService {
    if (!BluetoothPrinterService.instance) {
      BluetoothPrinterService.instance = new BluetoothPrinterService();
    }
    return BluetoothPrinterService.instance;
  }
  
  // Check if Bluetooth functionality is available
  private isBluetoothAvailable(): boolean {
    return this.BluetoothSerial !== null && Platform.OS !== 'web';
  }
  
  // Check if Bluetooth is available and enabled
  public async isBluetoothEnabled(): Promise<boolean> {
    if (!this.isBluetoothAvailable()) {
      return false;
    }
    
    try {
      return await this.BluetoothSerial.isEnabled();
    } catch (error) {
      console.log('Error checking Bluetooth status:', error);
      return false;
    }
  }
  
  // Enable Bluetooth if it's not already enabled
  public async enableBluetooth(): Promise<boolean> {
    if (!this.isBluetoothAvailable()) {
      return false;
    }
    
    try {
      return await this.BluetoothSerial.enable();
    } catch (error) {
      console.log('Error enabling Bluetooth:', error);
      return false;
    }
  }
  
  // Get list of paired devices
  public async getPairedDevices(): Promise<PrinterDevice[]> {
    if (!this.isBluetoothAvailable()) {
      return [];
    }
    
    try {
      // Check for required permissions first
      const permissionsGranted = await checkBluetoothPermissions();
      if (!permissionsGranted) {
        const requested = await requestBluetoothPermissions();
        if (!requested) {
          throw new Error('Bluetooth permissions not granted');
        }
      }
      
      const devices = await this.BluetoothSerial.list();
      return devices.map((device: any) => ({
        id: device.id,
        name: device.name || 'Unknown Device',
        address: device.address
      }));
    } catch (error) {
      console.log('Error getting paired devices:', error);
      return [];
    }
  }
  
  // Get list of available devices (including unpaired)
  public async scanForDevices(timeoutMs: number = 10000): Promise<PrinterDevice[]> {
    if (!this.isBluetoothAvailable()) {
      return [];
    }
    
    try {
      // Check for required permissions first
      const permissionsGranted = await checkBluetoothPermissions();
      if (!permissionsGranted) {
        const requested = await requestBluetoothPermissions();
        if (!requested) {
          throw new Error('Bluetooth permissions not granted');
        }
      }
      
      // Start discovery
      await this.BluetoothSerial.discoverUnpairedDevices();
      
      // Wait for specified timeout to discover devices
      await new Promise(resolve => setTimeout(resolve, timeoutMs));
      
      // Get discovered devices
      const devices = await this.BluetoothSerial.listUnpaired();
      return devices.map((device: any) => ({
        id: device.id,
        name: device.name || 'Unknown Device',
        address: device.address
      }));
    } catch (error) {
      console.log('Error scanning for devices:', error);
      return [];
    } finally {
      // Cancel discovery
      if (this.isBluetoothAvailable()) {
        try {
          await this.BluetoothSerial.cancelDiscovery();
        } catch (error) {
          console.log('Error canceling discovery:', error);
        }
      }
    }
  }
  
  // Connect to a specific Woosim printer
  public async connectToWoosimPrinter(): Promise<boolean> {
    if (!this.isBluetoothAvailable()) {
      console.log('BluetoothSerial not available on this platform');
      return false;
    }
    
    try {
      // First check if we're already connected
      if (this.isConnected && this.currentPrinter?.name.includes('Woosim')) {
        console.log('Already connected to Woosim printer');
        return true;
      }
      
      // Get list of paired devices
      const pairedDevices = await this.getPairedDevices();
      const woosimPrinter = pairedDevices.find(device => 
        device.name && device.name.includes('Woosim')
      );
      
      if (!woosimPrinter) {
        console.log('No paired Woosim printer found, scanning for unpaired devices...');
        
        // Scan for unpaired devices
        const unpaired = await this.scanForDevices();
        const unpairePrinter = unpaired.find(device => 
          device.name && device.name.includes('Woosim')
        );
        
        if (!unpairePrinter) {
          console.log('No Woosim printer found');
          return false;
        }
        
        // Try to pair with the printer first
        try {
          await this.BluetoothSerial.pairDevice(unpairePrinter.id);
          console.log('Woosim printer paired successfully');
        } catch (error) {
          console.log('Error pairing with Woosim printer:', error);
          // We'll still try to connect even if pairing failed
        }
        
        return await this.connectToDevice(unpairePrinter);
      }
      
      return await this.connectToDevice(woosimPrinter);
    } catch (error) {
      console.log('Error connecting to Woosim printer:', error);
      return false;
    }
  }
  
  // Connect to a specific device
  public async connectToDevice(device: PrinterDevice): Promise<boolean> {
    if (!this.isBluetoothAvailable()) {
      return false;
    }
    
    try {
      // Disconnect from any current connection first
      if (this.isConnected) {
        await this.disconnect();
      }
      
      // Connect to the new device
      await this.BluetoothSerial.connect(device.id);
      this.isConnected = true;
      this.currentPrinter = device;
      
      console.log(`Connected to ${device.name}`);
      return true;
    } catch (error) {
      console.log(`Error connecting to ${device.name}:`, error);
      this.isConnected = false;
      this.currentPrinter = null;
      return false;
    }
  }
  
  // Disconnect from current device
  public async disconnect(): Promise<boolean> {
    // If we're not connected, just return true since we're already disconnected
    if (!this.isConnected) {
      return true;
    }
    
    // Check if Bluetooth is available 
    if (!this.isBluetoothAvailable() || !this.BluetoothSerial) {
      this.isConnected = false;
      this.currentPrinter = null;
      return true;
    }
    
    try {
      // Safely check if disconnect method exists before calling
      if (typeof this.BluetoothSerial.disconnect === 'function') {
        await this.BluetoothSerial.disconnect();
      }
      
      this.isConnected = false;
      this.currentPrinter = null;
      
      console.log('Disconnected from printer');
      return true;
    } catch (error) {
      console.log('Error disconnecting from printer:', error);
      // Still clear the connection state
      this.isConnected = false;
      this.currentPrinter = null;
      return false;
    }
  }
  
  // Print raw text to the connected printer
  public async printText(text: string): Promise<boolean> {
    if (!this.isBluetoothAvailable() || !this.isConnected) {
      return false;
    }
    
    try {
      await this.BluetoothSerial.write(text);
      console.log('Text sent to printer');
      return true;
    } catch (error) {
      console.log('Error printing text:', error);
      return false;
    }
  }
  
  // Check if we have an active printer connection
  public isConnectedToPrinter(): boolean {
    return this.isConnected;
  }

  // Get current printer information
  public getCurrentPrinter(): PrinterDevice | null {
    return this.currentPrinter;
  }
  
  // Print a simple test page
  public async printTestPage(): Promise<boolean> {
    const testText = '\n\r' +
      '=========================\n\r' +
      '    PAGINA DE PRUEBA     \n\r' +
      '=========================\n\r' +
      '\n\r' +
      'Impresora: ' + (this.currentPrinter?.name || 'Desconocida') + '\n\r' +
      'Fecha: ' + new Date().toLocaleString() + '\n\r' +
      '\n\r' +
      'Texto normal\n\r' +
      '\x1B\x21\x01' + 'Texto enfatizado\n\r' + '\x1B\x21\x00' +
      '\x1B\x21\x08' + 'Texto grande\n\r' + '\x1B\x21\x00' +
      '\x1B\x21\x10' + 'Texto doble alto\n\r' + '\x1B\x21\x00' +
      '\x1B\x21\x20' + 'Texto doble ancho\n\r' + '\x1B\x21\x00' +
      '\x1B\x21\x30' + 'Texto grande y ancho\n\r' + '\x1B\x21\x00' +
      '\n\r' +
      '=========================\n\r' +
      '     FIN DE PRUEBA       \n\r' +
      '=========================\n\r' +
      '\n\r\n\r\n\r\n\r\n\r';
    
    return await this.printText(testText);
  }
  
  // Print a basic receipt for the invoice
  public async printInvoice(invoice: any): Promise<boolean> {
    if (!invoice) {
      console.log('No invoice data provided');
      return false;
    }
    
    try {
      // Format for Woosim WSP-i450 thermal printer
      const header = 
        '\x1B\x40' + // Initialize printer
        '\x1B\x61\x01' + // Center alignment
        '\x1B\x21\x08' + // Double-height text
        'FACTURA ELECTRONICA\n\r' +
        '\x1B\x21\x00' + // Normal text
        '\x1B\x61\x01' + // Center alignment
        `N° ${invoice.assignedFolio}\n\r` +
        '\x1B\x61\x00' + // Left alignment
        '=========================\n\r' +
        `Fecha: ${new Date(invoice.date).toLocaleDateString()}\n\r` +
        `Estado: ${invoice.state[1]}\n\r` +
        '=========================\n\r' +
        'CLIENTE:\n\r' +
        `${invoice.client.name}\n\r` +
        `RUT: ${invoice.client.rut}\n\r` +
        '=========================\n\r\n\r';
      
      const footer = 
        '\n\r=========================\n\r' +
        '\x1B\x61\x02' + // Right alignment
        `TOTAL: $ ${invoice.total.toLocaleString('es-CL')}\n\r` +
        '\x1B\x61\x01' + // Center alignment
        '\n\r\n\rGracias por su compra\n\r' +
        `${new Date().toLocaleString()}\n\r` +
        '\n\r\n\r\n\r';
      
      const printContent = header + footer;
      
      return await this.printText(printContent);
    } catch (error) {
      console.log('Error formatting invoice for printing:', error);
      return false;
    }
  }
  
  // Convert a PDF document to printable format for thermal printers
  // This is a simplified version that doesn't actually convert the PDF
  // In a real implementation, you would need a PDF parsing library
  public async printPdf(pdfUrl: string): Promise<boolean> {
    if (!this.isBluetoothAvailable() || !this.isConnected) {
      return false;
    }
    
    try {
      // In a real implementation, you would:
      // 1. Fetch the PDF data
      // 2. Parse it to extract text
      // 3. Format the text for the thermal printer
      // 4. Send the formatted text to the printer
      
      // For now, we'll just print a message saying we're printing the PDF
      const message = 
        '\x1B\x40' + // Initialize printer
        '\x1B\x61\x01' + // Center alignment
        '\x1B\x21\x08' + // Double-height text
        'IMPRESION DE PDF\n\r' +
        '\x1B\x21\x00' + // Normal text
        '\n\r' +
        'Este es un documento PDF\n\r' +
        'convertido para impresión térmica\n\r' +
        '\n\r' +
        'URL: ' + pdfUrl.substring(0, 30) + '...\n\r' +
        '\n\r\n\r\n\r';
        
      return await this.printText(message);
    } catch (error) {
      console.log('Error printing PDF:', error);
      return false;
    }
  }
}

export default BluetoothPrinterService.getInstance();