export const maskCPF = (v) => {
  if (!v) return "";
  v = v.replace(/\D/g, "");
  if (v.length > 11) v = v.substring(0, 11);
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return v;
};

export const maskPhone = (v) => {
  if (!v) return "";
  v = v.replace(/\D/g, "");
  if (v.length > 11) v = v.substring(0, 11);
  v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
  v = v.replace(/(\d{5})(\d)/, "$1-$2");
  return v;
};

export const maskCurrency = (v) => {
  if (!v && v !== 0) return "";
  let val = v.toString().replace(/\D/g, "");
  if (!val) return "";
  
  // Ensure we have at least 3 digits to avoid ".00" issues when formatting small numbers
  val = val.padStart(3, '0');
  
  const integerPart = val.slice(0, -2);
  const decimalPart = val.slice(-2);
  
  let formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  
  // Remove leading zeros from integer part unless it's just "0"
  formattedInteger = formattedInteger.replace(/^0+(?=\d)/, "");
  if (formattedInteger === "") formattedInteger = "0";

  return "R$ " + formattedInteger + "," + decimalPart;
};

export const sanitizeValue = (v) => {
  if (!v && v !== 0) return "";
  return v.toString().replace(/\D/g, "");
};
