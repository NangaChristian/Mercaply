const fs = require('fs');
let content = fs.readFileSync('src/pages/checkout/CheckoutPage.tsx', 'utf-8');

const startIndex = content.indexOf('const handleConfirmOrder = async () => {');
const endIndex = content.indexOf('return (', startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const confirmOrderReplacement = `const handleConfirmOrder = async () => {
    if (!acceptedCGV || !user) return;
    
    setIsProcessing(true);
    try {
      const sellerId = items[0]?.product?.sellerId || 'unknown_seller';

      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        title: item.product.title,
        variants: item.variants || {},
      }));

      const { supabase } = await import('../../lib/supabase');
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${session?.access_token}\`
        },
        body: JSON.stringify({
          userId: user.id,
          sellerId,
          amount: total,
          items: orderItems,
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Erreur lors de l\\'initialisation du paiement');
      }

      const paymentData = await res.json();
      clearCart();

      if (paymentData.link) {
        window.location.href = paymentData.link;
      } else {
        navigate('/checkout/success?orderId=' + paymentData.orderId);
      }
    } catch (error: any) {
      console.error('Error confirming order:', error);
      alert('Une erreur est survenue: ' + error.message);
      setIsProcessing(false);
    }
  };

  `;

  content = content.substring(0, startIndex) + confirmOrderReplacement + content.substring(endIndex);
  fs.writeFileSync('src/pages/checkout/CheckoutPage.tsx', content);
} else {
  console.log("Could not find bounds");
}
