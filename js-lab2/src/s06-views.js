
// Section 06 — From state to screen: views

// What one course card shows.
export function cardView(course, planner) {
  const inPlanner = planner.some((c) => c.id === course.id);

  let seats;

  if (course.seatsLeft === 0) {
    seats = "Full";
  } else if (course.seatsLeft === 1) {
    seats = "1 seat left";
  } else {
    seats = `${course.seatsLeft} seats left`;
  }

  return {
    id: course.id,
    heading: `${course.code} · ${course.title}`,
    meta: `${course.credits} credits · ${course.department}`,
    seats,
    inPlanner,
    buttonLabel: inPlanner ? "Remove" : "Add",
    disabled: course.seatsLeft === 0 && !inPlanner,
  };
}

// The planner summary.
export function summaryView(planner) {
  const count = planner.length;

  const credits = planner.reduce(
    (total, course) => total + course.credits,
    0
  );

  const text =
    count === 0
      ? "Nothing planned yet"
      : `${count} ${count === 1 ? "course" : "courses"} · ${credits} credits`;

  return {
    count,
    credits,
    overLimit: credits > 24,
    text,
  };
}

// The status line above the list.
export function statusView(state) {
  if (state.status === "loading") {
    return { message: "Loading courses…", showRetry: false };
  }

  if (state.status === "error") {
    return {
      message: `Couldn't load courses: ${state.error}`,
      showRetry: true,
    };
  }

  if (state.status === "ready" && state.courses.length === 0) {
    return { message: "No courses match.", showRetry: false };
  }

  return { message: "", showRetry: false };
}

// Grade points on a 10-point scale.
export const GRADE_POINTS = Object.freeze({
  A: 10,
  "A-": 9,
  B: 8,
  "B-": 7,
  C: 6,
  D: 5,
  F: 0,
});

// SGPA calculator.
export function sgpaView(planner, grades) {
  const total = planner.length;

  if (total === 0) {
    return {
      graded: 0,
      total: 0,
      credits: 0,
      sgpa: null,
      text: "Add courses to the planner first",
    };
  }

  let graded = 0;
  let credits = 0;
  let weightedPoints = 0;

  for (const course of planner) {
    const grade = grades[course.id];

    if (grade !== undefined && grade !== "") {
      graded++;
      credits += course.credits;
      weightedPoints += course.credits * GRADE_POINTS[grade];
    }
  }

  if (graded === 0) {
    return {
      graded,
      total,
      credits,
      sgpa: null,
      text: "Pick a grade to see your SGPA",
    };
  }

  const sgpa = Number((weightedPoints / credits).toFixed(2));

  const text =
    graded === total
      ? `SGPA ${sgpa.toFixed(2)}`
      : `SGPA ${sgpa.toFixed(2)} · ${graded} of ${total} courses graded`;

  return { graded, total, credits, sgpa, text };
}
