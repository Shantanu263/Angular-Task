import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DialogData } from '../../interfaces/Dialog';
import { Organization } from '../../interfaces/Organization';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatError } from '@angular/material/form-field';

@Component({
  selector: 'app-organization-dialog',
  standalone: true,
  template: `
    <div class="p-6">
      <h2 class="text-xl font-semibold mb-4">{{ data.title }}</h2>

      <form [formGroup]="organizationForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Name -->
        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" placeholder="Enter organization name" />
          <mat-error *ngIf="organizationForm.get('name')?.invalid && organizationForm.get('name')?.touched">
            Name is required
          </mat-error>
        </mat-form-field>

        <!-- Description -->
        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Description</mat-label>
          <textarea
            matInput
            formControlName="description"
            rows="3"
            placeholder="Enter description"
          ></textarea>
        </mat-form-field>

        <!-- Created By -->
        <mat-form-field appearance="fill" class="w-full">
          <mat-label>Created By</mat-label>
          <input matInput formControlName="createdBy" placeholder="Enter creator name" />
          <mat-error *ngIf="organizationForm.get('createdBy')?.invalid && organizationForm.get('createdBy')?.touched">
            Creator name is required
          </mat-error>
        </mat-form-field>

        <!--Buttons -->
        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            (click)="onCancel()"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            [disabled]="organizationForm.invalid"
            class="px-4 py-2 text-sm font-medium text-white bg-red-900 border border-transparent rounded-md hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ data.mode === 'add' ? 'Add' : 'Update' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    ::ng-deep .mat-mdc-form-field {
      width: 100%;
    }
  `],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatError
  ]
})
export class OrganizationDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<OrganizationDialogComponent>);
  private formBuilder = inject(FormBuilder);
  data: DialogData<Organization> = inject(MAT_DIALOG_DATA);

  organizationForm: FormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    description: [''],
    createdBy: ['', Validators.required]
  });

  ngOnInit(): void {
    if (this.data.mode === 'edit' && this.data.data) {
      this.organizationForm.patchValue(this.data.data);
    }
  }

  onSubmit(): void {
    if (this.organizationForm.valid) {
      this.dialogRef.close({
        action: 'save',
        data: this.organizationForm.value
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close({ action: 'cancel' });
  }
}
