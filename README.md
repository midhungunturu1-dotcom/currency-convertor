# Currency Converter

## Project Overview
This project is a premium, responsive currency converter website built with HTML, CSS, JavaScript, and Java Object-Oriented Programming. It offers live exchange rate conversion, handy history tracking, dark mode, favorites, and a polished fintech-inspired user interface.

## Features
- Live exchange rates from the Frankfurter API
- Responsive glassmorphism dashboard
- Amount input, currency selection, swap, reset, and conversion actions
- Conversion history saved with Local Storage
- Favorite currency pairs for quick reuse
- Searchable currency dropdowns
- Lightweight Java backend classes for OOP structure and console demonstration

## Technologies Used
- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Backend: Java 11+
- APIs: Frankfurter API
- Storage: Local Storage

## Folder Structure
- index.html – Main page markup
- style.css – Responsive premium styling
- script.js – Currency conversion logic, UI interactions, and API integration
- Currency.java – Currency model class
- ExchangeRateService.java – Fetch and return exchange rates
- CurrencyConverter.java – Validation and conversion logic
- Main.java – Console demo entry point
- config.properties – API configuration
- README.md – Project documentation

## API Used
The website uses the Frankfurter API for real-time exchange rates.

## Setup Instructions
1. Open the project folder in VS Code.
2. Launch the live preview or open index.html in a browser.
3. For the Java demo, compile and run the Java files from the terminal.

## How to Run in VS Code
- Open the folder in VS Code.
- Use the Live Server extension for the frontend.
- For Java, run the following commands in the terminal:
  - javac *.java
  - java Main

## Future Enhancements
- Add multi-currency basket conversion
- Support offline rate caching with improved refresh rules
- Add more advanced charting and historical rate trends
