# Pagination and Sorting Features

## Overview
Added comprehensive pagination and sorting functionality for both employees and organizations in the Angular application.

## Features Implemented

### 1. Enhanced Mock Data
- **Employees**: Expanded from 5 to 25 employees with diverse roles and organizations
- **Organizations**: Expanded from 4 to 15 organizations with varied member counts

### 2. Updated Interfaces
- Added `EmployeeResponse` and `OrganizationResponse` interfaces for paginated data
- Added `PaginationParams` interface for query parameters
- Supports pagination, sorting, and search parameters

### 3. Enhanced Services
- **EmployeesService**: Added `getEmployeesPaginated()` method
- **OrganizationsService**: Added `getOrganizationsPaginated()` method
- Both services support:
  - Page-based pagination (`_page`, `_limit`)
  - Multi-field sorting (`_sort`, `_order`)
  - Search functionality (`q` parameter)

### 4. Updated Home Component
- Added pagination and sorting state management using Angular signals
- Implemented separate pagination controls for employees and organizations
- Added computed properties for pagination information
- Created event handlers for:
  - Page changes
  - Page size changes
  - Column sorting
  - Search functionality

### 5. Enhanced UI Components
- **Search Input**: Real-time search for both employees and organizations
- **Page Size Selector**: Choose between 5, 10, or 20 items per page
- **Sortable Headers**: Click any column header to sort by that field
- **Pagination Controls**: Previous/Next buttons and page number buttons
- **Results Counter**: Shows current page range and total items

## Available Sort Fields

### Employees
- `username` (default)
- `email`
- `organisation`
- `role`

### Organizations
- `id`
- `name` (default)
- `createdBy`
- `totalMembers`

## Usage

1. **Pagination**: Use the Previous/Next buttons or click page numbers
2. **Sorting**: Click any column header to sort by that field (click again to reverse order)
3. **Search**: Type in the search box to filter results
4. **Page Size**: Use the dropdown to change items per page

## Technical Implementation

- Uses Angular signals for reactive state management
- Implements JSON Server query parameters for server-side operations
- Follows Angular best practices with standalone components
- Responsive design with Tailwind CSS
- Type-safe implementation with TypeScript interfaces

## JSON Server Endpoints

- `GET /employees?_page=1&_limit=5&_sort=username&_order=asc&q=search`
- `GET /organizations?_page=1&_limit=5&_sort=name&_order=asc&q=search`

## Default Settings

- **Page Size**: 5 items per page
- **Default Sort**: Employees by username (asc), Organizations by name (asc)
- **Search**: Real-time filtering across all fields

