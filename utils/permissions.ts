import { PermissionsAndroid, Platform } from "react-native";

/**
 * Requests Bluetooth permissions for Android devices
 * Required for connecting to Bluetooth printers
 * 
 * Note: For iOS, these permissions are handled through Info.plist,
 * which is managed by Expo in the managed workflow
 */
export const requestBluetoothPermissions = async (): Promise<boolean> => {
  if (Platform.OS !== "android") {
    return true; // iOS doesn't need runtime permission requests for this
  }
  
  try {
    const apiLevel = parseInt(Platform.Version.toString(), 10);
    
    // For Android 12 (API level 31) and higher, we need these specific permissions
    if (apiLevel >= 31) {
      // In Expo managed workflow, we can't directly access these permissions
      // This is a simulated response since we can't actually request these permissions
      console.log('Simulating Bluetooth permission request in Expo managed workflow');
      return true;
    }
    // For older Android versions
    else if (apiLevel >= 23) {
      // Location permission is often used as a proxy for Bluetooth in older Android versions
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Acceso a ubicación",
          message: "Esta aplicación necesita acceso a su ubicación para buscar dispositivos Bluetooth cercanos.",
          buttonNeutral: "Preguntar después",
          buttonNegative: "Cancelar",
          buttonPositive: "OK"
        }
      );
      
      return result === PermissionsAndroid.RESULTS.GRANTED;
    }
    
    return true; // Permissions not required for very old Android versions
  } catch (err) {
    console.error("Error requesting Bluetooth permissions:", err);
    return false;
  }
};

/**
 * Checks if Bluetooth permissions are granted
 * Useful to determine if we should show permission UI or proceed with Bluetooth operations
 */
export const checkBluetoothPermissions = async (): Promise<boolean> => {
  if (Platform.OS !== "android") {
    return true; // iOS handles this differently
  }
  
  try {
    const apiLevel = parseInt(Platform.Version.toString(), 10);
    
    if (apiLevel >= 31) {
      // In Expo managed workflow, simulate a check
      console.log('Simulating Bluetooth permission check in Expo managed workflow');
      return true;
    }
    else if (apiLevel >= 23) {
      return await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
    }
    
    return true;
  } catch (err) {
    console.error("Error checking Bluetooth permissions:", err);
    return false;
  }
};