# VisualiseIt 📊

**VisualiseIt** is an interactive learning platform that turns school math and science concepts into visual, hands-on experiences — instead of just reading definitions, students can *see* and *manipulate* the concept.

Currently includes interactive visualizers for Class 9 topics such as:
- Number Systems
- Polynomials
- Coordinate Geometry
- Graph Plotting

## ✨ Features

- 🔐 User authentication (register/login) with JWT-based security
- 🏫 Browse content by Class → Subject → Chapter → Topic
- 📈 Interactive, animated visualizers for math concepts
- 👤 User profile and settings management
- 🎨 Clean, responsive dashboard UI

## 🛠️ Tech Stack

**Frontend**
- React 19 (Create React App)
- React Router
- Lucide React (icons)

**Backend**
- Java 17+ / Spring Boot 3.5
- Spring Security + JWT (jjwt)
- Spring Data JPA
- MySQL

## 📂 Project Structure

```
VISUALISE_IT/
├── VisualiseIt-backend/    # Spring Boot REST API
│   └── src/main/java/com/example/educate_backend/
│       ├── controller/     # REST endpoints (Auth, Subject, Class, Visualization, User)
│       ├── service/        # Business logic
│       ├── model/          # JPA entities (User, Subject, Chapter, SchoolClass, ...)
│       ├── Repository/     # Spring Data repositories
│       ├── security/       # JWT filter, auth entry point
│       └── dto/            # Request/response objects
└── VisualiseIt_Frontend/   # React application
    └── src/
        ├── pages/          # Login, Register, Dashboard, Subjects, Classes, ...
        ├── components/     # Navbar, Sidebar, VisualizationDisplay, ...
        ├── class8/, class9/ # Topic-specific visualizer components
        ├── context/         # Auth context
        └── data/            # API calls, visualization registry
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) and npm
- Java 17+ and Maven
- MySQL

### Backend Setup
```bash
cd VisualiseIt-backend
# configure your MySQL credentials in src/main/resources/application.properties
./mvnw spring-boot:run
```

### Frontend Setup
```bash
cd VisualiseIt_Frontend
npm install
npm start
```

The frontend will run on `http://localhost:3000` and the backend on `http://localhost:8080` (default Spring Boot port).

## 📖 Usage

1. Register a new account or log in.
2. Pick a class and subject from the dashboard.
3. Choose a chapter/topic to open its interactive visualizer.
4. Explore concepts like polynomials or coordinate geometry visually.

## 🗺️ Roadmap

- [ ] Add more class levels and subjects
- [ ] Add progress tracking per student
- [ ] Add teacher/admin dashboard

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a pull request.

