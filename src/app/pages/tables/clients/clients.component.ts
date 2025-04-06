import { Component, OnInit } from '@angular/core';
import { UsersService, User } from '../../../services/users';
import { ToastrService } from 'ngx-toastr';

declare interface TableData {
  headerRow: string[];
  dataRows: User[];
}

@Component({
  selector: 'clients',
  moduleId: module.id,
  templateUrl: 'clients.component.html',
})
export class ClientsComponent implements OnInit {
  public tableData1: TableData;
  public isAddMode = false;
  public isEditMode = false;
  public formData: User = {
    fullname: '',
    email: '',
    phone: '',
    password: '',
    role: 'client'
  };
  public submitted = false;

  public currentPage: number = 1;
  public itemsPerPage: number = 5;
  public searchText: string = '';

  constructor(
    private usersService: UsersService,
    private toastr: ToastrService
  ) {
    this.tableData1 = {
      headerRow: ['ID', 'Full Name', 'Email', 'Phone', 'Role'],
      dataRows: []
    };
  }

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    this.usersService.getAllUsers().subscribe(
      (users: User[]) => {
        this.tableData1.dataRows = users;
      },
      (error) => {
        this.showError('Failed to fetch users', error);
      }
    );
  }

  // Pagination
  get paginatedRows() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRows().slice(startIndex, startIndex + this.itemsPerPage);
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
      row.fullname.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // Form Methods
  toggleAddForm() {
    this.isAddMode = true;
    this.isEditMode = false;
    this.formData = { 
      fullname: '', 
      email: '', 
      phone: '', 
      password: '', 
      role: 'client' 
    };
  }
  editRow(index: number) {
    this.isEditMode = true;
    this.isAddMode = false;
    this.formData = { ...this.paginatedRows[index], password: '' };
  }

  addRow() {
    this.submitted = true;
    
    if (!this.isFormValid()) {
      this.showMissingFieldsAlert();
      return;
    }
  
    this.usersService.createUser(this.formData).subscribe(
      () => {
        this.showSuccess('Client added successfully');
        this.getUsers();
        this.cancelForm();
      },
      (error) => {
        this.showError('Failed to add client', error);
      }
    );
  }
  
  updateRow() {
    this.submitted = true;
    
    if (!this.isFormValid(true)) {
      this.showMissingFieldsAlert(true);
      return;
    }
  
    const user = this.paginatedRows.find(u => u.id === this.formData.id);
    if (!this.formData.password) {
      this.formData.password = user?.password || '';
    }
  
    this.usersService.updateUser(this.formData.id!, this.formData).subscribe(
      () => {
        this.showSuccess('Client updated successfully');
        this.getUsers();
        this.cancelForm();
      },
      (error) => {
        this.showError('Failed to update client', error);
      }
    );
  }
  
  // Ajoutez ces méthodes utilitaires
  private isFormValid(isEdit: boolean = false): boolean {
    if (!this.formData.fullname || !this.formData.email || 
        !this.formData.phone || !this.formData.role) {
      return false;
    }
    
    // Password only required for new clients
    if (!isEdit && !this.formData.password) {
      return false;
    }
    
    return true;
  }
  
  private showMissingFieldsAlert(isEdit: boolean = false): void {
    const missingFields = [];
    
    if (!this.formData.fullname) missingFields.push('Full Name');
    if (!this.formData.email) missingFields.push('Email');
    if (!this.formData.phone) missingFields.push('Phone');
    if (!this.formData.role) missingFields.push('Role');
    if (!isEdit && !this.formData.password) missingFields.push('Password');
  
    this.showWarning(`Please fill in all required fields: ${missingFields.join(', ')}`);
  }
  deleteRow(index: number) {
    if (confirm('Are you sure you want to delete this client?')) {
      const user = this.paginatedRows[index];
      this.usersService.deleteUser(user.id!).subscribe(
        () => {
          this.showSuccess('Client deleted successfully');
          this.getUsers();
        },
        (error) => {
          this.showError('Failed to delete client', error);
        }
      );
    }
  }

  cancelForm() {
    this.isAddMode = false;
    this.isEditMode = false;
    this.formData = { 
      fullname: '', 
      email: '', 
      phone: '', 
      password: '', 
      role: 'client' 
    };
  }

  // Notification Methods
// Modifiez uniquement les méthodes de notification comme suit :

private showSuccess(message: string) {
  this.toastr.success(
    `<span data-notify="icon" class="nc-icon nc-bell-55"></span><span data-notify="message">${message}</span>`,
    "",
    {
      timeOut: 4000,
      closeButton: true,
      enableHtml: true,
      toastClass: "alert alert-success alert-with-icon",
      positionClass: "toast-top-right"  // Position en haut à droite
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
      positionClass: "toast-top-right"  // Position en haut à droite
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
      positionClass: "toast-top-right"  // Position en haut à droite
    }
  );
}
}