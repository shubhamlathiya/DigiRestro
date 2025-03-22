# DigiRestro 🍽️

DigiRestro is a restaurant management system aimed at optimizing restaurant operations by streamlining processes such as menu management, table assignments, and order tracking. This project is part of the **Bachelor of Computer Application** curriculum at the **B.V. Patel Institute of Computer Science, Uka Tarsadia University**.

---

## 📌 Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [System Overview](#system-overview)
  - [Purpose](#purpose)
  - [Scope](#scope)
- [Functional Requirements](#functional-requirements)
- [Non-Functional Requirements](#non-functional-requirements)
- [System Design](#system-design)
  - [Entity-Relationship Diagram](#entity-relationship-diagram)
  - [Use Case Diagrams](#use-case-diagrams)
  - [Data Dictionary](#data-dictionary)
- [GUI Design](#gui-design)
- [Technology Stack](#technology-stack)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Contributors](#contributors)
- [License](#license)

---

## 📖 Introduction

DigiRestro is developed to **improve efficiency and service quality** in restaurants. It centralizes operations like company and branch creation, menu management, order tracking, and payment processing, ensuring a seamless dining experience.

---

## 🚀 Features

### 🔹 Admin Features
- 🔑 User authentication and management.
- 📊 Subscription plan management.
- 📈 Reports and analytics:
  - 📌 Subscription statistics.
  - 💳 Financial transactions and payment statuses.

### 🔹 Company Owner Features
- 🏢 Manage companies and branches.
- 🔗 Integration with **Razorpay** for secure payments.
- 🍽️ Manage food categories, subcategories, and items.
- 📊 Access business performance reports.

### 🔹 Branch Features
- 🏷️ Table assignments and order management.
- ⏳ Real-time order tracking.
- 🧾 Bill generation and status alerts.

### 🔹 Customer Features
- 📜 View food items and place customized orders.

---

## 🏛️ System Overview

### 🎯 Purpose

To enhance restaurant operations by automating processes like menu management, order tracking, table allocation, and report generation.

### 📌 Scope

DigiRestro is designed for **in-restaurant services**, focusing on improving the dine-in experience. It does **not** support online delivery or takeout services.

---

## 📜 Functional Requirements

✅ **Admin**: User management, subscription handling, and analytics.
✅ **Company Owner**: Payment processing, food category management, and branch management.
✅ **Branch**: Table and order management, bill generation, and status tracking.
✅ **Customer**: View and order food items.

---

## 🔐 Non-Functional Requirements

🔹 Data security and protection.
🔹 Intuitive user interfaces.
🔹 Reliable email services for notifications.

---

## 🛠️ System Design

### 📌 Entity-Relationship Diagram
The ER diagram defines entities like **Admin, Company, Branch, and Customer**, and their relationships.

### 📌 Use Case Diagrams
- **Admin**: Manage users, subscriptions, and view reports.
- **Company Owner**: Manage companies, branches, and payments.
- **Branch**: Handle orders, tables, and customer requests.
- **Customer**: View menus and place orders.

### 📌 Data Dictionary
The system includes comprehensive database tables like:
- `user`: Stores user details (admin, company owners, branch users).
- `company`: Details about companies using DigiRestro.
- `branch`: Details about branches under companies.
- `food_item`: Information on available menu items.
- `order`: Tracks customer orders.

Refer to the documentation for the complete **data dictionary**.

---

## 🎨 GUI Design

### 📌 Key Pages
- **🏠 Home Panel**: Overview of DigiRestro functionality.
- **🛡️ Admin Panel**: Manage subscriptions, view reports.
- **🏢 Company Owner Panel**: Company and branch management, financial analytics.
- **🍽️ Branch Panel**: Table management, order tracking.

---

## 🏗️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Payment Gateway**: Razorpay

### 🛠 Tools Used
- 💻 Visual Studio Code
- 🌐 WebStorm
- 🗄️ MongoDB Compass

---

## 📡 API Documentation

### 📌 Key APIs

#### **Admin APIs**
- `GET /admin/dashboard` → Fetch admin dashboard data.
- `POST /admin/send-enquiry-reply` → Respond to customer inquiries.

#### **Company Owner APIs**
- `GET /company/allBranchesRevenue` → Retrieve revenue details of all branches.
- `POST /company/add-company` → Add a new company.

#### **Branch APIs**
- `GET /branch/dashboard` → Fetch branch-specific metrics.
- `POST /branch/add-order` → Place a new order.

📌 Refer to the **API documentation** for a detailed list.

---

## 🧪 Testing

### 🔹 Automation Testing
- ✅ **Postman Tests**:
  - Verify login.
  - Check subscription handling.
  - Fetch order details.

### 🔹 Manual Testing
- 🏗️ Functional testing for login, food management, and report generation.
- 🎨 Usability testing for GUI design.
- 🔄 Data and control flow testing for key functionalities.

---

## 🤝 Contributors

👨‍💻 Developed by **Shubham Lathija** and team at **B.V. Patel Institute of Computer Science, Uka Tarsadia University**.

---

## 📜 License

📄 This project is licensed under the **MIT License**.

---

📌 For a detailed breakdown of each section, please refer to the full documentation included in the project files. 🚀

