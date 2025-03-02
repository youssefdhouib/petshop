import { Component, OnInit } from '@angular/core';
import { OrdersService, Order } from '../../../services/orders'; // Import the service

declare interface TableData {
  headerRow: string[];
  dataRows: Order[];
}

@Component({
  selector: 'orders',
  moduleId: module.id,
  templateUrl: 'commandes.component.html',
})
export class CommandesComponent implements OnInit {
  public tableData1: TableData;
  public isAddMode = false;
  public isEditMode = false;
  public formData: Order = {
    user_id: 0, 
    animal_id: 0,
    status: '', 
    order_date: '', 
    total_amount: 0
  };
  public imagePreview: string | ArrayBuffer | null = null;
  public selectedFileName: string | null = null;
  public currentPage: number = 1;
  public itemsPerPage: number = 5;
  public searchText: string = '';

  constructor(private ordersService: OrdersService) {}

  ngOnInit() {
    this.tableData1 = {
      headerRow: ['ID', 'User ID', 'Animal ID', 'Status', 'Order Date', 'Total Amount'], // Adjust based on order data
      dataRows: []
    };
    this.getOrders(); // Fetch all orders when component loads
  }

  getOrders() {
    this.ordersService.getAllOrders().subscribe(
      (orders: Order[]) => {
        console.log(orders);
        this.tableData1.dataRows = orders;
      },
      (error) => {
        console.error('Failed to fetch orders', error);
      }
    );
  }

  // Pagination
  get paginatedRows() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredRows().slice(startIndex, endIndex);
  }

  previousPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  get totalPages() {
    return Math.ceil(this.filteredRows().length / this.itemsPerPage);
  }

  filteredRows() {
    return this.tableData1.dataRows.filter(row =>
      row.status.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // Add New Order
  toggleAddForm() {
    this.isAddMode = true;
    this.isEditMode = false;
    this.formData = { user_id: 0, animal_id: 0, status: '', order_date: '', total_amount: 0 };
  }

  addRow() {
    this.ordersService.createOrder(this.formData).subscribe(
      () => {
        this.getOrders();
        this.cancelForm();
      },
      (error) => {
        console.error('Failed to add order', error);
      }
    );
  }

  editRow(index: number) {
    this.isEditMode = true;
    this.isAddMode = false;
    this.formData = { ...this.paginatedRows[index] };
  }

  updateRow() {
    this.ordersService.updateOrder(this.formData.id!, this.formData).subscribe(
      (updatedOrder) => {
        console.log('Order updated:', updatedOrder);
        this.getOrders(); // Mettre à jour la liste des commandes après l'édition
        this.cancelForm();
      },
      (error) => {
        console.error('Failed to update order', error);
      }
    );
  }

  deleteRow(index: number) {
    const order = this.paginatedRows[index];
    this.ordersService.deleteOrder(order.id!).subscribe(
      () => {
        console.log('Order deleted');
        this.getOrders(); // Mettre à jour la liste des commandes après la suppression
      },
      (error) => {
        console.error('Failed to delete order', error);
      }
    );
  }
  

  cancelForm() {
    this.isAddMode = false;
    this.isEditMode = false;
    this.formData = { user_id: 0, animal_id: 0, status: '', order_date: '', total_amount: 0 };
    this.imagePreview = null;
    this.selectedFileName = null;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      console.log('File selected:', file); // Debugging
      this.selectedFileName = file.name;

      // Preview the image
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected'); // Debugging
    }
  }
}
