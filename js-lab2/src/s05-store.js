// Section 05 — State as a state machine
//
// The whole app's state is ONE object. It only ever changes through
// transition(state, event), which returns a NEW state (or the SAME state
// when the event changes nothing). Never change `state` itself.

export const initialState = Object.freeze({
  status: "idle",
  courses: [],
  error: null,
  departments: [],
  department: "",
  query: "",
  planner: [],
  grades: {},
});

export function transition(state, event) {
  switch (event.type) {
    case "LOAD_START":
      return {
        ...state,
        status: "loading",
        error: null,
      };

    case "LOAD_OK": {
      const departments =
        state.departments.length > 0
          ? state.departments
          : [...new Set(event.courses.map((course) => course.department))].sort();

      return {
        ...state,
        status: "ready",
        courses: event.courses,
        departments,
      };
    }

    case "LOAD_FAIL":
      return {
        ...state,
        status: "error",
        error: event.message,
      };

    case "SET_DEPARTMENT":
      if (state.department === event.department) return state;

      return {
        ...state,
        department: event.department,
      };

    case "SET_QUERY":
      if (state.query === event.query) return state;

      return {
        ...state,
        query: event.query,
      };

    case "ADD": {
  // Do not add a course that is already in the planner.
  if (state.planner.some((course) => course.id === event.course.id)) {
    return state;
  }

  // Do not add a course if it is full.
  if (event.course.seatsLeft === 0) {
    return state;
  }

  // Calculate the credits after adding this course.
  const currentCredits = state.planner.reduce(
    (total, course) => total + course.credits,
    0
  );

  if (currentCredits + event.course.credits > 24) {
    return state;
  }

  const { id, code, title, credits } = event.course;

  return {
    ...state,
    planner: [...state.planner, { id, code, title, credits }],
  };
}

    case "REMOVE": {
      const courseExists = state.planner.some(
        (course) => course.id === event.id
      );

      if (!courseExists) return state;

      const { [event.id]: removedGrade, ...grades } = state.grades;

      return {
        ...state,
        planner: state.planner.filter((course) => course.id !== event.id),
        grades,
      };
    }

    case "SET_GRADE": {
      const currentGrade = state.grades[event.id];

      if (currentGrade === event.grade) return state;

      const grades = { ...state.grades };

      if (event.grade === "") {
        delete grades[event.id];
      } else {
        grades[event.id] = event.grade;
      }

      return {
        ...state,
        grades,
      };
    }

    default:
      return state;
  }
}
