# Century Automotive — Modern Automotive Service Website

A full-stack automotive service website concept featuring an interactive 3D experience, online service requests, and a private staff management dashboard.

Built as a modern replacement for a traditional automotive shop website, with a focus on responsive design, customer experience, and a practical service workflow.

## Features

### Modern Responsive Website
- Responsive desktop, tablet, and mobile design
- Interactive 3D engine experience
- Smooth animations and transitions
- Automotive-focused visual design
- Service information and contact sections

### Online Service Requests
Customers can submit a service request directly through the website, including:

- Vehicle information
- Requested service
- Description of the problem
- Preferred appointment date and time
- Contact information
- Additional service options

The system validates requests before they are stored.

### Staff Service Desk

A private `/admin/` interface allows staff to manage incoming service requests and follow vehicles through the service process.

Workflow:

`New → Confirmed → Vehicle Received → In Service → Ready for Pickup → Completed`

Requests can also be declined when appropriate.

The dashboard includes:

- Service request management
- Status tracking
- Customer and vehicle information
- Search and filtering
- Request counts
- Notes and requested services
- Quick customer contact options

## Tech Stack

- HTML5
- CSS3
- JavaScript
- Three.js
- GSAP
- PHP
- JSON-based storage
- Apache configuration

No React or frontend framework is required.

## Project Structure

```text
century-automotive/
├── admin/
│   ├── api.php
│   └── index.php
├── api/
│   └── appointments.php
├── assets/
│   ├── admin.css
│   ├── admin.js
│   ├── app.js
│   └── styles.css
├── .env.example
├── .gitignore
├── .htaccess
├── bootstrap.php
├── index.php
└── README.md
```

## Running Locally

PHP 8+ is recommended.

From the project directory, start PHP's development server:

```bash
php -S localhost:8080
```

Then open:

```text
http://localhost:8080
```

The staff interface is available at:

```text
http://localhost:8080/admin/
```

## Configuration

Production credentials should never be committed to the repository.

Use the included `.env.example` as a reference for the required configuration and keep real credentials in the production environment.

Private appointment/runtime data should also remain outside the public repository.

## Security

The project includes server-side request handling, protected staff functionality, input validation, session-based authentication, and safeguards around application data.

For a real production deployment, HTTPS, secure production credentials, persistent database storage, backups, and properly configured transactional email should be used.

## About This Project

This project was created as a custom website concept for an automotive service business.

The services and business workflow shown in this repository are part of the demonstration and can be customized to match a shop's actual services, policies, branding, and internal workflow.

## Author

**Nemanja Djorić**

Web development project focused on combining modern frontend experiences with practical business functionality.
