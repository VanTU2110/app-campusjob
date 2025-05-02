// utils/formatters.ts

/**
 * Format currency values with appropriate symbols
 * @param amount Number to format
 * @param currency Currency code (USD, EUR, VND, etc.)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string): string => {
    // Define common currency symbols
    const currencySymbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CNY: '¥',
      KRW: '₩',
      VND: '₫',
      THB: '฿',
      INR: '₹',
      RUB: '₽',
      // Add more currencies as needed
    };
  
    // Default to ISO code if symbol not found
    const symbol = currencySymbols[currency] || currency;
    
    // Format the number with thousands separators
    let formattedAmount: string;
    
    try {
      // Use Intl.NumberFormat if available
      formattedAmount = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (error) {
      // Fallback for older devices
      formattedAmount = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    // Return formatted amount with symbol
    return `${symbol}${formattedAmount}`;
  };
  /**
 * Format phone number to more readable format
 * Example: 0987654321 -> 098 765 4321
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) { // Standard Vietnamese mobile number
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  } else if (cleaned.length === 11) { // Some special cases
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  } else {
    // Return original if format not recognized
    return phoneNumber;
  }
};

/**
 * Truncate text with ellipsis if it exceeds maxLength
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Format date to localized string
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};