package com.example.educate_backend.service;

import com.example.educate_backend.Repository.ChapterRepository;
import com.example.educate_backend.Repository.SchoolClassRepository;
import com.example.educate_backend.Repository.SubjectRepository;
import com.example.educate_backend.Repository.VisualizationRepository;
import com.example.educate_backend.dto.ChapterResponse;
import com.example.educate_backend.dto.SubjectResponse;
import com.example.educate_backend.model.Chapter;
import com.example.educate_backend.model.Subject;
import com.example.educate_backend.model.Visualization;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final SchoolClassRepository schoolClassRepository;
    private final ChapterRepository chapterRepository;
    private final VisualizationRepository visualizationRepository;

    public List<SubjectResponse> getSubjectsByClassLevel(Integer classLevel) {
        log.info("Fetching subjects for class level: {}", classLevel);
        return subjectRepository.findBySchoolClass_GradeLevel(classLevel)
                .stream()
                .map(this::mapSubjectToResponse)
                .collect(Collectors.toList());
    }

    public SubjectResponse getSubjectById(Long subjectId) {
        log.info("Fetching subject with id: {}", subjectId);
        return subjectRepository.findById(subjectId)
                .map(this::mapSubjectToResponse)
                .orElse(null);
    }

    private SubjectResponse mapSubjectToResponse(Subject subject) {
        return new SubjectResponse(
                subject.getId(),
                subject.getName(),
                subject.getSchoolClass().getGradeLevel()
        );
    }

    public void initializeDefaultSubjects() {
        log.info("Initializing default subjects if missing");

        List<Subject> defaults = new ArrayList<>();

        // Common subjects for classes 6-8
        for (int grade : new int[]{6,7,8}) {
            schoolClassRepository.findByGradeLevel(grade).ifPresent(schoolClass -> {
                defaults.add(new Subject(null, schoolClass, "Mathematics", new ArrayList<>()));
                defaults.add(new Subject(null, schoolClass, "Science", new ArrayList<>()));
                defaults.add(new Subject(null, schoolClass, "English", new ArrayList<>()));
                defaults.add(new Subject(null, schoolClass, "Social Studies", new ArrayList<>()));
                defaults.add(new Subject(null, schoolClass, "Computer Science", new ArrayList<>()));
            });
        }

        // Subjects for classes 9-10 (more specialized science subjects)
        for (int grade : new int[]{9,10}) {
            schoolClassRepository.findByGradeLevel(grade).ifPresent(schoolClass -> {
                defaults.add(new Subject(null, schoolClass, "Mathematics", new ArrayList<>()));
                defaults.add(new Subject(null, schoolClass, "Physics", new ArrayList<>()));
                defaults.add(new Subject(null, schoolClass, "Chemistry", new ArrayList<>()));
                defaults.add(new Subject(null, schoolClass, "Biology", new ArrayList<>()));
                defaults.add(new Subject(null, schoolClass, "English", new ArrayList<>()));
                defaults.add(new Subject(null, schoolClass, "Social Studies", new ArrayList<>()));
                defaults.add(new Subject(null, schoolClass, "Computer Science", new ArrayList<>()));
            });
        }

        for (Subject subj : defaults) {
            boolean exists = subjectRepository.existsByNameAndSchoolClass(subj.getName(), subj.getSchoolClass());
            if (!exists) {
                subjectRepository.save(subj);
                log.info("Created default subject: {} for class {}", subj.getName(), subj.getSchoolClass().getGradeLevel());
                initializeDefaultChapters(subj);
            }
        }

        synchronizeClassNineCoordinateChapter();
    }

    /** Keeps the seeded Class 9 chapter correct even for databases created before this content existed. */
    private void synchronizeClassNineCoordinateChapter() {
        schoolClassRepository.findByGradeLevel(9).ifPresent(schoolClass ->
                subjectRepository.findByNameAndSchoolClass("Mathematics", schoolClass).ifPresent(subject -> {
                    // Prefer the canonical chapter number 1 if present
                    chapterRepository.findBySubject_IdOrderByChapterNumber(subject.getId()).stream()
                            .filter(chapter -> chapter.getChapterNumber() == 1)
                            .findFirst()
                            .ifPresentOrElse(chapter -> {
                                synchronizeCoordinateChapter(chapter);
                            }, () -> {
                                // Fallback: try to find any existing chapter mistakenly titled "Number Systems" (or similar)
                                chapterRepository.findBySubject_IdOrderByChapterNumber(subject.getId()).stream()
                                        .filter(ch -> ch.getTitle() != null && ch.getTitle().toLowerCase().contains("number"))
                                        .findFirst()
                                        .ifPresent(this::synchronizeCoordinateChapter);
                            });
                })
        );
    }

    private void synchronizeCoordinateChapter(Chapter chapter) {
        chapter.setTitle("Orienting Yourself: The Use of Coordinates");
        chapter.setDescription("Coordinate systems, the Cartesian plane, and distance between two points.");
        chapterRepository.save(chapter);

        List<Visualization> visualizations = visualizationRepository.findByChapter_IdOrderByIdAsc(chapter.getId());
        visualizations.stream()
                .filter(visualization -> visualization.getType().equalsIgnoreCase("number-system")
                        || visualization.getType().equalsIgnoreCase("number-systems"))
                .forEach(visualization -> {
                    visualization.setTitle("Cartesian Coordinate Plane");
                    visualization.setType("coordinate-geometry");
                    visualization.setDescription("Plot points and explore coordinates, axes, and quadrants.");
                });
        visualizationRepository.saveAll(visualizations);

        if (visualizations.stream().noneMatch(visualization ->
                visualization.getType().equalsIgnoreCase("coordinate-geometry"))) {
            visualizationRepository.save(new Visualization(
                    null,
                    chapter,
                    "Cartesian Coordinate Plane",
                    "coordinate-geometry",
                    "Plot points and explore coordinates, axes, and quadrants.",
                    "{\"initialPoints\":[{\"id\":1,\"x\":4,\"y\":3},{\"id\":2,\"x\":-3,\"y\":5}]}"
            ));
        }
    }

    private void initializeDefaultChapters(Subject subject) {
        log.info("Initializing default chapters for subject: {}", subject.getName());

        List<Chapter> chapters = new ArrayList<>();

        switch (subject.getName().toLowerCase()) {
            case "mathematics":
                chapters.add(new Chapter(null, subject, 1, "Orienting Yourself: The Use of Coordinates", "Coordinate systems, the Cartesian plane, and distance between two points."));
                chapters.add(new Chapter(null, subject, 2, "Polynomials", "Understanding polynomials, their types, and operations with polynomial expressions"));
                chapters.add(new Chapter(null, subject, 3, "Coordinate Geometry", "Plotting points on coordinate plane and understanding distance and section formulas"));
                chapters.add(new Chapter(null, subject, 4, "Linear Equations", "Solving linear equations and inequalities in one and two variables"));
                chapters.add(new Chapter(null, subject, 5, "Quadratic Equations", "Understanding and solving quadratic equations and their applications"));
                break;

            case "science":
                chapters.add(new Chapter(null, subject, 1, "Matter and Its Properties", "Understanding matter, its states, and physical and chemical properties"));
                chapters.add(new Chapter(null, subject, 2, "Atoms and Molecules", "Structure of atoms, molecules, and compounds"));
                chapters.add(new Chapter(null, subject, 3, "Motion and Force", "Newton's laws of motion and their applications"));
                chapters.add(new Chapter(null, subject, 4, "Energy and Work", "Understanding work, energy, and power"));
                chapters.add(new Chapter(null, subject, 5, "Light and Sound", "Properties of light, sound, and their phenomena"));
                break;

            case "physics":
                chapters.add(new Chapter(null, subject, 1, "Kinematics", "Study of motion without considering the forces causing it"));
                chapters.add(new Chapter(null, subject, 2, "Dynamics", "Newton's laws and their applications to motion"));
                chapters.add(new Chapter(null, subject, 3, "Work, Energy and Power", "Concepts of work, kinetic energy, potential energy, and power"));
                chapters.add(new Chapter(null, subject, 4, "Waves and Oscillations", "Harmonic motion and wave phenomena"));
                chapters.add(new Chapter(null, subject, 5, "Electricity and Magnetism", "Electrostatics, current electricity, and magnetism"));
                break;

            case "chemistry":
                chapters.add(new Chapter(null, subject, 1, "Basic Concepts", "Atomic structure, chemical bonding, and molecular properties"));
                chapters.add(new Chapter(null, subject, 2, "States of Matter", "Solid, liquid, and gaseous states and their characteristics"));
                chapters.add(new Chapter(null, subject, 3, "Redox Reactions", "Oxidation and reduction reactions"));
                chapters.add(new Chapter(null, subject, 4, "Acids, Bases and Salts", "Properties and reactions of acids, bases, and salts"));
                chapters.add(new Chapter(null, subject, 5, "Organic Chemistry", "Basic concepts of organic compounds and reactions"));
                break;

            case "biology":
                chapters.add(new Chapter(null, subject, 1, "Cell Structure and Function", "Understanding cell organelles and their functions"));
                chapters.add(new Chapter(null, subject, 2, "Nutrition and Health", "Plant and animal nutrition, and balanced diet"));
                chapters.add(new Chapter(null, subject, 3, "Reproduction", "Asexual and sexual reproduction in plants and animals"));
                chapters.add(new Chapter(null, subject, 4, "Heredity and Evolution", "Laws of inheritance and concept of evolution"));
                chapters.add(new Chapter(null, subject, 5, "Ecology and Environment", "Ecosystems, food chains, and conservation"));
                break;

            case "english":
                chapters.add(new Chapter(null, subject, 1, "Grammar Fundamentals", "Parts of speech, tenses, and sentence structure"));
                chapters.add(new Chapter(null, subject, 2, "Reading Comprehension", "Techniques for understanding and analyzing texts"));
                chapters.add(new Chapter(null, subject, 3, "Writing Skills", "Essay writing, creative writing, and composition"));
                chapters.add(new Chapter(null, subject, 4, "Literature", "Analysis of poems, short stories, and novels"));
                chapters.add(new Chapter(null, subject, 5, "Communication Skills", "Oral and written communication techniques"));
                break;

            case "social studies":
            case "social science":
                chapters.add(new Chapter(null, subject, 1, "History", "Ancient, medieval, and modern history"));
                chapters.add(new Chapter(null, subject, 2, "Geography", "Earth's structure, continents, and climate zones"));
                chapters.add(new Chapter(null, subject, 3, "Civics", "Government structure and citizenship"));
                chapters.add(new Chapter(null, subject, 4, "Economics", "Basic economic concepts and systems"));
                chapters.add(new Chapter(null, subject, 5, "Cultural Heritage", "Culture, art, and traditions"));
                break;

            case "computer science":
                chapters.add(new Chapter(null, subject, 1, "Introduction to Computers", "Computer fundamentals and hardware components"));
                chapters.add(new Chapter(null, subject, 2, "Programming Basics", "Variables, data types, operators, and control structures"));
                chapters.add(new Chapter(null, subject, 3, "Problem Solving", "Algorithm design and logical thinking"));
                chapters.add(new Chapter(null, subject, 4, "Data Structures", "Arrays, lists, stacks, and queues"));
                chapters.add(new Chapter(null, subject, 5, "Database Concepts", "Introduction to databases and SQL"));
                break;

            default:
                chapters.add(new Chapter(null, subject, 1, "Introduction", "Introduction to " + subject.getName()));
                break;
        }

        for (Chapter chapter : chapters) {
            boolean exists = chapterRepository.existsBySubject_IdAndChapterNumber(subject.getId(), chapter.getChapterNumber());
            if (!exists) {
                chapterRepository.save(chapter);
                log.info("Created chapter: {} for subject: {}", chapter.getTitle(), subject.getName());
            }
        }
    }

    public List<ChapterResponse> getChaptersBySubjectId(Long subjectId) {
        log.info("Fetching chapters for subject id: {}", subjectId);
        return chapterRepository.findBySubject_IdOrderByChapterNumber(subjectId)
                .stream()
                .map(c -> new ChapterResponse(c.getId(), c.getChapterNumber(), c.getTitle(), c.getDescription()))
                .collect(Collectors.toList());
    }

    public void addChapterToSubject(Long subjectId, Chapter chapter) {
        log.info("Adding chapter to subject: {}", subjectId);
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new IllegalArgumentException("Subject not found with id: " + subjectId));

        chapter.setSubject(subject);
        chapterRepository.save(chapter);
        log.info("Chapter added successfully to subject: {}", subjectId);
    }
}
