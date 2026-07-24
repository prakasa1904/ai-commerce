import { CartState } from '../../domain/types/index.js';

const cartStore: CartState = {
  items: [],
  addItem: (item: CartItem) => {
    cartStore.items = [...cartStore.items, item];
  },
  removeItem: (id: number) => {
    cartStore.items = cartStore.items.filter(i => i.product.id !== id);
  }
};

export default cartStore;