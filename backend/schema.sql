CREATE DATABASE IF NOT EXISTS ems;
USE ems;

CREATE TABLE departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL UNIQUE
);

CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  phone VARCHAR(15),
  address VARCHAR(255),
  department_id INT NULL,
  designation VARCHAR(80),
  basic_salary DECIMAL(10,2) NOT NULL DEFAULT 0,
  join_date DATE,
  status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Admin','HR Manager','Employee') NOT NULL,
  employee_id INT NULL,
  active TINYINT NOT NULL DEFAULT 1,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  work_date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  UNIQUE (employee_id, work_date),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE leaves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  leave_type ENUM('Casual','Sick','Earned') NOT NULL,
  from_date DATE NOT NULL,
  to_date DATE NOT NULL,
  reason VARCHAR(255),
  status ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  decided_by INT NULL,
  applied_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE TABLE payroll (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id INT NOT NULL,
  month CHAR(7) NOT NULL,
  basic DECIMAL(10,2),
  allowances DECIMAL(10,2),
  deductions DECIMAL(10,2),
  net DECIMAL(10,2),
  UNIQUE (employee_id, month),
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

INSERT INTO departments(name) VALUES ('Engineering'),('HR'),('Finance'),('Sales');
