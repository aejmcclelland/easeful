content = """
# Easeful Task Manager — Feature Roadmap

This document outlines suggested next steps for developing the Easeful Task Manager, based on recent work and the app’s current structure.

---

## 1. Inline Status / Progress Updates
Allow users to update a task’s status (`Pending`, `In Progress`, `Completed`) directly in the `TaskCard`, similar to how the priority dropdown works.

**UI Ideas**
- A StatusBadge component
- A select dropdown
- A “Mark Complete / Undo” button

**Why this matters**
- Smooth workflow without opening the edit form
- Matches modern task apps (Todoist, TickTick, Things)

---

## 2. Task Grouping / Sorting
Improve readability of large task lists by grouping or sorting.

**Examples**
- Group by status: Today / Upcoming / Completed
- Sort by priority: High → Medium → Low
- Intelligent sections: Overdue, Today, Tomorrow, Later

---

## 3. Mark Complete Button
Add a single action button per task:

- “Mark Complete”
- “Restore”

**Benefits**
- Fast, satisfying user interaction
- Visual feedback (strike-through, faded colour)

---

## 4. Task Filtering
Add a filter bar above the task list.

**Possible filters**
- All
- Active
- Completed
- High Priority
- Due Today / Tomorrow

Filtering can be implemented fully client‑side.

---

## 5. Search in Task List
Add a search box to filter tasks by title or description.

- Instant client‑side filtering
- Makes large lists easier to navigate

---

## 6. Improved Due‑Date UX
Enhance the quickDue behaviour:

- Automatically set `dueDate` when choosing Today / Tomorrow
- Add smart options like “Next Week” or “This Weekend”

---

# Optional Features

### Recurring Task Preview
Show a small badge below a task describing its recurrence rules, such as:

- Repeats daily
- Repeats weekly on Mon/Wed/Fri
- Ends on 30 April

### Task Attachments (Your API already supports this!)
You already have routes for attaching and deleting images:

```
PUT /:id/photo
DELETE /:id/photo/:public_id
```

This enables:
- Receipt attachments
- Photo notes
- Document uploads

### Completed Tasks Tab or Section
Move completed tasks into a separate tab or collapsible section to declutter the main view.

### Drag & Drop Ordering
Use libraries like React Beautiful DnD for manual task ordering.

---

# Recommended Immediate Next Steps

1. **Add StatusBadge / inline status update**  
   Full parity with priority editing.

2. **Add “Mark Complete / Restore” button**  
   Fastest workflow improvement.

3. **Filtering: All / Active / Completed**  
   Essential for usability.

4. **Sort tasks by priority**  
   Simple but high‑impact.

---

This roadmap should help guide the next phase of development and keep the codebase organised and scalable.
"""

path