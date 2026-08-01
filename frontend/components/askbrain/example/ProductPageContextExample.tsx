'use client';

/**
 * Example: How to integrate AskBrain context in any page
 */

import { useEffect } from 'react';
import { usePageContext, useUpdatePageContext, useAskBrain } from '../index';

export function ProductPageWithAskBrain({ product }: { product: any }) {
  const { updateProductContext } = useUpdatePageContext();
  const { sendMessage } = useAskBrain();

  useEffect(() => {
    updateProductContext({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      brand: product.brand,
      seller: product.seller?.name,
      rating: product.rating,
      reviews: product.reviews,
    });
  }, [product, updateProductContext]);

  return (
    <div className="product-page">
      <h1>{product.name}</h1>
      <p>Price: ₹{product.price}</p>
      <button onClick={() => sendMessage("Should I buy this?")}>
        Ask AskBrain
      </button>
    </div>
  );
}

export function CartPageWithAskBrain({ items, total }: { items: any[]; total: number }) {
  const { updateContext, sendMessage } = useUpdatePageContext();

  useEffect(() => {
    updateContext({
      cartContext: {
        items: items.map(item => ({
          productId: item.id,
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total,
        itemCount: items.length,
      },
    });
  }, [items, total, updateContext]);

  return (
    <div className="cart-page">
      <h1>Cart ({items.length} items)</h1>
      <p>Total: ₹{total}</p>
      <button onClick={() => sendMessage("Can I save money?")}>
        💡 Find Savings
      </button>
    </div>
  );
}

export function SellerDashboardWithAskBrain({ stats }: { stats: any }) {
  const { updateContext } = useUpdatePageContext();

  useEffect(() => {
    updateContext({
      userContext: { id: stats.sellerId, role: 'seller', preferences: {} },
      dashboardContext: {
        type: 'seller',
        stats: {
          revenue: stats.revenue,
          orders: stats.orders,
          conversion: stats.conversion,
        },
      },
    });
  }, [stats, updateContext]);

  return (
    <div className="seller-dashboard">
      <h1>Seller Dashboard</h1>
    </div>
  );
}
