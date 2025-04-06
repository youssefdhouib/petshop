import { Component, OnInit } from '@angular/core';
import { OrdersService, Order, AnimalOrder } from '../../../services/orders';
import { Animal, AnimalService } from '../../../services/animals';
import { UsersService } from '../../../services/users';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';

declare interface TableData {
  headerRow: string[];
  dataRows: Order[];
}

@Component({
  selector: 'app-commandes',
  templateUrl: 'commandes.component.html'
})
export class CommandesComponent implements OnInit {

  public tableData1: TableData;
  public isAddMode = false;
  public isEditMode = false;
  public submitted = false;
  
  public formData: Order = {
    user_id: 0,
    animals: [{ id: 0, name: '', price: 0 }],
    total_amount: 0,
    order_date: '',
    status: 'Pending'
  };
  
  public allAnimals: Animal[] = [];
  public availableAnimals: Animal[] = [];
  public currentOrderAnimals: Animal[] = [];
  public users: any[] = [];
  
  public currentPage: number = 1;
  public itemsPerPage: number = 5;
  public searchText: string = '';

  constructor(
    private ordersService: OrdersService,
    private animalService: AnimalService,
    private userService: UsersService,
    private toastr: ToastrService
  ) {
    this.tableData1 = {
      headerRow: ['ID', 'User', 'Animals', 'Status', 'Date', 'Total'],
      dataRows: []
    };
  }

  ngOnInit() {
    this.getOrders();
    this.loadAnimals();
    this.loadUsers();
  }

  // Initial data loading
  getOrders() {
    this.ordersService.getAllOrders().subscribe(
      (orders: Order[]) => {
        this.tableData1.dataRows = orders;
      },
      (error) => {
        this.showError('Failed to load orders', error);
      }
    );
  }

  loadAnimals() {
    this.animalService.getAllAnimals().subscribe(
      (animals) => {
        this.allAnimals = animals;
      },
      (error) => {
        this.showError('Failed to load animals', error);
      }
    );
  }

  loadUsers() {
    this.userService.getAllUsers().subscribe(
      (users) => {
        this.users = users;
      },
      (error) => {
        this.showError('Failed to load users', error);
      }
    );
  }

