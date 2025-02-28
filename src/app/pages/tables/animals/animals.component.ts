import { Component, OnInit } from '@angular/core';

declare interface TableData {
  headerRow: string[];
  dataRows: string[][];
}

@Component({
  selector: 'animals',
  moduleId: module.id,
  templateUrl: 'animals.component.html',
})

export class AnimalsComponent implements OnInit {
  public tableData1: TableData;
  public isAddMode = false;  // Add new entry form visibility
  public isEditMode = false; // Edit existing entry form visibility
  public formData: string[] = ['', '', '', '', '']; // Form data for adding/editing

  // Pagination properties
  public currentPage: number = 1;
  public itemsPerPage: number = 5;
  public searchText: string = '';

  ngOnInit() {
    this.tableData1 = {
      headerRow: ['ID', 'Name', 'Country', 'City', 'Salary'],
      dataRows: [
        ['1', 'Dakota Rice', 'Niger', 'Oud-Turnhout', '$36,738'],
        ['2', 'Minerva Hooper', 'Curaçao', 'Sinaai-Waas', '$23,789'],
        ['3', 'Sage Rodriguez', 'Netherlands', 'Baileux', '$56,142'],
        ['4', 'Philip Chaney', 'Korea, South', 'Overland Park', '$38,735'],
        ['5', 'Doris Greene', 'Malawi', 'Feldkirchen in Kärnten', '$63,542'],
        ['6', 'Mason Porter', 'Chile', 'Gloucester', '$78,615'],
        ['7', 'John Doe', 'USA', 'New York', '$50,000'],
        ['8', 'Jane Smith', 'Canada', 'Toronto', '$65,000'],
        ['9', 'Tom Brown', 'UK', 'London', '$55,000'],
        ['10', 'Lucy White', 'Australia', 'Sydney', '$70,000'],
      ]
    };
  }

  // Pagination Methods
  get paginatedRows() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.tableData1.dataRows.slice(startIndex, endIndex);
  }

  // Navigate to previous page
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  

filteredRows() {
  return this.paginatedRows.filter(row => 
    row[1].toLowerCase().includes(this.searchText.toLowerCase()) // Filtre sur le nom (colonne 1)
  );
}

  // Navigate to next page
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Total number of pages
  get totalPages() {
    return Math.ceil(this.tableData1.dataRows.length / this.itemsPerPage);
  }

  // Toggle the Add Form visibility
  toggleAddForm() {
    this.isAddMode = true;
    this.formData = ['', '', '', '', '']; // Clear form for new entry
  }

  // Add New Row
  addRow() {
    const newRow = [...this.formData];
    newRow[0] = (this.tableData1.dataRows.length + 1).toString(); // Auto increment ID
    this.tableData1.dataRows.push(newRow);
    this.formData = ['', '', '', '', '']; // Clear the form after submission
    this.isAddMode = false; // Hide the form after adding
  }

  // Cancel Add/Edit form
  cancelForm() {
    this.isAddMode = false;
    this.isEditMode = false;
    this.formData = ['', '', '', '', '']; // Reset form data
  }

  // Edit (Update an existing row)
  editRow(index: number) {
    this.isEditMode = true;
    this.isAddMode = false; // Hide add form if edit is in progress
    this.formData = [...this.tableData1.dataRows[index]];
  }

  // Update the existing row
  updateRow() {
    const index = this.tableData1.dataRows.findIndex(row => row[0] === this.formData[0]);
    if (index !== -1) {
      this.tableData1.dataRows[index] = [...this.formData];
    }
    this.isEditMode = false; // Hide form after updating
    this.formData = ['', '', '', '', '']; // Clear form data
  }

  // Delete a row
  deleteRow(index: number) {
    this.tableData1.dataRows.splice(index, 1);
  }
}
