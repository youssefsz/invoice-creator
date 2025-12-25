# Invoice Creator

A professional web application designed to streamline the process of creating, managing, and tracking invoices. This application is built with modern web technologies, focusing on performance, user experience, and visual design.

## Overview

Invoice Creator allows users to easily generate professional invoices, track their payment status, and manage company details. The application features a responsive design with smooth transitions and a clean user interface, making it suitable for freelancers and small businesses.

## Key Features

*   **Dashboard Overview**: A centralized hub to view all invoices, categorized by payment status.
*   **Invoice Management**: Create, edit, and delete invoices with an intuitive form interface.
*   **Status Tracking**: Organize invoices into 'Paid' and 'Unpaid' tabs to keep track of finances.
*   **Company Profile Settings**: Configure and save company information such as name, email, phone, and address for automatic inclusion in invoices.
*   **PDF Generation**: Export invoices to PDF format for easy sharing with clients.
*   **Responsive Design**: Fully optimized for various screen sizes, ensuring functionality on desktop and mobile devices.
*   **Local Persistence**: Data is saved locally, ensuring you do not lose your work between sessions.

## Technology Stack

This project leverages a modern and robust technology stack:

*   **Framework**: Next.js 16 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **UI Components**: Radix UI (Headless UI primitives) and Lucide React (Icons)
*   **Form Handling**: React Hook Form and Zod for validation
*   **PDF Utilities**: jsPDF and html2canvas-pro

## Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Ensure you have Node.js installed on your machine.

### Installation

1.  Clone the repository:
    ```bash
    git clone <repository_url>
    ```

2.  Navigate to the project directory:
    ```bash
    cd invoice-creator
    ```

3.  Install dependencies:
    ```bash
    npm install
    # or
    pnpm install
    # or
    yarn install
    ```

### Running the Application

Start the development server:

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

Open http://localhost:3000 in your browser to view the application.

## Project Structure

*   `app/`: Contains the Next.js App Router pages and layouts.
*   `components/`: Reusable UI components, including invoice forms, lists, and previewers.
*   `lib/`: Utility functions, type definitions, and storage logic.
*   `hooks/`: Custom React hooks.
*   `public/`: Static assets.

## Contributing

Contributions to improve the application are welcome. Please ensure that any pull requests maintain the existing code style and structure.

## License

This project is open source and available for use under standard terms.