  // Form methods
  toggleAddForm() {
    this.isAddMode = true;
    this.isEditMode = false;
    this.formData = {
      user_id: 0,
      animals: [{ id: 0, name: '', price: 0 }],
      total_amount: 0,
      order_date: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    this.loadAvailableAnimals();
  }

  cancelForm() {
    this.isAddMode = false;
    this.isEditMode = false;
    this.submitted = false;
  }

  addAnimal() {
    this.formData.animals.push({ id: 0, name: '', price: 0 });
  }

  removeAnimal(index: number) {
    if (this.formData.animals.length > 1) {
      this.formData.animals.splice(index, 1);
      this.calculateTotal();
    } else {
      this.showWarning('At least one animal is required');
    }
  }

  // CRUD operations
  addRow() {
    this.submitted = true;
    
    if (!this.isFormValid()) {
      this.showMissingFieldsAlert();
      return;
    }

    this.calculateTotal();
    
    const orderData = {
      user_id: this.formData.user_id,
      animals: this.formData.animals.filter(a => a.id > 0),
      total_amount: this.formData.total_amount,
      order_date: this.formData.order_date,
      status: this.formData.status
    };

    this.ordersService.createOrder(orderData).subscribe({
      next: (response) => {
        this.showSuccess('Order created successfully');
        this.getOrders();
        this.cancelForm();
      },
      error: (error) => {
        this.showError('Failed to create order', error);
      }
    });
  }

  editRow(index: number) {
    const order = this.filteredRows()[index];
    this.isEditMode = true;
    this.isAddMode = false;
    
    forkJoin([
      this.animalService.getAvailableAnimals(),
      this.animalService.getAnimalsForOrder(order.id)
    ]).subscribe({
      next: ([available, current]) => {
        this.availableAnimals = [...available, ...current];
        this.currentOrderAnimals = [...current];
        this.formData = { ...order };
      },
      error: (error) => {
        this.showError('Failed to load order data', error);
      }
    });
  }

  updateRow() {
    this.submitted = true;
    
    if (!this.isFormValid()) {
      this.showMissingFieldsAlert();
      return;
    }

    if (!this.formData.id) return;

    this.calculateTotal();
    
    const orderData = {
      user_id: this.formData.user_id,
      animals: this.formData.animals.filter(a => a.id > 0),
      total_amount: this.formData.total_amount,
      order_date: this.formData.order_date,
      status: this.formData.status
    };

    this.ordersService.updateOrder(this.formData.id, orderData).subscribe({
      next: () => {
        this.showSuccess('Order updated successfully');
        this.getOrders();
        this.cancelForm();
      },
      error: (error) => {
        this.showError('Failed to update order', error);
      }
    });
  }

  deleteRow(index: number) {
    const order = this.filteredRows()[index];
    
    if (confirm('Are you sure you want to delete this order?')) {
      this.ordersService.deleteOrder(order.id!).subscribe({
        next: () => {
          this.showSuccess('Order deleted successfully');
          this.getOrders();
        },
        error: (error) => {
          this.showError('Failed to delete order', error);
        }
      });
    }
  }

  private isFormValid(): boolean {
    if (!this.formData.user_id || !this.formData.status || !this.formData.order_date) {
      return false;
    }
    
    return this.formData.animals.every(animal => animal.id > 0);
  }
  
  private showMissingFieldsAlert(): void {
    const missingFields = [];
    
    if (!this.formData.user_id) missingFields.push('User');
    if (!this.formData.status) missingFields.push('Status');
    if (!this.formData.order_date) missingFields.push('Order Date');
    
    this.formData.animals.forEach((animal, index) => {
      if (!animal.id) missingFields.push(`Animal ${index + 1}`);
    });
  
    this.showWarning(`Please fill in all required fields: ${missingFields.join(', ')}`);
  }

  loadAvailableAnimals() {
    this.animalService.getAvailableAnimals().subscribe({
      next: (animals) => this.availableAnimals = animals,
      error: (error) => this.showError('Failed to load available animals', error)
    });
  }

  onAnimalSelect(animalId: number, index: number) {
    const animal = this.allAnimals.find(a => a.id === animalId);
    if (animal) {
      this.formData.animals[index] = {
        id: animal.id,
        name: animal.name,
        price: animal.price
      };
      this.calculateTotal();
    }
  }

  calculateTotal() {
    this.formData.total_amount = this.formData.animals.reduce(
      (total, animal) => total + (animal.price || 0), 0
    );
  }

  isAnimalAvailable(animalId: number, currentIndex: number): boolean {
    if (!this.isEditMode) return true;
    
    const currentAnimal = this.formData.animals[currentIndex];
    if (currentAnimal?.id === animalId) return true;
    
    return this.availableAnimals.some(a => a.id === animalId);
  }

  // Notification methods
  private showSuccess(message: string) {
    this.toastr.success(
      `<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">${message}</span>`,
      "",
      {
        timeOut: 4000,
        closeButton: true,
        enableHtml: true,
        toastClass: "alert alert-success alert-with-icon",
        positionClass: "toast-top-right"
      }
    );
  }

  private showWarning(message: string) {
    this.toastr.warning(
      `<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">${message}</span>`,
      "",
      {
        timeOut: 5000,
        closeButton: true,
        enableHtml: true,
        toastClass: "alert alert-warning alert-with-icon",
        positionClass: "toast-top-right"
      }
    );
  }

  private showError(message: string, error?: any) {
    const errorMessage = error?.message ? `${message}: ${error.message}` : message;
    
    this.toastr.error(
      `<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">${errorMessage}</span>`,
      "",
      {
        timeOut: 5000,
        enableHtml: true,
        closeButton: true,
        toastClass: "alert alert-danger alert-with-icon",
        positionClass: "toast-top-right"
      }
    );
  }

  // Pagination and filtering
  filteredRows(): Order[] {
    if (!this.searchText) return this.tableData1.dataRows;
    
    const searchLower = this.searchText.toLowerCase();
    return this.tableData1.dataRows.filter(row =>
      row.status.toLowerCase().includes(searchLower) ||
      this.getUserName(row.user_id).toLowerCase().includes(searchLower) ||
      row.animals.some(a => a.name.toLowerCase().includes(searchLower))
    );
  }

  get paginatedRows(): Order[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRows().slice(startIndex, startIndex + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRows().length / this.itemsPerPage);
  }

  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  // Utility methods
  getUserName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user ? user.fullname || user.email : `User #${userId}`;
  }

  getStatusClass(status: string): string {
    switch(status.toLowerCase()) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  }
}