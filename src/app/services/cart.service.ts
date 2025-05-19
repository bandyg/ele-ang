import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/cart-item.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  private cartCountSubject = new BehaviorSubject<number>(0);

  constructor() {
    // Load cart from localStorage if available
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      this.cartItems = JSON.parse(savedCart);
      this.updateCart();
    }
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartItemsSubject.asObservable();
  }

  getCartCount(): Observable<number> {
    return this.cartCountSubject.asObservable();
  }

  addToCart(item: CartItem): void {
    const existingItemIndex = this.cartItems.findIndex((i) => i.id === item.id);

    if (existingItemIndex !== -1) {
      // Increment quantity if item already exists
      this.cartItems[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item
      this.cartItems.push({ ...item });
    }

    this.updateCart();
  }

  removeFromCart(itemId: string): void {
    this.cartItems = this.cartItems.filter((item) => item.id !== itemId);
    this.updateCart();
  }

  updateQuantity(itemId: string, quantity: number): void {
    const index = this.cartItems.findIndex((item) => item.id === itemId);
    if (index !== -1) {
      this.cartItems[index].quantity = quantity;
      this.updateCart();
    }
  }

  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
  }

  private updateCart(): void {
    // Update observables
    this.cartItemsSubject.next([...this.cartItems]);

    // Calculate total count
    const count = this.cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );
    this.cartCountSubject.next(count);

    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(this.cartItems));
  }
}
