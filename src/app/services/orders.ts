import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Order {
  id?: number;
  user_id: number;
  animal_id: number;
  status: string;
  order_date: string;
  total_amount: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl = 'http://localhost:8081/petshop/api/orders';
  
  constructor(private http: HttpClient) {}

  getAllOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/get/${id}`);
  }

  createOrder(order: Order): Observable<any> {
    return this.http.post<Order>(`${this.apiUrl}/add`, order);
  }

  updateOrder(id: number, order: Order): Observable<any> {
    return this.http.put<Order>(`${this.apiUrl}/update/${id}`, order);
  }

  // Suppression d'une commande
  deleteOrder(id: number): Observable<any> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}

